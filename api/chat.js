import {
  getAI, modelsToTry, SYSTEM_INSTRUCTION,
  isRetryable, isModelGone, sleep,
  requireUser, sendError,
} from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak didukung.' });
  try {
    const { profile, svc } = await requireUser(req);
    const { message, history = [], sessionId = null, image = null } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Parameter "message" wajib diisi.' });
    }

    // Lampiran gambar opsional: { mimeType, data (base64) }
    let imagePart = null;
    let imageLabel = '';
    if (image) {
      if (typeof image.data !== 'string' || !/^image\/(png|jpe?g|webp|gif)$/.test(image.mimeType || '')) {
        return res.status(400).json({ error: 'Format gambar tidak didukung. Pakai JPG, PNG, WebP, atau GIF.' });
      }
      if (image.data.length > 7000000) {
        return res.status(413).json({ error: 'Gambar terlalu besar. Maksimal 10MB sebelum kompresi.' });
      }
      imagePart = { inlineData: { mimeType: image.mimeType, data: image.data } };
      imageLabel = `\n[lampiran gambar${image.name ? ': ' + String(image.name).slice(0, 60) : ''}]`;
    }

    const contents = [];
    for (const turn of history) {
      if (turn.role === 'user') contents.push({ role: 'user', parts: [{ text: turn.content }] });
      else if (turn.role === 'model') contents.push({ role: 'model', parts: [{ text: turn.content }] });
    }
    const userParts = [{ text: message }];
    if (imagePart) userParts.push(imagePart);
    contents.push({ role: 'user', parts: userParts });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Encoding': 'none',
    });
    res.flushHeaders?.();

    const ai = getAI();
    let fullResponse = '';
    let usedModel = '';
    let lastErr = null;

    for (const model of modelsToTry()) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const stream = await ai.models.generateContentStream({
            model,
            contents,
            config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.55, topP: 0.9, maxOutputTokens: 2048 },
          });
          let gotText = false;
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              gotText = true;
              fullResponse += text;
              res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
            }
          }
          if (!gotText) throw new Error('Empty stream from ' + model);
          usedModel = model;
          break;
        } catch (e) {
          lastErr = e;
          if (isModelGone(e)) break;
          if (!isRetryable(e)) throw e;
          await sleep(180 * (attempt + 1));
        }
      }
      if (usedModel) break;
    }

    if (!usedModel) throw lastErr || new Error('Semua model sibuk. Coba lagi sebentar.');

    // simpan riwayat + log (best effort, jangan gagalkan response)
    try {
      if (sessionId) {
        await svc.from('chat_messages').insert([
          { session_id: sessionId, role: 'user', content: message + imageLabel },
          { session_id: sessionId, role: 'model', content: fullResponse },
        ]);
        await svc.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
      }
      await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'chat', model: usedModel });
    } catch (_) { /* abaikan */ }

    res.write(`data: ${JSON.stringify({ type: 'done', full: fullResponse })}\n\n`);
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      sendError(res, error);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }
}

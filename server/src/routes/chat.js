import { Router } from 'express';
import { ai, MODEL, MODEL_FALLBACKS, SYSTEM_INSTRUCTION, isRetryable, isModelGone, sleep } from '../gemini.js';

const router = Router();

function modelsToTry() {
  const list = [MODEL, ...MODEL_FALLBACKS];
  return [...new Set(list)];
}

async function streamWithFallback(contents, onText) {
  const tried = [];
  for (const model of modelsToTry()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.55,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        });
        let gotText = false;
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            gotText = true;
            onText(text);
          }
        }
        if (!gotText) throw new Error('Empty stream from ' + model);
        return model;
      } catch (e) {
        tried.push(`${model}: ${String(e.message || e).slice(0, 80)}`);
        if (isModelGone(e)) break;
        if (!isRetryable(e)) throw e;
        await sleep(180 * (attempt + 1));
      }
    }
  }
  throw new Error('Semua model sibuk. Coba lagi sebentar. [' + tried.join(' | ') + ']');
}

// POST /api/chat — streaming response via SSE
router.post('/', async (req, res) => {
  try {
    const { message, history = [], image = null } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Parameter "message" wajib diisi.' });
    }

    let imagePart = null;
    if (image) {
      if (typeof image.data !== 'string' || !/^image\/(png|jpe?g|webp|gif)$/.test(image.mimeType || '')) {
        return res.status(400).json({ error: 'Format gambar tidak didukung. Pakai JPG, PNG, WebP, atau GIF.' });
      }
      if (image.data.length > 7000000) {
        return res.status(413).json({ error: 'Gambar terlalu besar. Maksimal 10MB sebelum kompresi.' });
      }
      imagePart = { inlineData: { mimeType: image.mimeType, data: image.data } };
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Encoding': 'none',
    });
    res.flushHeaders?.();

    // Build contents array: history + current message
    const contents = [];

    for (const turn of history) {
      if (turn.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: turn.content }] });
      } else if (turn.role === 'model') {
        contents.push({ role: 'model', parts: [{ text: turn.content }] });
      }
    }
    const userParts = [{ text: message }];
    if (imagePart) userParts.push(imagePart);
    contents.push({ role: 'user', parts: userParts });

    let fullResponse = '';

    await streamWithFallback(contents, (text) => {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: 'done', full: fullResponse })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[chat] Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Gagal konek ke Gemini API. Cek API key.', detail: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }
});

export default router;

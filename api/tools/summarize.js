import { streamGenerateWithFallback, generateWithFallback, requireUser, sendError } from '../_lib.js';

const STYLES = {
  brief: 'Buat rangkuman singkat 1-2 paragraf yang menangkap inti teks.',
  detailed: 'Buat rangkuman detail dengan struktur: Ringkasan Utama, Poin Kunci, Detail Teknis.',
  bullets: 'Buat rangkuman dalam bentuk bullet points yang terstruktur per topik.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak didukung.' });
  try {
    const { profile, svc } = await requireUser(req);
    const { text, style = 'bullets' } = req.body || {};
    if (!text || text.length < 20) {
      return res.status(400).json({ error: 'Teks terlalu pendek. Minimal 20 karakter.' });
    }
    const { stream } = req.body || {};
    const prompt = `Rangkum teks berikut. ${STYLES[style] || STYLES.bullets}\n\nTeks:\n"""\n${text.slice(0, 30000)}\n"""`;
    if (stream) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.flushHeaders?.();
      let full = '';
      await streamGenerateWithFallback(prompt, undefined, (t) => { full += t; res.write(`data: ${JSON.stringify({ type: 'chunk', text: t })}\n\n`); });
      try { await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'summarize', model: 'stream' }); } catch (_) {}
      res.write(`data: ${JSON.stringify({ type: 'done', full })}\n\n`); res.end(); return;
    }
    const { text: result, model } = await generateWithFallback(prompt, undefined);
    try { await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'summarize', model }); } catch (_) {}
    res.status(200).json({ result });
  } catch (e) {
    sendError(res, e);
  }
}

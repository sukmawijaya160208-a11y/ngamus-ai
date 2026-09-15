import { generateWithFallback, requireUser, sendError } from '../_lib.js';

function cleanJSON(raw) {
  let cleaned = String(raw).trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak didukung.' });
  try {
    const { profile, svc } = await requireUser(req);
    const { text, count = 10, title = 'Set kartu' } = req.body || {};
    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Teks terlalu pendek untuk dijadikan flashcards.' });
    }
    const prompt = `Buat ${count} flashcard dari teks berikut. Setiap flashcard punya pertanyaan (front) dan jawaban (back).

Format output sebagai JSON array:
[{"front": "pertanyaan di sini", "back": "jawaban di sini"}]

Aturan:
- Pertanyaan harus spesifik dan bisa dijawab singkat
- Jawaban padat, maksimal 2-3 kalimat
- Cover poin-poin paling penting dari teks
- Jangan ulang pertanyaan yang mirip

Teks:
"""
${text.slice(0, 20000)}"""`;
    const { text: result, model } = await generateWithFallback(
      prompt,
      'Output HANYA JSON array valid. Tidak ada markdown code fence, tidak ada teks penjelas.'
    );
    const cards = cleanJSON(result);
    try {
      await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'flashcards', model });
      await svc.from('saved_flashcard_sets').insert({ user_id: profile.id, title, cards });
    } catch (_) { /* abaikan */ }
    res.status(200).json({ cards });
  } catch (e) {
    sendError(res, e);
  }
}

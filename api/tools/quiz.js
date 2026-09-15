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
    const { text, count = 5 } = req.body || {};
    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Teks terlalu pendek untuk dijadikan quiz.' });
    }
    const prompt = `Buat ${count} soal pilihan ganda dari teks berikut. Setiap soal punya 4 opsi (A, B, C, D) dan satu jawaban benar.

Format output sebagai JSON array:
[{"question": "soal di sini", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "penjelasan singkat kenapa jawabannya benar"}]

Catatan: "answer" adalah index (0-3) dari option yang benar.

Aturan:
- Soal menguji pemahaman, bukan hafalan buta
- Distractor (opsi salah) harus plausible
- Explanation wajib ada

Teks:
"""
${text.slice(0, 20000)}"""`;
    const { text: result, model } = await generateWithFallback(
      prompt,
      'Output HANYA JSON array valid. Tidak ada markdown code fence, tidak ada teks penjelas.'
    );
    const quiz = cleanJSON(result);
    try {
      await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'quiz', model });
    } catch (_) { /* abaikan */ }
    res.status(200).json({ quiz });
  } catch (e) {
    sendError(res, e);
  }
}

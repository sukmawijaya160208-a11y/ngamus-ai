import { generateWithFallback, requireUser, sendError } from '../_lib.js';

const TONES = {
  akademis: 'Gaya bahasa akademis formal (untuk tugas kuliah).',
  santai: 'Gaya bahasa santai tapi tetap jelas (untuk catatan pribadi).',
  formal: 'Gaya bahasa formal non-akademis (untuk laporan profesional).',
};
const INTENSITIES = {
  ringan: 'Ubah sekitar 30% kata. Pertahankan struktur kalimat sebagian besar.',
  sedang: 'Ubah sekitar 60% kata dan restrukturisasi kalimat. Pertahankan makna.',
  agresif: 'Tulis ulang total dengan struktur dan diksi yang sangat berbeda. Makna harus sama persis.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak didukung.' });
  try {
    const { profile, svc } = await requireUser(req);
    const { text, tone = 'akademis', intensity = 'sedang' } = req.body || {};
    if (!text || text.length < 10) {
      return res.status(400).json({ error: 'Teks terlalu pendek.' });
    }
    const prompt = `Parafrase teks berikut.
Tone: ${TONES[tone] || TONES.akademis}
Intensitas: ${INTENSITIES[intensity] || INTENSITIES.sedang}

PENTING:
- Pertahankan makna asli 100%
- Jangan tambah informasi baru
- Jangan hilangkan informasi penting
- Hasil harus terbaca natural seperti tulisan manusia, bukan output AI
- Variasikan panjang kalimat (campuran pendek dan panjang)

Teks asli:
"""
${text.slice(0, 15000)}"""`;
    const { text: result, model } = await generateWithFallback(
      prompt,
      'Kamu asisten parafrase profesional. Output hanya teks hasil parafrase tanpa komentar tambahan.'
    );
    try {
      await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'paraphrase', model });
    } catch (_) { /* abaikan */ }
    res.status(200).json({ result: result.trim() });
  } catch (e) {
    sendError(res, e);
  }
}

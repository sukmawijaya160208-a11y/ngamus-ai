import { generateWithFallback, requireUser, sendError } from '../_lib.js';

// Satu file untuk 2 path (hemat kuota functions Vercel):
//   /api/tools/explain  → ?resource=explain
//   /api/tools/citation → ?resource=citation

async function handleExplain(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak didukung.' });
  const { profile, svc } = await requireUser(req);
  const { text = '', topic } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Topik wajib diisi.' });
  const context = text ? `\n\nKonteks materi:\n"""\n${text.slice(0, 15000)}\n"""` : '';
  const { text: result, model } = await generateWithFallback(
    `Jelaskan topik berikut dengan mendalam untuk mahasiswa.${context}\n\nTopik: ${topic}`
  );
  try {
    await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'explain', model });
  } catch (_) { /* abaikan */ }
  res.status(200).json({ result });
}

async function handleCitation(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak didukung.' });
  const { profile, svc } = await requireUser(req);
  const { type = 'apa', source } = req.body || {};
  if (!source) return res.status(400).json({ error: 'Data sumber wajib diisi.' });
  const prompt = `Buat sitasi gaya ${String(type).toUpperCase()} untuk sumber berikut. Output HANYA sitasi yang sudah diformat, tanpa penjelasan.\n\nData sumber:\n${JSON.stringify(source, null, 2)}`;
  const { text: result, model } = await generateWithFallback(
    prompt,
    'Kamu generator sitasi akademik. Output hanya sitasi terformat, tidak ada teks lain.'
  );
  try {
    await svc.from('usage_logs').insert({ user_id: profile.id, tool: 'citation', model });
    await svc.from('saved_citations').insert({ user_id: profile.id, style: type, text: result.trim() });
  } catch (_) { /* abaikan */ }
  res.status(200).json({ result: result.trim() });
}

export default async function handler(req, res) {
  try {
    const resource = req.query.resource;
    if (resource === 'explain') return await handleExplain(req, res);
    if (resource === 'citation') return await handleCitation(req, res);
    return res.status(404).json({ error: 'Tidak ditemukan.' });
  } catch (e) {
    sendError(res, e);
  }
}

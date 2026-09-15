import { requireAdmin, sendError } from '../_lib.js';

const ALLOWED_KEYS = ['default_model'];

export default async function handler(req, res) {
  try {
    const { svc } = await requireAdmin(req);

    if (req.method === 'GET') {
      const { data, error } = await svc.from('app_settings').select('key, value, updated_at');
      if (error) throw error;
      return res.status(200).json({ settings: data });
    }

    if (req.method === 'PUT') {
      const { key, value } = req.body || {};
      if (!ALLOWED_KEYS.includes(key)) return res.status(400).json({ error: 'Key tidak dikenal.' });
      const { error } = await svc
        .from('app_settings')
        .upsert({ key, value: String(value || ''), updated_at: new Date().toISOString() });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method tidak didukung.' });
  } catch (e) {
    sendError(res, e);
  }
}

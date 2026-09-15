import { requireAdmin, sendError } from '../_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak didukung.' });
  try {
    const { svc } = await requireAdmin(req);
    const { data, error } = await svc
      .from('usage_logs')
      .select('id, tool, model, created_at, profiles(email, nama)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.status(200).json({ logs: data });
  } catch (e) {
    sendError(res, e);
  }
}

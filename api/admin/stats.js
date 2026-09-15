import { requireAdmin, sendError } from '../_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak didukung.' });
  try {
    const { svc } = await requireAdmin(req);

    const { count: totalUsers } = await svc.from('profiles').select('id', { count: 'exact', head: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: reqToday } = await svc
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const { data: weekLogs } = await svc
      .from('usage_logs')
      .select('tool')
      .gte('created_at', weekAgo);

    const perTool = {};
    (weekLogs || []).forEach((l) => {
      perTool[l.tool] = (perTool[l.tool] || 0) + 1;
    });

    // Jumlah thread bantuan terbuka (0 kalau tabel belum dibuat)
    let supportOpen = 0;
    try {
      const { count } = await svc.from('support_threads').select('id', { count: 'exact', head: true }).eq('status', 'open');
      supportOpen = count || 0;
    } catch {
      supportOpen = 0;
    }

    res.status(200).json({ totalUsers: totalUsers || 0, reqToday: reqToday || 0, perToolWeek: perTool, supportOpen });
  } catch (e) {
    sendError(res, e);
  }
}

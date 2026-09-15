import { requireAdmin, sendError } from '../_lib.js';

export default async function handler(req, res) {
  try {
    const { svc, profile: me } = await requireAdmin(req);

    if (req.method === 'GET') {
      const q = String(req.query.q || '').trim();
      let query = svc.from('profiles').select('id, email, nama, role, is_disabled, created_at').order('created_at', { ascending: false }).limit(100);
      if (q) query = query.or(`email.ilike.%${q}%,nama.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ users: data });
    }

    if (req.method === 'PATCH') {
      const { id, role, is_disabled } = req.body || {};
      if (!id) return res.status(400).json({ error: 'ID user wajib diisi.' });
      if (id === me.id) return res.status(400).json({ error: 'Tidak bisa mengubah akun sendiri.' });
      const patch = {};
      if (role !== undefined) {
        if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Role tidak valid.' });
        patch.role = role;
      }
      if (is_disabled !== undefined) patch.is_disabled = Boolean(is_disabled);
      if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Tidak ada perubahan.' });
      const { error } = await svc.from('profiles').update(patch).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method tidak didukung.' });
  } catch (e) {
    sendError(res, e);
  }
}

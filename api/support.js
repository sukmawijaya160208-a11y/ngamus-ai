import { requireUser, requireAdmin, sendError } from './_lib.js';

// Satu file untuk 2 path (hemat kuota functions Vercel):
//   /api/support/threads  → ?resource=threads
//   /api/support/messages → ?resource=messages

async function threadWithUser(svc, t) {
  const { data: p } = await svc.from('profiles').select('email, nama').eq('id', t.user_id).single();
  const { data: last } = await svc
    .from('support_messages')
    .select('content, sender_id, sender_role, created_at')
    .eq('thread_id', t.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return { ...t, email: p?.email || '—', nama: p?.nama || '', last };
}

async function handleThreads(req, res) {
  if (req.method === 'GET') {
    const wantAll = req.query.all === '1';
    if (wantAll) {
      const { svc } = await requireAdmin(req);
      const { data, error } = await svc
        .from('support_threads')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      const threads = await Promise.all((data || []).map((t) => threadWithUser(svc, t)));
      return res.status(200).json({ threads });
    }
    const { user, svc } = await requireUser(req);
    const { data, error } = await svc
      .from('support_threads')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ threads: data || [] });
  }

  if (req.method === 'POST') {
    const { user, profile, svc } = await requireUser(req);
    if (profile.role === 'admin') {
      return res.status(403).json({ error: 'Admin membalas lewat Panel Admin.' });
    }
    const subject = String(req.body?.subject || 'Bantuan').slice(0, 80);
    const { data, error } = await svc
      .from('support_threads')
      .insert({ user_id: user.id, subject })
      .select('*')
      .single();
    if (error) throw error;
    return res.status(200).json({ thread: data });
  }

  if (req.method === 'PATCH') {
    const { svc } = await requireAdmin(req);
    const { id, status } = req.body || {};
    if (!id || !['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'ID dan status (open/closed) wajib diisi.' });
    }
    const { error } = await svc.from('support_threads').update({ status }).eq('id', id);
    if (error) throw error;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method tidak didukung.' });
}

async function handleMessages(req, res) {
  if (req.method === 'GET') {
    const threadId = String(req.query.threadId || '');
    if (!threadId) return res.status(400).json({ error: 'threadId wajib diisi.' });
    const { user, profile, svc } = await requireUser(req);
    if (profile.role !== 'admin') {
      const { data: t } = await svc.from('support_threads').select('id').eq('id', threadId).eq('user_id', user.id).single();
      if (!t) return res.status(403).json({ error: 'Bukan obrolanmu.' });
    }
    const { data, error } = await svc
      .from('support_messages')
      .select('id, sender_id, sender_role, content, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw error;
    return res.status(200).json({ messages: data || [] });
  }

  if (req.method === 'POST') {
    const { user, profile, svc } = await requireUser(req);
    const { threadId, content } = req.body || {};
    const text = String(content || '').trim();
    if (!threadId || !text) {
      return res.status(400).json({ error: 'threadId dan pesan wajib diisi.' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: 'Pesan maksimal 2000 karakter.' });
    }
    const role = profile.role === 'admin' ? 'admin' : 'user';
    if (role !== 'admin') {
      const { data: t } = await svc.from('support_threads').select('id').eq('id', threadId).eq('user_id', user.id).single();
      if (!t) return res.status(403).json({ error: 'Bukan obrolanmu.' });
    }
    const { data, error } = await svc
      .from('support_messages')
      .insert({ thread_id: threadId, sender_id: user.id, sender_role: role, content: text })
      .select('id, sender_id, sender_role, content, created_at')
      .single();
    if (error) throw error;
    await svc.from('support_threads').update({
      updated_at: new Date().toISOString(),
      ...(role === 'user' ? { status: 'open' } : {}),
    }).eq('id', threadId);
    return res.status(200).json({ message: data });
  }

  return res.status(405).json({ error: 'Method tidak didukung.' });
}

export default async function handler(req, res) {
  try {
    const resource = req.query.resource;
    if (resource === 'threads') return await handleThreads(req, res);
    if (resource === 'messages') return await handleMessages(req, res);
    return res.status(404).json({ error: 'Tidak ditemukan.' });
  } catch (e) {
    sendError(res, e);
  }
}

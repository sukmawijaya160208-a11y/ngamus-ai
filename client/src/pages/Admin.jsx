import { useEffect, useState } from 'react';
import {
  ShieldCheck, Users, Activity, Wrench, Loader2, AlertCircle,
  Search, RefreshCw, Save, Check, Send, LifeBuoy, ScrollText,
  ChevronsLeft, ChevronsRight, TrendingUp, MessageSquareText,
  FileText, Shuffle, BookOpen, Layers, HelpCircle, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  adminStats, adminUsers, adminUpdateUser, adminLogs, adminSettings, adminSaveSetting,
  supportThreads, supportMessages, supportSend, supportSetStatus,
} from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const TOOL_LABELS = {
  chat: 'Tanya AI', summarize: 'Rangkumin', paraphrase: 'Parafrase',
  citation: 'Referensi', flashcards: 'Kartu Belajar', quiz: 'Quiz', explain: 'Penjelasan',
};

const TOOL_ICONS = {
  chat: MessageSquareText, summarize: FileText, paraphrase: Shuffle,
  citation: BookOpen, flashcards: Layers, quiz: HelpCircle, explain: Sparkles,
};

const TABS = [
  { id: 'ringkasan', label: 'Ringkasan', icon: Activity },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'bantuan', label: 'Bantuan', icon: LifeBuoy },
  { id: 'logs', label: 'Log Pakai', icon: ScrollText },
  { id: 'pengaturan', label: 'Pengaturan', icon: Wrench },
];

const TAB_TITLES = {
  ringkasan: ['Ringkasan', 'Pantauan kesehatan Ngampus AI.'],
  users: ['Pengguna', 'Kelola role dan status akun.'],
  bantuan: ['Bantuan', 'Balas obrolan pengguna.'],
  logs: ['Log Pakai', 'Jejak pemakaian tool AI.'],
  pengaturan: ['Pengaturan', 'Konfigurasi aplikasi.'],
};

function fmtTime(iso) {
  try {
    const d = new Date(iso);
    const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === new Date().toDateString()) return time;
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ${time}`;
  } catch {
    return '';
  }
}

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('ringkasan');
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState('');
  const [savedTick, setSavedTick] = useState('');
  const [modelDraft, setModelDraft] = useState('');
  // Bantuan
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [supportMsgs, setSupportMsgs] = useState([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);

  async function loadAll(search) {
    setLoading(true);
    setError('');
    try {
      const [s, u, l, st] = await Promise.all([
        adminStats(), adminUsers(search), adminLogs(), adminSettings(),
      ]);
      setStats(s);
      setUsers(u.users || []);
      setLogs(l.logs || []);
      setSettings(st.settings || []);
      const dm = (st.settings || []).find((x) => x.key === 'default_model');
      if (dm) setModelDraft(dm.value);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    loadSupport(false);
  }

  async function loadSupport(withSpinner) {
    if (withSpinner) setSupportLoading(true);
    try {
      const t = await supportThreads(true);
      const list = t.threads || [];
      setThreads(list);
      setActiveThread((prev) => {
        if (prev) {
          const fresh = list.find((x) => x.id === prev.id);
          if (fresh) return fresh;
        }
        return list.find((x) => x.status === 'open') || list[0] || null;
      });
    } catch {
      setThreads([]);
    } finally {
      if (withSpinner) setSupportLoading(false);
    }
  }

  async function loadSupportMsgs(tid) {
    try {
      const d = await supportMessages(tid);
      setSupportMsgs(d.messages || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { loadAll(''); }, []);

  useEffect(() => {
    if (tab !== 'bantuan' || !activeThread) return;
    loadSupportMsgs(activeThread.id);
    const iv = setInterval(() => {
      if (document.hidden) return;
      supportMessages(activeThread.id).then((d) => setSupportMsgs(d.messages || [])).catch(() => {});
      loadSupport(false);
    }, 4000);
    return () => clearInterval(iv);
  }, [tab, activeThread?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function searchUsers(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await adminUsers(q);
      setUsers(u.users || []);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(u) {
    const next = u.role === 'admin' ? 'user' : 'admin';
    toast(`Ubah ${u.email} jadi ${next.toUpperCase()}?`, {
      action: {
        label: 'Ya, ubah',
        onClick: async () => {
          try {
            await adminUpdateUser(u.id, { role: next });
            setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
            toast.success(`${u.email} sekarang ${next}`);
          } catch (e) { toast.error(e.message); }
        },
      },
      cancel: { label: 'Batal', onClick: () => {} },
      duration: 6000,
    });
  }

  async function toggleDisable(u) {
    const next = !u.is_disabled;
    toast(`${next ? 'Nonaktifkan' : 'Aktifkan'} ${u.email}?`, {
      action: {
        label: next ? 'Nonaktifkan' : 'Aktifkan',
        onClick: async () => {
          try {
            await adminUpdateUser(u.id, { is_disabled: next });
            setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: x.role, is_disabled: next } : x)));
            toast.success(next ? 'Akun dinonaktifkan' : 'Akun diaktifkan');
          } catch (e) { toast.error(e.message); }
        },
      },
      cancel: { label: 'Batal', onClick: () => {} },
      duration: 6000,
    });
  }

  async function saveModel() {
    if (!modelDraft.trim()) return;
    setSavingKey('default_model');
    try {
      await adminSaveSetting('default_model', modelDraft.trim());
      toast.success('Model default tersimpan');
       setSavedTick('Model default tersimpan. Berlaku untuk request berikutnya.');
       setTimeout(() => setSavedTick(''), 4000);
     } catch (e) {
       toast.error(e.message);
     } finally {
       setSavingKey('');
     }
  }

  async function sendReply() {
    const text = supportInput.trim();
    if (!text || supportSending || !activeThread) return;
    setSupportInput('');
    setSupportSending(true);
    try {
      const data = await supportSend(activeThread.id, text);
      setSupportMsgs((prev) => [...prev, data.message]);
      loadSupport(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSupportSending(false);
    }
  }

  async function toggleThreadStatus() {
    if (!activeThread) return;
    const next = activeThread.status === 'open' ? 'closed' : 'open';
    try {
      await supportSetStatus(activeThread.id, next);
      setActiveThread({ ...activeThread, status: next });
      loadSupport(false);
    } catch (e) {
      setError(e.message);
    }
  }

  const openCount = threads.filter((t) => t.status === 'open').length;
  const badgeFor = (id) => {
    if (id === 'users') return users.length || null;
    if (id === 'bantuan') return openCount || null;
    return null;
  };

  const statCards = stats ? [
    { label: 'Total Pengguna', value: stats.totalUsers, sub: 'akun terdaftar', icon: Users },
    { label: 'Request Hari Ini', value: stats.reqToday, sub: 'permintaan AI', icon: Activity },
    { label: 'Request 7 Hari', value: Object.values(stats.perToolWeek || {}).reduce((a, b) => a + b, 0), sub: 'akumulasi mingguan', icon: TrendingUp },
    { label: 'Bantuan Terbuka', value: stats.supportOpen ?? openCount, sub: 'perlu dibalas', icon: LifeBuoy, go: 'bantuan' },
  ] : [];

  const [tabTitle, tabDesc] = TAB_TITLES[tab];

  const navBtn = (t) => {
    const Icon = t.icon;
    const badge = badgeFor(t.id);
    const active = tab === t.id;
    return (
      <button
        key={t.id}
        type="button"
        title={t.label}
        onClick={() => setTab(t.id)}
        className={`w-full flex items-center gap-3 rounded-[8px] text-[14px] font-medium transition-colors duration-120 ${
          collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
        } ${active ? 'bg-accent-soft text-accent-deep' : 'text-muted hover:bg-surface-hover hover:text-main'}`}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span className="flex-1 text-left truncate">{t.label}</span>}
        {!collapsed && badge != null && (
          <span className="shrink-0 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
        {collapsed && badge != null && (
          <span className="absolute ml-6 -mt-5 min-w-4 h-4 px-0.5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-screen">
      {/* Sub-sidebar (desktop) */}
      <aside className={`hidden md:flex flex-col shrink-0 border-r border-app bg-surface transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-4`}>
          {!collapsed && (
            <span className="flex items-center gap-2 font-extrabold text-[15px]">
              <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <ShieldCheck size={17} className="text-white" />
              </span>
              Admin
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Buka panel' : 'Ciutkan panel'}
            className="p-2 rounded-lg text-muted hover:bg-surface-hover hover:text-main transition-colors"
          >
            {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {TABS.map(navBtn)}
        </nav>
        <div className="px-3 py-3 border-t border-app">
          {!collapsed && (
            <p className="text-[11px] text-subtle px-1">Panel admin · Ngampus AI</p>
          )}
        </div>
      </aside>

      {/* Konten */}
      <div className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8">
        {/* Topbar mobile: tab horizontal */}
        <div className="md:hidden flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap border transition-colors ${tab === t.id ? 'bg-accent text-white border-accent' : 'bg-surface text-muted border-app'}`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <header className="mb-6 flex items-center gap-3">
          <div>
            <h1 className="font-bold text-xl">{tabTitle}</h1>
            <p className="text-[13px] text-muted">{tabDesc}</p>
          </div>
          <button onClick={() => { loadAll(q); }} className="ml-auto flex items-center gap-1.5 text-[12.5px] text-muted hover:text-accent border border-app bg-surface rounded-lg px-3 py-2">
            <RefreshCw size={14} /> Muat ulang
          </button>
        </header>

        {error && (
          <p role="alert" className="flex items-center gap-2 text-[13px] text-danger bg-danger-soft px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} /> {error}
          </p>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20 text-subtle">
            <Loader2 size={26} className="animate-spin text-accent" />
          </div>
        ) : (
          <>
            {tab === 'ringkasan' && stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {statCards.map((c) => {
                    const Icon = c.icon;
                    const inner = (
                      <>
                        <div className="flex items-start justify-between">
                          <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                            <Icon size={19} className="text-accent" />
                          </span>
                        </div>
                        <p className="font-extrabold text-3xl mt-3">{c.value}</p>
                        <p className="text-[12px] font-semibold mt-0.5">{c.label}</p>
                        <p className="text-[11.5px] text-muted">{c.sub}</p>
                      </>
                    );
                    return c.go ? (
                      <button key={c.label} type="button" onClick={() => setTab(c.go)} className="text-left bg-surface border border-app rounded-xl p-5 shadow-card hover:border-accent transition-colors">
                        {inner}
                      </button>
                    ) : (
                      <div key={c.label} className="bg-surface border border-app rounded-xl p-5 shadow-card">
                        {inner}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                  {/* Aktivitas terbaru */}
                  <div className="xl:col-span-3 bg-surface border border-app rounded-xl shadow-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-app flex items-center justify-between">
                      <h2 className="font-bold text-[15px]">Aktivitas Terbaru</h2>
                      <button type="button" onClick={() => setTab('logs')} className="text-[12.5px] font-semibold text-accent hover:underline">
                        Lihat semua
                      </button>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {logs.slice(0, 7).map((l) => {
                        const Icon = TOOL_ICONS[l.tool] || Activity;
                        return (
                          <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                            <span className="w-9 h-9 rounded-lg bg-bg-subtle border border-app flex items-center justify-center shrink-0">
                              <Icon size={16} className="text-accent" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13.5px] font-semibold truncate">
                                {l.profiles?.email || '—'} <span className="font-normal text-muted">memakai {TOOL_LABELS[l.tool] || l.tool}</span>
                              </p>
                              <p className="text-[11.5px] text-subtle">{fmtTime(l.created_at)} · {l.model || '—'}</p>
                            </div>
                          </div>
                        );
                      })}
                      {logs.length === 0 && (
                        <p className="px-5 py-8 text-center text-subtle text-[13px]">Belum ada aktivitas.</p>
                      )}
                    </div>
                  </div>

                  {/* Statistik cepat */}
                  <div className="xl:col-span-2 bg-surface border border-app rounded-xl p-5 shadow-card">
                    <h2 className="font-bold text-[15px] mb-4">Pemakaian per Tool (7 hari)</h2>
                    {Object.keys(stats.perToolWeek || {}).length === 0 ? (
                      <p className="text-[13px] text-subtle">Belum ada aktivitas minggu ini.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(stats.perToolWeek).sort((a, b) => b[1] - a[1]).map(([tool, n]) => {
                          const max = Math.max(...Object.values(stats.perToolWeek));
                          return (
                            <div key={tool}>
                              <div className="flex items-center justify-between text-[12.5px] mb-1">
                                <span className="font-medium">{TOOL_LABELS[tool] || tool}</span>
                                <span className="font-bold">{n}</span>
                              </div>
                              <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
                                <span className="block h-full bg-accent rounded-full" style={{ width: `${Math.max((n / max) * 100, 4)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="bg-surface border border-app rounded-xl shadow-card overflow-hidden">
                <form onSubmit={searchUsers} className="flex gap-2 p-4 border-b border-app">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari email atau nama..." aria-label="Cari pengguna" className="w-full bg-bg-subtle border border-app rounded-lg pl-9 pr-3 py-2.5 text-[13.5px] focus:outline-none focus:border-accent" />
                  </div>
                  <button type="submit" className="px-4 py-2.5 rounded-lg bg-accent text-white text-[13.5px] font-semibold">Cari</button>
                </form>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[640px]">
                    <thead>
                      <tr className="text-left text-subtle border-b border-app">
                        <th className="px-4 py-3 font-semibold">Email / Nama</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Daftar</th>
                        <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-app last:border-0 hover:bg-surface-hover">
                          <td className="px-4 py-3">
                            <span className="block font-semibold">{u.email}</span>
                            <span className="block text-subtle text-[12px]">{u.nama || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-accent text-white' : 'bg-bg-subtle border border-app text-muted'}`}>{u.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            {u.is_disabled ? <span className="text-danger font-semibold text-[12px]">Nonaktif</span> : <span className="text-success font-semibold text-[12px]">Aktif</span>}
                          </td>
                          <td className="px-4 py-3 text-subtle text-[12px]">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button type="button" onClick={() => toggleRole(u)} className="text-[12px] font-semibold text-accent hover:underline mr-3">
                              Jadi {u.role === 'admin' ? 'user' : 'admin'}
                            </button>
                            <button type="button" onClick={() => toggleDisable(u)} className={`text-[12px] font-semibold hover:underline ${u.is_disabled ? 'text-success' : 'text-danger'}`}>
                              {u.is_disabled ? 'Aktifkan' : 'Nonaktifkan'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-subtle">Tidak ada pengguna.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'bantuan' && (
              <div className="bg-surface border border-app rounded-xl shadow-card overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[480px]">
                  {/* Daftar thread */}
                  <div className="border-b md:border-b-0 md:border-r border-app flex flex-col min-h-0">
                    <div className="px-4 py-3 border-b border-app flex items-center justify-between">
                      <span className="font-bold text-[13.5px]">Obrolan masuk</span>
                      <button type="button" onClick={() => loadSupport(true)} aria-label="Muat ulang bantuan" className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface-hover">
                        <RefreshCw size={15} className={supportLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-56 md:max-h-none">
                      {threads.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setActiveThread(t); setSupportMsgs([]); loadSupportMsgs(t.id); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeThread?.id === t.id ? 'bg-accent-soft' : 'hover:bg-surface-hover'}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'open' ? 'bg-success' : 'bg-[var(--border-strong)]'}`} />
                            <span className="font-semibold text-[13px] truncate flex-1">{t.nama || t.email}</span>
                          </span>
                          <span className="block text-[12px] text-subtle truncate mt-0.5 pl-4">
                            {t.last ? `${t.last.sender_id && t.last.sender_id === user?.id ? 'Kamu: ' : ''}${t.last.content}` : 'Belum ada pesan'}
                          </span>
                          <span className="block text-[11px] text-subtle pl-4 mt-0.5">{fmtTime(t.updated_at)}</span>
                        </button>
                      ))}
                      {threads.length === 0 && (
                        <p className="text-[12.5px] text-subtle text-center px-3 py-8">
                          Belum ada obrolan bantuan.
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Isi obrolan */}
                  <div className="flex flex-col min-h-[420px]">
                    {!activeThread ? (
                      <div className="flex-1 flex items-center justify-center text-subtle text-[13px] p-8">
                        Pilih obrolan di sebelah kiri.
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-app flex items-center gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-[14px] truncate">{activeThread.nama || activeThread.email}</p>
                            <p className="text-[11.5px] text-subtle truncate">{activeThread.email}</p>
                          </div>
                          <button
                            type="button"
                            onClick={toggleThreadStatus}
                            className={`ml-auto text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${activeThread.status === 'open' ? 'border-app text-muted hover:border-danger hover:text-danger' : 'border-accent text-accent hover:bg-accent-soft'}`}
                          >
                            {activeThread.status === 'open' ? 'Tutup' : 'Buka lagi'}
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px]">
                          {supportMsgs.map((m) => {
                            const mine = m.sender_id ? m.sender_id === user?.id : m.sender_role === 'admin';
                            return (
                            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap ${mine ? 'bg-accent text-white rounded-br-md' : 'bg-bg-subtle border border-app rounded-bl-md'}`}>
                                {m.content}
                                <span className={`block text-[10.5px] mt-1 text-right ${mine ? 'text-white/70' : 'text-subtle'}`}>
                                  {fmtTime(m.created_at)}
                                </span>
                              </div>
                            </div>
                            );
                          })}
                          {supportMsgs.length === 0 && (
                            <p className="text-center text-subtle text-[12.5px] py-6">Belum ada pesan di obrolan ini.</p>
                          )}
                        </div>
                        <div className="p-3 border-t border-app flex items-end gap-2">
                          <textarea
                            value={supportInput}
                            onChange={(e) => setSupportInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                            placeholder="Balas sebagai admin..."
                            rows={1}
                            aria-label="Balas pesan"
                            className="flex-1 min-w-0 resize-none bg-bg-subtle border border-app rounded-xl px-3.5 py-2.5 text-[13.5px] focus:outline-none focus:border-accent max-h-28"
                          />
                          <button
                            type="button"
                            onClick={sendReply}
                            disabled={!supportInput.trim() || supportSending}
                            aria-label="Kirim balasan"
                            className="shrink-0 w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 text-white flex items-center justify-center"
                          >
                            {supportSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'logs' && (
              <div className="bg-surface border border-app rounded-xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[560px]">
                    <thead>
                      <tr className="text-left text-subtle border-b border-app">
                        <th className="px-4 py-3 font-semibold">Waktu</th>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Tool</th>
                        <th className="px-4 py-3 font-semibold">Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id} className="border-b border-app last:border-0 hover:bg-surface-hover">
                          <td className="px-4 py-2.5 text-subtle text-[12px] whitespace-nowrap">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2.5">{l.profiles?.email || '—'}</td>
                          <td className="px-4 py-2.5 font-medium">{TOOL_LABELS[l.tool] || l.tool}</td>
                          <td className="px-4 py-2.5 font-mono text-[12px] text-subtle">{l.model || '—'}</td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-subtle">Belum ada log.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'pengaturan' && (
              <div className="bg-surface border border-app rounded-xl p-5 shadow-card space-y-4 max-w-2xl">
                <div>
                  <label htmlFor="setting-model" className="text-[13px] font-semibold block mb-1.5">Model AI default</label>
                  <p className="text-[12.5px] text-muted mb-2">Dipakai saat user tidak memilih model khusus. Contoh: gemini-3.8-flash, gemini-flash-latest.</p>
                  <div className="flex gap-2">
                    <input id="setting-model" value={modelDraft} onChange={(e) => setModelDraft(e.target.value)} className="flex-1 min-w-0 bg-bg-subtle border border-app rounded-lg px-3.5 py-2.5 text-[14px] font-mono focus:outline-none focus:border-accent" />
                    <button type="button" onClick={saveModel} disabled={savingKey === 'default_model'} className="px-4 py-2.5 rounded-lg bg-accent text-white text-[13.5px] font-semibold flex items-center gap-1.5 disabled:opacity-50">
                      {savingKey === 'default_model' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
                    </button>
                  </div>
                  {savedTick && (
                    <p className="flex items-center gap-1.5 text-[12.5px] text-success mt-2"><Check size={14} /> {savedTick}</p>
                  )}
                </div>
                <div className="border-t border-app pt-4">
                  <h2 className="font-bold text-[14px] mb-2">Semua pengaturan</h2>
                  {settings.map((s) => (
                    <div key={s.key} className="flex items-center justify-between py-2 border-b border-app last:border-0 text-[13px]">
                      <code className="font-mono">{s.key}</code>
                      <span className="font-mono text-muted">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

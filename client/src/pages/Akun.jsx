import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, AlertCircle, Check, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { Field } from '../components/auth-ui.jsx';
import RoleBadge from '../components/RoleBadge.jsx';

export default function Akun() {
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState(profile?.nama || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pw1, setPw1] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  // Profil dimuat async — sinkronkan nama saat tiba (jangan timpa ketikan user)
  useEffect(() => {
    if (profile?.nama) setNama((prev) => prev || profile.nama);
  }, [profile?.nama]);

  async function saveNama(e) {
    e.preventDefault();
    if (!nama.trim()) {
      setMsg({ type: 'error', text: 'Nama tidak boleh kosong.' });
      return;
    }
    setSaving(true);
    setMsg({ type: '', text: '' });
    const { error } = await supabase.from('profiles').update({ nama: nama.trim() }).eq('id', user.id);
    setSaving(false);
    if (error) setMsg({ type: 'error', text: error.message });
    else {
      setMsg({ type: 'ok', text: 'Nama berhasil diperbarui.' });
      refreshProfile();
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pw1.length < 6) {
      setPwMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }
    setPwSaving(true);
    setPwMsg({ type: '', text: '' });
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setPwSaving(false);
    if (error) setPwMsg({ type: 'error', text: error.message });
    else {
      setPwMsg({ type: 'ok', text: 'Password berhasil diganti.' });
      setPw1('');
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center">
            <User size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Akun saya</h1>
            <p className="text-[13px] text-muted">Kelola profil dan keamanan.</p>
          </div>
        </div>
      </header>

      {/* identitas */}
      <div className="bg-surface border border-app rounded-xl p-5 shadow-card mb-4 flex items-center gap-4">
        <span className="w-12 h-12 rounded-full bg-accent-soft text-accent-deep font-extrabold text-lg flex items-center justify-center shrink-0">
          {(profile?.nama || user?.email || '?').charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-[15px] truncate">{profile?.nama || '—'}</p>
          <p className="text-[13px] text-muted truncate">{user?.email}</p>
        </div>
        <RoleBadge role={profile?.role} disabled={profile?.is_disabled} size="md" />
      </div>

      {/* ubah nama */}
      <form onSubmit={saveNama} className="bg-surface border border-app rounded-xl p-5 shadow-card mb-4 space-y-3">
        <h2 className="font-bold text-[15px]">Ubah nama</h2>
        <Field label="Nama lengkap" type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
        {msg.text && (
          <p className={`flex items-center gap-2 text-[12.5px] px-3 py-2 rounded-lg ${msg.type === 'ok' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
            {msg.type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />} {msg.text}
          </p>
        )}
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold text-[13.5px] flex items-center gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />} Simpan nama
        </button>
      </form>

      {/* ganti password */}
      <form onSubmit={changePassword} className="bg-surface border border-app rounded-xl p-5 shadow-card mb-4 space-y-3">
        <h2 className="font-bold text-[15px]">Ganti password</h2>
        <Field label="Password baru" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="Minimal 6 karakter" autoComplete="new-password" />
        {pwMsg.text && (
          <p className={`flex items-center gap-2 text-[12.5px] px-3 py-2 rounded-lg ${pwMsg.type === 'ok' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
            {pwMsg.type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />} {pwMsg.text}
          </p>
        )}
        <button type="submit" disabled={pwSaving} className="px-5 py-2.5 rounded-lg bg-surface border border-strong hover:border-accent font-semibold text-[13.5px] flex items-center gap-2">
          {pwSaving && <Loader2 size={14} className="animate-spin" />} Ganti password
        </button>
      </form>

      <button onClick={handleLogout} className="w-full py-3 rounded-xl text-[14px] font-semibold text-danger bg-danger-soft hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <LogOut size={16} /> Keluar dari akun
      </button>
    </div>
  );
}

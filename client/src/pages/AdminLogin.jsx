import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { SetupNotice } from '../components/auth-ui.jsx';

function DarkField({ label, ...props }) {
  const id = `admin-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="text-[13px] font-semibold block mb-1.5 text-white/80">{label}</label>
      <input
        id={id}
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#d97706] transition-colors"
      />
    </div>
  );
}

/* Login khusus pengelola. Akun non-admin ditolak walau password benar. */
export default function AdminLogin() {
  const { configured, user, isAdmin, loading: authLoading, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!configured) return <SetupNotice />;
  if (!authLoading && user && isAdmin) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Isi email dan password admin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      const { data: { user: u } } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', u.id).single();
      if (prof?.role !== 'admin') {
        await signOut();
        setError('Akun ini bukan admin. Halaman ini khusus pengelola.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(/invalid login credentials/i.test(err.message || '') ? 'Email atau password salah.' : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-[#141210]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-2xl bg-[#d97706] inline-flex items-center justify-center">
            <ShieldCheck size={24} className="text-white" />
          </span>
          <h1 className="font-display font-bold text-2xl mt-4 text-[#fafaf9]">Panel Admin</h1>
          <p className="text-white/50 text-[13.5px] mt-1">Akses terbatas — khusus pengelola Ngampus AI.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 space-y-3.5">
          <DarkField label="Email admin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" autoComplete="email" />
          <div>
            <label htmlFor="admin-password" className="text-[13px] font-semibold block mb-1.5 text-white/80">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password admin"
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-11 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#d97706] transition-colors"
              />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          {error && (
            <p role="alert" className="flex items-start gap-2 text-[12.5px] text-[#f87171] bg-[#450a0a] border border-[#7f1d1d] px-3 py-2.5 rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] disabled:opacity-50 text-white font-semibold text-[14px] transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Memeriksa...</> : 'Masuk sebagai Admin'}
          </button>
        </form>
        <div className="flex items-center justify-between mt-5 text-[13px]">
          <Link to="/" className="text-white/50 hover:text-white transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Beranda
          </Link>
          <Link to="/auth" className="text-white/50 hover:text-white transition-colors">
            Masuk sebagai pengguna
          </Link>
        </div>
      </div>
    </div>
  );
}

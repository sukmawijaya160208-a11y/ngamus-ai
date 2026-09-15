import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, GraduationCap, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { SetupNotice } from '../components/auth-ui.jsx';
import AuthSwitch from '../components/AuthSwitch.jsx';

function toIDMessage(msg) {
  if (/invalid login credentials/i.test(msg)) return 'Email atau password salah.';
  if (/email not confirmed/i.test(msg)) return 'Email belum diverifikasi. Cek inbox kamu.';
  if (/too many requests|rate limit/i.test(msg)) return 'Terlalu banyak percobaan. Tunggu sebentar.';
  return msg;
}

function PillField({ icon: Icon, label, ...props }) {
  return (
    <label className="asw-field">
      <Icon size={18} aria-hidden="true" />
      <input {...props} aria-label={label} className="asw-input" />
    </label>
  );
}

function PasswordField({ label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="asw-field">
      <Lock size={18} aria-hidden="true" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={label}
        className="asw-input"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        className="asw-eye"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="asw-error">
      <AlertCircle size={15} className="shrink-0 mt-0.5" /> {message}
    </p>
  );
}

function MasukForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Isi email dan password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(toIDMessage(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="asw-form">
      <h2 className="asw-title">Masuk</h2>
      <p className="asw-sub">Lanjut belajar di mana terakhir berhenti.</p>
      <PillField icon={Mail} label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" />
      <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password kamu" autoComplete="current-password" />
      <ErrorBox message={error} />
      <button type="submit" disabled={loading} className="asw-btn asw-submit">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Masuk...</> : 'Masuk'}
      </button>
    </form>
  );
}

function DaftarForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [canResend, setCanResend] = useState(false);

  async function handleResend() {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth?mode=masuk` },
      });
      if (resendError) throw resendError;
      setCanResend(false);
      setDone(true);
    } catch (err) {
      setError(toIDMessage(err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !password) {
      setError('Isi nama, email, dan password.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    setLoading(true);
    setError('');
    setCanResend(false);
    try {
      const data = await signUp(nama.trim(), email.trim(), password);
      if (data.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setDone(true);
      }
    } catch (err) {
      if (/already registered|already exists/i.test(err.message)) {
        setError('Email ini sudah terdaftar tapi belum diverifikasi. Minta link baru di bawah.');
        setCanResend(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="asw-form asw-done">
        <CheckCircle2 size={40} className="text-success" />
        <h2 className="asw-title mt-3">Cek email kamu</h2>
        <p className="asw-sub">
          Pendaftaran berhasil. Kami mengirim link verifikasi ke <b className="text-main">{email}</b>.
          Klik link itu, lalu masuk.
        </p>
        <Link to="/auth" className="asw-btn asw-submit asw-linkbtn">
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="asw-form">
      <h2 className="asw-title">Daftar</h2>
      <p className="asw-sub">Satu akun gratis untuk semua tool belajar.</p>
      <PillField icon={User} label="Nama lengkap" type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama kamu" autoComplete="name" />
      <PillField icon={Mail} label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" />
      <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete="new-password" />
      <ErrorBox message={error} />
      {canResend && !loading && (
        <button type="button" onClick={handleResend} className="mt-2 text-[13px] text-accent font-semibold hover:underline">
          Kirim ulang link verifikasi
        </button>
      )}
      <button type="submit" disabled={loading} className="asw-btn asw-submit">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Mendaftar...</> : 'Buat akun'}
      </button>
    </form>
  );
}

export default function Auth() {
  const { configured } = useAuth();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'daftar' ? 'daftar' : 'masuk';

  if (!configured) return <SetupNotice />;

  function handleSwitch(next) {
    setParams(next === 'daftar' ? { mode: 'daftar' } : {}, { replace: false });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-2.5 mb-7">
        <span className="w-10 h-10 rounded-[10px] bg-accent flex items-center justify-center">
          <GraduationCap size={22} className="text-white" />
        </span>
        <span className="font-display font-bold text-lg">Ngampus AI</span>
      </Link>
      <AuthSwitch
        mode={mode}
        onSwitch={handleSwitch}
        masukForm={<MasukForm />}
        daftarForm={<DaftarForm />}
      />
      <Link to="/" className="mt-6 text-[13.5px] text-muted hover:text-main transition-colors">
        ← Kembali ke beranda
      </Link>
    </div>
  );
}

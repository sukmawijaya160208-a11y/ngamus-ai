import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function SetupNotice() {
  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="bg-surface border border-app rounded-2xl p-8 shadow-card text-center">
        <span className="w-12 h-12 rounded-xl bg-accent-soft inline-flex items-center justify-center">
          <AlertTriangle size={22} className="text-accent" />
        </span>
        <h1 className="font-bold text-lg mt-4">Backend akun belum disambung</h1>
        <p className="text-muted text-[14px] leading-relaxed mt-2">
          Pemilik aplikasi perlu membuat project Supabase gratis, menjalankan{' '}
          <code className="font-mono text-[12px] bg-bg-subtle border border-app rounded px-1.5 py-0.5">supabase-schema.sql</code>,
          lalu mengisi <code className="font-mono text-[12px] bg-bg-subtle border border-app rounded px-1.5 py-0.5">client/.env</code>.
          Panduan lengkap ada di <code className="font-mono text-[12px] bg-bg-subtle border border-app rounded px-1.5 py-0.5">DEPLOY.md</code>.
        </p>
        <Link to="/" className="inline-block mt-5 text-accent font-semibold text-[14px]">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export function Field({ label, ...props }) {
  const id = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="text-[13px] font-semibold block mb-1.5">{label}</label>
      <input
        id={id}
        {...props}
        className="w-full bg-bg-subtle border border-app rounded-lg px-3.5 py-2.5 text-[14px] text-main placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

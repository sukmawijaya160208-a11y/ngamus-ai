import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  FileText,
  Shuffle,
  BookOpen,
  Layers,
  HelpCircle,
  ArrowRight,
  Zap,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from '../components/RoleBadge.jsx';

const TOOLS = [
  { to: '/chat', label: 'Tanya AI', desc: 'Chat dengan Gemini Flash. Tanya apa aja tentang materi kuliah.', icon: MessageSquareText },
  { to: '/rangkumin', label: 'Rangkumin', desc: 'Ubah teks panjang jadi poin-poin kunci yang terstruktur.', icon: FileText },
  { to: '/parafrase', label: 'Parafrase', desc: 'Tulis ulang teks biar lolos detektor AI. Makna tetap sama.', icon: Shuffle },
  { to: '/referensi', label: 'Referensi', desc: 'Generate sitasi APA, IEEE, Harvard dari data sumber.', icon: BookOpen },
  { to: '/kartu-belajar', label: 'Kartu Belajar', desc: 'Auto-generate flashcard dari materi untuk hafalan cepat.', icon: Layers },
  { to: '/quiz', label: 'Quiz', desc: 'Uji pemahaman dengan soal pilihan ganda + penjelasan.', icon: HelpCircle },
];

export default function Dashboard() {
  const { profile, isAdmin, isDisabled } = useAuth();
  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:px-8 md:py-12">
      {/* Hero — role aware */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold">
            <Zap size={12} /> Powered by Gemini Flash
          </span>
          <RoleBadge role={profile?.role} disabled={isDisabled} size="md" />
          {isAdmin && <span className="text-xs font-mono text-subtle">· Panel admin di sidebar</span>}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
          {isAdmin ? `Halo, ${profile?.nama || 'Admin'} — pantau kampus.` : 'Belajar kuliah jadi lebih cepat.'}
        </h1>
        <p className="text-muted mt-2 text-base md:text-lg max-w-xl">
          {isAdmin ? 'Kelola pengguna, log pemakaian, dan bantuan. Akun admin tetap bisa pakai semua tool user.' : 'Asisten AI untuk mahasiswa Indonesia. Tanya materi, rangkum jurnal, parafrase tugas, bikin flashcard — semua di satu tempat.'}
        </p>
        {isAdmin && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-900 text-white text-sm font-semibold hover:bg-black transition-colors">
              <ShieldCheck size={16} /> Buka Panel Admin <ArrowRight size={14} />
            </Link>
            <Link to="/bantuan" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-strong hover:border-accent text-sm font-semibold transition-colors">
              <Activity size={16} /> Cek Bantuan Masuk
            </Link>
          </div>
        )}
      </header>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.to}
              to={tool.to}
              className="group bg-surface border border-app rounded-[10px] p-5 shadow-card hover:shadow-card-md hover:border-strong transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center">
                  <Icon size={20} className="text-accent" />
                </div>
                <ArrowRight size={18} className="text-subtle group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-[15px] mt-3">{tool.label}</h3>
              <p className="text-[13px] text-muted mt-1 leading-relaxed">{tool.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Stats / info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-app rounded-[10px] p-4 shadow-card">
          <div className="text-2xl font-extrabold text-accent">15 RPM</div>
          <div className="text-xs text-muted mt-0.5">Rate limit Gemini Flash gratis</div>
        </div>
        <div className="bg-surface border border-app rounded-[10px] p-4 shadow-card">
          <div className="text-2xl font-extrabold text-accent">1 Juta</div>
          <div className="text-xs text-muted mt-0.5">Token per menit (gratis)</div>
        </div>
        <div className="bg-surface border border-app rounded-[10px] p-4 shadow-card">
          <div className="text-2xl font-extrabold text-accent">6 Tools</div>
          <div className="text-xs text-muted mt-0.5">Dalam satu aplikasi</div>
        </div>
      </div>

      {/* Setup reminder */}
      <div className="mt-6 bg-bg-subtle border border-app rounded-[10px] p-5">
        <h3 className="font-bold text-sm">Cara Mulai</h3>
        <ol className="mt-2 space-y-1.5 text-[13px] text-muted">
          <li><span className="text-accent font-semibold">1.</span> Dapatkan API key gratis di <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-accent underline">Google AI Studio</a></li>
          <li><span className="text-accent font-semibold">2.</span> Simpan di <code className="font-mono text-[12px] bg-surface px-1.5 py-0.5 rounded border border-app">server/.env</code> dengan format <code className="font-mono text-[12px] bg-surface px-1.5 py-0.5 rounded border border-app">GEMINI_API_KEY=...</code></li>
          <li><span className="text-accent font-semibold">3.</span> Jalankan server: <code className="font-mono text-[12px] bg-surface px-1.5 py-0.5 rounded border border-app">npm run dev</code></li>
          <li><span className="text-accent font-semibold">4.</span> Mulai pakai tools di atas</li>
        </ol>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import {
  GraduationCap, ArrowRight, Check, Menu, X,
  Sparkles, Quote, ChevronDown,
  AlertTriangle, FileWarning, Clock3,
} from 'lucide-react';
import MarqueeHero from '../components/MarqueeHero.jsx';
import FeatureSlides from '../components/FeatureSlides.jsx';
import Coverflow from '../components/Coverflow.jsx';
import Footer from '../components/Footer.jsx';
import { ScrollProgress, Stagger } from '../components/LandingMotion.jsx';
import ScrollCanvas from '../components/ScrollCanvas.jsx';
import { ParallaxSection, ScaleOnScroll } from '../components/ScrollAnimations.jsx';

const PH = '/FOTO%20UNTUK%20LEANDING%20PAGE';
const spring = { type: 'spring', stiffness: 110, damping: 20 };

function Rise({ children, delay = 0, className = '' }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-70px' }} transition={{ ...spring, delay }}>
      {children}
    </motion.div>
  );
}

function CountUp({ end, suffix = '', duration = 1400 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min((t - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(eased * end));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick); io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString('id-ID')}{suffix}</span>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [
    { href: '#fitur', label: 'Fitur' },
    { href: '#cara-kerja', label: 'Cara Kerja' },
    { href: '#cerita', label: 'Catatan' },
    { href: '#batas', label: 'Batas' },
    { href: '#harga', label: 'Harga' },
    { href: '#faq', label: 'FAQ' },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${scrolled ? 'bg-surface/90 backdrop-blur-md border-b border-app' : 'bg-transparent border-b border-transparent'}`}>
      <motion.span aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent" style={{ scaleX: scrollYProgress }} />
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#atas" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center"><GraduationCap size={19} className="text-white" /></span>
          <span className="font-display text-[18px] tracking-tight">Ngampus AI</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-bg-subtle text-muted font-mono text-[10px] border border-app">v2.4</span>
        </a>
        <nav className="hidden md:flex items-center gap-7" aria-label="Navigasi utama">
          {links.map((l) => (<a key={l.href} href={l.href} className="text-[13px] font-medium text-muted hover:text-main transition-colors">{l.label}</a>))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-[14px] font-semibold transition-colors">Mulai gratis <ArrowRight size={15} /></Link>
          <button type="button" className="md:hidden p-2 rounded-xl hover:bg-surface-hover" onClick={() => setOpen(!open)} aria-label={open ? 'Tutup menu' : 'Buka menu'}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden bg-surface border-t border-app px-5 py-3 space-y-1">
          {links.map((l) => (<a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted hover:bg-bg-subtle hover:text-main">{l.label}</a>))}
          <Link to="/dashboard" className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-accent text-white text-[14px] font-semibold mt-2">Mulai gratis <ArrowRight size={15} /></Link>
        </nav>
      )}
    </header>
  );
}

const FAQS = [
  { q: 'Beneran gratis? Apa syaratnya?', a: 'Ya. Ngampus AI memakai Gemini Flash yang punya jatah gratis 1.500 request per hari — cukup untuk pemakaian kuliah normal. Satu-satunya syarat: daftar dan login, lalu admin menyambungkan API key server. Kuota milik bersama, pemakaian dicatat transparan di panel admin.' },
  { q: 'Apakah ini termasuk contekan atau curang akademik?', a: 'Tergantung pemakaian. Ngampus AI dirancang sebagai tutor: menjelaskan konsep, merangkum materi yang kamu upload, dan menguji pemahaman lewat quiz. Menyalin mentah-mentah jawaban untuk tugas tetap tanggung jawabmu — pakai fitur Parafrase untuk menulis ulang dengan bahasamu sendiri dan selalu pahami isinya.' },
  { q: 'Dataku aman? Materi yang ku-upload dikirim ke mana?', a: 'Teks yang kamu tempel dikirim ke Gemini API untuk diproses, lalu jawabannya ditampilkan. Riwayat chat dan sitasi tersimpan di database akunmu yang dilindungi Row Level Security — user lain tidak bisa mengintip. Jangan tempel data pribadi sensitif seperti password di tool AI mana pun.' },
  { q: 'Perlu install apa? Bisa di HP?', a: 'Tidak perlu install. Ini aplikasi web responsif — buka di browser HP, tablet, atau laptop. Cukup daftar satu akun untuk memakai semua tool dan riwayatmu ikut ke mana-mana.' },
  { q: 'Bedanya sama ChatGPT atau pelajarin.ai?', a: 'ChatGPT itu generalis. Ngampus AI dikemas khusus alur kuliah Indonesia: rangkum jurnal → tanya konsep → parafrase tugas → generate sitasi APA/IEEE → hafalkan via flashcard → uji via quiz, dalam satu tempat, satu akun, satu bahasa.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-surface border rounded-2xl overflow-hidden transition-colors ${open ? 'border-accent/30' : 'border-app hover:border-strong'}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4">
        <span className="font-display text-[16px] leading-snug">{q}</span>
        <span className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-accent border-accent text-white' : 'border-app text-muted'}`}><ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} /></span>
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden"><p className="px-5 pb-5 text-[14px] text-muted leading-relaxed">{a}</p></div>
      </div>
    </div>
  );
}

const PLANS = [
  { name: 'Pelajar', desc: 'Mulai serius — semua tool inti, jatah harian lega.', price: 30, was: 60, off: 50, cta: 'Pilih Pelajar', includes: 'Mulai dengan:', popular: false, features: ['Keenam tool + akun pribadi', '200 request / hari', 'Riwayat 90 hari', 'Upload gambar', 'Dukungan email'] },
  { name: 'Kampus', desc: 'Pejuang deadline — kuota besar + antrean prioritas.', price: 90, was: 140, off: 36, cta: 'Pilih Kampus', includes: 'Semua di Pelajar, plus:', popular: true, features: ['2.000 request / hari', 'Riwayat selamanya', 'Antrean prioritas', 'Ekspor PDF', 'Grup 5 orang'] },
  { name: 'Pro', desc: 'Skripsian — power tools tanpa batas wajar.', price: 145, was: 190, off: 24, cta: 'Pilih Pro', includes: 'Semua di Kampus, plus:', popular: false, features: ['Prioritas tertinggi', 'Template skripsi massal', 'Akses beta duluan', 'Konsultasi prioritas', 'Badge Pro'] },
];

const LOGS = [
  { img: 'potret-1.jpg', alt: 'Rani, Pendidikan Dokter', meta: '12 Sep 2026 · 14:31', matkul: 'Patologi Blok 3', input: 'Diktat 42 hal PDF → Rangkumin (detail)', output: '12 poin + 3 tabel → 2 hal', n: 'Rani P.', m: 'Pend. Dokter, sem 4 · 22***09' },
  { img: 'potret-2.jpg', alt: 'Dimas, Teknik Informatika', meta: '11 Sep 2026 · 22:07', matkul: 'RPL — Laporan KP', input: 'Draft 1.200 kata → Parafrase ×3', output: 'Turnitin 38% → 11% · cek manual', n: 'Dimas A.', m: 'Informatika, sem 6 · 21***44' },
  { img: 'potret-3.jpg', alt: 'Salsa, Manajemen', meta: '10 Sep 2026 · 09:14', matkul: 'Pengantar Manajemen', input: 'Catatan 8 hal → Kartu → Quiz 15', output: 'Skor 11/15 · salah POAC', n: 'Salsa N.', m: 'Manajemen, sem 2 · 24***18' },
];

const COMPARE_GROUPS = [
  { h: 'Kuota AI', rows: [{ label: 'Request / hari', values: ['200', '2.000', 'Prioritas'] }, { label: 'Antrean prioritas', values: [false, true, true] }, { label: 'Upload gambar', values: [true, true, true] }] },
  { h: 'Riwayat & Berkas', rows: [{ label: 'Riwayat tersimpan', values: ['90 hari', 'Selamanya', 'Selamanya'] }, { label: 'Ekspor PDF', values: [false, true, true] }, { label: 'Grup belajar', values: [false, '5 orang', '15 orang'] }] },
  { h: 'Fitur Pro', rows: [{ label: 'Template skripsi', values: [false, false, true] }, { label: 'Akses beta', values: [false, false, true] }, { label: 'Badge Pro', values: [false, false, true] }] },
];

export default function Landing() {
  const reduce = useReducedMotion();
  const bandRef = useRef(null);
  const { scrollYProgress: bandP } = useScroll({ target: bandRef, offset: ['start end', 'end start'] });
  const bandScale = useTransform(bandP, [0, 1], [reduce ? 1 : 1.08, 1]);
  return (
    <div id="atas" className="landing-light min-h-screen">
      <ScrollProgress />
      <div className="relative z-10 bg-[var(--bg)]">
      <Navbar />
      <MarqueeHero />

      <div className="border-y border-app bg-surface py-3 overflow-hidden ticker-mask" aria-hidden="true">
        <div className="animate-marquee flex w-max items-center gap-6 pr-6">
          {[...['Tanya AI', 'Rangkumin', 'Parafrase', 'Referensi', 'Kartu Belajar', 'Quiz'], ['Tanya AI', 'Rangkumin', 'Parafrase', 'Referensi', 'Kartu Belajar', 'Quiz']].flat().map((t, i) => (
            <span key={i} className="flex items-center gap-6 font-mono font-medium text-[11px] tracking-[0.14em] text-muted whitespace-nowrap">{t.toUpperCase()} <span className="text-accent text-[8px]">●</span></span>
          ))}
        </div>
      </div>

      <div className="border-b border-app bg-[#fffbeb]/70">
        <div className="max-w-7xl mx-auto px-5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono tracking-wide">
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> SYSTEM OK</span>
          <span className="text-subtle">BUILD 14 Sep 2026 · 6 tool · Gemini Flash · RLS</span>
          <span className="hidden sm:inline text-subtle">·</span>
          <span className="hidden lg:inline text-subtle">Foto kampus asli — bukan generate</span>
          <a href="#batas" className="ml-auto underline decoration-dotted underline-offset-4 hover:text-main">Lihat batasan →</a>
        </div>
      </div>

      <section className="px-5 py-10 md:py-12 border-b border-app relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[11px] font-mono tracking-[0.16em] text-accent uppercase">Angka yang bisa dicek</p>
            <p className="hidden md:block text-[11px] font-mono text-subtle">* dari env & schema — bukan klaim marketing</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {[
              { v: 6, label: 'Tool dalam satu akun', foot: 'Chat · Rangkumin · Parafrase · Referensi · Kartu · Quiz' },
              { v: 1500, label: 'Request gratis / hari', foot: 'Kuota proyek Google — bukan janji kami' },
              { v: 2, label: 'Role: user & admin', foot: 'RLS — admin tidak baca chat user' },
              { v: 0, prefix: 'Rp', label: 'Gratis di tier dasar', foot: 'Paket berbayar = mockup' },
            ].map((st, i) => (
              <Rise key={i} delay={i * 0.05}>
                <div className="bg-surface border border-app rounded-2xl p-5 h-full flex flex-col hover:border-accent/20 transition-colors">
                  <div className="font-mono text-[11px] tracking-widest text-subtle uppercase">{st.label}</div>
                  <div className="font-display text-[30px] leading-none mt-2">{st.prefix}<CountUp end={st.v} /></div>
                  <p className="text-[11px] font-mono text-subtle leading-snug mt-3 pt-3 border-t border-app">{st.foot}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur" className="px-5 py-14 md:py-20 scroll-mt-16 relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <Stagger>
            <p className="text-[11px] font-mono tracking-[0.16em] text-accent uppercase">[Katalog Alat]</p>
            <h2 className="font-display text-3xl md:text-[42px] leading-[0.95] mt-2 max-w-2xl">Enam alat riset — satu meja belajar.</h2>
            <p className="text-muted text-[14px] mt-3 max-w-xl leading-relaxed">Tiap tool transparan: <span className="font-mono text-[12px] bg-bg-subtle border border-app px-1.5 py-0.5 rounded">input → proses → output</span> — tanpa "AI ajaib" tanpa jejak.</p>
          </Stagger>
          <Stagger delay={0.08}><FeatureSlides /></Stagger>
        </div>
      </section>

      <section ref={bandRef} className="px-5">
        <div className="max-w-7xl mx-auto">
          <Rise>
            <ParallaxSection speed={0.25}>
              <div className="photo-frame relative h-[360px] md:h-[420px] overflow-hidden">
                <motion.img src={`${PH}/perpustakaan.jpg`} alt="Perpustakaan universitas" loading="lazy" width={1600} height={1479} className="absolute inset-0 w-full h-full object-cover" style={{ scale: bandScale }} />
                <div className="absolute inset-0 bg-[#1c1917]/60" aria-hidden="true" />
                <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10 text-center">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-mono tracking-[0.16em] text-[#fbbf24] uppercase">Arsip Ruang Baca • Kampus Pusat</p>
                    <p className="font-quote text-[26px] md:text-[32px] leading-tight text-white mt-3">“Di mana pemahaman sejati diuji sebelum lembar ujian dibagikan.”</p>
                    <p className="text-white/60 text-[11px] font-mono mt-4">Foto asli — 1600×1479 · Catatan Lapangan No. 41</p>
                  </div>
                </div>
              </div>
            </ParallaxSection>
          </Rise>
        </div>
      </section>

      <section id="cara-kerja" className="px-5 py-14 md:py-20 scroll-mt-16 relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <Rise>
            <p className="text-[11px] font-mono tracking-[0.16em] text-accent uppercase">[Metodologi]</p>
            <h2 className="font-display text-3xl md:text-[42px] leading-[0.95] mt-2 max-w-xl">Tiga langkah — dari berkas mentah ke catatan teruji.</h2>
          </Rise>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
            <div className="lg:col-span-5 space-y-3">
              {[
                { n: '01', t: 'Unggah berkas apapun', d: 'PDF tebal, PPT dosen, rekaman m4a/mp3, foto catatan binder — seret langsung.' },
                { n: '02', t: 'Pilih mode sintesis', d: 'Ringkasan UTS, kartu hafalan anatomi/kode, atau bedah teori kritis.' },
                { n: '03', t: 'Validasi & ekspor', d: 'Klik rujukan → lompat ke halaman sumber. Ekspor Notion / Markdown / PDF.' },
              ].map((s, i) => (
                <Rise key={i} delay={i * 0.06}>
                  <div className={`p-5 rounded-2xl border flex gap-4 ${i === 0 ? 'bg-surface border-accent/30 shadow-card' : 'bg-surface border-app'}`}>
                    <span className={`font-mono text-[11px] font-bold tracking-widest shrink-0 mt-0.5 ${i === 0 ? 'text-accent' : 'text-subtle'}`}>{s.n}</span>
                    <div><h3 className="font-display text-[16px] leading-tight">{s.t}</h3><p className="text-muted text-[13px] leading-relaxed mt-1">{s.d}</p></div>
                  </div>
                </Rise>
              ))}
              <p className="text-[11px] font-mono text-subtle flex items-center gap-2"><Clock3 size={12} /> Tanpa install · jalan di HP · riwayat ikut akun</p>
            </div>
            <Rise className="lg:col-span-7" delay={0.12}>
              <div className="rounded-2xl border border-app bg-surface overflow-hidden">
                <div className="bg-bg-subtle px-4 py-3 border-b border-app flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-border" /><span className="w-2.5 h-2.5 rounded-full bg-border" /><span className="w-2.5 h-2.5 rounded-full bg-border" /><span className="ml-2 font-mono text-[11px] text-subtle truncate">workspace_farmakologi.pdf</span></div>
                  <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-accent-soft text-accent-deep font-bold">Gemini Flash ●</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-app p-4 gap-4">
                  <div className="space-y-2 pr-1">
                    <div className="flex items-center justify-between border-b border-app/60 pb-2"><span className="font-mono text-[10px] tracking-widest text-subtle">SUMBER [HAL. 24]</span><FileWarning size={13} className="text-subtle" /></div>
                    <div className="p-3 bg-bg-subtle rounded-xl border border-app text-[13px] leading-relaxed"><p className="font-mono text-[11px] leading-relaxed"><span className="bg-accent-soft px-1 rounded">ACE Inhibitor</span> menghambat konversi Angiotensin I → Angiotensin II…</p><div className="mt-2 text-[10px] font-mono text-subtle border-t border-app pt-2">Farmakologi — dr. Suryo, Sp.FK (2024)</div></div>
                  </div>
                  <div className="space-y-2 pl-1">
                    <div className="flex items-center justify-between border-b border-app/60 pb-2"><span className="font-mono text-[10px] tracking-widest text-accent font-bold">SINTESIS</span><Sparkles size={13} className="text-accent" /></div>
                    <div className="p-3 bg-bg-subtle rounded-xl border-l-2 border-accent text-[13px]"><div className="font-display text-[13px]">Poin Kunci:</div><ul className="list-disc list-inside text-[12px] text-muted mt-1 space-y-0.5"><li>Angiotensin II ↓ → vasodilatasi</li><li>Bradikinin ↑ → batuk kering</li></ul><div className="mt-2 pt-2 border-t border-app flex justify-between text-[10px] font-mono text-accent"><span>Hal. 24 • Bab 3</span><span className="underline">Lompat →</span></div></div>
                  </div>
                </div>
                <div className="bg-bg-subtle px-4 py-2 border-t border-app flex justify-between font-mono text-[11px] text-subtle"><span>1.2s • 42k tokens</span><span className="text-accent font-medium">Ekspor Notion siap</span></div>
              </div>
            </Rise>
          </div>
        </div>
      </section>

      <section id="cerita" className="px-5 py-14 md:py-20 bg-surface border-y border-app scroll-mt-16 relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <Rise>
            <p className="text-[11px] font-mono tracking-[0.16em] text-accent uppercase">[Bukti Kerja]</p>
            <h2 className="font-display text-3xl md:text-[42px] leading-[0.95] mt-2 max-w-xl">Bukan testimoni mulus — ini log asli.</h2>
            <p className="text-muted text-[14px] mt-3 max-w-xl">Nama disamarkan, NIM di-blur. Input → output apa adanya.</p>
          </Rise>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
            {LOGS.map((t, i) => (
              <Rise key={i} delay={i * 0.05} className="h-full">
                <div className="bg-bg-subtle border border-app rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className="px-4 py-2.5 border-b border-app bg-surface flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-mono text-subtle">{t.meta}</span>
                    <span className="ml-auto text-[10px] font-mono px-2 py-1 rounded-full bg-accent-soft text-accent-deep">{t.matkul}</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="space-y-2 font-mono text-[11px] leading-relaxed">
                      <p className="p-2.5 rounded-xl bg-surface border border-app"><span className="text-accent font-bold">IN ›</span> {t.input}</p>
                      <p className="p-2.5 rounded-xl bg-surface border border-app"><span className="text-accent font-bold">OUT ›</span> {t.output}</p>
                    </div>
                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-app">
                      <img src={`${PH}/${t.img}`} alt={t.alt} loading="lazy" width={80} height={80} className="w-8 h-8 rounded-full object-cover border border-app" />
                      <div><p className="font-semibold text-[13px] leading-none">{t.n}</p><p className="font-mono text-[11px] text-subtle">{t.m}</p></div>
                      <Quote size={13} className="ml-auto text-subtle" />
                    </div>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section id="batas" className="px-5 py-12 md:py-14 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <ScaleOnScroll>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 md:p-8">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0"><AlertTriangle size={17} className="text-amber-600" /></span>
                <div><p className="text-[11px] font-mono tracking-[0.14em] text-accent font-bold uppercase">[Transparansi Akademik]</p><h2 className="font-display text-xl md:text-2xl leading-tight mt-1">Jujur soal batasan.</h2><p className="text-[13px] text-muted mt-1">Bantu belajar — bukan pengganti baca, paham, dan cek sumber.</p></div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 mt-6">
                {[
                  { icon: FileWarning, t: 'Bisa halu', d: 'Kadang ngarang sitasi/angka. Cek jurnal asli sebelum kutip.' },
                  { icon: Clock3, t: 'Kuota bareng', d: '1.500 req/hari untuk semua user. Jam padat bisa antre.' },
                  { icon: AlertTriangle, t: 'Bukan penilai', d: 'Parafrase bantu diksi, tapi dosen nilai orisinalitas.' },
                ].map((b) => {
                  const I = b.icon;
                  return (<div key={b.t} className="bg-white border border-amber-200 rounded-xl p-4"><p className="font-semibold text-[13px] flex items-center gap-2"><I size={13} className="text-amber-600" /> {b.t}</p><p className="text-[12px] text-muted leading-relaxed mt-1">{b.d}</p></div>);
                })}
              </div>
            </div>
          </ScaleOnScroll>
        </div>
      </section>

      <section id="harga" className="px-5 py-14 md:py-20 scroll-mt-16 relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <Rise>
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-[11px] font-mono tracking-[0.16em] text-accent uppercase">[Harga]</p>
              <h2 className="font-display text-3xl md:text-[42px] leading-[0.95] mt-2">Gratis dulu. Bayar nanti kalau butuh.</h2>
              <p className="text-muted text-[14px] mt-3">Semua tool jalan di tier gratis. Kartu di bawah = rancangan, belum billing.</p>
            </div>
          </Rise>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 items-stretch">
            {PLANS.map((p, i) => (
              <Rise key={p.name} delay={i * 0.06} className="h-full">
                <div className={`relative flex flex-col h-full rounded-2xl p-6 ${p.popular ? 'bg-surface border-2 border-accent' : 'bg-surface border border-app'}`}>
                  {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-[11px] font-bold whitespace-nowrap">Paling Laris</span>}
                  <h3 className="font-display text-[19px]">{p.name}</h3>
                  <p className="text-muted text-[12px] mt-1 leading-relaxed">{p.desc}</p>
                  <p className="mt-4 flex items-baseline gap-1"><span className="font-mono font-bold text-[32px] tracking-tight leading-none">Rp<CountUp end={p.price} /></span><span className="text-muted text-[12px]">rb/bln</span></p>
                  <p className="mt-1 flex items-center gap-2"><span className="text-subtle line-through text-[12px]">Rp{p.was}rb</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-soft text-accent-deep">-{p.off}%</span></p>
                  <Link to="/daftar" className={`mt-5 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full font-semibold text-[13px] transition-colors ${p.popular ? 'bg-accent hover:bg-accent-hover text-white' : 'bg-ink-800 hover:bg-black text-white'}`}>{p.cta} <ArrowRight size={14} /></Link>
                  <p className="mt-5 text-[10px] font-mono tracking-widest text-subtle uppercase">{p.includes}</p>
                  <ul className="mt-2 space-y-1.5">
                    {p.features.map((f) => (<li key={f} className="flex items-center gap-2 text-[12px] text-muted"><span className="w-4 h-4 rounded-full bg-accent-soft flex items-center justify-center shrink-0"><Check size={10} className="text-accent-deep" /></span>{f}</li>))}
                  </ul>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section id="banding" className="px-5 pb-14 md:pb-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Rise>
            <div className="text-center max-w-xl mx-auto">
              <p className="text-[11px] font-mono tracking-[0.16em] text-accent uppercase">Bandingkan</p>
              <h2 className="font-display text-3xl md:text-[42px] leading-[0.95] mt-2">Pilih dengan kepala dingin.</h2>
            </div>
          </Rise>
          <Rise delay={0.08}>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-app bg-surface">
              <table className="w-full min-w-[620px] text-[13px] border-collapse">
                <thead><tr className="border-b border-app"><th className="text-left px-4 py-3 text-[10px] font-mono tracking-widest text-subtle uppercase">Fitur</th>{PLANS.map((p) => (<th key={p.name} className={`px-3 py-3 text-center ${p.popular ? 'bg-accent-soft/40' : ''}`}><span className="font-display text-[13px]">{p.name}</span><span className="block font-mono text-[11px] text-accent">Rp{p.price}rb</span></th>))}</tr></thead>
                {COMPARE_GROUPS.map((g) => (
                  <tbody key={g.h}><tr><td colSpan={4} className="px-4 py-2 text-[10px] font-mono tracking-widest text-muted uppercase bg-bg-subtle/60">{g.h}</td></tr>{g.rows.map((r) => (<tr key={r.label} className="border-t border-app/60"><td className="px-4 py-2.5 font-medium">{r.label}</td>{r.values.map((v, vi) => (<td key={vi} className={`px-3 py-2.5 text-center ${PLANS[vi].popular ? 'bg-accent-soft/40' : ''}`}>{v === true ? (<span className="inline-flex w-4 h-4 rounded bg-success-soft items-center justify-center"><Check size={10} className="text-success" /></span>) : v === false ? (<X size={13} className="inline text-subtle" />) : (<span className="font-medium">{v}</span>)}</td>))}</tr>))}</tbody>
                ))}
                <tbody><tr className="border-t border-app"><td className="px-4 py-3" />{PLANS.map((p) => (<td key={p.name} className={`px-3 py-3 text-center ${p.popular ? 'bg-accent-soft/40' : ''}`}><Link to="/daftar" className={`inline-flex px-4 py-2 rounded-full font-semibold text-[12px] ${p.popular ? 'bg-accent text-white' : 'border border-app'}`}>{p.cta}</Link></td>))}</tr></tbody>
              </table>
            </div>
          </Rise>
        </div>
      </section>

      <Coverflow />

      <section id="faq" className="px-5 py-14 md:py-20 scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <Rise>
            <p className="text-[11px] font-mono tracking-[0.16em] text-accent uppercase">FAQ</p>
            <h2 className="font-display text-3xl md:text-[42px] leading-[0.95] mt-2">Yang sering ditanyakan.</h2>
          </Rise>
          <div className="mt-6 space-y-3">
            {FAQS.map((f, i) => (<Rise key={i} delay={Math.min(i * 0.04, 0.16)}><FaqItem q={f.q} a={f.a} /></Rise>))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 md:p-10 rounded-2xl bg-surface border border-app text-center">
            <p className="font-mono text-[11px] tracking-[0.14em] text-accent font-bold uppercase">[Siapkan Semester Ini]</p>
            <h2 className="font-display text-2xl md:text-3xl max-w-2xl mx-auto mt-2 leading-tight">Hentikan begadang tanpa arah. Mulai susun catatan yang berdaya guna.</h2>
            <p className="text-muted text-[14px] max-w-xl mx-auto mt-3">Daftar 60 detik. Gratis 3 dokumen pertama tiap bulan.</p>
            <Link to="/daftar" className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-[14px]">Mulai Belajar Sekarang <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      </div>
      <Footer />
    </div>
  );
}

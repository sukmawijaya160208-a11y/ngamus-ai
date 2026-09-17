import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import {
  GraduationCap, ArrowRight, Check, Menu, X,
  KeyRound, ClipboardPaste, Sparkles, Quote, ChevronDown,
  AlertTriangle, FileWarning, Clock3,
} from 'lucide-react';
import MarqueeHero from '../components/MarqueeHero.jsx';
import FeatureSlides from '../components/FeatureSlides.jsx';
import Coverflow from '../components/Coverflow.jsx';
import Footer from '../components/Footer.jsx';
import { ScrollProgress, Stagger } from '../components/LandingMotion.jsx';
import HeroCanvas from '../components/HeroCanvas.jsx';
import ScrollCanvas from '../components/ScrollCanvas.jsx';
import { TiltCard, ParallaxSection, ScaleOnScroll, RotateOnScroll } from '../components/ScrollAnimations.jsx';

const PH = '/FOTO%20UNTUK%20LEANDING%20PAGE';

const spring = { type: 'spring', stiffness: 110, damping: 20 };

function Rise({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ end, suffix = '', duration = 1400 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString('id-ID')}{suffix}</span>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
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
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${scrolled ? 'bg-surface/90 backdrop-blur-md border-b border-app shadow-card' : 'bg-transparent border-b border-transparent'}`}>
      <motion.span aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent" style={{ scaleX: scrollYProgress }} />
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#atas" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </span>
          <span className="font-display font-bold text-[17px] tracking-tight">Ngampus AI</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-bg-subtle text-muted font-mono text-[10px] border border-app">v2.4 Kampus ID</span>
        </a>
        <nav className="hidden md:flex items-center gap-7" aria-label="Navigasi utama">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[13px] font-medium text-muted hover:text-main transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-[14px] font-semibold transition-colors">
            Mulai gratis <ArrowRight size={15} />
          </Link>
          <button type="button" className="md:hidden p-2 rounded-lg hover:bg-surface-hover" onClick={() => setOpen(!open)} aria-label={open ? 'Tutup menu' : 'Buka menu'}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden bg-surface border-t border-app px-5 py-3 space-y-1" aria-label="Navigasi seluler">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-[14px] font-medium text-muted hover:bg-surface-hover hover:text-main">
              {l.label}
            </a>
          ))}
          <Link to="/dashboard" className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-accent text-white text-[14px] font-semibold mt-2">
            Mulai gratis <ArrowRight size={15} />
          </Link>
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
    <div className="bg-surface border border-app rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4">
        <span className="font-semibold text-[15px] font-display">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden"><p className="px-5 pb-4 text-[14px] text-muted leading-relaxed">{a}</p></div>
      </div>
    </div>
  );
}

const PLANS = [
  { name: 'Pelajar', desc: 'Buat mulai serius: semua tool inti dengan jatah harian lega.', price: 30, was: 60, off: 50, cta: 'Pilih Pelajar', includes: 'Mulai dengan:', popular: false, features: ['Keenam tool belajar + akun pribadi', '200 request AI per hari', 'Riwayat chat & sitasi 90 hari', 'Upload gambar ke Tanya AI', 'Dukungan via email'] },
  { name: 'Kampus', desc: 'Buat pejuang deadline: kuota besar plus antrean prioritas.', price: 90, was: 140, off: 36, cta: 'Pilih Kampus', includes: 'Semua di Pelajar, plus:', popular: true, features: ['2.000 request AI per hari', 'Riwayat tersimpan selamanya', 'Antrean prioritas (lebih cepat)', 'Ekspor hasil ke PDF', 'Grup belajar sampai 5 orang'] },
  { name: 'Pro', desc: 'Buat skripsian dan kreator: power tools tanpa batas wajar.', price: 145, was: 190, off: 24, cta: 'Pilih Pro', includes: 'Semua di Kampus, plus:', popular: false, features: ['Request prioritas tertinggi', 'Template skripsi + sitasi massal', 'Akses fitur beta paling dulu', 'Konsultasi prioritas', 'Badge Pro di profil'] },
];

const LOGS = [
  { img: 'potret-1.jpg', alt: 'Rani, Pendidikan Dokter', meta: '12 Sep 2026 · 14:31 · FK-U', matkul: 'Patologi Blok 3', input: 'Diktat 42 hal PDF → Rangkumin (detail)', output: '12 poin + 3 tabel → dicetak 2 hal', n: 'Rani P.', m: 'Pendidikan Dokter, sem 4 · NIM 22***09' },
  { img: 'potret-2.jpg', alt: 'Dimas, Teknik Informatika', meta: '11 Sep 2026 · 22:07 · IF-6', matkul: 'RPL — Laporan KP', input: 'Draft 1.200 kata → Parafrase (sedang) ×3', output: 'Turnitin 38% → 11% · tetap diperiksa manual', n: 'Dimas A.', m: 'Teknik Informatika, sem 6 · NIM 21***44' },
  { img: 'potret-3.jpg', alt: 'Salsa, Manajemen', meta: '10 Sep 2026 · 09:14 · FEB', matkul: 'Pengantar Manajemen', input: 'Catatan 8 hal → Kartu Belajar → Quiz 15 soal', output: 'Skor 11/15 · salah di POAC, diulang', n: 'Salsa N.', m: 'Manajemen, sem 2 · NIM 24***18' },
];

const COMPARE_GROUPS = [
  { h: 'Kuota AI', rows: [{ label: 'Request per hari', values: ['200', '2.000', 'Prioritas tertinggi'] }, { label: 'Antrean prioritas', values: [false, true, true] }, { label: 'Upload gambar', values: [true, true, true] }] },
  { h: 'Riwayat & Berkas', rows: [{ label: 'Riwayat tersimpan', values: ['90 hari', 'Selamanya', 'Selamanya'] }, { label: 'Ekspor PDF', values: [false, true, true] }, { label: 'Grup belajar', values: [false, '5 orang', '15 orang'] }] },
  { h: 'Fitur Pro', rows: [{ label: 'Template skripsi massal', values: [false, false, true] }, { label: 'Akses fitur beta', values: [false, false, true] }, { label: 'Badge Pro di profil', values: [false, false, true] }] },
  { h: 'Bantuan', rows: [{ label: 'Dukungan email', values: [true, true, true] }, { label: 'Chat dengan admin', values: [true, true, true] }, { label: 'Konsultasi prioritas', values: [false, false, true] }] },
];

export default function Landing() {
  const reduce = useReducedMotion();
  const bandRef = useRef(null);
  const { scrollYProgress: bandP } = useScroll({ target: bandRef, offset: ['start end', 'end start'] });
  const bandScale = useTransform(bandP, [0, 1], [reduce ? 1 : 1.12, 1]);

  return (
    <div id="atas" className="landing-light min-h-screen">
      <ScrollProgress />
      <div className="relative z-10 bg-[var(--bg)] shadow-card-lg">
      <Navbar />
      <MarqueeHero />

      <div className="border-y border-app bg-surface py-3 overflow-hidden ticker-mask" aria-hidden="true">
        <div className="animate-marquee flex w-max items-center gap-8 pr-8">
          {[...['Tanya AI', 'Rangkumin', 'Parafrase', 'Referensi', 'Kartu Belajar', 'Quiz'], ['Tanya AI', 'Rangkumin', 'Parafrase', 'Referensi', 'Kartu Belajar', 'Quiz']].flat().map((t, i) => (
            <span key={i} className="flex items-center gap-8 font-mono font-medium text-[12px] tracking-[0.16em] text-muted whitespace-nowrap">
              {t.toUpperCase()} <span className="text-accent">♦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-app bg-[#fffbeb]">
        <div className="max-w-7xl mx-auto px-5 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-mono leading-none tracking-wide">
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> SYSTEM OK</span>
          <span className="text-subtle">BUILD 14 Sep 2026 · 6 tool · Gemini Flash · Supabase RLS</span>
          <span className="hidden sm:inline text-subtle">·</span>
          <span className="text-subtle">Foto kampus asli (bukan generate) · Foto: 1200–1600px</span>
          <a href="#batas" className="ml-auto underline decoration-dotted underline-offset-4 hover:text-main">Lihat batasan →</a>
        </div>
      </div>

      <section className="px-5 py-10 md:py-14 border-b border-app relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">Angka yang bisa dicek</p>
            <p className="hidden md:block text-[11px] font-mono text-subtle">* hitung dari env & schema, bukan klaim marketing</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[
              { v: 6, s: '', label: 'Tool belajar dalam satu akun', foot: 'Chat, Rangkumin, Parafrase, Referensi, Kartu, Quiz' },
              { v: 1500, s: '', label: 'Request gratis/hari (Gemini Flash)', foot: 'Kuota proyek Google — bukan janji kami' },
              { v: 2, s: '', label: 'Role: pengguna & admin', foot: 'RLS Supabase — admin tidak baca chat user' },
              { v: 0, s: '', label: 'Rupiah. Gratis selamanya di tier dasar.', prefix: 'Rp', foot: 'Paket berbayar = mockup, belum ada billing' },
            ].map((st, i) => (
              <Rise key={i} delay={i * 0.06}>
                <div className="bg-surface border border-app rounded-xl p-5 h-full flex flex-col">
                  <div className="font-display font-semibold text-[28px] md:text-3xl tracking-tight">
                    {st.prefix}<CountUp end={st.v} suffix={st.s} />
                  </div>
                  <p className="text-[13px] font-medium leading-snug mt-1">{st.label}</p>
                  <p className="text-[11px] font-mono text-subtle leading-snug mt-2 border-t border-app pt-2">{st.foot}</p>
                </div>
              </Rise>
            ))}
          </div>
          <p className="md:hidden text-[11px] font-mono text-subtle mt-3">* angka dari env & schema, bukan klaim marketing</p>
        </div>
      </section>

      <section id="fitur" className="px-5 py-14 md:py-20 scroll-mt-16 relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <Stagger>
            <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">[Katalog Alat Studi]</p>
            <h2 className="font-display font-semibold text-3xl md:text-[44px] leading-[1.08] mt-2 max-w-2xl">
              Enam alat riset dalam satu meja belajar.
            </h2>
            <p className="text-muted text-[14px] mt-3 max-w-xl leading-relaxed">Tiap tool ada <em>input → proses → output</em> yang jelas. Tidak ada "AI ajaib" tanpa jejak.</p>
          </Stagger>
          <Stagger delay={0.08}><FeatureSlides /></Stagger>
        </div>
      </section>

      <section ref={bandRef} className="px-5">
        <div className="max-w-7xl mx-auto">
          <Rise>
            <ParallaxSection speed={0.3}>
              <div className="photo-frame relative h-[380px] md:h-[440px] shadow-card-lg overflow-hidden">
                <motion.img
                  src={`${PH}/perpustakaan.jpg`}
                  alt="Rak-rak buku tinggi di perpustakaan universitas"
                  loading="lazy"
                  width={1600}
                  height={1479}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ scale: bandScale }}
                />
                <div className="absolute inset-0 bg-[#1c1917]/55" aria-hidden="true" />
                <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 text-center">
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-mono tracking-[0.14em] text-[#fbbf24] uppercase">[Arsip Ruang Baca • Kampus Pusat]</p>
                    <p className="font-display font-semibold italic text-2xl md:text-[32px] leading-tight text-white mt-2">
                      “Di mana pemahaman sejati diuji sebelum lembar ujian dibagikan.”
                    </p>
                    <p className="text-white/70 text-[12px] font-mono mt-3">Foto asli perpustakaan — 1600×1479 · Catatan Lapangan No. 41</p>
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
            <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">[Metodologi Belajar Cerdas]</p>
            <h2 className="font-display font-semibold text-3xl md:text-[44px] leading-[1.08] mt-2 max-w-xl">
              Tiga langkah dari berkas mentah ke catatan teruji.
            </h2>
          </Rise>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            <div className="lg:col-span-5 space-y-3">
              {[
                { n: '01', t: 'Unggah Berkas Apapun', d: 'PDF diktat tebal, PPT slide dosen dengan layout rumit, rekaman kuliah m4a/mp3, hingga foto catatan tangan binder.', active: true },
                { n: '02', t: 'Pilih Mode Sintesis', d: 'Ringkasan komprehensif untuk UTS, kartu kilas untuk hafalan istilah anatomi/kode, atau bedah teori kritis.' },
                { n: '03', t: 'Validasi & Ekspor Bebas', d: 'Setiap proposisi klik-balik ke halaman sumber. Ekspor instan ke Notion, Markdown, atau PDF.' },
              ].map((s, i) => (
                <Rise key={i} delay={i * 0.08}>
                  <div className={`p-6 rounded-xl border flex gap-4 ${s.active ? 'bg-surface border-l-4 border-l-accent border-t border-r border-b border-app shadow-card' : 'bg-surface border-app'}`}>
                    <span className={`font-mono font-bold text-[11px] tracking-wider shrink-0 ${s.active ? 'text-accent' : 'text-subtle'}`}>LANGKAH {s.n}</span>
                    <div>
                      <h3 className="font-display font-semibold text-[15.5px]">{s.t}</h3>
                      <p className="text-muted text-[13.5px] leading-relaxed mt-1">{s.d}</p>
                    </div>
                  </div>
                </Rise>
              ))}
              <Rise delay={0.1}><p className="text-[12px] font-mono text-subtle mt-2 flex items-center gap-2"><Clock3 size={13} /> Tanpa install · jalan di HP · riwayat ikut akun</p></Rise>
            </div>
            <Rise className="lg:col-span-7" delay={0.15}>
              <div className="rounded-xl border border-app bg-surface shadow-card overflow-hidden">
                <div className="bg-bg-subtle px-4 py-3 border-b border-app flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-border" /><span className="w-3 h-3 rounded-full bg-border" /><span className="w-3 h-3 rounded-full bg-border" /><span className="ml-2 font-mono text-[11px] text-subtle">workspace_sesi_uts_farmakologi.pdf</span></div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-accent-soft text-accent-deep font-semibold">Gemini Flash Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-app p-4 gap-4 bg-surface">
                  <div className="space-y-3 pr-2">
                    <div className="flex items-center justify-between border-b border-app pb-2"><span className="font-mono text-[11px] text-subtle">DOKUMEN SUMBER [HAL. 24]</span><FileWarning size={14} className="text-subtle" /></div>
                    <div className="p-3 bg-bg-subtle rounded border border-app text-[13px] leading-relaxed">
                      <p className="font-mono text-[12px]"><span className="bg-accent-soft px-1 font-semibold">"Mekanisme aksi ACE Inhibitor</span> bekerja dengan menghambat konversi Angiotensin I menjadi Angiotensin II..."</p>
                      <div className="mt-3 text-[11px] font-mono text-subtle border-t border-app pt-2">Kuliah Farmakologi Klinik - dr. Suryo, Sp.FK (2024)</div>
                    </div>
                  </div>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center justify-between border-b border-app pb-2"><span className="font-mono text-[11px] text-accent font-semibold">SINTESIS TERVERIFIKASI</span><Sparkles size={14} className="text-accent" /></div>
                    <div className="p-3 bg-bg-subtle rounded border-l-2 border-accent text-[13px] space-y-2">
                      <div className="font-display font-bold text-[13px]">Poin Kunci Farmakodinamik:</div>
                      <ul className="list-disc list-inside text-[12px] text-muted space-y-1"><li>Inhibisi Angiotensin II → Vasodilatasi sistemik.</li><li>Retensi Bradikinin (sebab batuk kering).</li></ul>
                      <div className="mt-2 pt-2 border-t border-app flex items-center justify-between text-[10px] font-mono text-accent"><span>Rujukan: Halaman 24 • Bab 3</span><span className="underline">Lompat →</span></div>
                    </div>
                  </div>
                </div>
                <div className="bg-bg-subtle px-4 py-2 border-t border-app flex items-center justify-between font-mono text-[11px] text-subtle"><span>Latency: 1.2s • Tokens: 42.180</span><span className="text-accent font-medium">Ekspor Notion Siap</span></div>
              </div>
            </Rise>
          </div>
        </div>
      </section>

      <section id="cerita" className="px-5 py-14 md:py-20 bg-surface border-y border-app scroll-mt-16 relative">
        <ScrollCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <Rise>
            <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">[Bukti Kerja Nyata]</p>
            <h2 className="font-display font-semibold text-3xl md:text-[44px] leading-[1.08] mt-2 max-w-xl">
              Catatan log eksplorasi mahasiswa.
            </h2>
            <p className="text-muted text-[14px] mt-3 max-w-xl">Bukan ulasan palsu berfoto studio. Cuplikan interaksi nyata berbagai jurusan — nama disamarkan, NIM di-blur.</p>
          </Rise>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 items-stretch">
            {LOGS.map((t, i) => (
              <Rise key={i} delay={i * 0.08} className="h-full">
                <div className="bg-bg-subtle border border-app rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-app bg-surface flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-mono tracking-wide text-subtle">{t.meta}</span>
                    <span className="ml-auto text-[11px] font-mono px-2 py-1 rounded-full bg-accent-soft text-accent-deep">{t.matkul}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="space-y-2 font-mono text-[12px] leading-relaxed">
                      <p className="p-2.5 rounded bg-surface border border-app"><span className="text-accent font-semibold">IN &gt;</span> {t.input}</p>
                      <p className="p-2.5 rounded bg-surface border border-app"><span className="text-accent font-semibold">OUT &gt;</span> {t.output}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-app">
                      <img src={`${PH}/${t.img}`} alt={t.alt} loading="lazy" width={400} height={600} className="w-9 h-9 rounded-full object-cover border border-app" />
                      <span>
                        <span className="block font-bold text-[13px]">{t.n}</span>
                        <span className="block font-mono text-[11px] text-subtle">{t.m}</span>
                      </span>
                      <Quote size={14} className="ml-auto text-subtle" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
          <Rise delay={0.2}><p className="text-[11px] font-mono text-subtle mt-4 text-center">* Log disetujui pemilik untuk ditampilkan. Hasil AI tetap perlu verifikasi dosen.</p></Rise>
        </div>
      </section>

      <section id="batas" className="px-5 py-14 md:py-16 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <ScaleOnScroll>
            <div className="rounded-2xl border-2 border-accent bg-accent-soft/30 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0"><AlertTriangle size={18} className="text-amber-600" /></span>
                <span className="text-[11px] font-mono font-bold tracking-[0.14em] text-accent uppercase">[Pernyataan Transparansi Akademik]</span>
              </div>
              <h2 className="font-display font-semibold text-xl md:text-2xl leading-tight">Jujur soal batasan.</h2>
              <p className="text-[13.5px] text-muted leading-relaxed mt-1 max-w-2xl">Ngampus AI membantu belajar — bukan pengganti baca, paham, dan cek sumber.</p>
              <div className="grid md:grid-cols-3 gap-3 mt-6">
                {[
                  { icon: FileWarning, t: 'Bisa halu', d: 'Jawaban kadang mengarang sitasi atau angka. Selalu cek jurnal asli sebelum kutip.' },
                  { icon: Clock3, t: 'Kuota bareng', d: '1.500 req/hari untuk semua user. Jam padat bisa antre — panel admin tampilkan sisa.' },
                  { icon: AlertTriangle, t: 'Bukan penilai', d: 'Parafrase bantu ubah diksi, tapi dosen tetap nilai orisinalitas & pemahamanmu.' },
                ].map((b) => {
                  const I = b.icon;
                  return (
                    <div key={b.t} className="bg-white border border-amber-200 rounded-xl p-4">
                      <p className="font-semibold text-[14px] flex items-center gap-2"><I size={14} className="text-amber-600" /> {b.t}</p>
                      <p className="text-[13px] text-muted leading-relaxed mt-1">{b.d}</p>
                    </div>
                  );
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
              <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">[Biaya Ramah Kantong Mahasiswa]</p>
              <h2 className="font-display font-semibold text-3xl md:text-[44px] leading-[1.08] mt-2">Investasi terjangkau untuk satu semester penuh.</h2>
              <p className="text-muted text-[15px] mt-3">Hari ini semua tool jalan di tier gratis. Kartu di bawah adalah rancangan — belum ada billing aktif.</p>
              <p className="inline-flex items-center gap-2 mt-3 text-[11px] font-mono px-3 py-1.5 rounded-full bg-accent-soft text-accent-deep border border-amber-200">● Live: gratis · Mockup: Pelajar/Kampus/Pro</p>
            </div>
          </Rise>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 items-stretch">
            {PLANS.map((p, i) => (
              <Rise key={p.name} delay={i * 0.08} className="h-full">
                <div className={`relative flex flex-col h-full rounded-2xl p-7 ${p.popular ? 'bg-surface border-2 border-accent shadow-card-lg' : 'bg-surface border border-app shadow-card'}`}>
                  {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-accent text-white text-[11.5px] font-bold whitespace-nowrap shadow-card">Paling Laris (rancangan)</span>}
                  <h3 className="font-display font-semibold text-xl">{p.name}</h3>
                  <p className="text-muted text-[13px] mt-1 leading-relaxed">{p.desc}</p>
                  <p className="mt-4 flex items-end gap-1"><span className="font-mono font-semibold text-[40px] leading-none tracking-tight">Rp<CountUp end={p.price} /></span><span className="text-muted text-[13px] mb-1">rb/bulan</span></p>
                  <p className="mt-2 flex items-center gap-2"><span className="text-subtle line-through text-[14px]">Rp{p.was}rb</span><span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent-soft text-accent-deep">Hemat {p.off}%</span></p>
                  <Link to="/daftar" className={`mt-5 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-[14px] transition-colors shadow-card-md ${p.popular ? 'bg-accent hover:bg-accent-hover text-white' : 'bg-ink-800 hover:bg-ink-900 text-white'}`}>
                    {p.cta} <ArrowRight size={16} />
                  </Link>
                  <a href="#fitur" className="mt-2.5 flex items-center justify-center px-5 py-3 rounded-xl bg-surface border border-strong hover:border-accent font-semibold text-[14px] transition-colors">Lihat semua fitur</a>
                  <p className="mt-6 text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">Fitur</p>
                  <p className="text-[13px] font-semibold mt-1.5">{p.includes}</p>
                  <ul className="mt-2.5 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-muted leading-snug"><span className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center shrink-0 mt-0.5"><Check size={12} className="text-accent-deep" strokeWidth={3} /></span>{f}</li>
                    ))}
                  </ul>
                </div>
              </Rise>
            ))}
          </div>
          <Rise delay={0.2}><p className="text-center text-[12px] font-mono text-subtle mt-6">* Harga di atas rancangan. Saat ini semua user = gratis. Billing aktif akan diumumkan di dashboard.</p></Rise>
        </div>
      </section>

      <section id="banding" className="px-5 py-14 md:py-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Rise>
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">Bandingkan</p>
              <h2 className="font-display font-semibold text-3xl md:text-[44px] leading-[1.08] mt-2">Pilih dengan kepala dingin.</h2>
              <p className="text-muted text-[15px] mt-3">Semua paket dapat keenam tool. Bedanya di kuota, kecepatan, dan fitur lanjutan.</p>
            </div>
          </Rise>
          <Rise delay={0.1}>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-app bg-surface shadow-card">
              <table className="w-full min-w-[660px] text-[13.5px] border-collapse">
                <thead><tr className="border-b border-app"><th className="text-left px-5 py-4 text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">Fitur</th>{PLANS.map((p) => (<th key={p.name} className={`px-4 py-4 text-center align-top ${p.popular ? 'bg-accent-soft/60' : ''}`}>{p.popular && (<span className="inline-block px-2.5 py-0.5 rounded-full bg-accent text-white text-[10.5px] font-bold mb-1.5">Terlaris</span>)}<span className="block font-display font-semibold text-[15px]">{p.name}</span><span className="block text-accent font-bold text-[13px] mt-0.5">Rp{p.price}rb <span className="text-muted font-normal">/bln</span></span></th>))}</tr></thead>
                {COMPARE_GROUPS.map((g) => (
                  <tbody key={g.h}><tr><td colSpan={4} className="px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] text-muted uppercase bg-bg-subtle/70">{g.h}</td></tr>{g.rows.map((r) => (<tr key={r.label} className="border-t border-app"><td className="px-5 py-3 font-medium">{r.label}</td>{r.values.map((v, vi) => (<td key={vi} className={`px-4 py-3 text-center ${PLANS[vi].popular ? 'bg-accent-soft/60' : ''}`}>{v === true ? (<span className="inline-flex w-5 h-5 rounded-md bg-success-soft items-center justify-center"><Check size={13} className="text-success" strokeWidth={3} /></span>) : v === false ? (<X size={15} className="inline text-subtle" />) : (<span className="font-medium">{v}</span>)}</td>))}</tr>))}</tbody>
                ))}
                <tbody><tr className="border-t border-app"><td className="px-5 py-4" />{PLANS.map((p) => (<td key={p.name} className={`px-4 py-4 text-center ${p.popular ? 'bg-accent-soft/60' : ''}`}><Link to="/daftar" className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold text-[13px] transition-colors ${p.popular ? 'bg-accent hover:bg-accent-hover text-white' : 'bg-bg-subtle border border-app hover:border-accent'}`}>{p.cta} <ArrowRight size={14} /></Link></td>))}</tr></tbody>
              </table>
            </div>
          </Rise>
        </div>
      </section>

      <Coverflow />

      <section id="faq" className="px-5 py-14 md:py-20 scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <Rise>
            <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">FAQ</p>
            <h2 className="font-display font-semibold text-3xl md:text-[44px] leading-[1.08] mt-2">Yang sering ditanyakan.</h2>
          </Rise>
          <div className="mt-7 space-y-2.5">
            {FAQS.map((f, i) => (
              <Rise key={i} delay={Math.min(i * 0.06, 0.24)}><FaqItem q={f.q} a={f.a} /></Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 md:p-14 rounded-2xl bg-surface border border-app text-center flex flex-col items-center shadow-card">
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent font-bold">[Siapkan Semester Ini]</span>
            <h2 className="font-display font-semibold text-2xl md:text-3xl text-main max-w-2xl mt-2">Hentikan begadang tanpa arah. Mulai susun catatan kuliah yang berdaya guna.</h2>
            <p className="text-muted text-[14px] max-w-xl mt-3">Daftarkan akun kampus dalam 60 detik. Gratis untuk 3 dokumen pertama setiap bulan.</p>
            <Link to="/daftar" className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-[14px] transition-colors">Mulai Belajar Sekarang <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      </div>
      <Footer />
    </div>
  );
}

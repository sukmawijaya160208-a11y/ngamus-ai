import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

const PH = '/FOTO%20UNTUK%20LEANDING%20PAGE';

const FILM = [
  { src: `${PH}/hero-diskusi.jpg`, alt: 'Diskusi di kampus' },
  { src: `${PH}/perpustakaan.jpg`, alt: 'Perpustakaan' },
  { src: `${PH}/catatan.jpg`, alt: 'Catatan' },
  { src: `${PH}/kelompok-laptop.jpg`, alt: 'Kelompok laptop' },
  { src: `${PH}/meja-belajar.jpg`, alt: 'Meja belajar' },
  { src: `${PH}/kampus.jpg`, alt: 'Gedung kampus' },
  { src: `${PH}/wisuda.jpg`, alt: 'Wisuda' },
  { src: `${PH}/potret-1.jpg`, alt: 'Potret' },
];

/* Editorial brutalist hero — anti AI-slop
   No glass, no gradient mesh. Grid, mono, film strip. */
export default function MarqueeHero() {
  const reduce = useReducedMotion();
  const strip = [...FILM, ...FILM];

  return (
    <section className="relative w-full overflow-hidden bg-[var(--bg)] border-b border-app">
      {/* masthead mono */}
      <div className="max-w-6xl mx-auto px-5 pt-20 md:pt-24">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tracking-wide text-subtle border-y border-app py-2">
          <span>EDISI 14 SEP 2026 — NGAMPUS AI</span>
          <span className="hidden sm:inline">·</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success" /> LIVE: GRATIS</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">6 TOOL · GEMINI FLASH · SUPABASE RLS</span>
          <span className="ml-auto hidden lg:inline">FOTO ASLI — BUKAN GENERATE</span>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-10 py-8 md:py-10 items-start">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.12em] uppercase">
              <span className="px-2 py-1 rounded bg-ink-900 text-white">DITENAGAI GEMINI FLASH</span>
              <span className="text-accent">· GRATIS</span>
            </p>
            <h1 className="font-display font-semibold text-[42px] sm:text-5xl lg:text-[64px] leading-[0.95] tracking-tight mt-4">
              Belajar kuliah<br />jadi lebih <span className="underline decoration-[8px] decoration-amber-200 underline-offset-4">cepat.</span>
            </h1>
            <p className="text-muted text-[16px] md:text-[18px] leading-relaxed mt-4 max-w-xl">
              Ngampus AI merangkum materi, menjawab pertanyaan, memparafrase tugas, dan menyusun flashcard — langsung di browser, tanpa antre. <span className="font-mono text-[12px] text-subtle">* butuh verifikasi manual</span>
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/daftar" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-ink-900 hover:bg-black text-white font-semibold text-[14px] transition-colors">
                Daftar gratis sekarang <ArrowRight size={16} />
              </Link>
              <a href="#fitur" className="inline-flex items-center px-6 py-3.5 rounded-lg border border-strong hover:border-accent font-semibold text-[14px] transition-colors">
                Lihat cara kerja
              </a>
            </div>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-mono text-subtle">
              <span className="inline-flex items-center gap-1.5"><Check size={12} className="text-success" /> Tanpa kartu kredit</span>
              <span className="inline-flex items-center gap-1.5"><Check size={12} className="text-success" /> Bahasa Indonesia</span>
              <span className="inline-flex items-center gap-1.5"><Check size={12} className="text-success" /> Tanpa install</span>
            </p>
          </div>

          {/* datasheet card */}
          <div className="border border-app rounded-xl overflow-hidden bg-surface shadow-card">
            <div className="px-4 py-3 border-b border-app flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-[0.12em] uppercase">Spec sheet — v1.0</span>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-accent-soft text-accent-deep">READY</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-[13px]">
              {[
                ['Input', 'Teks / PDF / gambar'],
                ['Proses', 'Gemini Flash 1.5K req/hari'],
                ['Output', 'Rangkum · Sitasi · Quiz'],
                ['Simpan', 'Supabase RLS per akun'],
              ].map(([k, v]) => (
                <div key={k} className="border border-app rounded-lg p-3">
                  <p className="text-[11px] font-mono tracking-wide text-subtle uppercase">{k}</p>
                  <p className="font-medium mt-1 leading-snug">{v}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-bg-subtle border-t border-app text-[11px] font-mono text-subtle">
              Foto di film strip bawah adalah foto kampus asli — 1200–1600px, bukan AI generate.
            </div>
          </div>
        </div>
      </div>

      {/* film strip — perforated */}
      <div aria-hidden="true" className="border-y border-app bg-ink-900 text-white overflow-hidden">
        <div className="flex items-center gap-1 py-2 px-2">
          <div className={`flex w-max gap-2 ${reduce ? '' : 'animate-marquee'}`} style={reduce ? undefined : { animationDuration: '40s' }}>
            {strip.map((img, i) => (
              <div key={i} className="relative h-20 md:h-24 aspect-[4/3] shrink-0 border border-white/20 bg-white/5">
                <img src={img.src} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] font-mono tracking-wide px-1 py-0.5 text-white/80 truncate">{img.alt.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

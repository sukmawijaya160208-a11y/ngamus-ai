import { Link } from 'react-router-dom';

export default function MarqueeHero() {
  return (
    <section className="relative px-5 md:px-8 max-w-7xl mx-auto pt-20 md:pt-28 pb-8 md:pb-14 bg-academic-grid">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-app mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.12em] text-muted font-medium uppercase">[Konsorsium Riset Mahasiswa • Indonesia]</span>
        </div>
        <h1 className="font-display font-semibold text-[36px] sm:text-[48px] lg:text-[56px] leading-[1.05] tracking-tight">
          Ubah materi kuliah berantakan jadi pemahaman siap ujian.
        </h1>
        <p className="text-muted text-[15px] md:text-[18px] leading-relaxed max-w-3xl mt-4 font-light">
          Bukan pengganti berpikir, melainkan asisten riset dan kompilasi cerdas. Olah slide dosen 80 halaman, rekaman suara, atau jurnal PDF panjang menjadi catatan ringkas terstruktur, kartu flash, dan latihan soal mandiri.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-7">
          <Link to="/daftar" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-[14px] transition-colors shadow-card">
            Coba Gratis Sekarang <span aria-hidden>→</span>
          </Link>
          <a href="#fitur" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface border border-strong hover:border-accent font-medium text-[14px] transition-colors">
            Lihat Contoh Rangkuman
          </a>
        </div>
        <div className="pt-6 mt-8 border-t border-app flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-[11px] font-mono text-subtle">
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> 6 Alur Studi Terintegrasi</span>
          <span className="text-subtle">•</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Didukung Gemini Flash</span>
          <span className="text-subtle">•</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Keamanan Berkas Supabase RLS</span>
          <span className="hidden sm:inline-flex items-center gap-1.5"><span className="text-subtle">•</span> Server Terenkripsi</span>
        </div>
      </div>
    </section>
  );
}

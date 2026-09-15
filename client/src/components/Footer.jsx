import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { GraduationCap, ArrowRight, ArrowUp } from 'lucide-react';

const TICKER = ['Tanya AI', 'Rangkumin', 'Parafrase', 'Referensi', 'Kartu Belajar', 'Quiz', 'Bantuan Admin'];

/* Footer sinematik: tirai terungkap saat scroll (sticky),
   marquee diagonal, headline raksasa, watermark raksasa.
   Animasi pakai motion (pengganti GSAP), tanpa dependensi baru. */
export default function Footer() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 110, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.55], [0, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0.25, 1], [0, 1]);
  const markY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, 0]);

  const cols = [
    {
      h: 'Jelajah',
      links: [
        { label: 'Fitur', href: '#fitur' },
        { label: 'Cara Kerja', href: '#cara-kerja' },
        { label: 'Cerita', href: '#cerita' },
        { label: 'Harga', href: '#harga' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      h: 'Akun',
      links: [
        { label: 'Masuk', to: '/masuk' },
        { label: 'Daftar', to: '/daftar' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Bantuan Admin', to: '/bantuan' },
      ],
    },
    {
      h: 'Bantuan',
      links: [
        { label: 'Pertanyaan umum', href: '#faq' },
        { label: 'Hubungi admin', to: '/bantuan' },
        { label: 'Status sistem', href: '/api/health', external: true },
      ],
    },
  ];

  return (
    <footer ref={ref} className="sticky bottom-0 z-0 overflow-hidden bg-[#161311] text-[#fafaf9]">
      {/* grid + aurora */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'linear-gradient(to bottom, transparent, black 30%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%)',
        }}
      />
      <motion.div
        aria-hidden="true"
        style={{ opacity: glowOpacity }}
        className="absolute left-1/2 top-24 -translate-x-1/2 w-[560px] h-[380px] rounded-full bg-[#d97706]/25 blur-[110px] pointer-events-none"
      />

      {/* marquee diagonal */}
      <div className="relative border-y border-white/10 bg-white/[0.03] py-3 overflow-hidden -rotate-[1.2deg] scale-[1.02] mt-8" aria-hidden="true">
        <div className={`flex w-max items-center gap-10 pr-10 ${reduce ? '' : 'animate-marquee'}`} style={reduce ? undefined : { animationDuration: '30s' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-10 font-display font-semibold text-[14px] tracking-[0.18em] text-white/50 whitespace-nowrap">
              {t.toUpperCase()} <span className="text-[#f59e0b]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* headline raksasa */}
      <div className="relative px-5 pt-14 md:pt-20 text-center">
        <motion.h2
          style={{ y: titleY, opacity: titleOpacity }}
          className="font-display font-semibold text-[40px] leading-[1.02] sm:text-6xl lg:text-7xl tracking-tight"
        >
          Materi menumpuk?<br />Bereskan malam ini.
        </motion.h2>
        <motion.p
          style={{ opacity: titleOpacity }}
          className="text-white/60 text-[15px] md:text-base mt-4 max-w-md mx-auto"
        >
          Daftar satu akun, tempel diktat pertamamu, dapat rangkumannya sebelum kopi kedua habis.
        </motion.p>
        <motion.div style={{ opacity: titleOpacity }} className="mt-8 flex justify-center">
          <motion.div whileHover={reduce ? {} : { scale: 1.05 }} whileTap={reduce ? {} : { scale: 0.95 }}>
            <Link
              to="/daftar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white font-semibold text-[15px] transition-colors"
            >
              Daftar gratis sekarang <ArrowRight size={17} />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* kartu brand + kolom link */}
      <div className="relative max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4">
        <div className="rounded-2xl bg-[#d97706] p-7 flex flex-col text-white overflow-hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[10px] bg-white/20 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </span>
            <span className="font-display font-bold text-[17px]">Ngampus AI</span>
          </div>
          <p className="font-display font-semibold text-2xl leading-snug mt-6">
            Belajar kuliah jadi lebih cepat.
          </p>
          <p className="text-white/75 text-[13.5px] mt-2 leading-relaxed">
            Asisten belajar mahasiswa Indonesia: tanya, rangkum, parafrase, sitasi, flashcard, quiz.
          </p>
          <p className="text-white/60 text-[12px] mt-auto pt-6">© 2026 Ngampus AI</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
          {cols.map((c) => (
            <nav key={c.h} aria-label={c.h}>
              <p className="text-[11px] font-bold tracking-[0.14em] text-white/40 uppercase">{c.h}</p>
              <ul className="mt-3 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="text-[13.5px] text-white/70 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    ) : l.external ? (
                      <a href={l.href} className="text-[13.5px] text-white/70 hover:text-white transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <a href={l.href} className="text-[13.5px] text-white/70 hover:text-white transition-colors">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* watermark raksasa */}
      <div className="relative overflow-hidden" aria-hidden="true">
        <motion.p
          style={{ y: markY }}
          className="font-display font-bold text-[19vw] leading-[0.85] text-center text-white/[0.05] whitespace-nowrap select-none -mb-[2vw]"
        >
          NGAMPUS AI
        </motion.p>
      </div>

      {/* bar bawah */}
      <div className="relative border-t border-white/10 px-5 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <p className="text-[12px] text-white/40">Ditenagai Gemini 3.8 Flash · Bahasa Indonesia</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
            aria-label="Kembali ke atas"
            className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
          >
            <ArrowUp size={17} />
          </button>
        </div>
      </div>
    </footer>
  );
}

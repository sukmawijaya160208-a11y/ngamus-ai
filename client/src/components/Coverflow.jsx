import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const PH = '/FOTO%20UNTUK%20LEANDING%20PAGE';

const SLIDES = [
  {
    img: 'hero-diskusi.jpg', alt: 'Tiga mahasiswa berdiskusi sambil membuka laptop di area kampus',
    tag: 'Diskusi', title: 'Tanya Apa Saja', sub: 'TANYA AI',
    desc: 'Konsep susah dijelaskan santai, kapan saja.',
    to: '/chat', cta: 'Buka Tanya AI',
  },
  {
    img: 'perpustakaan.jpg', alt: 'Rak-rak buku tinggi di perpustakaan universitas',
    tag: 'Fokus', title: 'Rangkum Cepat', sub: 'RANGKUMIN',
    desc: 'Diktat tebal jadi poin inti siap hafal.',
    to: '/rangkumin', cta: 'Buka Rangkumin',
  },
  {
    img: 'wisuda.jpg', alt: 'Momen wisuda mahasiswa',
    tag: 'Wisuda', title: 'Uji Nyali', sub: 'QUIZ',
    desc: 'Soal dari materimu, lengkap dengan skor.',
    to: '/quiz', cta: 'Buka Quiz',
  },
  {
    img: 'kampus.jpg', alt: 'Gedung universitas megah di siang hari',
    tag: 'Kampus', title: 'Mulai Gratis', sub: 'SATU AKUN',
    desc: 'Semua tool dalam satu tempat.',
    to: '/daftar', cta: 'Daftar sekarang',
  },
  {
    img: 'meja-belajar.jpg', alt: 'Mahasiswi menulis catatan di meja belajar dekat jendela',
    tag: 'Rutinitas', title: 'Tulis Ulang', sub: 'PARAFRASE',
    desc: 'Tugas jadi tulisanmu sendiri.',
    to: '/parafrase', cta: 'Buka Parafrase',
  },
];

function geometry(w) {
  if (w < 640) return { card: 230, gap: 148, h: 420 };
  if (w < 1024) return { card: 300, gap: 208, h: 510 };
  return { card: 340, gap: 248, h: 570 };
}

/* Coverflow 3D ala referensi: kartu tengah penuh + tipografi,
   kartu samping miring meredup, panah + dots, bg blur sinkron.
   Murni CSS 3D + motion — tanpa dependensi baru. */
export default function Coverflow() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [gw, setGw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const onR = () => setGw(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  const n = SLIDES.length;
  const { card, gap, h } = geometry(gw);
  const go = useCallback((dir) => setIndex((i) => (i + dir + n) % n), [n]);
  const active = SLIDES[index];

  return (
    <section id="galeri" className="relative px-5 py-14 md:py-20 bg-[#141210] text-[#fafaf9] scroll-mt-16 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        >
          <p className="text-[12px] font-bold tracking-[0.22em] text-[#f59e0b] uppercase">— Galeri —</p>
          <h2 className="font-display font-semibold text-3xl md:text-[44px] leading-[1.08] mt-2">
            Kampus, dari sudut terbaik.
          </h2>
          <p className="text-white/55 text-[15px] mt-3 max-w-xl mx-auto">
            Geser kartunya. Tiap sudut kampus terhubung ke satu tool Ngampus AI.
          </p>
        </motion.div>
      </div>

      <div className="relative mt-8">
        {/* bg blur sinkron */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <motion.img
            key={active.img}
            src={`${PH}/${active.img}`}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.8 }}
            className="w-full h-full object-cover blur-3xl opacity-25 scale-110"
          />
          <div className="absolute inset-0 bg-[#141210]/55" />
        </div>

        <div className="relative mx-auto" style={{ maxWidth: 1100, height: h, perspective: '1300px' }}>
          {SLIDES.map((s, i) => {
            let off = i - index;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const abs = Math.abs(off);
            const hide = abs > 2;
            return (
              <div
                key={s.img}
                role={off === 0 ? undefined : 'button'}
                tabIndex={off === 0 ? undefined : 0}
                aria-label={off === 0 ? undefined : `Lihat ${s.title}`}
                onClick={() => { if (off !== 0) setIndex(i); }}
                onKeyDown={(e) => { if (off !== 0 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setIndex(i); } }}
                className={`absolute top-1/2 left-1/2 ${off !== 0 ? 'cursor-pointer' : ''}`}
                style={{
                  width: card,
                  height: (card * 4) / 3,
                  transform: `translate(-50%, -50%) translateX(${off * gap}px) translateZ(${-abs * 170}px) rotateY(${off * -30}deg)`,
                  transformStyle: 'preserve-3d',
                  zIndex: 10 - abs,
                  opacity: hide ? 0 : 1 - abs * 0.12,
                  visibility: hide ? 'hidden' : 'visible',
                  transition: reduce ? 'none' : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s',
                }}
              >
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden border border-white/15 shadow-card-lg bg-[#1c1917]"
                  style={{ filter: off === 0 ? 'none' : `brightness(${1 - abs * 0.38})` }}
                >
                  <img
                    src={`${PH}/${s.img}`}
                    alt={s.alt}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.93) 22%, rgba(10,8,6,0.25) 55%, rgba(10,8,6,0.12) 100%)' }}
                  />
                  <span className="absolute top-4 right-4 text-[12px] font-semibold text-white/85">#{s.tag}</span>
                  <div className="absolute bottom-0 inset-x-0 p-5 text-center">
                    <p className="font-display font-bold text-white text-[26px] leading-[1.05] tracking-tight">{s.title}</p>
                    <p className="text-white/75 text-[12px] font-semibold tracking-[0.14em] mt-1.5">— {s.sub}</p>
                    <p className="text-white/60 text-[12.5px] mt-2 leading-relaxed">{s.desc}</p>
                    {off === 0 && (
                      <Link
                        to={s.to}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#d97706] hover:bg-[#b45309] text-white text-[13px] font-semibold transition-colors"
                      >
                        {s.cta} <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* panah */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Sebelumnya"
            className="absolute top-1/2 -translate-y-1/2 left-1 sm:left-4 z-20 w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur flex items-center justify-center text-white/80 hover:text-white hover:border-white/50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Berikutnya"
            className="absolute top-1/2 -translate-y-1/2 right-1 sm:right-4 z-20 w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur flex items-center justify-center text-white/80 hover:text-white hover:border-white/50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* dots */}
        <div className="relative z-10 flex items-center justify-center gap-2 mt-2 pb-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.img}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ke slide ${i + 1}: ${s.title}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-[#f59e0b]' : 'w-2 bg-white/25 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

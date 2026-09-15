import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import {
  MessageSquareText, FileText, Shuffle, BookOpen, Layers, HelpCircle, ArrowUpRight,
} from 'lucide-react';

const PH = '/FOTO%20UNTUK%20LEANDING%20PAGE';

const SLIDES = [
  {
    no: '01', icon: MessageSquareText, title: 'Tanya AI',
    desc: 'Chat streaming Gemini Flash. Tanya konsep, minta contoh soal, bedah jurnal — Bahasa Indonesia, riwayat per akun.',
    to: '/chat', cta: 'Buka Tanya AI',
    img: 'hero-diskusi.jpg', alt: 'Diskusi di kampus',
    spec: 'IN: pertanyaan → OUT: jawaban + sumber saran',
  },
  {
    no: '02', icon: FileText, title: 'Rangkumin',
    desc: 'Diktat panjang jadi poin kunci per topik. Gaya: bullet / singkat / detail.',
    to: '/rangkumin', cta: 'Buka Rangkumin',
    img: 'catatan.jpg', alt: 'Catatan kuliah',
    spec: 'IN: 30 hal PDF → OUT: 12 poin inti',
  },
  {
    no: '03', icon: Shuffle, title: 'Parafrase',
    desc: 'Tulis ulang tugas dengan diksi baru. Tiga intensitas, makna dijaga.',
    to: '/parafrase', cta: 'Buka Parafrase',
    img: 'meja-belajar.jpg', alt: 'Meja belajar',
    spec: 'IN: 1.200 kata → OUT: 3 versi + cek manual',
  },
  {
    no: '04', icon: BookOpen, title: 'Referensi',
    desc: 'Sitasi APA, IEEE, Harvard, MLA. Otomatis tersimpan di akunmu.',
    to: '/referensi', cta: 'Buka Referensi',
    img: 'perpustakaan.jpg', alt: 'Perpustakaan',
    spec: 'IN: judul/DOI → OUT: sitasi siap tempel',
  },
  {
    no: '05', icon: Layers, title: 'Kartu Belajar',
    desc: 'Materi jadi flashcard tanya-jawab otomatis. Balik, hafalkan, lanjut.',
    to: '/kartu-belajar', cta: 'Buka Kartu',
    img: 'kelompok-laptop.jpg', alt: 'Kelompok laptop',
    spec: 'IN: ringkasan → OUT: 20 kartu Q/A',
  },
  {
    no: '06', icon: HelpCircle, title: 'Quiz',
    desc: 'Soal dari materimu sendiri + penjelasan tiap jawaban dan skor akhir.',
    to: '/quiz', cta: 'Buka Quiz',
    img: 'wisuda.jpg', alt: 'Wisuda',
    spec: 'IN: materi → OUT: 15 soal + koreksi',
  },
];

/* Datasheet grid — anti bento generik */
function Row({ s }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 1.08, 1]);
  const Icon = s.icon;

  return (
    <div ref={ref} className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5 md:gap-6 border border-app rounded-xl overflow-hidden bg-surface shadow-card">
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-accent-soft border border-amber-200 flex items-center justify-center">
            <Icon size={18} className="text-accent-deep" />
          </span>
          <span className="text-[12px] font-mono font-bold tracking-[0.14em] text-subtle">{s.no} — {s.title.toUpperCase()}</span>
          <span className="ml-auto text-[11px] font-mono px-2 py-1 rounded bg-bg-subtle border border-app">/ {s.to}</span>
        </div>
        <h3 className="font-display font-semibold text-2xl md:text-3xl leading-none mt-4">{s.title}</h3>
        <p className="text-muted text-[14px] leading-relaxed mt-2">{s.desc}</p>
        <p className="mt-3 text-[11px] font-mono px-2.5 py-2 rounded bg-bg-subtle border border-app text-subtle">{s.spec}</p>
        <Link to={s.to} className="group inline-flex items-center gap-1.5 mt-4 text-[13px] font-semibold underline decoration-amber-200 underline-offset-4 hover:decoration-accent">
          {s.cta} <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
      <div className="relative bg-bg-subtle border-t lg:border-t-0 lg:border-l border-app overflow-hidden min-h-[220px]">
        <motion.img
          src={`${PH}/${s.img}`}
          alt={s.alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: imgScale }}
        />
        <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded">{s.alt} — foto asli</span>
      </div>
    </div>
  );
}

export default function FeatureSlides() {
  return (
    <div className="mt-6 grid gap-4">
      {SLIDES.map((s) => (
        <Row key={s.no} s={s} />
      ))}
    </div>
  );
}

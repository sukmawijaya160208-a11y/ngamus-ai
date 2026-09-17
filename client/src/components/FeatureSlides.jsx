import { Link } from 'react-router-dom';
import { Search, FileText, Edit3, Quote, Layers, HelpCircle } from 'lucide-react';

const TOOLS = [
  { n: '01', icon: Search, title: 'Tanya Dokumen Konseptual', desc: 'Jawab berbasis isi diktat — setiap jawaban mengunci halaman sumber, bukan ngarang.', to: '/chat', spec: ['PDF / E-Book Bab 4', 'RAG Semantik', 'Jawaban + cuplikan hal.'] },
  { n: '02', icon: FileText, title: 'Sintesis Multi-Halaman', desc: 'Ratusan lembar jadi 3–5 halaman. Aksioma dan argumen dosen tetap.', to: '/rangkumin', spec: ['80 hlm / 3 PDF', 'Hierarchical Extract', 'Ringkasan + Glosarium'] },
  { n: '03', icon: Edit3, title: 'Parafrase Beretika', desc: 'Rekonstruksi sintaksis PUEBI tanpa ubah makna — lawan jebakan sinonim acak.', to: '/parafrase', spec: ['Draft bab kajian', 'PUEBI Syntax', 'Formal + 3 gaya'] },
  { n: '04', icon: Quote, title: 'Sitasi & Validasi DOI', desc: 'APA 7th / IEEE / Harvard instan. Tempel link jurnal atau teks mentah.', to: '/referensi', spec: ['DOI / URL / Judul', 'Metadata Resolver', 'APA • BibTeX'] },
  { n: '05', icon: Layers, title: 'Flashcards Spaced-Repetition', desc: 'Istilah esensial jadi deck Q&A. Ekspor .apkg ke Anki.', to: '/kartu-belajar', spec: ['Bab / Teorema', 'Kurva Lupa', '.apkg + Latihan'] },
  { n: '06', icon: HelpCircle, title: 'Soal Ujian Adaptif', desc: 'HOTS L4–L6 dari silabusmu — essay & pilihan ganda + rubrik.', to: '/quiz', spec: ['Silabus / Kisi-Kisi', 'Bloom L4–L6', '10 soal + rubrik'] },
];

export default function FeatureSlides() {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        return (
          <div key={t.n} className="group p-5 rounded-2xl bg-surface border border-app hover:border-accent/30 hover:shadow-card transition-all flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-bg-subtle border border-app flex items-center justify-center group-hover:border-accent/20 transition-colors"><Icon size={17} className="text-accent" /></span>
              <span className="text-[10px] font-mono tracking-widest text-subtle">{t.n}</span>
            </div>
            <h3 className="font-display text-[17px] leading-tight">{t.title}</h3>
            <p className="text-muted text-[13px] leading-relaxed mt-1.5 flex-1">{t.desc}</p>
            <div className="mt-4 p-2.5 rounded-xl bg-bg-subtle border border-app font-mono text-[11px] leading-relaxed">
              <div><span className="text-accent font-semibold">IN</span> <span className="text-muted">›</span> {t.spec[0]}</div>
              <div><span className="text-subtle font-semibold">PROC</span> <span className="text-muted">›</span> {t.spec[1]}</div>
              <div><span className="text-accent font-semibold">OUT</span> <span className="text-muted">›</span> {t.spec[2]}</div>
            </div>
            <Link to={t.to} className="mt-4 inline-flex text-[13px] font-semibold text-accent hover:text-accent-hover">Buka →</Link>
          </div>
        );
      })}
    </div>
  );
}

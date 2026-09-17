import { Link } from 'react-router-dom';
import { Search, FileText, Edit3, Quote, Layers, HelpCircle } from 'lucide-react';

const TOOLS = [
  { n: '01', icon: Search, title: 'Tanya Dokumen Konseptual', desc: 'Eksplorasi materi kuliah rumit dengan tanya jawab berbasis isi diktat. Jawaban mengunci nomor halaman sumber.', to: '/chat', spec: ['PDF Slide Dosen / E-Book Bab 4', 'RAG Semantik & Cross-Encoding', 'Jawaban akurat + cuplikan halaman'] },
  { n: '02', icon: FileText, title: 'Sintesis Diktat Multi-Halaman', desc: 'Kompilasi ratusan lembar modul jadi draf 3–5 halaman. Aksioma, variabel, dan argumen dosen tetap terjaga.', to: '/rangkumin', spec: ['Diktat 80 hlm / 3 PDF Terkait', 'Hierarchical Extraction', 'Ringkasan hierarkis + Glosarium'] },
  { n: '03', icon: Edit3, title: 'Parafrase Akademik Beretika', desc: 'Ubah struktur gramatikal ragam ilmiah formal tanpa mengubah makna inti atau jebakan sinonim acak.', to: '/parafrase', spec: ['Kalimat mentah / Draft bab kajian', 'Rekonstruksi Sintaksis PUEBI', 'Ragam formal + 3 alternatif gaya'] },
  { n: '04', icon: Quote, title: 'Penyusun Sitasi & Validasi DOI', desc: 'Format daftar pustaka instan APA 7th, IEEE, atau Harvard. Tempel link URL jurnal atau teks bibliografi.', to: '/referensi', spec: ['DOI link / Judul paper / URL', 'Metadata Resolver & Format Engine', 'Sitasi APA / BibTeX siap salin'] },
  { n: '05', icon: Layers, title: 'Spaced-Repetition Flashcards', desc: 'Ekstraksi istilah esensial jadi tumpukan kartu flash Q&A. Ekspor ke Anki atau pelajari di tempat.', to: '/kartu-belajar', spec: ['Bab Anatomi / Teorema Algoritma', 'Algoritma Retensi Kurva Lupa', 'File .apkg + Mode Latihan'] },
  { n: '06', icon: HelpCircle, title: 'Latihan Soal Ujian Adaptif', desc: 'Simulasi studi kasus essay & pilihan ganda HOTS lengkap dengan kunci evaluasi mandiri.', to: '/quiz', spec: ['Silabus & Kisi-Kisi UTS/UAS', 'Taksonomi Bloom L4–L6', '10 Soal Berbobot + Rubrik'] },
];

export default function FeatureSlides() {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        return (
          <div key={t.n} className="p-6 rounded-xl bg-surface border border-app hover:border-accent/40 transition-colors flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center"><Icon size={18} className="text-accent" /></span>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-bg-subtle border border-app">ALAT {t.n}</span>
            </div>
            <h3 className="font-display font-semibold text-[17px] leading-tight">{t.title}</h3>
            <p className="text-muted text-[13px] leading-relaxed mt-2 flex-1">{t.desc}</p>
            <div className="mt-4 p-3 rounded-lg bg-bg-subtle border border-app font-mono text-[11px] space-y-1.5">
              <div><span className="text-accent font-semibold">IN &gt;</span> {t.spec[0]}</div>
              <div><span className="text-muted font-semibold">PROC &gt;</span> {t.spec[1]}</div>
              <div><span className="text-accent font-semibold">OUT &gt;</span> {t.spec[2]}</div>
            </div>
            <Link to={t.to} className="mt-4 inline-flex text-[13px] font-semibold underline decoration-amber-200 underline-offset-4 hover:decoration-accent">Buka →</Link>
          </div>
        );
      })}
    </div>
  );
}

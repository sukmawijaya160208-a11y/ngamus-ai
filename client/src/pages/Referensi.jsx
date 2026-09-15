import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { generateCitation, isAuthError } from '../lib/api.js';

const STYLES = [
  { id: 'apa', label: 'APA' },
  { id: 'ieee', label: 'IEEE' },
  { id: 'harvard', label: 'Harvard' },
  { id: 'mla', label: 'MLA' },
];

const EMPTY_SOURCE = {
  authors: '',
  title: '',
  year: '',
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  url: '',
  publisher: '',
  city: '',
};

export default function Referensi() {
  const navigate = useNavigate();
  const [style, setStyle] = useState('apa');
  const [source, setSource] = useState(EMPTY_SOURCE);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function update(field, value) {
    setSource(prev => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    if (!source.title && !source.authors) {
      setError('Minimal isi judul atau penulis.');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      const data = await generateCitation(style, source);
      setResult(data.result);
    } catch (err) {
      if (isAuthError(err)) {
        navigate('/auth', { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const FIELDS = [
    { key: 'authors', label: 'Penulis', placeholder: 'Contoh: Sari, D., & Budi, A.' },
    { key: 'title', label: 'Judul', placeholder: 'Judul paper / buku' },
    { key: 'year', label: 'Tahun', placeholder: '2024' },
    { key: 'journal', label: 'Jurnal / Publisher', placeholder: 'Nama jurnal atau penerbit' },
    { key: 'volume', label: 'Volume', placeholder: '12' },
    { key: 'issue', label: 'Issue', placeholder: '3' },
    { key: 'pages', label: 'Halaman', placeholder: '45-67' },
    { key: 'url', label: 'URL', placeholder: 'https://...' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center">
            <BookOpen size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Referensi</h1>
            <p className="text-[13px] text-muted">Generate sitasi akademik dari data sumber</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="text-[13px] font-semibold block mb-2">Gaya Sitasi</label>
            <div className="flex gap-2">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${
                    style === s.id ? 'bg-accent text-white border-accent' : 'bg-surface text-muted border-app hover:border-strong'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 bg-surface border border-app rounded-xl p-4 shadow-card">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="text-[12px] font-medium text-muted block mb-1">{f.label}</label>
                <input
                  type="text"
                  value={source[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-bg-subtle border border-app rounded-lg px-3 py-2 text-[13px] text-main placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Membuat sitasi...</> : 'Generate Sitasi'}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold">Hasil Sitasi ({style.toUpperCase()})</label>
            {result && (
              <button onClick={copyResult} className="flex items-center gap-1 text-[12px] text-muted hover:text-accent">
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            )}
          </div>

          <div className="min-h-32 bg-surface border border-app rounded-xl p-4 shadow-card">
            {loading && !result ? (
              <div className="flex items-center justify-center h-24 text-subtle">
                <Loader2 size={20} className="animate-spin text-accent" />
              </div>
            ) : result ? (
              <p className="text-[14px] leading-relaxed font-mono">{result}</p>
            ) : (
              <div className="flex items-center justify-center h-24 text-subtle text-[13px]">
                Sitasi akan muncul di sini
              </div>
            )}
          </div>
          <p className="text-[11.5px] text-subtle">
            Setiap sitasi yang dibuat otomatis tersimpan di akunmu.
          </p>
        </div>
      </div>
    </div>
  );
}

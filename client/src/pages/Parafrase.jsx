import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Loader2, Copy, Check, AlertCircle, ArrowDown } from 'lucide-react';
import { paraphrase, isAuthError } from '../lib/api.js';

const TONES = [
  { id: 'akademis', label: 'Akademis' },
  { id: 'santai', label: 'Santai' },
  { id: 'formal', label: 'Formal' },
];

const INTENSITIES = [
  { id: 'ringan', label: 'Ringan' },
  { id: 'sedang', label: 'Sedang' },
  { id: 'agresif', label: 'Agresif' },
];

export default function Parafrase() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [tone, setTone] = useState('akademis');
  const [intensity, setIntensity] = useState('sedang');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (text.trim().length < 10) {
      setError('Teks terlalu pendek.');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      const data = await paraphrase(text, tone, intensity);
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

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center">
            <Shuffle size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Parafrase</h1>
            <p className="text-[13px] text-muted">Tulis ulang teks — lolos detektor AI, makna tetap</p>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-surface border border-app rounded-xl shadow-card">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-muted">Gaya:</span>
          <div className="flex gap-1">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium border transition-colors ${
                  tone === t.id ? 'bg-accent text-white border-accent' : 'bg-bg-subtle text-muted border-app hover:border-strong'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-muted">Intensitas:</span>
          <div className="flex gap-1">
            {INTENSITIES.map(i => (
              <button
                key={i.id}
                onClick={() => setIntensity(i.id)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium border transition-colors ${
                  intensity === i.id ? 'bg-accent text-white border-accent' : 'bg-bg-subtle text-muted border-app hover:border-strong'
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[11px] text-subtle ml-auto">{wordCount} kata</span>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold">Teks Asli</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste teks yang mau diparafrase di sini..."
            className="w-full h-72 resize-y bg-bg-subtle border border-app rounded-xl px-4 py-3 text-[14px] leading-relaxed text-main placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || text.trim().length < 10}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Memparafrase...</> : 'Parafrase Sekarang'}
          </button>
          {error && (
            <div className="flex items-center gap-2 text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold">Hasil Parafrase</label>
            {result && (
              <button
                onClick={copyResult}
                className="flex items-center gap-1.5 text-[12px] text-muted hover:text-accent transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            )}
          </div>
          <div className="min-h-72 bg-surface border border-app rounded-xl p-4 shadow-card">
            {loading && !result ? (
              <div className="flex flex-col items-center justify-center h-64 text-subtle">
                <Loader2 size={24} className="animate-spin mb-2 text-accent" />
                <p className="text-[13px]">Lagi nulis ulang teks...</p>
              </div>
            ) : result ? (
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{result}</p>
            ) : (
              <div className="flex items-center justify-center h-64 text-subtle text-[13px]">
                Hasil parafrase akan muncul di sini
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

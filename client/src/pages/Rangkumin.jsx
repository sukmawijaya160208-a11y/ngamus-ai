import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { summarize, streamSummarize, isAuthError } from '../lib/api.js';
import Markdown from '../components/Markdown.jsx';

const STYLES = [
  { id: 'bullets', label: 'Bullet Points' },
  { id: 'brief', label: 'Singkat' },
  { id: 'detailed', label: 'Detail' },
];

export default function Rangkumin() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [style, setStyle] = useState('bullets');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (text.trim().length < 20) { setError('Teks terlalu pendek. Minimal 20 karakter.'); return; }
    setLoading(true); setError(''); setResult('');
    let streamed = '';
    // coba streaming dulu biar shutttt langsung muncul, fallback ke non-stream kalau gagal
    const useStream = text.length < 12000;
    if (useStream) {
      streamSummarize(text, style,
        (_c, full) => { streamed = full; setResult(full); },
        (full) => { setResult(full); setLoading(false); },
        async (err) => {
          if (isAuthError(err)) { navigate('/auth', { replace: true }); return; }
          if (!streamed) {
            try { const data = await summarize(text, style); setResult(data.result); } catch (e) { setError(e.message); }
            setLoading(false);
          } else setLoading(false);
        }
      );
      // timeout fallback: kalau 4 detik belum chunk, pakai non-stream
      setTimeout(async () => { if (!streamed && loading) {
        try { const data = await summarize(text, style); if (!streamed) { setResult(data.result); setLoading(false); } } catch {}
      }}, 4000);
      return;
    }
    try { const data = await summarize(text, style); setResult(data.result); } catch (err) {
      if (isAuthError(err)) { navigate('/auth', { replace: true }); return; }
      setError(err.message);
    } finally { setLoading(false); }
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charCount = text.length;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center">
            <FileText size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Rangkumin</h1>
            <p className="text-[13px] text-muted">Ubah teks panjang jadi poin-poin kunci</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold">Teks Materi</label>
            <span className="text-[11px] text-subtle">{charCount.toLocaleString()} karakter</span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste teks materi kuliah, jurnal, atau catatan di sini..."
            className="w-full h-72 resize-y bg-bg-subtle border border-app rounded-xl px-4 py-3 text-[14px] leading-relaxed text-main placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
          />

          <div>
            <label className="text-[13px] font-semibold block mb-2">Gaya Rangkuman</label>
            <div className="flex gap-2">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${
                    style === s.id
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface text-muted border-app hover:border-strong'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || text.trim().length < 20}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Merangkum...</> : 'Rangkum Sekarang'}
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
            <label className="text-[13px] font-semibold">Hasil Rangkuman</label>
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
                <p className="text-[13px]">Lagi merangkum teks...</p>
              </div>
            ) : result ? (
              <Markdown>{result}</Markdown>
            ) : (
              <div className="flex items-center justify-center h-64 text-subtle text-[13px]">
                Hasil rangkuman akan muncul di sini
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

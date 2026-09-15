import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Loader2, ChevronLeft, ChevronRight, RotateCw, AlertCircle } from 'lucide-react';
import { generateFlashcards, isAuthError } from '../lib/api.js';

const COUNTS = [5, 10, 15, 20];

export default function KartuBelajar() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [count, setCount] = useState(10);
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (text.trim().length < 50) {
      setError('Teks terlalu pendek. Minimal 50 karakter untuk flashcard yang bagus.');
      return;
    }
    setLoading(true);
    setError('');
    setCards([]);
    try {
      const data = await generateFlashcards(text, count, text.trim().slice(0, 60));
      setCards(data.cards || []);
      setCurrentIdx(0);
      setFlipped(false);
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

  function next() {
    setFlipped(false);
    setCurrentIdx(i => Math.min(i + 1, cards.length - 1));
  }
  function prev() {
    setFlipped(false);
    setCurrentIdx(i => Math.max(i - 1, 0));
  }

  const card = cards[currentIdx];

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center">
            <Layers size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Kartu Belajar</h1>
            <p className="text-[13px] text-muted">Auto-generate flashcard dari materi untuk hafalan cepat</p>
          </div>
        </div>
      </header>

      {cards.length === 0 ? (
        /* Input mode */
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold">Teks Materi</label>
            <span className="text-[11px] text-subtle">{text.length.toLocaleString()} karakter</span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste materi kuliah atau teks yang mau dihafal di sini..."
            className="w-full h-64 resize-y bg-bg-subtle border border-app rounded-xl px-4 py-3 text-[14px] leading-relaxed text-main placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
          />

          <div>
            <label className="text-[13px] font-semibold block mb-2">Jumlah Kartu</label>
            <div className="flex gap-2">
              {COUNTS.map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                    count === c ? 'bg-accent text-white border-accent' : 'bg-surface text-muted border-app hover:border-strong'
                  }`}
                >
                  {c} kartu
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || text.trim().length < 50}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Membuat kartu...</> : 'Buat Flashcard'}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-subtle">
              <Loader2 size={28} className="animate-spin mb-3 text-accent" />
              <p className="text-[13px]">Gemini lagi nulis pertanyaan & jawaban dari materi...</p>
            </div>
          )}
        </div>
      ) : (
        /* Card mode */
        <div className="max-w-2xl mx-auto">
          {/* Flashcard */}
          <div
            onClick={() => setFlipped(f => !f)}
            className="relative cursor-pointer select-none mb-6"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full min-h-[280px] transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : '',
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-surface border border-app rounded-2xl p-8 flex flex-col items-center justify-center shadow-card-lg"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-3">Pertanyaan</span>
                <p className="text-center text-lg font-semibold leading-relaxed">{card.front}</p>
                <span className="absolute bottom-4 text-[11px] text-subtle flex items-center gap-1">
                  <RotateCw size={11} /> Klik untuk balik
                </span>
              </div>
              {/* Back */}
              <div
                className="absolute inset-0 bg-bg-subtle border border-accent rounded-2xl p-8 flex flex-col items-center justify-center shadow-card-lg"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <span className="text-[11px] font-semibold text-teal uppercase tracking-wider mb-3">Jawaban</span>
                <p className="text-center text-base leading-relaxed">{card.back}</p>
                <span className="absolute bottom-4 text-[11px] text-subtle flex items-center gap-1">
                  <RotateCw size={11} /> Klik untuk balik
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-app text-[13px] font-medium hover:border-strong disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>

            <div className="text-center">
              <div className="text-[14px] font-bold">
                {currentIdx + 1} / {cards.length}
              </div>
              <div className="flex gap-1 mt-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setFlipped(false); }}
                    className={`w-2 h-2 rounded-full transition-colors ${i === currentIdx ? 'bg-accent' : 'bg-[var(--border-strong)] hover:opacity-70'}`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={next}
              disabled={currentIdx === cards.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-app text-[13px] font-medium hover:border-strong disabled:opacity-30 transition-colors"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => { setCards([]); setText(''); }}
            className="w-full mt-6 py-2.5 rounded-lg text-[13px] text-muted hover:text-accent border border-app bg-surface hover:border-strong transition-colors"
          >
            Buat set kartu baru
          </button>
        </div>
      )}
    </div>
  );
}

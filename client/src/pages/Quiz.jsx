import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Loader2, Check, X, RotateCcw, AlertCircle, Trophy } from 'lucide-react';
import { generateQuiz, isAuthError } from '../lib/api.js';

const COUNTS = [5, 10, 15];

export default function Quiz() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (text.trim().length < 50) {
      setError('Teks terlalu pendek. Minimal 50 karakter.');
      return;
    }
    setLoading(true);
    setError('');
    setQuestions([]);
    try {
      const data = await generateQuiz(text, count);
      setQuestions(data.quiz || []);
      setCurrentIdx(0);
      setSelected(null);
      setAnswered([]);
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

  function selectAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setAnswered(prev => [...prev, {
      qIdx: currentIdx,
      selected: idx,
      correct: questions[currentIdx].answer === idx,
    }]);
  }

  function nextQ() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    }
  }

  function restart() {
    setQuestions([]);
    setText('');
    setSelected(null);
    setAnswered([]);
  }

  const score = answered.filter(a => a.correct).length;
  const isFinished = answered.length === questions.length && questions.length > 0;
  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-app flex items-center justify-center">
            <HelpCircle size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Quiz</h1>
            <p className="text-[13px] text-muted">Uji pemahaman dengan soal pilihan ganda</p>
          </div>
        </div>
      </header>

      {questions.length === 0 ? (
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold">Teks Materi</label>
            <span className="text-[11px] text-subtle">{text.length.toLocaleString()} karakter</span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste materi yang mau dijadikan quiz di sini..."
            className="w-full h-56 resize-y bg-bg-subtle border border-app rounded-xl px-4 py-3 text-[14px] leading-relaxed text-main placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
          />

          <div>
            <label className="text-[13px] font-semibold block mb-2">Jumlah Soal</label>
            <div className="flex gap-2">
              {COUNTS.map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                    count === c ? 'bg-accent text-white border-accent' : 'bg-surface text-muted border-app hover:border-strong'
                  }`}
                >
                  {c} soal
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || text.trim().length < 50}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Membuat soal...</> : 'Buat Quiz'}
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
              <p className="text-[13px]">Gemini lagi menyusun soal & distractor...</p>
            </div>
          )}
        </div>
      ) : isFinished ? (
        /* Results */
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-accent" />
          </div>
          <h2 className="text-2xl font-extrabold">Quiz Selesai!</h2>
          <p className="text-muted text-sm mt-1 mb-6">
            Skor: <span className="font-bold text-accent text-lg">{score}</span> / {questions.length}
          </p>

          <div className="w-full bg-bg-subtle border border-app rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>

          {/* Review */}
          <div className="space-y-2 text-left mb-6">
            {questions.map((q, i) => {
              const ans = answered.find(a => a.qIdx === i);
              const isCorrect = ans?.correct;
              return (
                <div key={i} className="flex items-start gap-2 bg-surface border border-app rounded-lg p-3">
                  {isCorrect
                    ? <Check size={16} className="text-success mt-0.5 shrink-0" />
                    : <X size={16} className="text-danger mt-0.5 shrink-0" />}
                  <div className="text-[12px]">
                    <span className="font-semibold">Soal {i + 1}:</span> {q.question}
                    {!isCorrect && (
                      <div className="text-muted mt-1">
                        Jawaban benar: <span className="font-medium text-success">{q.options[q.answer]}</span>
                      </div>
                    )}
                    <div className="text-subtle mt-0.5">{q.explanation}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={restart}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-[14px] transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={16} /> Quiz Baru
          </button>
        </div>
      ) : (
        /* Quiz playing */
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold">
              Soal {currentIdx + 1} dari {questions.length}
            </span>
            <span className="text-[13px] text-muted">
              Benar: <span className="font-bold text-success">{score}</span>
            </span>
          </div>
          <div className="w-full bg-bg-subtle border border-app rounded-full h-1.5 mb-6 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="bg-surface border border-app rounded-xl p-5 shadow-card mb-4">
            <p className="text-[15px] font-semibold leading-relaxed mb-4">{currentQ.question}</p>
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => {
                const isSelected = selected === i;
                const isAnswer = currentQ.answer === i;
                const showResult = selected !== null;

                let bgClass = 'bg-bg-subtle border border-app hover:border-strong';
                if (showResult) {
                  if (isAnswer) bgClass = 'bg-success-soft border border-success';
                  else if (isSelected) bgClass = 'bg-danger-soft border border-danger';
                  else bgClass = 'bg-bg-subtle border border-app opacity-60';
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={showResult}
                    className={`w-full text-left px-4 py-3 rounded-lg text-[14px] transition-colors flex items-center justify-between ${bgClass}`}
                  >
                    <span>{opt}</span>
                    {showResult && isAnswer && <Check size={16} className="text-success shrink-0" />}
                    {showResult && isSelected && !isAnswer && <X size={16} className="text-danger shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation + Next */}
          {selected !== null && (
            <div className="animate-slide-up">
              <div className="bg-bg-subtle border border-app rounded-lg p-4 mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Penjelasan</span>
                <p className="text-[13px] leading-relaxed mt-1">{currentQ.explanation}</p>
              </div>
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={nextQ}
                  className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-[14px] transition-colors"
                >
                  Soal Berikutnya
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

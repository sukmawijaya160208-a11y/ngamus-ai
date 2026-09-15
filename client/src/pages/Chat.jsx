import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Send, Sparkles, Loader2, AlertCircle, Plus, History, MessageSquare, GraduationCap, ImagePlus, Mic, X } from 'lucide-react';
import { streamChat, isAuthError } from '../lib/api.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Markdown from '../components/Markdown.jsx';

const SUGGESTIONS = [
  'Jelaskan konsep machine learning untuk pemula',
  'Apa beda revisi dan amandemen UUD 1945?',
  'Bandingkan methode kuantitatif vs kualitatif',
  'Jelaskan hukum Ohm dan beri contoh soal',
];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Gagal membaca file.'));
    r.readAsDataURL(blob);
  });
}

// Validasi 10MB + kompres sisi klien agar lolos limit body serverless
async function processImage(file) {
  if (!ALLOWED_IMAGE.includes(file.type)) {
    throw new Error('Format tidak didukung. Pakai JPG, PNG, WebP, atau GIF.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Ukuran maksimal 10MB.');
  }
  let blob = file;
  try {
    const bitmap = await createImageBitmap(file);
    const MAX_DIM = 1568;
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    if (scale < 1 || file.size > 900 * 1024) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const out = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
      if (out && out.size < file.size) blob = out;
    }
    bitmap.close();
  } catch {
    // Browser lama: pakai file asli
  }
  const dataUrl = await blobToDataUrl(blob);
  return {
    preview: dataUrl,
    base64: String(dataUrl).split(',')[1],
    mimeType: blob.type || file.type,
    name: file.name,
    size: blob.size,
  };
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attError, setAttError] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const recogRef = useRef(null);
  const baseTextRef = useRef('');
  // Penjaga agar hasil load basi tidak menimpa pesan yang sedang streaming
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const streamingRef = useRef(false);

  const loadSessions = useCallback(async () => {
    if (!supabase || !user) return;
    const { data } = await supabase
      .from('chat_sessions')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20);
    if (data) setSessions(data);
  }, [user]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  useEffect(() => {
    if (!supabase || !activeId) {
      if (!streamingRef.current) setMessages([]);
      return;
    }
    const sid = activeId;
    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        // Abaikan kalau user sudah pindah sesi atau sedang streaming
        if (sid !== activeIdRef.current || streamingRef.current) return;
        if (data) setMessages(data.map((m) => ({ role: m.role, content: m.content })));
      });
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setError('');
    setShowHistory(false);
  }

  async function handleSend(text) {
    const msg = text.trim();
    const att = attachment;
    if ((!msg && !att) || isStreaming) return;

    setError('');
    setAttError('');
    setInput('');
    setAttachment(null);
    if (listening) recogRef.current?.stop();

    const finalMsg = msg || 'Jelaskan gambar ini.';

    let sid = activeId;
    if (!sid && supabase && user) {
      const { data } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: finalMsg.slice(0, 45) })
        .select('id')
        .single();
      if (data) {
        sid = data.id;
        setActiveId(sid);
        loadSessions();
      }
    }

    const userMsg = { role: 'user', content: finalMsg, image: att?.preview || null, imageName: att?.name || null };
    const placeholderMsg = { role: 'model', content: '', streaming: true };
    const base = [...messages, userMsg];

    setMessages([...base, placeholderMsg]);
    setIsStreaming(true);
    streamingRef.current = true;

    const history = base.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    const imagePayload = att ? { mimeType: att.mimeType, data: att.base64, name: att.name } : null;

    streamChat(
      finalMsg,
      history,
      sid,
      (_chunk, full) => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', content: full, streaming: true };
          return updated;
        });
      },
      (full) => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', content: full, streaming: false };
          return updated;
        });
        setIsStreaming(false);
        streamingRef.current = false;
        loadSessions();
      },
      (err) => {
        if (isAuthError(err)) {
          streamingRef.current = false;
          navigate('/auth', { replace: true });
          return;
        }
        setError(err.message || 'Terjadi kesalahan.');
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.streaming) {
            updated[updated.length - 1] = { role: 'model', content: 'Maaf, terjadi error. Coba lagi.', streaming: false, error: true };
          }
          return updated;
        });
        setIsStreaming(false);
        streamingRef.current = false;
      },
      imagePayload
    );
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttError('');
    try {
      setAttachment(await processImage(file));
    } catch (err) {
      setAttError(err.message);
    }
  }

  const micSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  function toggleMic() {
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError('Browser tidak mendukung suara. Pakai Chrome/Edge terbaru.');
      return;
    }
    if (isStreaming) return;
    try {
      const rec = new SR();
      rec.lang = 'id-ID';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      baseTextRef.current = input;
      rec.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const t = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) {
            baseTextRef.current = `${baseTextRef.current} ${t}`.trim();
          } else {
            interim += t;
          }
        }
        const base = baseTextRef.current;
        setInput(`${base}${base && interim ? ' ' : ''}${interim}`.trimStart());
      };
      rec.onend = () => {
        setListening(false);
        recogRef.current = null;
      };
      rec.onerror = (ev) => {
        setListening(false);
        recogRef.current = null;
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          setError('Izin mic ditolak. Aktifkan izin mikrofon di browser.');
        } else if (ev.error === 'no-speech') {
          setError('Tidak terdengar suara. Coba lagi.');
        }
      };
      recogRef.current = rec;
      setError('');
      rec.start();
      setListening(true);
    } catch {
      setError('Gagal menyalakan mic.');
    }
  }

  const historyPanel = (
    <div className="w-60 shrink-0 border-r border-app bg-surface flex-col h-full hidden md:flex">
      <div className="p-3">
        <button
          type="button"
          onClick={newChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold transition-colors"
        >
          <Plus size={15} /> Chat baru
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {sessions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setActiveId(s.id); setError(''); setShowHistory(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors flex items-center gap-2 ${s.id === activeId ? 'bg-accent-soft text-accent-deep font-semibold' : 'text-muted hover:bg-surface-hover'}`}
          >
            <MessageSquare size={14} className="shrink-0" />
            <span className="truncate">{s.title}</span>
          </button>
        ))}
        {sessions.length === 0 && (
          <p className="text-[12px] text-subtle text-center px-3 py-6">Belum ada riwayat chat.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      {historyPanel}

      {/* mobile history overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowHistory(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-app flex flex-col">
            <div className="p-3 border-b border-app">
              <button
                type="button"
                onClick={newChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold"
              >
                <Plus size={15} /> Chat baru
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setActiveId(s.id); setError(''); setShowHistory(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] flex items-center gap-2 ${s.id === activeId ? 'bg-accent-soft text-accent-deep font-semibold' : 'text-muted'}`}
                >
                  <MessageSquare size={14} className="shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-app bg-surface/80 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setShowHistory(true)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-surface-hover" aria-label="Riwayat chat">
              <History size={18} />
            </button>
            <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-white" />
            </span>
            <div>
              <h1 className="font-bold text-[15px] leading-tight">Tanya AI</h1>
              <p className="text-[11px] text-subtle">Selalu siap membantu · tersimpan otomatis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={newChat}
            className="hidden md:flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-accent px-3 py-1.5 rounded-md hover:bg-surface-hover transition-colors"
          >
            <Plus size={14} /> Chat baru
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-xl bg-accent-soft flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={26} className="text-accent" />
                </div>
                <h2 className="font-bold text-lg">Tanya apa aja, bro</h2>
                <p className="text-muted text-sm mt-1 mb-6">Dari konsep kuliah sampai soal hitungan. AI ini siap ngejawab.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSend(s)}
                      className="text-left text-[13px] px-4 py-3 rounded-lg bg-surface border border-app hover:border-strong hover:shadow-card transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={`${activeId || 'new'}-${i}`}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] md:max-w-[75%] min-w-0">
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt={msg.imageName || 'Gambar lampiran'}
                        className="w-full max-h-56 object-cover rounded-2xl rounded-br-md border border-app mb-1.5"
                      />
                    )}
                    <div className="bg-accent text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap shadow-card">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 max-w-[92%] md:max-w-[85%]">
                    <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1" aria-hidden="true">
                      <Sparkles size={14} className="text-white" />
                    </span>
                    <div className={`flex-1 min-w-0 rounded-2xl rounded-bl-md px-4 py-3 border border-app ${msg.error ? 'bg-danger-soft' : 'bg-bg-subtle'}`}>
                      {msg.streaming && !msg.content ? (
                        <div className="flex items-center gap-1.5 py-1.5" aria-label="AI sedang mengetik">
                          <span className="loading-dot w-2 h-2 rounded-full bg-[var(--text-subtle)] inline-block" style={{ animationDelay: '0s' }} />
                          <span className="loading-dot w-2 h-2 rounded-full bg-[var(--text-subtle)] inline-block" style={{ animationDelay: '0.2s' }} />
                          <span className="loading-dot w-2 h-2 rounded-full bg-[var(--text-subtle)] inline-block" style={{ animationDelay: '0.4s' }} />
                        </div>
                      ) : (
                        <div className={msg.streaming ? 'typing-cursor' : ''}>
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="px-4 md:px-8 pb-4 pt-2 border-t border-app bg-surface">
          {error && (
            <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          {(attachment || attError) && (
            <div className="max-w-3xl mx-auto mb-2 flex flex-wrap items-center gap-2">
              {attachment && (
                <div className="flex items-center gap-2 bg-bg-subtle border border-app rounded-xl p-1.5 pr-2 max-w-full">
                  <img src={attachment.preview} alt="Pratinjau lampiran" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold truncate max-w-[140px] sm:max-w-[220px]">{attachment.name}</p>
                    <p className="text-[11px] text-subtle">{formatBytes(attachment.size)} · terkirim ke AI</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    aria-label="Hapus lampiran"
                    className="p-1.5 rounded-lg text-subtle hover:text-danger hover:bg-danger-soft transition-colors shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              {attError && (
                <p role="alert" className="flex items-center gap-1.5 text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-lg">
                  <AlertCircle size={14} /> {attError}
                </p>
              )}
            </div>
          )}
          <div className="max-w-3xl mx-auto flex items-end gap-1.5 sm:gap-2 bg-surface border border-app rounded-2xl p-2 pl-2 sm:pl-3 shadow-card focus-within:border-accent transition-colors">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              aria-label="Lampirkan gambar"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isStreaming}
              aria-label="Lampirkan gambar (maks 10MB)"
              title="Lampirkan gambar (maks 10MB)"
              className="shrink-0 w-10 h-10 rounded-xl text-subtle hover:text-accent hover:bg-surface-hover disabled:opacity-40 flex items-center justify-center transition-colors"
            >
              <ImagePlus size={19} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={listening ? 'Mendengarkan... ketuk mic untuk berhenti' : 'Tulis pertanyaan...'}
              rows={1}
              aria-label="Tulis pertanyaan"
              className="flex-1 min-w-0 resize-none bg-transparent px-1 py-2.5 text-[14px] text-main placeholder:text-subtle focus:outline-none max-h-32"
              style={{ minHeight: '40px' }}
              disabled={isStreaming}
            />
            {micSupported && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={isStreaming && !listening}
                aria-label={listening ? 'Berhenti merekam' : 'Bicara'}
                title={listening ? 'Berhenti merekam' : 'Bicara (Bahasa Indonesia)'}
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 ${listening ? 'text-danger bg-danger-soft' : 'text-subtle hover:text-accent hover:bg-surface-hover'}`}
              >
                {listening ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
                ) : (
                  <Mic size={19} />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSend(input)}
              disabled={(!input.trim() && !attachment) || isStreaming}
              className="shrink-0 w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              aria-label="Kirim"
            >
              {isStreaming ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </div>
          <p className="text-[11px] text-subtle text-center mt-2">
            Gemini bisa membuat kesalahan. Cek info penting sebelum dipakai.
          </p>
        </div>
      </div>
    </div>
  );
}

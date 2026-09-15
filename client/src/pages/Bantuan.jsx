import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, AlertCircle, LifeBuoy, ShieldCheck } from 'lucide-react';
import {
  supportThreads, supportCreateThread, supportMessages, supportSend, isAuthError,
} from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function fmtTime(iso) {
  try {
    const d = new Date(iso);
    const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === new Date().toDateString()) return time;
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ${time}`;
  } catch {
    return '';
  }
}

export default function Bantuan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const loadMessages = useCallback(async (tid) => {
    const data = await supportMessages(tid);
    setMessages(data.messages || []);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await supportThreads(false);
        const list = t.threads || [];
        let th = list.find((x) => x.status === 'open') || list[0];
        if (!th) {
          const c = await supportCreateThread('Butuh bantuan');
          th = c.thread;
        }
        if (!alive) return;
        setThread(th);
        await loadMessages(th.id);
        if (alive) setLoading(false);
      } catch (e) {
        if (!alive) return;
        if (isAuthError(e)) {
          navigate('/auth', { replace: true });
          return;
        }
        setError(/relation|does not exist|schema cache/i.test(e.message || '')
          ? 'Fitur bantuan belum diaktifkan admin (tabel database belum dibuat).'
          : e.message);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [loadMessages, navigate]);

  // Polling jawaban admin tiap 4 detik
  useEffect(() => {
    if (!thread) return;
    const iv = setInterval(() => {
      if (document.hidden) return;
      supportMessages(thread.id).then((d) => setMessages(d.messages || [])).catch(() => {});
    }, 4000);
    return () => clearInterval(iv);
  }, [thread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !thread) return;
    setInput('');
    setError('');
    const temp = { id: `tmp-${Date.now()}`, sender_id: user?.id, sender_role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, temp]);
    setSending(true);
    try {
      const data = await supportSend(thread.id, text);
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? data.message : m)));
      setThread((prev) => (prev ? { ...prev, status: 'open' } : prev));
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-app bg-surface/80 backdrop-blur-sm md:px-8">
        <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
          <LifeBuoy size={18} className="text-white" />
        </span>
        <div>
          <h1 className="font-bold text-[15px] leading-tight">Bantuan Admin</h1>
          <p className="text-[11px] text-subtle">Ngobrol langsung dengan admin · dibalas &lt; 1 hari</p>
        </div>
        {thread?.status === 'closed' && (
          <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-bg-subtle border border-app text-muted">
            Ditutup
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-subtle">
              <Loader2 size={26} className="animate-spin text-accent mb-2" />
              <p className="text-[13px]">Membuka obrolan...</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="inline-block text-[12px] text-muted bg-bg-subtle border border-app rounded-full px-4 py-1.5">
                  Sampaikan kendala atau pertanyaanmu. Admin akan membalas di sini.
                </p>
              </div>
              {messages.map((m) => {
                // Sisi ditentukan dari ID pengirim (bukan role) —
                // akun admin yang chat di sini tetap tampil kanan.
                const mine = m.sender_id ? m.sender_id === user?.id : m.sender_role === 'user';
                return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  {!mine ? (
                    <div className="flex items-start gap-2.5 max-w-[92%] md:max-w-[85%]">
                      <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1" aria-hidden="true">
                        <ShieldCheck size={14} className="text-white" />
                      </span>
                      <div className="min-w-0 rounded-2xl rounded-bl-md px-4 py-2.5 bg-bg-subtle border border-app">
                        <p className="text-[11px] font-bold text-accent mb-0.5">Admin</p>
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        <p className="text-[10.5px] text-subtle text-right mt-1">{fmtTime(m.created_at)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] md:max-w-[75%] bg-accent text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-card">
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      <p className="text-[10.5px] text-white/70 text-right mt-1">{fmtTime(m.created_at)}</p>
                    </div>
                  )}
                </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 pb-4 pt-2 border-t border-app bg-surface">
        {thread?.status === 'closed' && (
          <p className="max-w-3xl mx-auto mb-2 text-[12px] text-muted bg-bg-subtle border border-app px-3 py-2 rounded-lg">
            Obrolan ini ditutup admin. Kirim pesan baru untuk membukanya lagi.
          </p>
        )}
        {error && (
          <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-lg">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="max-w-3xl mx-auto flex items-end gap-2 bg-surface border border-app rounded-2xl p-2 pl-4 shadow-card focus-within:border-accent transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan untuk admin..."
            rows={1}
            aria-label="Tulis pesan untuk admin"
            className="flex-1 min-w-0 resize-none bg-transparent px-0 py-2.5 text-[14px] text-main placeholder:text-subtle focus:outline-none max-h-32"
            style={{ minHeight: '40px' }}
            disabled={sending || loading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending || loading}
            className="shrink-0 w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
            aria-label="Kirim"
          >
            {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}

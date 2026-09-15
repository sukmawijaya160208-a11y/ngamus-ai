import { supabase, supabaseReady } from './supabase.js';

const API_BASE = '/api';

export function isAuthError(err) {
  return err && (err.code === 401 || /login| sesi |auth/i.test(err.message || ''));
}

async function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (supabaseReady && supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function httpError(status, data) {
  const err = new Error(data?.error || `HTTP ${status}`);
  err.code = status;
  return err;
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch {
    return { status: 'error', geminiReady: false };
  }
}

export async function streamChat(message, history, sessionId, onChunk, onDone, onError, image = null) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ message, history, sessionId, image }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      onError(httpError(res.status, err));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';
    let finished = false;
    const doneOnce = (text) => { if (!finished) { finished = true; onDone(text); } };
    const failOnce = (e) => { if (!finished) { finished = true; onError(e); } };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              full += data.text;
              if (!finished) onChunk(data.text, full);
            } else if (data.type === 'done') {
              doneOnce(data.full || full);
            } else if (data.type === 'error') {
              failOnce(new Error(data.message));
            }
          } catch {
            // abaikan baris parsial
          }
        }
      }
    }

    if (full) doneOnce(full);
  } catch (error) {
    onError(error);
  }
}

async function postJSON(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(res.status, data);
  return data;
}

async function getJSON(endpoint) {
  const headers = await authHeaders();
  delete headers['Content-Type'];
  const res = await fetch(`${API_BASE}${endpoint}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(res.status, data);
  return data;
}

async function patchJSON(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(res.status, data);
  return data;
}

async function putJSON(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(res.status, data);
  return data;
}

export const summarize = (text, style) => postJSON('/tools/summarize', { text, style });
export const paraphrase = (text, tone, intensity) => postJSON('/tools/paraphrase', { text, tone, intensity });
export async function streamSummarize(text, style, onChunk, onDone, onError) {
  try {
    const res = await fetch(`${API_BASE}/tools/summarize`, { method: 'POST', headers: await authHeaders(), body: JSON.stringify({ text, style, stream: true }) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); onError(httpError(res.status, err)); return; }
    const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ''; let full = ''; let done = false;
    const doneOnce = (t) => { if (!done) { done = true; onDone(t); } };
    while (true) { const { done: d, value } = await reader.read(); if (d) break;
      buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop() || '';
      for (const l of lines) if (l.startsWith('data: ')) try { const data = JSON.parse(l.slice(6)); if (data.type === 'chunk') { full += data.text; onChunk(data.text, full); } else if (data.type === 'done') doneOnce(data.full || full); else if (data.type === 'error') onError(new Error(data.message)); } catch {}
    }
    if (full) doneOnce(full);
  } catch (e) { onError(e); }
}
export const generateCitation = (type, source) => postJSON('/tools/citation', { type, source });
export const generateFlashcards = (text, count, title) => postJSON('/tools/flashcards', { text, count, title });
export const generateQuiz = (text, count) => postJSON('/tools/quiz', { text, count });
export const explainTopic = (text, topic) => postJSON('/tools/explain', { text, topic });

// ---- admin ----
export const adminStats = () => getJSON('/admin/stats');
export const adminUsers = (q) => getJSON('/admin/users' + (q ? `?q=${encodeURIComponent(q)}` : ''));
export const adminUpdateUser = (id, patch) => patchJSON('/admin/users', { id, ...patch });
export const adminLogs = () => getJSON('/admin/logs');
export const adminSettings = () => getJSON('/admin/settings');
export const adminSaveSetting = (key, value) => putJSON('/admin/settings', { key, value });

// ---- bantuan (chat user ↔ admin) ----
export const supportThreads = (all) => getJSON('/support/threads' + (all ? '?all=1' : ''));
export const supportCreateThread = (subject) => postJSON('/support/threads', { subject });
export const supportMessages = (threadId) => getJSON(`/support/messages?threadId=${encodeURIComponent(threadId)}`);
export const supportSend = (threadId, content) => postJSON('/support/messages', { threadId, content });
export const supportSetStatus = (id, status) => patchJSON('/support/threads', { id, status });

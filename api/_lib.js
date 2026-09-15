import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// ---------- Gemini ----------
export function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY belum diset di environment.');
  return new GoogleGenAI({ apiKey });
}

export const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
export const MODEL_FALLBACKS = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

export const SYSTEM_INSTRUCTION = `Kamu Ngampus AI — asisten belajar mahasiswa Indonesia. Jawab Bahasa Indonesia, padat, terstruktur (markdown jika perlu), beri contoh praktis, jangan ngarang.`;

export function modelsToTry() {
  return [...new Set([MODEL, ...MODEL_FALLBACKS])];
}

export function isRetryable(e) {
  const msg = String(e?.message || '');
  return /503|500|UNAVAILABLE|overloaded|high demand|429|RESOURCE_EXHAUSTED|quota/i.test(msg);
}

export function isModelGone(e) {
  const msg = String(e?.message || '');
  return /404|NOT_FOUND|no longer available/i.test(msg);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function streamGenerateWithFallback(prompt, systemOverride, onText) {
  const ai = getAI();
  for (const model of modelsToTry()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({ model, contents: prompt, config: { systemInstruction: systemOverride || SYSTEM_INSTRUCTION, temperature: 0.55, maxOutputTokens: 2048 } });
        let got = false;
        for await (const chunk of stream) { const t = chunk.text; if (t) { got = true; onText(t); } }
        if (!got) throw new Error('Empty stream');
        return model;
      } catch (e) {
        if (isModelGone(e)) break;
        if (!isRetryable(e)) throw e;
        await sleep(180 * (attempt + 1));
      }
    }
  }
  throw new Error('Semua model sibuk.');
}

export async function generateWithFallback(prompt, systemOverride) {
  const ai = getAI();
  const tried = [];
  for (const model of modelsToTry()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemOverride || SYSTEM_INSTRUCTION,
            temperature: 0.6,
          },
        });
        if (!response.text) throw new Error('Empty response from ' + model);
        return { text: response.text, model };
      } catch (e) {
        tried.push(`${model}: ${String(e.message || e).slice(0, 80)}`);
        if (isModelGone(e)) break;
        if (!isRetryable(e)) throw e;
        await sleep(1200 * (attempt + 1));
      }
    }
  }
  throw new Error('Semua model sibuk. Coba lagi sebentar.');
}

// ---------- Supabase (service role, server only) ----------
export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Verifikasi Bearer token → return { user, profile } atau throw 401/403
export async function requireUser(req) {
  const svc = getServiceClient();
  if (!svc) throw Object.assign(new Error('Supabase belum dikonfigurasi.'), { status: 503 });
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw Object.assign(new Error('Belum login.'), { status: 401 });
  const { data, error } = await svc.auth.getUser(token);
  if (error || !data?.user) throw Object.assign(new Error('Sesi tidak valid. Login ulang.'), { status: 401 });
  const { data: profile } = await svc.from('profiles').select('*').eq('id', data.user.id).single();
  if (!profile) throw Object.assign(new Error('Profil tidak ditemukan.'), { status: 403 });
  if (profile.is_disabled) throw Object.assign(new Error('Akun dinonaktifkan. Hubungi admin.'), { status: 403 });
  return { user: data.user, profile, svc };
}

export async function requireAdmin(req) {
  const ctx = await requireUser(req);
  if (ctx.profile.role !== 'admin') {
    throw Object.assign(new Error('Khusus admin.'), { status: 403 });
  }
  return ctx;
}

export function sendError(res, e) {
  const status = e.status || 500;
  res.status(status).json({ error: e.message || 'Terjadi kesalahan.' });
}

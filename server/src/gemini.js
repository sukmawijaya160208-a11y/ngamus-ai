import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('\n========================================');
  console.error('  GEMINI_API_KEY belum diset!');
  console.error('  1. Buka https://aistudio.google.com/apikey');
  console.error('  2. Create API Key (gratis)');
  console.error('  3. Copy ke server/.env');
  console.error('========================================\n');
}

export const ai = new GoogleGenAI({ apiKey: apiKey || 'placeholder' });

export const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Fallback chain — urut model REAL yang ada di Google AI. gemini-3.8-flash tidak ada (404), jangan pakai.
export const MODEL_FALLBACKS = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

export function isRetryable(e) {
  const msg = String(e?.message || '');
  return /503|500|UNAVAILABLE|overloaded|high demand|429|RESOURCE_EXHAUSTED|quota/i.test(msg);
}

export function isModelGone(e) {
  const msg = String(e?.message || '');
  return /404|NOT_FOUND|no longer available/i.test(msg);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const SYSTEM_INSTRUCTION = `Kamu Ngampus AI — asisten belajar mahasiswa Indonesia. Jawab Bahasa Indonesia, padat, terstruktur (markdown jika perlu), beri contoh praktis untuk konsep, jangan ngarang.`;

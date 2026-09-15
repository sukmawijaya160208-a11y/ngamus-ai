# Ngampus AI

Asisten belajar untuk mahasiswa Indonesia. Powered by **Gemini Flash** (gratis).

6 tools dalam satu aplikasi: **Tanya AI** (chat streaming), **Rangkumin**,
**Parafrase** (anti-AI-detector), **Referensi** (sitasi APA/IEEE/Harvard/MLA),
**Kartu Belajar** (flashcard), dan **Quiz**.

Terinspirasi konsep [pelajarin.ai](https://pelajarin.ai/).

## Struktur

```
ngampus-ai/
├── client/   # Vite + React 19 + Tailwind CSS v4 + React Router
└── server/   # Express + @google/genai (Gemini Flash)
```

## Cara Jalanin (5 menit)

### 1. Dapetin Gemini API Key (GRATIS)

1. Buka **https://aistudio.google.com/apikey**
2. Login pake akun Google
3. Klik **"Create API Key"** → pilih project (atau bikin baru)
4. Copy API key-nya (format: `AIza...`)

Limit gratis: **15 request/menit, 1500 request/hari, 1 juta token/menit.**
Cukup banget buat pemakaian kuliah harian.

### 2. Setup Server

```bash
cd server
npm install
cp .env.example .env
```

Buka file `.env`, isi API key:

```
GEMINI_API_KEY=AIza... (paste key kamu di sini)
PORT=3001
```

Jalanin server:

```bash
npm run dev
```

Server jalan di `http://localhost:3001`.
Cek: buka `http://localhost:3001/api/health` → harusnya `{"status":"ok",...}`.

### 3. Setup Client

```bash
cd client
bun install     # atau: npm install (butuh RAM lega)
bun run dev     # atau: npm run dev
```

Buka `http://localhost:5173`. Selesai.

> Catatan: kalau `npm install` crash OOM di laptop RAM kecil,
> pake [bun](https://bun.sh) (`bun install`) — jauh lebih hemat memori.

## API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/health` | Status server + cek API key |
| POST | `/api/chat` | Chat streaming (SSE): `{message, history}` |
| POST | `/api/tools/summarize` | Rangkuman: `{text, style}` |
| POST | `/api/tools/paraphrase` | Parafrase: `{text, tone, intensity}` |
| POST | `/api/tools/citation` | Sitasi: `{type, source}` |
| POST | `/api/tools/flashcards` | Flashcard JSON: `{text, count}` |
| POST | `/api/tools/quiz` | Quiz JSON: `{text, count}` |
| POST | `/api/tools/explain` | Penjelasan topik: `{text, topic}` |

## Desain

Warm scholarly palette (amber + stone), **bukan** purple/blue AI-slop gradient.
Light/dark mode otomatis + toggle manual. Responsive: sidebar jadi drawer di mobile.

## Bun vs npm

Project ini bisa jalan pake dua-duanya. `bun install` direkomendasikan
kalau RAM terbatas. `npm run dev` / `bun run dev` dua-duanya bisa dipake
buat jalanin dev server.

## v2 — Akun, Role & Deploy

- **Daftar/Masuk**: `/daftar`, `/masuk` (email + password, via Supabase).
- **Role**: `user` biasa vs `admin` (akses `/admin`: statistik, kelola user, log, atur model AI).
- Semua tool wajib login; hasilnya tersimpan otomatis di akun.
- **Setup backend akun**: bikin project di supabase.com → jalankan `supabase-schema.sql`
  di SQL Editor → isi `client/.env` (lihat `client/.env.example`).
- **Deploy Vercel**: panduan lengkap di `DEPLOY.md` (serverless `api/`, `vercel.json` siap).
- **Foto landing**: `client/public/FOTO UNTUK LEANDING PAGE/` (10 foto lokal, sudah terverifikasi).

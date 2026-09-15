# DEPLOY — Ngampus AI v2

## 1. Supabase (wajib, ±10 menit, gratis)

1. Daftar di **https://supabase.com** → **New Project** (nama: `ngampus-ai`, region: Singapore).
2. Tunggu project siap → buka **SQL Editor → New Query**.
3. Paste **seluruh isi `supabase-schema.sql`** (di root repo) → **Run**.
   Ini membuat: `profiles`, `chat_sessions`, `chat_messages`, `saved_citations`,
   `saved_flashcard_sets`, `usage_logs`, `app_settings` + trigger auto-profil +
   auto-promote `sukma160208@gmail.com` jadi **admin** + semua RLS policy.
4. **Authentication → Sign In / Up**: pastikan **Email** aktif.
   Opsional (biar daftar langsung masuk tanpa verifikasi email):
   **Authentication → Settings → matikan "Confirm email"**.
5. **Authentication → URL Configuration → Redirect URLs**, tambahkan:
   - `http://localhost:5173/**`
   - `https://namadomainmu.vercel.app/**` (ganti setelah deploy)
6. **Settings → API**, catat 3 nilai:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY` (juga dipakai sebagai `VITE_SUPABASE_ANON_KEY`)
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**rahasia, hanya di server/Vercel**)

## 2. Environment variables

**Lokal — `client/.env`** (copy dari `client/.env.example`):
```
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

**Lokal — `server/.env`** (sudah ada):
```
GEMINI_API_KEY=...
PORT=3001
```

**Vercel — Settings → Environment Variables** (Production + Preview):
| Key | Isi |
|-----|-----|
| `GEMINI_API_KEY` | API key Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.8-flash` (opsional) |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

## 3. Deploy ke Vercel

```bash
npm i -g vercel
vercel login        # login via browser (satu-satunya langkah manual)
vercel --prod       # jawab: root ./, build otomatis dari vercel.json
```

`vercel.json` sudah mengatur: install root + client (bun),
build `client/dist`, rewrite `/api/*` ke serverless functions,
fallback SPA ke `index.html`. Satu URL, tanpa CORS.

## 4. Jalan lokal

```bash
# terminal 1 — backend Express (dev)
cd server && node src/index.js      # http://localhost:3001

# terminal 2 — frontend (proxy /api → :3001 otomatis)
cd client && bun run dev            # http://localhost:5173
```
Atau double-click **`start-ngampus.bat`**.

## 5. Checklist setelah deploy

- [ ] Buka `/api/health` → `geminiReady: true`, `supabaseReady: true`
- [ ] Daftar akun baru → profil `user` terbentuk otomatis
- [ ] Login `sukma160208@gmail.com` → badge **ADMIN** muncul di sidebar
- [ ] User biasa buka `/admin` → dilempar ke dashboard; panggil API admin langsung → 403
- [ ] Pakai Tanya AI → pesan tersimpan (cek menu Riwayat di halaman chat)
- [ ] Panel admin → statistik, tabel user, log, ganti model default
- [ ] Tambah admin baru: Panel Admin → Pengguna → "Jadi admin"

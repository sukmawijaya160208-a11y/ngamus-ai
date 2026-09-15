# Aturan Deploy — Ngampus AI

> Berlaku untuk semua perubahan — diperketat 14 Sep 2026 malam.

## Live URL
- Production: https://ngampus-ai.vercel.app
- Last deploy: 14 Sep 2026 19:BB — role system v2 (RoleBadge + guards disabled + Dashboard admin-aware + Sidebar admin dark + Admin sonner)

## Aturan Baru (Wajib)
1. **Ada perubahan langsung deploy** — tiap edit `client/` / `api/` / `vercel.json` / `supabase-*.sql` → `vercel deploy --prod --yes` dalam sesi yang sama. Jangan tunda.
2. **Verifikasi dulu**: `npm run build` di `client/` harus pass (contoh: 10.6s). Gagal → jangan deploy.
3. **Vault + Skema**: update `docs/vault/daily/YYYY-MM-DD.md` (paste JSON [[skema-hasil-sesi]]) + `memory add`.
4. **Jangan deploy jika**: build gagal, foto belum di `public/FOTO UNTUK LEANDING PAGE/`, atau `isDisabled` guard belum dites.
5. **Cek HP**: buka https://ngampus-ai.vercel.app — bandingkan hero masthead + RoleBadge.

## Auto-deploy (opsi git)
- Jika repo git terhubung ke Vercel, `git push main` → auto deploy. Saat ini projek belum git, jadi manual via `vercel --prod` (aturan #1).

## Cek live
- `vercel ls` · `vercel inspect <url> --logs` · `vercel curl <url>`

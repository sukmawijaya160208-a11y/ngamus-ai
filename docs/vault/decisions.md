# Decisions

> Sumber kebenaran ringkas. Tiap baris = fakta teknis yang jangan diulang.

- **Coverflow 3D** live di landing sebelum FAQ: 5 kartu foto kampus (CSS 3D perspective, tengah penuh + CTA, samping miring redup klikable, panah+dots, bg blur sinkron, responsif 3 geometri, reduced-motion, keyboard) — tanpa dep baru.
- **FeatureSlides** = 6 slide full-width berselang (nomor besar, judul 40px, foto parallax scale+geser ikut scroll) — ganti bento grid (AI-slop).
- **Chat Bantuan** bubble by `sender_id` (API kembalikan `sender_id`) — bukan `sender_role`. Berlaku di `/bantuan` + tab admin.
- **/admin-masuk** khusus: kartu gelap, tolak non-admin + `signOut` otomatis, guard `/admin` → arahkan ke sana.
- **Stack hemat global**: caveman full + ponytail on + rtk 0.49.0 + Headroom manual (trial).
- **Landing anti-slop (14 Sep 2026)**: proof strip mono + stats + footnote + log IN/OUT + section Batasan jujur — lihat [[landing-anti-slop]].

---
*Mirror `memory` penting. Update tiap selesai fitur.*

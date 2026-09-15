# Skema Hasil Sesi Baru — Ngampus AI

> Kirim skema ini tiap tutup sesi. File: `docs/vault/daily/YYYY-MM-DD.md` + `memory add`.

```json
{
  "sesi": "2026-09-14T05:22:00+07:00",
  "durasi": "42m",
  "t stack_hemat": ["caveman:full", "ponytail:on", "rtk:0.49.0", "headroom:manual"],
  "skill_aktif": ["frontend-design", "design-taste-frontend", "shadcn", "serena"],
  "task": [
    { "id": "landing-anti-slop-v2", "status": "done", "file": "client/src/pages/Landing.jsx", "build": "pass 9.4s" },
    { "id": "vault-auto-daily", "status": "done", "file": "docs/vault/daily/2026-09-14.md" }
  ],
  "ubah": ["Landing: proof strip, stats+footnote, log IN/OUT, Batasan", "Vault: 00-index bintang, template daily, scheduler 07:00"],
  "batas": ["jawaban bisa halu", "kuota 1500/hari bareng", "harga mockup belum billing"],
  "next": ["tes DeepSeek V4.1 Flash", "cek Clario key"],
  "link": ["docs/vault/00-index.md", "docs/vault/landing-anti-slop.md"]
}
```

## Cara pakai
1. Copy JSON di atas, isi `sesi`/`task`/`ubah` tiap selesai
2. Tempel di `daily/YYYY-MM-DD.md` bagian `## Hasil`
3. `memory add` ringkas id-ID (1 baris)

## Contoh terse (caveman full)
```
landing v2 done | proof+log+batas | build pass | daily auto 07:00
```

---
Template: `templates/daily.md` · Trigger: `Ctrl+D`

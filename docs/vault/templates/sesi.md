# Template Hasil Sesi

> Dipakai tiap akhir sesi opencode. Isi singkat id-ID, fakta teknis.
> Cara cepat: `./scripts/catet.sh "ringkasan"` (log) atau `--selesai` / `--ide`.
> Skema JSON lengkap: [[skema-hasil-sesi]].

## Sesi: {{date:YYYY-MM-DD}} {{time}}

- **Task:** 
- **Ubah:** (file + baris, mis. `server/src/index.js:42`)
- **Hasil:** lolos / gagal + verifikasi (`npm run build`, `opencode mcp list`, dsb)
- **Batas / Next:** 
- **Keputusan baru →** pindah ke [[decisions]] + `memory add`

---
*Aturan auto-simpan: [[aturan-opencode]]*

# Aturan OpenCode + MCP Global

> Setup sekali, berlaku untuk semua proyek. Config: `~/.config/opencode/opencode.jsonc`

## 🧩 7 MCP Global (terverifikasi 2026-09-17, 7/7 connected)

| MCP | Fungsi | Butuh key |
| --- | --- | --- |
| `context7` | Docs library up-to-date (React 19, Vite, Supabase) — anti halusinasi API | `CONTEXT7_API_KEY` |
| `sequential-thinking` | Planning step-by-step task kompleks | — |
| `memory` | Ingatan lintas sesi (`~/.local/share/opencode/memory.json`) | — |
| `github` | Issues, PR, code search via `https://api.githubcopilot.com/mcp` (PAT + `oauth: false`, GitHub tidak support DCR) | `GITHUB_TOKEN` |
| `playwright` | Browser beneran buat test UI / E2E | — |
| `supabase` | Manage tabel, RLS, auth, storage, edge functions | `SUPABASE_ACCESS_TOKEN` |
| `tavily` | Deep web search + extract | `TAVILY_API_KEY` |

Runtime: Node 22 LTS userspace di `~/.local/node-v22.23.2-linux-x64/` (tanpa sudo).
Obsidian: v1.13.7 userspace di `~/.local/obsidian/`, binary `~/.local/bin/obsidian`.

## 🔑 API Keys — ambil di sini, simpan di `~/.bashrc`

- Context7 → `https://context7.com/dashboard` → `CONTEXT7_API_KEY`
- Tavily → `https://app.tavily.com/home` → `TAVILY_API_KEY`
- Supabase → `https://supabase.com/dashboard/account/tokens` → `SUPABASE_ACCESS_TOKEN`
- GitHub → `https://github.com/settings/personal-access-tokens/new` (fine-grained, centang `repo`, `issues`, `pull requests`) → `GITHUB_TOKEN`

```bash
export CONTEXT7_API_KEY="..."
export TAVILY_API_KEY="..."
export SUPABASE_ACCESS_TOKEN="..."
export GITHUB_TOKEN="..."
```

## ⛔ Aturan Keras

1. **Key TIDAK PERNAH masuk** file proyek, git, chat, atau screenshot. Cuma di `~/.bashrc` + env.
2. Key yang pernah bocor ke chat = anggap kebakar → **revoke + bikin baru**.
3. Abis ubah `opencode.jsonc` atau tambah key → **quit + restart opencode** (config cuma ke-load pas start).
4. Cek status: `opencode mcp list` (harus 7/7 connected).
5. `playwright` pertama kali butuh: `npx playwright install chromium`.
6. Vault Obsidian yang valid = `docs/vault/` — JANGAN buka root proyek sebagai vault (duplikat `.obsidian` kosong di root boleh dihapus).

## 💾 Auto-Simpan Vault (wajib tiap akhir sesi)

Vault HARUS konek ke proyek: tiap ada kejadian penting, catat via script
(daily note kebikin otomatis dari template kalau belum ada):

```bash
./scripts/catet.sh "pesan log"              # → ## 📝 Log
./scripts/catet.sh --selesai "task beres"   # → ## ✅ Selesai
./scripts/catet.sh --ide "ide / bug"        # → ## 💡 Ide / Bug
```

Template: `templates/sesi.md` (hasil sesi terstruktur), `templates/daily.md` (harian).
Keputusan penting → pindah ke [[decisions]] + `memory add`, kosongkan [[00-inbox]].

## 🔄 Aturan Sesi / Multitasking

1. MCP = nambah tools, BUKAN multitasking. Multitasking = jalanin task paralel via subagent.
2. Pola kerja: `sequential-thinking` pecah plan → lempar paralel → `memory` simpen hasil → `playwright` verifikasi UI → `github` bikin PR.
3. Maksimal 3–6 MCP aktif relevan per task. Kalau ada MCP nganggur terus, disable sementara biar hemat context.
4. Tiap sesi baru: baca [[00-index]], cek [[00-inbox]], simpan keputusan ke [[decisions]] + `memory add`.

## 🔗 Terkait

- [[00-index]] — mulai dari sini tiap sesi
- [[env-setup]] — stack + env proyek
- [[aturan-deploy]] — SOP deploy

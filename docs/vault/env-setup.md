# Env Setup (global + ngampus-ai)

Setup hemat-token + teliti-sesi-baru. Berlaku global semua projek.

## TaskSkill / Desain anti-ngaco (baru)
- `frontend-design` (Anthropic 885K) + `canvas-design` — aturan desain sistematis
- `design-taste-frontend` + `high-end-visual-design` + `stitch-design-taste` (leonxlnx) — cegah bento/glass generik
- `web-design-guidelines` (Vercel) — checklist web pro
Total skills global sekarang 72 (opencode baca `~/.agents/skills` otomatis, tanpa batas ngaco).

## Stack hemat
- Headroom (input-side compress, app manual https://extraheadroom.com, trial 7 hari)
- Ponytail plugin `@metalbolicx/opencode-ponytail` 4.8.4 (on, lazy senior dev)
- Caveman plugin `@mumme-it/opencode-caveman` 0.2.0 (default full; /caveman lite|full|ultra, stop caveman)
- RTK 0.49.0 di `~/.local/bin/rtk.exe` (cek `rtk gain`)

## Plugin opencode (`~/.config/opencode/opencode.jsonc`)
`./plugins/claude-mem.js, superpowers, opencode-mem, @mumme-it/opencode-caveman, @metalbolicx/opencode-ponytail`

## MCP: + serena (code graph, ganti scan file mentah) via uvx. Restart opencode agar aktif.

## Skills global (`~/.agents/skills`, 67 total)
- shadcn + migrate-radix-to-base
- mattpocock (11): ask-matt, code-review, codebase-design, diagnosing-bugs, implement, research, setup-matt-pocock-skills, tdd, grill-me, handoff, writing-for-agents
- alirezarezvani (12): senior-fullstack, senior-frontend, code-reviewer, tdd-guide, skill-security-auditor, llm-cost-optimizer, self-improving-agent, karpathy-coder, database-schema-designer, landing-page-generator, api-design-reviewer, tech-debt-tracker
- browser-use: browser-use, open-source, qa
- ⚠️ karpathy-coder flag Critical (Snyk), tdd-guide/skill-security-auditor/browser-use/qa flag High/Med — review sebelum pakai.

## Tools
- Python 3.12.9 (`%LOCALAPPDATA%\Programs\Python\Python312`), uv 0.11.7, browser-use CLI 0.1.13
- Obsidian 1.13.7 (`%LOCALAPPDATA%\Programs\Obsidian\Obsidian.exe`), vault = `docs/vault`
- sonner (client): `<Toaster>` di `client/src/main.jsx`, build lolos.

## Sesi baru: baca `docs/vault/00-index.md` + decisions, memory list 10, todowrite.

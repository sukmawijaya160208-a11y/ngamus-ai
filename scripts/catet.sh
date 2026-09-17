#!/usr/bin/env bash
# catet.sh — simpan cepat ke vault Obsidian (docs/vault/daily/).
# Dipakai agent TIAP AKHIR SESI biar "kalo ada apa-apa di projek, vault nyimpen".
#
# Pakai:
#   ./scripts/catet.sh "pesan log"              → masuk ## 📝 Log
#   ./scripts/catet.sh --selesai "task beres"   → masuk ## ✅ Selesai
#   ./scripts/catet.sh --ide "ide / bug"        → masuk ## 💡 Ide / Bug
set -euo pipefail

MODE="## 📝 Log"
if [ "${1:-}" = "--selesai" ]; then MODE="## ✅ Selesai"; shift; fi
if [ "${1:-}" = "--ide" ]; then MODE="## 💡 Ide / Bug"; shift; fi
MSG="${*:-}"
[ -z "$MSG" ] && { echo 'pakai: ./scripts/catet.sh [--selesai|--ide] "pesan"'; exit 1; }

VAULT="$(cd "$(dirname "$0")/../docs/vault" && pwd)"
TODAY="$(date +%F)"
NOW="$(date +%H:%M)"
DAILY="$VAULT/daily/$TODAY.md"
HARI=(Senin Selasa Rabu Kamis Jumat Sabtu Minggu)
DOW="${HARI[$(($(date +%u) - 1))]}"
YEST="$(date -d yesterday +%F)"
TOM="$(date -d tomorrow +%F)"

# Bikin daily note dari template kalau belum ada
if [ ! -f "$DAILY" ]; then
  sed -e "s/{{date:YYYY-MM-DD}}/$TODAY/g" \
      -e "s/{{date:dddd}}/$DOW/g" \
      -e "s/{{time}}/$NOW/g" \
      -e "s/{{date:YYYY-MM-DD:-1d}}/$YEST/g" \
      -e "s/{{date:YYYY-MM-DD:+1d}}/$TOM/g" \
      "$VAULT/templates/daily.md" > "$DAILY"
  echo "dibuat: daily/$TODAY.md"
fi

# Sisip di bawah header section (entri terbaru paling atas)
LINE="- $NOW — $MSG"
awk -v sec="$MODE" -v line="$LINE" '
  $0 == sec && !done { print; print line; done = 1; next }
  1
' "$DAILY" > "$DAILY.tmp" && mv "$DAILY.tmp" "$DAILY"
echo "kesimpen → daily/$TODAY.md [$MODE]"

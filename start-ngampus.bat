@echo off
title Ngampus AI Launcher
cd /d "%~dp0"

echo  ========================================
echo   NGAMPUS AI - Launcher
echo  ========================================
echo.

REM --- 1. Cek server/.env ---
if not exist "server\.env" (
  echo  [!] server\.env belum ada. Dibuat dari contoh...
  copy "server\.env.example" "server\.env" >nul
  echo  [!] Isi GEMINI_API_KEY di server\.env dulu!
  echo      Ambil gratis di https://aistudio.google.com/apikey
  echo.
  pause
  exit /b 1
)

REM --- 2. Install server deps kalau belum ada ---
if not exist "server\node_modules" (
  echo  [*] Install server dulu...
  call npm install --prefix "server" --no-audit --no-fund
)

REM --- 3. Install client deps kalau belum ada ---
if not exist "client\node_modules" (
  echo  [*] Install client dulu...
  where bun >nul 2>nul
  if %errorlevel%==0 (
    call bun install --cwd "client"
  ) else (
    call npm install --prefix "client" --no-audit --no-fund
  )
)

REM --- 4. Jalanin server (window 1) ---
echo  [*] Menyalakan server...
start "Ngampus AI - Server :3001" cmd /k "cd /d ""%~dp0server"" && node src/index.js"

REM --- 5. Jalanin client (window 2) ---
echo  [*] Menyalakan web client...
where bun >nul 2>nul
if %errorlevel%==0 (
  start "Ngampus AI - Web :5173" cmd /k "cd /d ""%~dp0client"" && bun run dev"
) else (
  start "Ngampus AI - Web :5173" cmd /k "cd /d ""%~dp0client"" && npm run dev"
)

echo.
echo  ========================================
echo   SELESAI. Buka di browser:
echo.
echo     Web    : http://localhost:5173
echo     Server : http://localhost:3001/api/health
echo.
echo   Tutup kedua window hitam untuk berhenti.
echo  ========================================
echo.
pause

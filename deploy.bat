@echo off
chcp 65001 >nul
cls
echo.
echo   ╔══════════════════════════════════════════════╗
echo   ║   Tax Advisor Pro — One-Click Deploy         ║
echo   ║   Push + Pull + Restart + Open Link          ║
echo   ╚══════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: ═══════════════════════════════════════════
:: STEP 1: Push local code to GitHub
:: ═══════════════════════════════════════════
echo   [1/4] Pushing to GitHub...
echo   ─────────────────────────────────────────

git add .
if %errorlevel% neq 0 (
    echo   [ERROR] git add failed!
    pause
    exit /b 1
)

git commit -m "deploy: update tax-advisor-pro %date% %time:~0,5%"
if %errorlevel% neq 0 (
    echo   [INFO] Nothing new to commit — deploying existing code...
)

git push origin main
if %errorlevel% neq 0 (
    echo   [ERROR] git push failed! Check your credentials.
    pause
    exit /b 1
)

echo.
echo   [OK] Code pushed to GitHub successfully!
echo.

:: ═══════════════════════════════════════════
:: STEP 2-4: SSH into VPS → Pull → Install → Restart
:: ═══════════════════════════════════════════
echo   [2/4] Connecting to VPS (191.101.81.204)...
echo   [3/4] Pulling latest code from GitHub...
echo   [4/4] Installing deps + restarting server...
echo   ─────────────────────────────────────────
echo.

ssh root@191.101.81.204 "cd /root/apps/tax-advisor-pro && echo '  [OK] Connected to VPS' && echo '' && echo '  Pulling from GitHub...' && git pull origin main && echo '' && echo '  Installing dependencies...' && npm install --production 2>&1 | tail -1 && echo '' && echo '  Restarting server...' && (pm2 restart tax-advisor-pro --update-env 2>/dev/null && echo '  [OK] PM2 restarted!' || (pm2 start server/index.js --name tax-advisor-pro 2>/dev/null && echo '  [OK] PM2 started!') || (systemctl restart tax-advisor-pro 2>/dev/null && echo '  [OK] Service restarted!') || echo '  [INFO] Pull done. Restart server manually if needed.') && echo '' && echo '  ════════════════════════════════════════' && echo '  DEPLOY COMPLETE!' && echo '  ════════════════════════════════════════'"

echo.
echo   ╔══════════════════════════════════════════════╗
echo   ║          DEPLOY COMPLETE!                    ║
echo   ╠══════════════════════════════════════════════╣
echo   ║                                              ║
echo   ║  LIVE SITE:                                  ║
echo   ║  https://minaandrawes4.srv978932.hstgr.cloud ║
echo   ║                                              ║
echo   ║  PAGES:                                      ║
echo   ║  /guide.html        Federal Tax Guide        ║
echo   ║  /guides.html       State Guide Hub          ║
echo   ║  /tax-planner.html  Tax Calculator           ║
echo   ║  /itin-guide.html   ITIN Guide               ║
echo   ║  /efile.html        E-File Center            ║
echo   ║  /auth.html         Login / Signup           ║
echo   ║                                              ║
echo   ╚══════════════════════════════════════════════╝
echo.

:: Open the live site in browser
start "" "https://minaandrawes4.srv978932.hstgr.cloud"

pause

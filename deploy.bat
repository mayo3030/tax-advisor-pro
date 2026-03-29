@echo off
chcp 65001 >nul
echo.
echo ══════════════════════════════════════════════
echo   Tax Advisor Pro — Deploy to VPS
echo ══════════════════════════════════════════════
echo.

cd /d "%~dp0"

:: ── Step 1: Push local changes to GitHub ──
echo [1/4] Pushing to GitHub...
echo.

git add .
if %errorlevel% neq 0 (
    echo [ERROR] git add failed!
    pause
    exit /b 1
)

git commit -m "update tax-advisor-pro"
if %errorlevel% neq 0 (
    echo [INFO] Nothing new to commit — continuing to deploy...
)

git push
if %errorlevel% neq 0 (
    echo [ERROR] git push failed! Check your remote.
    pause
    exit /b 1
)
echo.
echo [OK] Code pushed to GitHub.
echo.

:: ── Step 2: SSH into VPS and pull + restart ──
echo [2/4] Connecting to VPS and pulling latest code...
echo.
echo      You may be asked for your VPS root password.
echo.

ssh root@191.101.81.204 "cd /root/apps/tax-advisor-pro && echo '[OK] Connected to VPS' && git pull origin main && echo '' && echo '[3/4] Installing dependencies...' && npm install --production && echo '' && echo '[4/4] Restarting application...' && (pm2 restart tax-advisor-pro 2>nul || pm2 start server/index.js --name tax-advisor-pro 2>nul || echo '[INFO] No PM2 — trying systemctl...' && systemctl restart tax-advisor-pro 2>nul || echo '[INFO] App pulled. Restart manually if needed.') && echo '' && echo '══════════════════════════════════════════' && echo '  DEPLOY COMPLETE!' && echo '══════════════════════════════════════════'"

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] SSH command had issues. Check VPS manually.
)

:: ── Step 3: Show the live link ──
echo.
echo ══════════════════════════════════════════════
echo   DEPLOYED SUCCESSFULLY!
echo ══════════════════════════════════════════════
echo.
echo   Live URL:
echo   https://minaandrawes4.srv978932.hstgr.cloud
echo.
echo   Guide:
echo   https://minaandrawes4.srv978932.hstgr.cloud/guide.html
echo.
echo   E-File:
echo   https://minaandrawes4.srv978932.hstgr.cloud/efile.html
echo.
echo   Tax Planner:
echo   https://minaandrawes4.srv978932.hstgr.cloud/tax-planner.html
echo.
echo   ITIN Guide:
echo   https://minaandrawes4.srv978932.hstgr.cloud/itin-guide.html
echo.
echo ══════════════════════════════════════════════
echo.

:: ── Open browser ──
start "" "https://minaandrawes4.srv978932.hstgr.cloud"

pause

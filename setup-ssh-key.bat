@echo off
chcp 65001 >nul
echo.
echo ══════════════════════════════════════════════
echo   Setup SSH Key — No More Passwords!
echo ══════════════════════════════════════════════
echo.
echo   This will create an SSH key and copy it to
echo   your VPS so deploy.bat works without a password.
echo.
echo   You only need to run this ONCE.
echo.
pause

:: Check if key exists
if exist "%USERPROFILE%\.ssh\id_rsa.pub" (
    echo.
    echo [OK] SSH key already exists!
    echo.
) else (
    echo.
    echo [1/2] Creating SSH key...
    ssh-keygen -t rsa -b 4096 -f "%USERPROFILE%\.ssh\id_rsa" -N ""
    echo.
    echo [OK] SSH key created!
)

echo [2/2] Copying key to VPS (enter your VPS password one last time)...
echo.
type "%USERPROFILE%\.ssh\id_rsa.pub" | ssh root@191.101.81.204 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo '[OK] Key installed! No more passwords needed.'"

echo.
echo ══════════════════════════════════════════════
echo   DONE! Now deploy.bat will work without
echo   asking for a password every time.
echo ══════════════════════════════════════════════
echo.
pause

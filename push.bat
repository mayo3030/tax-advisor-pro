@echo off
echo.
echo ========================================
echo   Git Push — Tax Advisor Pro
echo ========================================
echo.

cd /d "%~dp0"

git add .
if %errorlevel% neq 0 (
    echo [ERROR] git add failed!
    pause
    exit /b 1
)
echo [OK] Files staged.

git commit -m "update tax-advisor-pro"
if %errorlevel% neq 0 (
    echo [WARNING] Nothing to commit or commit failed.
)

git push
if %errorlevel% neq 0 (
    echo [ERROR] git push failed! Check your remote settings.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Done! Changes pushed successfully.
echo ========================================
echo.
pause

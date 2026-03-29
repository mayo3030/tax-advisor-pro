@echo off
title Tax Advisor Pro
color 1F

:: Always run from the folder where this .bat file lives
cd /d "%~dp0"

echo.
echo   ================================================
echo        Tax Advisor Pro - مستشار الضرائب
echo   ================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 4F
    echo   [ERROR] Node.js is not installed!
    echo.
    echo   Download it from: https://nodejs.org
    echo   Install the LTS version, then run this again.
    echo.
    pause
    exit /b 1
)

:: Show Node version and check if it's new enough
for /f "tokens=*" %%i in ('node -v') do (
    echo   Node.js version: %%i
    set NODE_VER=%%i
)

:: Check if .env exists
if not exist ".env" (
    color 4F
    echo.
    echo   [ERROR] .env file is missing!
    echo.
    echo   Create a file called ".env" in this folder with:
    echo     ANTHROPIC_API_KEY=sk-ant-your-key-here
    echo     PORT=3000
    echo     CLAUDE_MODEL=claude-sonnet-4-20250514
    echo.
    pause
    exit /b 1
)
echo   .env file: Found

:: Check if port 3000 is already in use
netstat -an | findstr ":3000.*LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    color 6F
    echo.
    echo   [WARNING] Port 3000 is already in use!
    echo   Another program may be running on that port.
    echo   Close it first, or change PORT in .env
    echo.
    choice /c YN /m "   Try to start anyway? (Y/N)"
    if errorlevel 2 exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo.
    echo   Installing dependencies (first time only)...
    echo   This may take a minute...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 4F
        echo.
        echo   [ERROR] npm install failed!
        echo   Make sure you have internet connection.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo   Dependencies installed successfully!
    echo.
) else (
    echo   Dependencies: Already installed
)

:: Verify key files exist
if not exist "server\index.js" (
    color 4F
    echo   [ERROR] server\index.js is missing!
    pause
    exit /b 1
)
if not exist "public\index.html" (
    color 4F
    echo   [ERROR] public\index.html is missing!
    pause
    exit /b 1
)

echo.
echo   ------------------------------------------------
echo   Starting server on http://localhost:3000
echo   ------------------------------------------------
echo.
echo   IMPORTANT: Open this link in Chrome for voice features!
echo   Press Ctrl+C to stop the server.
echo.

:: Open browser after 2 second delay
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Run the server
node server/index.js
if %errorlevel% neq 0 (
    color 4F
    echo.
    echo   ================================================
    echo   [ERROR] Server crashed! Check the error above.
    echo   ================================================
    echo.
    echo   Common fixes:
    echo   1. Run "npm install" manually in this folder
    echo   2. Check .env has your API key
    echo   3. Make sure port 3000 is not already in use
    echo   4. If "fetch is not defined" - upgrade Node to v18+
    echo      Download from: https://nodejs.org
    echo.
)
pause

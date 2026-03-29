@echo off
title Tax Advisor Pro
color 1F

:: Always run from the folder where this .bat file lives
cd /d "%~dp0"

echo.
echo   ================================================
echo        Tax Advisor Pro
echo        ================================================
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

:: Show Node version
for /f "tokens=*" %%i in ('node -v') do echo   Node.js version: %%i

:: Check if .env exists
if not exist ".env" (
    color 4F
    echo.
    echo   [ERROR] .env file is missing!
    echo   Create a .env file with your ANTHROPIC_API_KEY
    echo.
    pause
    exit /b 1
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
)

:: Start server and open browser
echo   Starting server on http://localhost:3000
echo   Opening browser...
echo.
echo   Press Ctrl+C to stop the server.
echo   ================================================
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
    echo   - Run "npm install" manually in this folder
    echo   - Check .env has your API key
    echo   - Make sure port 3000 is not already in use
    echo.
)
pause

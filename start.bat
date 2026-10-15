@echo off
setlocal enabledelayedexpansion

title Point Blank Studio
cd /d "%~dp0"

:: If PointBlank.exe exists and no --console argument was given, launch the native executable
if "%~1"=="" (
    if exist "PointBlank.exe" (
        start "" "PointBlank.exe"
        exit /b 0
    )
)

echo =====================================================================
echo                     🎬 Point Blank Studio
echo =====================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH!
    echo.
    echo PointBlank requires Node.js (version 18 or newer).
    echo Please download and install it from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Verify dependencies (node_modules)
if not exist "node_modules\" (
    echo [*] First-time setup detected: Installing required dependencies...
    echo [*] Running npm install, please wait...
    echo.
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install npm dependencies.
        echo Please check your internet connection or run 'npm install' manually.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
    echo.
)

:: 3. Check for .env file
if not exist ".env" (
    echo [*] Notice: .env file was not found. Creating default configuration...
    (
        echo PORT=3000
        echo VIDEO_PROVIDER=fal
        echo FAL_API_KEY=
        echo OPENAI_API_KEY=
        echo GEMINI_API_KEY=
    ) > .env
    echo [OK] Created .env template. Please add your API keys if needed.
    echo.
)

:: 4. Start Point Blank Studio and open dedicated application window
echo [*] Launching Point Blank Studio...
echo [*] Local Address:  http://localhost:3000
echo [*] Single-click shutdown is available in the web interface.
echo.
echo =====================================================================
echo.

:: Launch standalone app window
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
) else (
    start http://localhost:3000
)

node server.js

if %errorlevel% neq 0 (
    echo.
    echo [!] Server terminated unexpectedly with exit code %errorlevel%.
    pause
)

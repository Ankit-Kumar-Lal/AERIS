@echo off
TITLE AERIS 2.0 - Sentinel Launch Control
COLOR 0A

echo ===============================================================================
echo                AERIS 2.0 -- AI-Powered Epidemic Risk Intelligence
echo                               Team Sentinel
echo       "A risk signal is a prompt to verify, not a confirmed outbreak."
echo ===============================================================================
echo.

cd /d "%~dp0"

:: 1. Terminate any stale processes holding ports 5173 and 8000
echo [1/5] Terminating any stale processes on ports 5173 and 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5173, 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>nul

:: 2. Check Python & Select Project Virtualenv if present
set "PYTHON_EXE=python"
if exist "%~dp0apps\api\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0apps\api\.venv\Scripts\python.exe"
    echo [2/5] Using project virtualenv Python: apps\api\.venv
) else (
    where python >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Python not found in PATH or .venv! Please install Python 3.10+.
        pause
        exit /b 1
    )
    echo [2/5] Using system Python.
)

:: 3. Check Node.js & npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm / Node.js not found in PATH! Please install Node.js 18+.
    pause
    exit /b 1
)

:: 4. Verify & Seed Sentinel Database
echo [3/5] Verifying Sentinel Database...
cd apps\api
if not exist aeris2.db (
    echo Database not found. Initializing schema and seeding 47 Northeast villages...
    "%PYTHON_EXE%" seed.py
) else (
    echo Database aeris2.db is initialized.
)
cd /d "%~dp0"

:: 5. Start Backend & Frontend
echo [4/5] Starting AERIS FastAPI Backend on http://localhost:8000...
start "AERIS 2.0 Backend [FastAPI:8000]" cmd /k "cd /d "%~dp0apps\api" && "%PYTHON_EXE%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [5/5] Starting AERIS React Frontend on http://localhost:5173...
start "AERIS 2.0 Frontend [Vite:5173]" cmd /k "cd /d "%~dp0apps\web" && npm run dev -- --host --port 5173 --strictPort"

:: 6. Launch Sentinel in Default Browser
echo Waiting for servers to initialize...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo ===============================================================================
echo   AERIS 2.0 is now running with the latest code!
echo   - Web Application: http://localhost:5173
echo   - API Documentation: http://localhost:8000/docs
echo   - Features Active:
echo       * Sentinel Network Map & Brahmaputra Basin Animation on Login
echo       * Northeast Health & Water News Feed on Dashboard
echo   - Demo Accounts:
echo       * Admin:      admin@sentinel.org    / Sentinel@123
echo       * ASHA:       asha@sentinel.org     / Sentinel@123
echo       * Official:   officer@sentinel.org  / Sentinel@123
echo       * Civilian:   civilian@sentinel.org / Sentinel@123
echo ===============================================================================
echo Press any key to exit this launcher window (servers will keep running in their own windows).
pause >nul

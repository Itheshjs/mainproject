@echo off
echo Starting Interview Prep Pro Development Environment...
echo ======================================================

cd /d "%~dp0"

echo.
echo 1. Starting Backend Server (Node.js)...
echo ----------------------------------------
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

echo.
echo 2. Starting Resume Analyzer (Next.js)...
echo ---------------------------------------
cd resume-analyzer-main
if not exist node_modules (
    echo Installing Resume Analyzer dependencies...
    npm install
)
start "Resume Analyzer" cmd /k "npm run dev"
cd ..

echo.
echo 3. Starting Mock Interview Bot (Python)...
echo -----------------------------------------
cd mock-interview-bot
if exist .venv\Scripts\Activate.ps1 (
    start "Mock Interview Bot" cmd /k "powershell -ExecutionPolicy Bypass -File .venv\Scripts\Activate.ps1 & cd mock-interview-bot & python app.py"
) else (
    echo Python virtual environment not found. Please set up the virtual environment first.
    echo Run: python -m venv .venv
    echo Then: .venv\Scripts\Activate.ps1
    echo Then: pip install -r requirements.txt
)
cd ..

echo.
echo All services are starting in separate command windows.
echo Please check each window for status and logs.
echo.
echo Backend Server: http://localhost:3000
echo Resume Analyzer: http://localhost:3001
echo Mock Interview Bot: http://localhost:5000
echo.
echo Press any key to exit this launcher (services will continue running)...
pause >nul
# Interview Prep Pro Development Environment Startup Script
Write-Host "Starting Interview Prep Pro Development Environment..." -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

Set-Location -Path $PSScriptRoot

Write-Host "`n1. Starting Backend Server (Node.js)..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Set-Location -Path "backend"
Start-Process cmd -ArgumentList "/k", "node server.js" -WindowTitle "Backend Server"
Set-Location -Path ".."

Write-Host "`n2. Starting Resume Analyzer (Next.js)..." -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow
Set-Location -Path "resume-analyzer-main"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Resume Analyzer dependencies..." -ForegroundColor Cyan
    npm install
}
Start-Process cmd -ArgumentList "/k", "npm run dev" -WindowTitle "Resume Analyzer"
Set-Location -Path ".."

Write-Host "`n3. Starting Mock Interview Bot (Python)..." -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Yellow
Set-Location -Path "mock-interview-bot"
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Start-Process cmd -ArgumentList "/k", "powershell -ExecutionPolicy Bypass -File .venv\Scripts\Activate.ps1 & cd mock-interview-bot & python app.py" -WindowTitle "Mock Interview Bot"
} else {
    Write-Host "Python virtual environment not found. Please set up the virtual environment first." -ForegroundColor Red
    Write-Host "Run: python -m venv .venv" -ForegroundColor Red
    Write-Host "Then: .venv\Scripts\Activate.ps1" -ForegroundColor Red
    Write-Host "Then: pip install -r requirements.txt" -ForegroundColor Red
}
Set-Location -Path ".."

Write-Host "`nAll services are starting in separate command windows." -ForegroundColor Green
Write-Host "Please check each window for status and logs." -ForegroundColor Green
Write-Host "`nBackend Server: http://localhost:3000" -ForegroundColor Blue
Write-Host "Resume Analyzer: http://localhost:3001" -ForegroundColor Blue
Write-Host "Mock Interview Bot: http://localhost:5000" -ForegroundColor Blue
Write-Host "`nPress any key to exit this launcher (services will continue running)..." -ForegroundColor Green
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
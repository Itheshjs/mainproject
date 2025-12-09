# Interview Prep Pro - Development Environment Startup Guide

This guide explains how to use the automated startup scripts to launch all services for the Interview Prep Pro application.

## Available Startup Scripts

### 1. Batch File (Windows Command Prompt)
- **File**: `start-all.bat`
- **Usage**: Double-click the file or run from Command Prompt
- **Best for**: Users comfortable with traditional Windows batch files

### 2. PowerShell Script
- **File**: `start-all.ps1`
- **Usage**: Right-click and "Run with PowerShell" or execute from PowerShell terminal
- **Best for**: Users who prefer PowerShell or need more detailed output

## What the Scripts Do

The startup scripts automatically launch all required services in separate command windows:

1. **Backend Server** (Node.js)
   - Directory: `backend/`
   - Command: `node server.js`
   - Port: `http://localhost:3000`

2. **Resume Analyzer** (Next.js)
   - Directory: `resume-analyzer-main/`
   - Command: `npm run dev`
   - Port: `http://localhost:3001`
   - Note: Automatically runs `npm install` if node_modules is missing

3. **Mock Interview Bot** (Python)
   - Directory: `mock-interview-bot/`
   - Command: Activates virtual environment and runs `python app.py`
   - Port: `http://localhost:5000`
   - Note: Requires existing Python virtual environment

## Prerequisites

Before running the startup scripts, ensure you have:

1. **Node.js** installed (for backend and resume analyzer)
2. **Python** installed (for mock interview bot)
3. **Python virtual environment** set up in `mock-interview-bot/` directory:
   ```bash
   cd mock-interview-bot
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

## How to Use

### Method 1: Double-click (Easiest)
1. Navigate to the project root directory
2. Double-click on `start-all.bat`
3. Wait for all services to start (check individual command windows for status)

### Method 2: Command Prompt
```bash
cd c:\xampp-new\htdocs\geminitest
start-all.bat
```

### Method 3: PowerShell
```bash
cd c:\xampp-new\htdocs\geminitest
.\start-all.ps1
```

## Troubleshooting

### If you see "Python virtual environment not found":
1. Open PowerShell or Command Prompt
2. Navigate to the mock-interview-bot directory:
   ```bash
   cd mock-interview-bot
   ```
3. Create the virtual environment:
   ```bash
   python -m venv .venv
   ```
4. Activate the virtual environment:
   ```bash
   .venv\Scripts\Activate.ps1
   ```
5. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

### If services don't start:
1. Check that all required software (Node.js, Python) is installed
2. Verify ports 3000, 3001, and 5000 are not in use
3. Check individual command windows for error messages

## Stopping Services

To stop all services:
1. Close each individual command window
2. Or press `Ctrl + C` in each window to terminate the processes

## Additional Notes

- The scripts will continue running in the background even after closing the launcher window
- Each service runs in its own command window for easy monitoring
- Dependencies are automatically installed for the Resume Analyzer if missing
- The scripts preserve existing functionality while automating the startup process
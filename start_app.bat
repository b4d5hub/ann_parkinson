@echo off
color 0B
echo ==========================================================
echo   Parkinson's Simulation - Full Stack Launch Script
echo ==========================================================
echo.
echo This script will open terminal windows for the 
echo separate components of your project. Keep them open!
echo.

echo [1/2] Starting Backend API Server (Flask)...
start "Python API Server (Port 5000)" cmd /k "python server.py"

echo [2/2] Starting Frontend Simulation App (React/Vite)...
start "Frontend Simulation App" cmd /k "cd simulation_app && npm run dev"

echo.
echo ==========================================================
echo Everything is launching! 
echo.
echo - Simulation App: Go to http://localhost:5173
echo - Python Backend is running on port 5000 internally.
echo ==========================================================
echo.
pause

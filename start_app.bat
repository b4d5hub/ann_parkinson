@echo off
color 0B
echo ==========================================================
echo   Parkinson's Simulation - Full Stack Launch Script
echo ==========================================================
echo.
echo This script will open three new terminal windows for the 
echo separate components of your project. Keep them open!
echo.

echo [1/3] Starting Backend API Server (Flask)...
start "Python API Server (Port 5000)" cmd /k "python server.py"

echo [2/3] Starting Frontend Simulation App (React/Vite)...
cd simulation_app
start "Frontend Simulation App" cmd /k "npm run dev"

echo [3/3] Opening Jupyter Notebook (Backend)...
cd ..
start "Jupyter Notebook Tracker" cmd /k "python -m jupyter notebook notebooks/ann_parkinsons.ipynb"

echo.
echo ==========================================================
echo Everything is launching! 
echo.
echo - Simulation App: Go to http://localhost:5173
echo - Python Backend is running on port 5000 internally.
echo - Your Jupyter notebook will open in a browser tab.
echo ==========================================================
echo.
pause

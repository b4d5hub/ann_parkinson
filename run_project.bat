@echo off
color 0A
echo ==========================================================
echo   Parkinson's Disease ANN Project - Setup ^& Launch
echo ==========================================================
echo.
echo [1/2] Installing required Python libraries...
pip install tensorflow pandas numpy matplotlib seaborn scikit-learn jupyter

echo.
echo [2/3] Launching the Backend API Server...
start "ANN Backend Server" python server.py

echo.
echo [3/3] Launching the Jupyter Notebook...
echo The notebook will open in your default browser shortly.
echo (Keep this terminal window open while using Jupyter)
echo.

jupyter notebook notebooks/ann_parkinsons.ipynb

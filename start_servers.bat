@echo off
echo ===================================================
echo   Starting 3% Candidate Portal Servers
echo ===================================================

echo.
echo 1. Starting Backend Server (Port 5000)...
start "Backend API" cmd /k "cd backend\backend && npm run dev"

echo.
echo 2. Starting Frontend Server (Port 5173/5174)...
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Servers launched in new windows!
echo   Please check the new windows for status.
echo ===================================================
pause

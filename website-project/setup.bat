@echo off
echo.
echo ╔════════════════════════════════════════╗
echo ║  Website Project Setup Script          ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo [2/4] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo [3/4] Creating .env files...
if not exist backend\.env (
  copy backend\.env.example backend\.env
)
if not exist frontend\.env (
  copy frontend\.env.example frontend\.env
)

echo [4/4] Starting Docker containers...
docker-compose up -d

echo.
echo ╔════════════════════════════════════════╗
echo ║  Setup Complete!                       ║
echo ╚════════════════════════════════════════╝
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Database: localhost:5432
echo PgAdmin:  http://localhost:5050
echo.
echo To stop containers: docker-compose down
echo.
pause

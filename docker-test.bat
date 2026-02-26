@echo off
REM Docker Setup Test Script for Windows
REM Usage: docker-test.bat

echo.
echo 🐳 Docker Environment Test
echo ==========================
echo.

REM Check Docker installation
echo 1️⃣  Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker not found. Please install Docker Desktop.
    pause
    exit /b 1
)
echo ✓ Docker is installed

REM Check Docker Compose
echo.
echo 2️⃣  Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker Compose not found.
    pause
    exit /b 1
)
echo ✓ Docker Compose is installed

REM Check Docker daemon
echo.
echo 3️⃣  Checking Docker daemon...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker daemon is not running
    echo   Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo ✓ Docker daemon is running

REM Check Docker files
echo.
echo 4️⃣  Checking Docker configuration files...
for %%F in (Dockerfile Dockerfile.frontend docker-compose.yml .dockerignore) do (
    if exist %%F (
        echo ✓ %%F found
    ) else (
        echo ✗ %%F missing
        exit /b 1
    )
)

REM Build images
echo.
echo 5️⃣  Building Docker images...
echo This may take a few minutes...
docker-compose build
if %errorlevel% neq 0 (
    echo ✗ Build failed
    pause
    exit /b 1
)
echo ✓ Images built successfully

REM Start containers
echo.
echo 6️⃣  Starting containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ✗ Failed to start containers
    pause
    exit /b 1
)
echo ✓ Containers started

REM Wait for services
echo.
echo 7️⃣  Waiting for services to start...
timeout /t 5

REM Show container status
echo.
echo 🔟 Container Status:
docker-compose ps

echo.
echo ✅ Docker setup test complete!
echo.
echo 📍 Access Points:
echo    Frontend: http://localhost:5173
echo    Admin Panel: http://localhost:5173/admin-panel
echo    Backend API: http://localhost:5000/api/tours
echo.
echo 🛑 To stop containers: docker-compose down
echo.
pause

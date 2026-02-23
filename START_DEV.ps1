# Trail Colombo Development Server Startup Script

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Trail Colombo - Development Server Startup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
$backendRunning = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node' }

if ($backendRunning) {
    Write-Host "✓ Backend Server is RUNNING on http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "✗ Backend Server is NOT running" -ForegroundColor Red
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    Push-Location "c:\Users\Aruthsha Kasandun\Desktop\Website\backend"
    npm start
    Pop-Location
}

Write-Host ""
Write-Host "Starting Frontend Development Server..." -ForegroundColor Yellow
Write-Host "This will open at http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# Start frontend
cd "c:\Users\Aruthsha Kasandun\Desktop\Website\frontend"
npm run dev

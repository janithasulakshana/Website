# Docker Compose Startup Script for Lets Go Colombo Tours
# Runs the entire monitoring stack with Docker Desktop

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Lets Go Colombo Tours - Docker Stack Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    $null = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ ERROR: Docker command not found!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if docker-compose is available
$useCompose = $true
try {
    $null = docker-compose --version 2>$null
} catch {
    Write-Host "⚠️  docker-compose not found. Using 'docker compose' instead..." -ForegroundColor Yellow
    $useCompose = $false
}

$COMPOSE_CMD = if ($useCompose) { "docker-compose" } else { "docker compose" }

Write-Host "[1/4] Building Docker images..." -ForegroundColor Yellow
& $COMPOSE_CMD build --no-cache
Write-Host "✓ Images built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Starting services..." -ForegroundColor Yellow
& $COMPOSE_CMD up -d
Write-Host "✓ Services started" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "[4/4] Checking service health..." -ForegroundColor Yellow
Write-Host ""
& $COMPOSE_CMD ps
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Stack is running!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Access your services:" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "🔌 Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "📊 Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "📈 Grafana:    http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Grafana Credentials:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor Yellow
Write-Host "  Password: admin123" -ForegroundColor Yellow
Write-Host ""

Write-Host "Backend Metrics:" -ForegroundColor Cyan
Write-Host "  Metrics:  http://localhost:5000/metrics" -ForegroundColor Gray
Write-Host "  Health:   http://localhost:5000/health" -ForegroundColor Gray
Write-Host ""

Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs:        $COMPOSE_CMD logs -f" -ForegroundColor Gray
Write-Host "  Stop services:    $COMPOSE_CMD down" -ForegroundColor Gray
Write-Host "  Remove all data:  $COMPOSE_CMD down -v" -ForegroundColor Gray
Write-Host ""
Write-Host "For more info, see: DOCKER_MONITORING_GUIDE.md" -ForegroundColor Gray
Write-Host ""

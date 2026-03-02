#!/bin/bash
# Docker Compose Startup Script for Lets Go Colombo Tours
# Runs the entire monitoring stack with Docker Desktop

set -e

echo "================================================"
echo "Lets Go Colombo Tours - Docker Stack Setup"
echo "================================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose not found. Using 'docker compose' instead..."
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "[1/4] Building Docker images..."
$COMPOSE_CMD build --no-cache
echo "✓ Images built successfully"
echo ""

echo "[2/4] Starting services..."
$COMPOSE_CMD up -d
echo "✓ Services started"
echo ""

echo "[3/4] Waiting for services to be ready..."
sleep 10

echo "[4/4] Checking service health..."
echo ""
$COMPOSE_CMD ps
echo ""

echo "================================================"
echo "✅ Stack is running!"
echo "================================================"
echo ""
echo "Access your services:"
echo ""
echo "🌐 Frontend:   http://localhost:5173"
echo "🔌 Backend:    http://localhost:5000"
echo "📊 Prometheus: http://localhost:9090"
echo "📈 Grafana:    http://localhost:3000"
echo ""
echo "Grafana Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Backend Metrics:"
echo "  Metrics:  http://localhost:5000/metrics"
echo "  Health:   http://localhost:5000/health"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Remove all data:  docker-compose down -v"
echo ""
echo "For more info, see: DOCKER_MONITORING_GUIDE.md"
echo ""

#!/bin/bash
# Docker Setup Test Script
# Usage: chmod +x docker-test.sh && ./docker-test.sh

set -e

echo "🐳 Docker Environment Test"
echo "=========================="
echo ""

# Check Docker installation
echo "1️⃣  Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✓ Docker: $DOCKER_VERSION"
else
    echo "✗ Docker not found. Please install Docker Desktop."
    exit 1
fi

# Check Docker Compose
echo ""
echo "2️⃣  Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✓ Docker Compose: $COMPOSE_VERSION"
else
    echo "✗ Docker Compose not found."
    exit 1
fi

# Check Docker daemon
echo ""
echo "3️⃣  Checking Docker daemon..."
if docker ps &> /dev/null; then
    echo "✓ Docker daemon is running"
else
    echo "✗ Docker daemon is not running"
    echo "  Please start Docker Desktop and try again"
    exit 1
fi

# Check Docker files
echo ""
echo "4️⃣  Checking Docker configuration files..."
files=("Dockerfile" "Dockerfile.frontend" "docker-compose.yml" ".dockerignore")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file found"
    else
        echo "✗ $file missing"
        exit 1
    fi
done

# Build images
echo ""
echo "5️⃣  Building Docker images..."
echo "This may take a few minutes..."
docker-compose build
echo "✓ Images built successfully"

# Test containers
echo ""
echo "6️⃣  Starting containers..."
docker-compose up -d
echo "✓ Containers started"

# Wait for services to be ready
echo ""
echo "7️⃣  Waiting for services to start..."
sleep 5

# Test backend health
echo ""
echo "8️⃣  Testing backend API..."
if curl -s http://localhost:5000/api/test > /dev/null; then
    echo "✓ Backend API is responding"
else
    echo "✗ Backend API is not responding"
fi

# Test frontend
echo ""
echo "9️⃣  Testing frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✓ Frontend is responding"
else
    echo "✗ Frontend is not responding yet (this is normal on first start)"
fi

# Show container status
echo ""
echo "🔟 Container Status:"
docker-compose ps

# Seed database
echo ""
echo "1️⃣1️⃣  Seeding database..."
docker-compose exec -T backend node seed.js

# Test booking creation
echo ""
echo "1️⃣2️⃣  Testing booking API..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "tour_id": 1,
    "name": "Docker Test",
    "email": "docker@test.com",
    "phone": "9876543210",
    "date": "2026-04-01"
  }')

if echo "$RESPONSE" | grep -q "success"; then
    echo "✓ Booking API working: $RESPONSE"
else
    echo "✗ Booking API error: $RESPONSE"
fi

echo ""
echo "✅ Docker setup test complete!"
echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:5173"
echo "   Admin Panel: http://localhost:5173/admin-panel"
echo "   Backend API: http://localhost:5000/api/tours"
echo ""
echo "🛑 To stop containers: docker-compose down"

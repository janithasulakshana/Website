# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### 1. Build and Start Services

```bash
# Build images (first time only)
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2. Access Applications

- **Frontend:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin-panel
- **Backend API:** http://localhost:5000/api/tours

### 3. Database Management

```bash
# Run seed script in backend container
docker-compose exec backend node seed.js

# Access SQLite database
docker-compose exec backend sqlite3 /data/bookings.db
```

### 4. Stop Services

```bash
# Stop and remove containers
docker-compose down

# Stop but keep containers
docker-compose stop

# Restart services
docker-compose restart
```

## Environment Configuration

### Development
```bash
# Copy example file
cp .env.docker.example .env.docker

# Edit with your values
nano .env.docker
```

### Production Deployment

1. **Update environment variables:**
   ```env
   JWT_SECRET=generate-strong-32-char-secret
   NODE_ENV=production
   CORS_ORIGIN=https://your-domain.com
   ```

2. **Use named volumes for database:**
   ```yaml
   volumes:
     - database_volume:/data
   ```

3. **Add Nginx reverse proxy** (optional, see nginx-example.conf)

4. **Deploy to cloud platforms:**
   - **AWS ECS:** Use AWS ECR + ECS service
   - **Google Cloud Run:** Push images to Google Container Registry
   - **DigitalOcean:** Use App Platform or manually with droplets
   - **Heroku:** Use Docker buildpack

## Useful Commands

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec backend npm run seed
docker-compose exec frontend npm run build

# View container resource usage
docker stats

# Remove all containers and volumes
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Run in detached mode with auto-restart
docker-compose up -d --restart=always
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up

# Then re-seed
docker-compose exec backend node seed.js
```

## Docker Compose File Structure

- **services:** Backend and Frontend applications
- **volumes:** Persistent storage for SQLite database
- **networks:** Internal communication between services
- **healthcheck:** Automatic service health monitoring
- **depends_on:** Service startup ordering
- **restart:** Automatic restart policies

## Security Notes

⚠️ **For Production:**
1. Change `JWT_SECRET` to a strong, random value
2. Set `NODE_ENV=production`
3. Use HTTPS (add reverse proxy like Nginx)
4. Don't store `.env` file in git repository
5. Use secrets management tools (AWS Secrets Manager, Vault, etc.)
6. Set resource limits:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## Example: Full Production Setup

See `docker-compose.prod.yml` for production-grade configuration with:
- Nginx reverse proxy
- Resource limits
- Logging configuration
- Health checks
- Auto-restart policies

# Docker Compose Setup for Lets Go Colombo Tours with Monitoring

This Docker Compose configuration runs the complete application stack with monitoring:

## Services

### Backend API
- **Image**: Custom Node.js image from `Dockerfile`
- **Port**: 5000
- **Database**: SQLite with persistent volume

### Frontend Application
- **Image**: Custom React/Vite image from `Dockerfile.frontend`
- **Port**: 5173
- **Hot Reload**: Enabled for development

### Prometheus
- **Image**: `prom/prometheus:v2.47.0`
- **Port**: 9090
- **Purpose**: Metrics collection from backend
- **Config**: `monitoring/prometheus-docker-config.yaml`

### Grafana
- **Image**: `grafana/grafana:10.2.0`
- **Port**: 3000
- **Credentials**: admin/admin123
- **Dashboard**: Auto-provisioned "Lets Go Colombo Tours - Application Monitoring"

## Quick Start

### Option 1: Using Docker Desktop GUI
1. Open Docker Desktop
2. Go to Containers
3. Click "Run"
4. Paste this command:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Option 2: Using Command Line

```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f grafana
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## Accessing Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:5000 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana Dashboard | http://localhost:3000 | admin / admin123 |
| Backend Metrics | http://localhost:5000/metrics | - |
| Backend Health | http://localhost:5000/health | - |

## Environment Variables

Create a `.env` file in the root directory to customize:

```env
# Backend
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:5173
DATABASE_PATH=/data/bookings.db

# Frontend
VITE_API_BASE_URL=http://localhost:5000

# Grafana
GF_SECURITY_ADMIN_PASSWORD=your-custom-password
```

## Volumes

```yaml
volumes:
  db_data:           # SQLite database persistence
  prometheus_data:   # Prometheus metrics history (15 days retention)
  grafana_data:      # Grafana dashboards and configurations
```

## Network

All services communicate over the `app-network` bridge network. Service names are:
- `backend` (for internal communication)
- `frontend`
- `prometheus`
- `grafana`

## Health Checks

Each service has a health check configured:
- **Backend**: Pings `/api/test` endpoint
- **Prometheus**: Checks `/-/healthy` endpoint
- **Grafana**: Checks `/api/health` endpoint

View health status:
```bash
docker-compose ps
```

## Troubleshooting

### Grafana shows "No Data"
1. Check Prometheus is running: `docker-compose ps`
2. Check Prometheus targets: http://localhost:9090/targets
3. Check backend metrics: `curl http://localhost:5000/metrics`
4. Restart Grafana: `docker-compose restart grafana`

### Backend can't connect to database
```bash
# Check volume permissions
docker-compose exec backend ls -la /data/

# Recreate volumes (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
```

### Port already in use
Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### View real-time logs
```bash
# All services
docker-compose logs -f --tail 50

# Specific service
docker-compose logs -f backend
docker-compose logs -f grafana
```

## Performance Tips

1. **Limit Prometheus retention**:
   ```bash
   docker-compose.yml: '--storage.tsdb.retention.time=7d'
   ```

2. **Increase Grafana dashboard refresh**:
   - Edit monitoring/grafana-dashboards.yaml
   - Change `"refresh": "5s"` to `"refresh": "30s"`

3. **Monitor resource usage**:
   ```bash
   docker stats
   ```

## Production Considerations

⚠️ **Before deploying to production:**

1. Change Grafana admin password
2. Configure HTTPS/TLS
3. Use external database instead of SQLite
4. Set up proper backup strategy
5. Configure persistent storage
6. Use secrets management for credentials
7. Set resource limits in docker-compose

Example production config:
```yaml
resources:
  limits:
    cpus: '1'
    memory: 512M
  reservations:
    cpus: '0.5'
    memory: 256M
```

## Updating Services

```bash
# Pull latest images
docker-compose pull

# Rebuild custom images
docker-compose build --no-cache

# Update and restart
docker-compose up -d --force-recreate
```

## Backup & Restore

```bash
# Backup Grafana data
docker run --rm -v lets-go-colombo-tours_grafana_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/grafana-backup.tar.gz -C /data .

# Backup Prometheus data
docker run --rm -v lets-go-colombo-tours_prometheus_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/prometheus-backup.tar.gz -C /data .

# Backup database
cp backend/bookings.db backups/bookings.db.backup
```

---

**Lets Go Colombo Tours by J** - Docker Compose Monitoring Stack v1.0.0

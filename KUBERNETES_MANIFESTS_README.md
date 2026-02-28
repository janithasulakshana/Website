# Kubernetes Manifests Summary

## Files Created

### 1. Configuration & Secrets
- **configmap.yaml** - Environment variables and config values
  * cors-origin: CORS configuration for the API
  * environment: Set to "production"
  
- **secret.yaml** - Sensitive data stored securely
  * jwt-secret: JWT signing key (MUST BE UPDATED FOR PRODUCTION)

### 2. Storage
- **storage.yaml** - Persistent Volume and PersistentVolumeClaim
  * 5Gi capacity for SQLite database
  * Local hostPath storage (suitable for single-node/development)
  * For production, use cloud storage (EBS, GCP Persistent Disk, etc.)

### 3. Services (Internal Networking)
- **backend-service.yaml** - ClusterIP service for backend
  * Port 5000 (internal)
  * Routes to backend pods
  
- **frontend-service.yaml** - ClusterIP service for frontend
  * Port 5173 (internal)
  * Routes to frontend pods

### 4. Deployments (Application Pods)
- **backend-deployment.yaml** - Backend API service
  * 2 replicas (can be scaled)
  * CPU: 250m requested, 500m limit
  * Memory: 256Mi requested, 512Mi limit
  * Mounts persistent volume for database
  * Includes liveness and readiness probes
  * Pod anti-affinity to spread replicas across nodes
  
- **frontend-deployment.yaml** - Frontend web application
  * 2 replicas (can be scaled)
  * Same resource limits as backend
  * Connects to backend via service DNS (backend:5000)
  * Includes health probes

### 5. Ingress (External Access)
- **ingress.yaml** - HTTP routing rules
  * Routes "/" to frontend
  * Routes "/api" to backend
  * Requires nginx-ingress controller
  * MUST UPDATE "example.com" to your actual domain

### 6. Combined Manifests
- **combined-manifests.yaml** - All resources in one file
  * Deploy all at once: kubectl apply -f combined-manifests.yaml
  * Useful for templating or GitOps workflows

### 7. Deployment Scripts
- **deploy.sh** - Bash deployment script (Linux/Mac)
- **deploy.ps1** - PowerShell deployment script (Windows)
  * Interactive deployment with checks
  * Guides through each step
  * Verifies prerequisites and deployment

### 8. Documentation
- **KUBERNETES_DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **README.md** (this file) - Manifest overview

## Architecture

```
                    Internet
                        |
                    Ingress (nginx)
                    /         \
                   /           \
            Frontend SVC     Backend SVC
            (port 5173)      (port 5000)
              /    \            /    \
        Frontend   Frontend  Backend  Backend
        Pod 1      Pod 2     Pod 1    Pod 2
        |                              |
        +------> Shared Database <-----+
                (PersistentVolume)
```

## Environment Variables

### Backend
- NODE_ENV: "production"
- PORT: "5000"
- HOST: "0.0.0.0"
- DATABASE_PATH: "/data/bookings.db"
- JWT_SECRET: (from secret)
- CORS_ORIGIN: (from configmap)

### Frontend
- VITE_API_BASE_URL: "http://backend:5000"
  * This is the internal Kubernetes DNS name for the backend service
  * Kubernetes automatically resolves "backend" to the service IP

## Key Features

### High Availability
- 2 replicas per deployment ensure uptime during pod failures
- Liveness probes restart unhealthy pods
- Readiness probes prevent traffic to unready pods
- Rolling updates ensure zero downtime during deployments

### Resource Management
- CPU/memory requests reserve minimum resources for pod scheduling
- CPU/memory limits prevent pods from consuming excessive resources
- Prevents resource starvation for other workloads

### Pod Distribution
- Pod anti-affinity spreads replicas across different nodes
- If one node fails, pods on other nodes continue running
- Better fault tolerance and resource utilization

### Health Monitoring
- Liveness probe (httpGet /api/test on backend, / on frontend)
  * Restarts pods that are hung or unresponsive
  * 40s initial delay for backend (app startup time)
  * 30s initial delay for frontend
  
- Readiness probe (same endpoints)
  * Removes pods from service load balancing if unhealthy
  * Faster detection than liveness probe
  * Prevents traffic to degraded pods

### Data Persistence
- SQLite database stored in PersistentVolume
- Data survives pod restarts
- Can be backed up independently

## What You Need to Do

### Before Deployment
1. ✓ Build Docker images (already done)
2. ✓ Push images to registry (Docker Hub, ECR, GCR, etc.)
3. ✓ Update image references in deployments
4. ✓ Update JWT_SECRET in secret.yaml
5. ✓ Update CORS_ORIGIN in configmap.yaml
6. ✓ Update ingress domain in ingress.yaml
7. ✓ Choose storage backend (if not using hostPath)

### During Deployment
1. Apply manifests in order (or use combined-manifests.yaml)
2. Monitor pod status: kubectl get pods
3. Check logs: kubectl logs <pod-name>
4. Verify service connectivity: kubectl get endpoints

### After Deployment
1. Port forward for local testing: kubectl port-forward svc/frontend 5173:5173
2. Configure DNS for ingress domain
3. Set up monitoring/logging (optional)
4. Create database backups regularly
5. Monitor resource usage and scale as needed

## Production Checklist

- [ ] Update JWT_SECRET to a strong, unique value
- [ ] Update CORS_ORIGIN to your domain
- [ ] Update ingress domain to your domain
- [ ] Change imagePullPolicy to "IfNotPresent" for stable deployments
- [ ] Use cloud storage instead of hostPath for PersistentVolume
- [ ] Set up TLS/SSL certificates for ingress
- [ ] Configure resource quotas for the namespace
- [ ] Enable pod security policies
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy for database PV
- [ ] Test disaster recovery procedures
- [ ] Document scaling procedures
- [ ] Set up log aggregation (ELK, Splunk, etc.)

## Scaling Guidance

### Horizontal Scaling (more replicas)
```
kubectl scale deployment backend --replicas=5
kubectl scale deployment frontend --replicas=5
```

### Vertical Scaling (more resources per pod)
Edit deployments and increase:
- resources.requests.cpu/memory
- resources.limits.cpu/memory

### Database Scaling
SQLite is suitable for single-node deployments. For production multi-node:
- Consider PostgreSQL instead of SQLite
- Use managed services (RDS, Cloud SQL, etc.)
- Set up replication/failover

## Troubleshooting Commands

```
# Check overall status
kubectl get all

# Pod details
kubectl describe pod <pod-name>

# Pod logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous  # Previous crashed container

# Service endpoints
kubectl get endpoints backend frontend

# Port forward for testing
kubectl port-forward svc/backend 5000:5000
kubectl port-forward svc/frontend 5173:5173

# Watch pod status in real-time
kubectl get pods -w

# Get resource usage
kubectl top pods
kubectl top nodes

# Check persistent volumes
kubectl get pvc
kubectl describe pvc database-pvc

# Rollout status
kubectl rollout status deployment/backend
kubectl rollout undo deployment/backend  # Rollback to previous version
```

## Next Steps

1. Read **KUBERNETES_DEPLOYMENT_GUIDE.md** for detailed instructions
2. Update manifests with your specific values
3. Push Docker images to registry
4. Run deploy.sh or deploy.ps1, or manually apply manifests
5. Monitor deployment: kubectl get pods -w
6. Test connectivity: kubectl port-forward
7. Set up ingress and DNS for production access

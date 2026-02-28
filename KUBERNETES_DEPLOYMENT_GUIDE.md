# Kubernetes Deployment Guide

## Overview
This guide covers deploying the LetsGo booking application on Kubernetes using the generated YAML manifests.

## Files Generated
- backend-deployment.yaml: Backend API deployment (2 replicas)
- backend-service.yaml: Backend ClusterIP service
- frontend-deployment.yaml: Frontend deployment (2 replicas)
- frontend-service.yaml: Frontend ClusterIP service
- configmap.yaml: Application configuration
- secret.yaml: Sensitive data (JWT secret)
- storage.yaml: Persistent volume and claim for database
- ingress.yaml: Ingress routing rules

## Prerequisites
1. Kubernetes cluster (v1.19+) with kubectl configured
2. Ingress controller installed (nginx-ingress recommended)
3. Docker images built and pushed to a registry:
   - your-registry/backend:latest
   - your-registry/frontend:latest

## Step 1: Push Docker Images to Registry

Build and push your images:
```
docker build -f Dockerfile -t your-registry/backend:latest .
docker push your-registry/backend:latest

docker build -f Dockerfile.frontend -t your-registry/frontend:latest .
docker push your-registry/frontend:latest
```

Replace 'your-registry' with your Docker registry (Docker Hub, ECR, GCR, etc.)

## Step 2: Update Image References

Edit backend-deployment.yaml and frontend-deployment.yaml:
Change:
  image: backend:latest
  image: frontend:latest

To:
  image: your-registry/backend:latest
  image: your-registry/frontend:latest

## Step 3: Configure Secrets

Edit secret.yaml and update the JWT secret:
```
stringData:
  jwt-secret: "your-actual-jwt-secret-here"
```

Apply the secret (do this first, before deployments):
```
kubectl apply -f secret.yaml
```

## Step 4: Configure Environment Variables

Edit configmap.yaml to match your production environment:
```
data:
  cors-origin: "https://yourdomain.com"
  environment: "production"
```

## Step 5: Deploy to Kubernetes

Deploy all manifests in order:
```
# 1. Storage setup
kubectl apply -f storage.yaml

# 2. Configuration and secrets
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# 3. Services
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-service.yaml

# 4. Deployments
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# 5. Ingress (if using external access)
kubectl apply -f ingress.yaml
```

Alternatively, deploy all at once:
```
kubectl apply -f .
```

## Step 6: Verify Deployment

Check pod status:
```
kubectl get pods -l app=backend
kubectl get pods -l app=frontend
```

Expected output (2 running pods per deployment):
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxx-xxxxx      1/1     Running   0          2m
backend-xxxxxxxx-xxxxx      1/1     Running   0          2m
frontend-xxxxxxxx-xxxxx     1/1     Running   0          2m
frontend-xxxxxxxx-xxxxx     1/1     Running   0          2m
```

Check service endpoints:
```
kubectl get svc
kubectl get endpoints backend frontend
```

View deployment details:
```
kubectl describe deployment backend
kubectl describe deployment frontend
```

## Step 7: Access the Application

### Using Port Forward (Development)
```
# Frontend
kubectl port-forward svc/frontend 5173:5173

# Backend
kubectl port-forward svc/backend 5000:5000
```

Then access:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Using Ingress (Production)
1. Update ingress.yaml with your domain name
2. Configure DNS to point to your Ingress controller IP
3. Deploy the ingress: kubectl apply -f ingress.yaml
4. Access via https://yourdomain.com

To find Ingress IP:
```
kubectl get ingress app-ingress
```

## Troubleshooting

### Pods not starting
```
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```

### Service connectivity issues
```
kubectl get svc
kubectl describe svc backend
```

### Database volume issues
```
kubectl get pvc
kubectl describe pvc database-pvc
```

### Clear and redeploy
```
kubectl delete -f .
kubectl apply -f .
```

## Key Features

- **2 Replicas**: Both frontend and frontend run with 2 replicas for high availability
- **Resource Limits**: CPU 500m/Memory 512Mi per pod
- **Health Checks**: Liveness and readiness probes prevent bad pods from receiving traffic
- **Pod Anti-Affinity**: Tries to spread replicas across different nodes
- **Persistent Storage**: 5Gi volume for SQLite database
- **Secrets Management**: JWT secret stored securely in Kubernetes
- **Configuration Management**: Environment variables via ConfigMap

## Scaling

Scale deployments up/down:
```
kubectl scale deployment backend --replicas=3
kubectl scale deployment frontend --replicas=3
```

## Updates and Rollouts

Update image version:
```
kubectl set image deployment/backend backend=your-registry/backend:v1.1.0
```

Check rollout status:
```
kubectl rollout status deployment/backend
```

Rollback to previous version:
```
kubectl rollout undo deployment/backend
```

## Cleanup

Delete all resources:
```
kubectl delete -f .
```

Or delete specific resources:
```
kubectl delete deployment backend frontend
kubectl delete service backend frontend
kubectl delete pvc database-pvc
```

#!/bin/bash
# Quick Kubernetes Deployment Script for LetsGo Application

set -e

echo "=== LetsGo Kubernetes Deployment Script ==="
echo ""

# Step 1: Check prerequisites
echo "[1] Checking prerequisites..."
if ! command -v kubectl &> /dev/null; then
    echo "ERROR: kubectl is not installed or not in PATH"
    exit 1
fi
echo "✓ kubectl found"

# Step 2: Display current context
echo ""
echo "[2] Kubernetes Context:"
kubectl config current-context
echo ""
read -p "Continue with this cluster? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 3: Verify image registry
echo ""
echo "[3] Verify Docker images are pushed to registry"
echo "Expected images:"
echo "  - your-registry/backend:latest"
echo "  - your-registry/frontend:latest"
echo ""
read -p "Have you pushed the images? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please push images first:"
    echo "  docker push your-registry/backend:latest"
    echo "  docker push your-registry/frontend:latest"
    exit 1
fi

# Step 4: Update image references
echo ""
echo "[4] Update image references in manifests..."
echo "Replace 'backend:latest' and 'frontend:latest' with your registry URIs"
echo "in backend-deployment.yaml and frontend-deployment.yaml"
echo ""
read -p "Update the manifests? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 5: Deploy storage
echo ""
echo "[5] Deploying storage resources..."
kubectl apply -f storage.yaml
echo "✓ Storage deployed"

# Step 6: Deploy configuration
echo ""
echo "[6] Deploying configuration and secrets..."
kubectl apply -f configmap.yaml
echo "⚠ UPDATE secret.yaml with real JWT secret before production!"
kubectl apply -f secret.yaml
echo "✓ Configuration deployed"

# Step 7: Deploy services
echo ""
echo "[7] Deploying services..."
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-service.yaml
echo "✓ Services deployed"

# Step 8: Deploy applications
echo ""
echo "[8] Deploying applications..."
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
echo "✓ Deployments created"

# Step 9: Deploy ingress
echo ""
echo "[9] Deploy ingress? (y/n) "
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Update ingress.yaml with your domain first!"
    kubectl apply -f ingress.yaml
    echo "✓ Ingress deployed"
fi

# Step 10: Wait and verify
echo ""
echo "[10] Waiting for pods to be ready (up to 2 minutes)..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s 2>/dev/null || true
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s 2>/dev/null || true

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Pod Status:"
kubectl get pods -l "app in (backend,frontend)"
echo ""
echo "Service Status:"
kubectl get svc backend frontend
echo ""
echo "Next steps:"
echo "1. Check pod logs: kubectl logs <pod-name>"
echo "2. Port forward: kubectl port-forward svc/frontend 5173:5173"
echo "3. Update ingress.yaml and deploy for production access"

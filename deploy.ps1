# Quick Kubernetes Deployment Script for LetsGo Application (Windows PowerShell)

Write-Host "=== LetsGo Kubernetes Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[1] Checking prerequisites..." -ForegroundColor Yellow
try {
    $null = kubectl version --client
    Write-Host "✓ kubectl found" -ForegroundColor Green
} catch {
    Write-Host "ERROR: kubectl is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Step 2: Display current context
Write-Host ""
Write-Host "[2] Kubernetes Context:" -ForegroundColor Yellow
kubectl config current-context
Write-Host ""
$response = Read-Host "Continue with this cluster? (y/n)"
if ($response -ne "y") { exit 1 }

# Step 3: Verify image registry
Write-Host ""
Write-Host "[3] Verify Docker images are pushed to registry" -ForegroundColor Yellow
Write-Host "Expected images:"
Write-Host "  - your-registry/backend:latest"
Write-Host "  - your-registry/frontend:latest"
Write-Host ""
$response = Read-Host "Have you pushed the images? (y/n)"
if ($response -ne "y") {
    Write-Host "Please push images first using Docker CLI" -ForegroundColor Red
    exit 1
}

# Step 4: Update image references
Write-Host ""
Write-Host "[4] Update image references in manifests..." -ForegroundColor Yellow
Write-Host "Edit backend-deployment.yaml and frontend-deployment.yaml:"
Write-Host "  Change: image: backend:latest"
Write-Host "  To: image: your-registry/backend:latest"
Write-Host ""
$response = Read-Host "Have you updated the manifests? (y/n)"
if ($response -ne "y") { exit 1 }

# Step 5: Deploy storage
Write-Host ""
Write-Host "[5] Deploying storage resources..." -ForegroundColor Yellow
kubectl apply -f storage.yaml
Write-Host "✓ Storage deployed" -ForegroundColor Green

# Step 6: Deploy configuration
Write-Host ""
Write-Host "[6] Deploying configuration and secrets..." -ForegroundColor Yellow
kubectl apply -f configmap.yaml
Write-Host "⚠ UPDATE secret.yaml with real JWT secret before production!" -ForegroundColor Magenta
kubectl apply -f secret.yaml
Write-Host "✓ Configuration deployed" -ForegroundColor Green

# Step 7: Deploy services
Write-Host ""
Write-Host "[7] Deploying services..." -ForegroundColor Yellow
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-service.yaml
Write-Host "✓ Services deployed" -ForegroundColor Green

# Step 8: Deploy applications
Write-Host ""
Write-Host "[8] Deploying applications..." -ForegroundColor Yellow
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
Write-Host "✓ Deployments created" -ForegroundColor Green

# Step 9: Deploy ingress
Write-Host ""
$response = Read-Host "Deploy ingress? (y/n)"
if ($response -eq "y") {
    Write-Host "Update ingress.yaml with your domain first!" -ForegroundColor Magenta
    kubectl apply -f ingress.yaml
    Write-Host "✓ Ingress deployed" -ForegroundColor Green
}

# Step 10: Verify
Write-Host ""
Write-Host "[10] Checking deployment status..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pod Status:" -ForegroundColor Yellow
kubectl get pods -l "app in (backend,frontend)"
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Yellow
kubectl get svc backend frontend
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check pod logs: kubectl logs <pod-name>"
Write-Host "2. Port forward: kubectl port-forward svc/frontend 5173:5173"
Write-Host "3. Update ingress.yaml and deploy for production access"

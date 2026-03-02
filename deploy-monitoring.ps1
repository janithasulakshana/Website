# Grafana Monitoring Stack Deployment Script
# For Lets Go Colombo Tours by J

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Grafana Monitoring Stack Deployment" -ForegroundColor Cyan
Write-Host "Lets Go Colombo Tours by J" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install npm dependencies
Write-Host "[1/6] Installing Prometheus client in backend..." -ForegroundColor Yellow
Set-Location backend
npm install prom-client
Set-Location ..
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy Prometheus
Write-Host "[2/6] Deploying Prometheus..." -ForegroundColor Yellow
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
Write-Host "✓ Prometheus deployed" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy Grafana Configuration
Write-Host "[3/6] Deploying Grafana configuration..." -ForegroundColor Yellow
kubectl apply -f monitoring/grafana-datasources.yaml
kubectl apply -f monitoring/grafana-dashboards-config.yaml
kubectl apply -f monitoring/grafana-dashboards.yaml
Write-Host "✓ Grafana configuration deployed" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy Grafana
Write-Host "[4/6] Deploying Grafana..." -ForegroundColor Yellow
kubectl apply -f monitoring/grafana-deployment.yaml
Write-Host "✓ Grafana deployed" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for pods to be ready
Write-Host "[5/6] Waiting for pods to be ready..." -ForegroundColor Yellow
Write-Host "This may take a few minutes while images are pulled..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=prometheus --timeout=300s
kubectl wait --for=condition=ready pod -l app=grafana --timeout=300s
Write-Host "✓ All pods are ready" -ForegroundColor Green
Write-Host ""

# Step 6: Display status
Write-Host "[6/6] Deployment Status:" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
kubectl get pods -l app=prometheus
kubectl get pods -l app=grafana
Write-Host ""
kubectl get svc prometheus grafana
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Monitoring stack deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Instructions:" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan
Write-Host "1. Grafana Dashboard:" -ForegroundColor White
Write-Host "   kubectl port-forward svc/grafana 3000:3000" -ForegroundColor Gray
Write-Host "   Then visit: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Username: admin" -ForegroundColor Yellow
Write-Host "   Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Prometheus:" -ForegroundColor White
Write-Host "   kubectl port-forward svc/prometheus 9090:9090" -ForegroundColor Gray
Write-Host "   Then visit: http://localhost:9090" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Backend Metrics:" -ForegroundColor White
Write-Host "   kubectl port-forward deployment/website-backend 5000:5000" -ForegroundColor Gray
Write-Host "   Then visit: http://localhost:5000/metrics" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Dashboard: 'Lets Go Colombo Tours - Application Monitoring'" -ForegroundColor Magenta
Write-Host ""

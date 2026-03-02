#!/bin/bash
# Grafana Monitoring Stack Deployment Script
# For Lets Go Colombo Tours by J

set -e

echo "================================================"
echo "Grafana Monitoring Stack Deployment"
echo "Lets Go Colombo Tours by J"
echo "================================================"
echo ""

# Step 1: Install npm dependencies
echo "[1/6] Installing Prometheus client in backend..."
cd backend
npm install prom-client
cd ..
echo "✓ Dependencies installed"
echo ""

# Step 2: Deploy Prometheus
echo "[2/6] Deploying Prometheus..."
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
echo "✓ Prometheus deployed"
echo ""

# Step 3: Deploy Grafana Configuration
echo "[3/6] Deploying Grafana configuration..."
kubectl apply -f monitoring/grafana-datasources.yaml
kubectl apply -f monitoring/grafana-dashboards-config.yaml
kubectl apply -f monitoring/grafana-dashboards.yaml
echo "✓ Grafana configuration deployed"
echo ""

# Step 4: Deploy Grafana
echo "[4/6] Deploying Grafana..."
kubectl apply -f monitoring/grafana-deployment.yaml
echo "✓ Grafana deployed"
echo ""

# Step 5: Wait for pods to be ready
echo "[5/6] Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=prometheus --timeout=300s
kubectl wait --for=condition=ready pod -l app=grafana --timeout=300s
echo "✓ All pods are ready"
echo ""

# Step 6: Display status
echo "[6/6] Deployment Status:"
echo "================================================"
kubectl get pods -l app=prometheus
kubectl get pods -l app=grafana
echo ""
kubectl get svc prometheus grafana
echo "================================================"
echo ""

echo "✅ Monitoring stack deployed successfully!"
echo ""
echo "Access Instructions:"
echo "-------------------"
echo "1. Grafana Dashboard:"
echo "   kubectl port-forward svc/grafana 3000:3000"
echo "   Then visit: http://localhost:3000"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "2. Prometheus:"
echo "   kubectl port-forward svc/prometheus 9090:9090"
echo "   Then visit: http://localhost:9090"
echo ""
echo "3. Backend Metrics:"
echo "   kubectl port-forward deployment/website-backend 5000:5000"
echo "   Then visit: http://localhost:5000/metrics"
echo ""
echo "📊 Dashboard: 'Lets Go Colombo Tours - Application Monitoring'"
echo ""

# Grafana Monitoring Stack for Lets Go Colombo Tours

This monitoring stack provides comprehensive observability for the Lets Go Colombo Tours application using Grafana and Prometheus.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install the `prom-client` package for Prometheus metrics.

### 2. Deploy Monitoring Stack

Deploy all monitoring components to Kubernetes:

```bash
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/grafana-datasources.yaml
kubectl apply -f monitoring/grafana-dashboards-config.yaml
kubectl apply -f monitoring/grafana-dashboards.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
```

### 3. Access Grafana Dashboard

Port forward Grafana to access the web UI:

```bash
kubectl port-forward svc/grafana 3000:3000
```

Then open http://localhost:3000 in your browser.

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

### 4. Access Prometheus (Optional)

Port forward Prometheus to check metrics:

```bash
kubectl port-forward svc/prometheus 9090:9090
```

Then open http://localhost:9090 in your browser.

## 📊 Dashboard Features

The "Lets Go Colombo Tours - Application Monitoring" dashboard includes:

### Performance Metrics
- **Backend API Response Time**: Average response time for all API endpoints
- **HTTP Request Rate**: Requests per second by method and route
- **HTTP Status Codes**: Distribution of HTTP status codes (200, 400, 500, etc.)

### Business Metrics
- **Active Bookings**: Total number of bookings in the system
- **Pending Bookings**: Number of bookings awaiting confirmation

### System Metrics
- **Memory Usage**: Node.js heap memory utilization percentage
- **CPU Usage**: Process CPU consumption
- **Database Connections**: Active database connections

### Health Monitoring
- Health check endpoint: `/health`
- Metrics endpoint: `/metrics`

## 🔍 Available Metrics

The backend exposes the following custom metrics at `/metrics`:

### HTTP Metrics
- `http_request_duration_seconds` - Request duration histogram
- `http_requests_total` - Total HTTP requests counter

### Business Metrics
- `bookings_total` - Total number of bookings
- `bookings_pending` - Number of pending bookings

### System Metrics (Default)
- `nodejs_heap_size_used_bytes` - Node.js heap usage
- `nodejs_heap_size_total_bytes` - Total heap size
- `process_cpu_user_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Resident memory
- `nodejs_eventloop_lag_seconds` - Event loop lag

## 📝 Configuration

### Prometheus Scrape Interval
Default: 15 seconds

To change, edit `monitoring/prometheus-config.yaml`:
```yaml
global:
  scrape_interval: 30s  # Change this value
```

### Grafana Dashboard Refresh
Default: 5 seconds

To change, edit the dashboard JSON in `monitoring/grafana-dashboards.yaml`:
```json
"refresh": "10s"  # Change this value
```

### Metrics Update Interval
Booking metrics are updated every 30 seconds by default.

To change, edit `backend/server.js`:
```javascript
setInterval(() => {
    updateBookingMetrics(db);
}, 60000);  // Change to 60 seconds
```

## 🔧 Troubleshooting

### Grafana shows "No Data"
1. Check Prometheus is running: `kubectl get pods | grep prometheus`
2. Check Prometheus can scrape backend: Visit http://localhost:9090/targets
3. Verify backend metrics endpoint: `curl http://website-backend:5000/metrics`

### Backend metrics not updating
1. Check backend logs: `kubectl logs deployment/website-backend`
2. Verify database connection is working
3. Test metrics endpoint: `kubectl port-forward deployment/website-backend 5000:5000` then visit http://localhost:5000/metrics

### Prometheus can't find targets
1. Ensure backend service is running: `kubectl get svc website-backend`
2. Check service port matches Prometheus config (5000)
3. Verify pod labels match service selectors

## 🎨 Customizing Dashboards

### Add New Panels
1. Log into Grafana
2. Click on the dashboard
3. Click "Add Panel" in the top right
4. Use PromQL to query metrics
5. Save the dashboard
6. Export JSON and update `monitoring/grafana-dashboards.yaml`

### Example PromQL Queries

**Average Response Time by Route:**
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**Request Rate by Status:**
```promql
sum by (status) (rate(http_requests_total[5m]))
```

**Error Rate Percentage:**
```promql
100 * sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
```

## 🔐 Security Considerations

### Production Recommendations:
1. **Change default passwords** - Update Grafana admin password:
   ```yaml
   - name: GF_SECURITY_ADMIN_PASSWORD
     valueFrom:
       secretKeyRef:
         name: grafana-secret
         key: admin-password
   ```

2. **Restrict metrics endpoint** - Add authentication to `/metrics`:
   ```javascript
   app.get('/metrics', authenticateMetrics, async (req, res) => {
     // metrics code
   });
   ```

3. **Use TLS** - Enable HTTPS for Grafana and Prometheus

4. **Network Policies** - Restrict access to monitoring services

## 📦 Components

- **Prometheus** v2.47.0 - Metrics collection and storage
- **Grafana** v10.2.0 - Visualization and dashboards
- **prom-client** v15.1.0 - Node.js Prometheus client

## 🔄 Updating

### Update Backend Metrics
1. Edit `backend/metrics.js`
2. Restart backend: `kubectl rollout restart deployment/website-backend`

### Update Dashboards
1. Edit `monitoring/grafana-dashboards.yaml`
2. Apply changes: `kubectl apply -f monitoring/grafana-dashboards.yaml`
3. Restart Grafana: `kubectl rollout restart deployment/grafana`

### Update Prometheus Config
1. Edit `monitoring/prometheus-config.yaml`
2. Apply changes: `kubectl apply -f monitoring/prometheus-config.yaml`
3. Reload Prometheus: `kubectl rollout restart deployment/prometheus`

## 📈 Monitoring Best Practices

1. **Set up alerts** - Configure Prometheus alerting rules
2. **Monitor trends** - Review weekly/monthly trends
3. **Set baselines** - Establish normal operating ranges
4. **Document incidents** - Record and analyze outages
5. **Regular reviews** - Weekly dashboard reviews with team

## 🆘 Support

For issues or questions:
- Email: letsgocolombotoursbyj@gmail.com
- Check logs: `kubectl logs -f deployment/grafana`
- Prometheus UI: http://localhost:9090
- Grafana docs: https://grafana.com/docs/

---

**Lets Go Colombo Tours by J** - Monitoring Dashboard v1.0.0

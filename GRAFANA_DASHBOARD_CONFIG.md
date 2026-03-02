# Grafana Dashboard Configuration Guide

## 📊 Dashboard Overview

The **"Lets Go Colombo Tours - Application Monitoring"** dashboard displays real-time metrics for your application including:
- Backend API performance
- HTTP request rates and status codes
- Business metrics (bookings)
- System resource usage (CPU, memory)

---

## 🚀 Accessing the Dashboard

### Step 1: Open Grafana UI
```
URL: http://localhost:3000
Username: admin
Password: admin123
```

### Step 2: Navigate to Dashboards
1. Click the **Grafana logo** (top-left) to open the main menu
2. Click **Dashboards**
3. Click **Browse**
4. Find **"Lets Go Colombo Tours - Application Monitoring"**
5. Click to open

---

## 🎨 Dashboard Layout

### Current Panels (7 panels total)

| Panel | Location | Type | Metric |
|-------|----------|------|--------|
| **Backend API Response Time** | Top-left | Time series graph | Average response time (seconds) |
| **HTTP Request Rate** | Top-right | Time series graph | Requests per second by method |
| **HTTP Status Codes** | Middle-left | Time series graph | Distribution of status codes (200, 4xx, 5xx) |
| **Active Bookings** | Middle-right (top) | Stat card | Total bookings in system |
| **Pending Bookings** | Middle-right (bottom) | Stat card | Bookings awaiting confirmation |
| **Memory Usage** | Bottom-left | Time series graph | Node.js heap memory % |
| **CPU Usage** | Bottom-right | Time series graph | Process CPU usage % |

---

## ⚙️ Editing the Dashboard

### Method 1: Edit via UI (Recommended for quick changes)

#### Step 1: Enter Edit Mode
1. Open the dashboard
2. Click **Edit** button (pencil icon, top-right)

#### Step 2: Modify Panels
Each panel can be customized:

**To Edit a Panel:**
1. Click the **panel title** or **three dots** (⋮) in top-right corner
2. Choose action:
   - **Edit**: Modify panel settings
   - **Inspect**: View query and data
   - **Delete**: Remove panel
   - **Duplicate**: Copy panel
   - **Replace**: Swap visualization type

#### Step 3: Panel Editor
When editing a panel, you'll see:

```
┌─────────────────────────────────┐
│ Panel Title                     │
├─────────────────────────────────┤
│ Queries Tab | Visualization Tab │
├─────────────────────────────────┤
│                                 │
│  [Query Editor]                 │
│  - Metric: http_request_duration_seconds_sum
│  - Legend: Avg Response Time
│                                 │
└─────────────────────────────────┘
```

### Method 2: Edit via JSON

#### Step 1: Access JSON Editor
1. Open dashboard in edit mode
2. Click the **dashboard settings** (gear icon, top-right)
3. Click **JSON Model**
4. Edit the JSON directly

#### Step 2: Save Changes
1. Click **Save** (Ctrl+S)
2. Enter a commit message (e.g., "Updated API response time threshold")
3. Click **Save**

---

## 📈 Common Customizations

### 1. Change Time Range

**UI Method:**
1. Click the time range dropdown (top-right, shows "Last 6 hours")
2. Select: Last 1h, Last 6h, Last 24h, Last 7d, or custom range

**URL Method:**
```
http://localhost:3000/d/lets-go-colombo?from=now-1h&to=now
```

### 2. Change Refresh Rate

**UI Method:**
1. Click the refresh dropdown (⟳ icon)
2. Select: 5s, 10s, 30s, 1m, 5m, or Off

**JSON Method:**
Edit the dashboard JSON:
```json
"refresh": "5s"
```
Change to:
```json
"refresh": "30s"
```

### 3. Add a New Panel

**Step 1: Enter Edit Mode**
Click **Edit** button

**Step 2: Add Panel**
Click **+ Add Panel** (top toolbar)

**Step 3: Configure Panel**
```
1. Choose visualization type (Graph, Stat, Gauge, etc.)
2. Enter Prometheus query in the query editor
3. Customize panel settings
4. Click "Apply"
```

### 4. Modify Prometheus Queries

#### Example: Change Response Time Metric

**Current Query:**
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**To get 95th percentile instead:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**To get by route:**
```promql
histogram_quantile(0.95, sum by (route) (rate(http_request_duration_seconds_bucket[5m])))
```

---

## 🔍 Useful Prometheus Queries for Custom Panels

### HTTP Metrics
```promql
# Error rate (%)
100 * sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Request count by status
sum by (status) (increase(http_requests_total[5m]))

# Average response time by route
avg by (route) (rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]))
```

### Business Metrics
```promql
# Bookings conversion rate
bookings_total / site_visits

# New bookings per minute
rate(bookings_total[1m])

# Average bookings per day
increase(bookings_total[1d])
```

### System Metrics
```promql
# Memory usage in MB
nodejs_heap_size_used_bytes / 1024 / 1024

# Event loop delay
nodejs_eventloop_lag_seconds

# Active connections
database_connections_active
```

### Application Availability
```promql
# Application up/down (1 = up, 0 = down)
up{job="backend"}

# HTTP 200 success rate (proxy for availability)
sum(rate(http_requests_total{status="200"}[5m]))

# Error rate (%)
100 * sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
```

---

## 🟢 Example: Monitor Application Availability

**Step 1: Add a Stat Panel**
1. Click **Edit** on your dashboard
2. Click **+ Add Panel**
3. Choose **Stat** visualization
4. Use query:
   ```promql
   up{job="backend"}
   ```
5. Set value mappings: 1 = "Up", 0 = "Down"
6. Set color: Green for Up, Red for Down
7. Save the panel as "Backend Availability"

**Step 2: (Optional) Add Error Rate Panel**
1. Add another Stat panel
2. Query:
   ```promql
   100 * sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
   ```
3. Set thresholds: Green < 1%, Yellow < 5%, Red ≥ 5%
4. Title: "Error Rate (%)"

**Step 3: (Optional) Set Up Alerts**
1. In the panel, go to **Alert** tab
2. Condition: "WHEN last() OF query (A, 1m, now) IS BELOW 1"
3. Add notification channel (email, Slack, etc.)

---

## 🎯 Threshold Configuration

### Set Thresholds for Stat Cards

**Example: Color code Active Bookings**

1. Edit the **"Active Bookings"** panel
2. Go to **Visualization** tab
3. Under **Thresholds**, configure:
   ```
   Green:  0 - 100
   Yellow: 100 - 500
   Red:    500+
   ```

### For Time Series Graphs

1. Edit panel
2. Go to **Visualization** tab
3. Scroll to **Standard Options** → **Thresholds**
4. Add threshold steps

---

## 💾 Saving Dashboard Changes

### Auto-Save
- Changes are saved automatically every 30 seconds while editing

### Manual Save
1. Click **Save** (Ctrl+S)
2. Enter commit message
3. Click **Save** button

### Export Dashboard JSON
1. Click **Share** (export icon)
2. Select **Export**
3. Choose **Export for sharing externally** or **Save to file**

---

## 🔧 Advanced Configuration

### 1. Add Dashboard Variables

**Use case:** Create dropdown to filter by environment (dev, staging, prod)

**Steps:**
1. Click **Dashboard Settings** (gear icon)
2. Click **Variables**
3. Click **New Variable**
4. Configure:
   ```
   Name: environment
   Type: Query
   Data source: Prometheus
   Query: label_values(http_requests_total, job)
   ```

### 2. Add Annotations

**Use case:** Mark deployments or incidents on timeline

**Steps:**
1. Click **Annotations** in left sidebar
2. Click **+ New Annotation**
3. Configure query to fetch events

### 3. Set Up Alerts

**Step 1: Create Alert Rule**
1. Edit a panel (e.g., "CPU Usage")
2. Click **Alert** tab
3. Configure condition: "Alert when CPU > 80%"

**Step 2: Configure Notification Channel**
1. Click **Alerting** → **Notification channels**
2. Add channel: Email, Slack, Webhook, etc.

---

## 📱 Dashboard Sharing

### Share with Team

**Method 1: Public Link**
1. Click **Share** icon (top-right)
2. Click **Snapshots** tab
3. Click **Create snapshot**
4. Share the link

**Method 2: Export & Import**
1. Export dashboard JSON (see above)
2. Share JSON file
3. Others can import via **Dashboards** → **Import**

### Embed in Website
```html
<iframe src="http://localhost:3000/d/lets-go-colombo?orgId=1&refresh=30s&kiosk" 
        width="100%" height="600"></iframe>
```

---

## 🎨 Customizing Dashboard Appearance

### Change Dashboard Name
1. Click **Settings** (gear icon)
2. Edit **Name** field
3. Save

### Change Dashboard Description
1. Click **Settings** (gear icon)
2. Edit **Description**
3. Save

### Change Panel Colors

**For Time Series:**
1. Edit panel
2. Go to **Visualization** tab
3. Expand **Color scheme** options
4. Choose: Classic, Blue/Red, Green/Yellow, Custom, etc.

**For Stat Cards:**
1. Edit panel
2. Go to **Visualization** tab
3. Set **Color mode**: Value, Background, or custom

---

## 📊 Example: Create a New Panel

### Add "Error Rate" Panel

**Step 1: Enter Edit Mode**
Click **Edit**

**Step 2: Add Panel**
Click **+ Add Panel**

**Step 3: Choose Visualization**
Select **Stat** card

**Step 4: Configure Query**
```promql
100 * sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
```

**Step 5: Set Panel Title**
Set title to "Error Rate (%)"

**Step 6: Configure Thresholds**
- Green: 0-5
- Yellow: 5-10
- Red: 10+

**Step 7: Apply & Save**
1. Click **Apply**
2. Click **Save**

---

## 🐛 Troubleshooting Dashboard Issues

### "No Data" in Panels

**Cause:** Backend not sending metrics

**Solution:**
```bash
# Check backend is running
docker-compose ps

# Check metrics endpoint
curl http://localhost:5000/metrics

# Check Prometheus can scrape backend
Visit http://localhost:9090/targets
```

### Panels Show Old Data

**Solution 1:** Refresh dashboard
- Press **F5** or click refresh button

**Solution 2:** Change time range
- Click time range dropdown
- Select different range

**Solution 3:** Restart Grafana
```bash
docker-compose restart grafana
```

### Can't Edit Dashboard

**Check:** Are you in edit mode?
- Click **Edit** button (top-right)

**Note:** Read-only users can't edit
- Change in **Dashboard Settings** → **Permissions**

---

## 📚 Dashboard Best Practices

1. **Organize Panels**: Group related metrics together
2. **Use Descriptive Titles**: Make panel purpose clear
3. **Set Appropriate Time Ranges**: 5-minute default for real-time, longer for trends
4. **Use Thresholds**: Visually highlight anomalies
5. **Document**: Add panel descriptions and links to runbooks
6. **Version Control**: Export and commit dashboard JSON to git
7. **Regular Review**: Update queries and thresholds based on actual data
8. **Performance**: Limit queries to necessary time ranges

---

## 📖 Useful Resources

- **Grafana Docs**: https://grafana.com/docs/grafana/latest/
- **Prometheus Query Language**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Dashboard Examples**: https://grafana.com/grafana/dashboards/

---

## 🔄 Backup & Restore Dashboard

### Backup Dashboard JSON
```bash
# Export current dashboard
curl http://localhost:3000/api/dashboards/uid/lets-go-colombo \
  -H "Authorization: Bearer $GRAFANA_API_TOKEN" > dashboard-backup.json
```

### Restore Dashboard
```bash
# Import dashboard JSON
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Authorization: Bearer $GRAFANA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @dashboard-backup.json
```

---

**Last Updated:** March 2, 2026  
**Lets Go Colombo Tours by J** - Monitoring Dashboard Configuration Guide v1.0

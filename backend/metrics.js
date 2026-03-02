const promClient = require('prom-client');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const bookingsTotal = new promClient.Gauge({
  name: 'bookings_total',
  help: 'Total number of bookings in the system'
});

const bookingsPending = new promClient.Gauge({
  name: 'bookings_pending',
  help: 'Number of pending bookings'
});

const databaseConnectionsActive = new promClient.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(bookingsTotal);
register.registerMetric(bookingsPending);
register.registerMetric(databaseConnectionsActive);

// Middleware to track HTTP metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });
  
  next();
};

// Function to update booking metrics
const updateBookingMetrics = (db) => {
  db.get('SELECT COUNT(*) as total FROM bookings', [], (err, row) => {
    if (!err && row) {
      bookingsTotal.set(row.total);
    }
  });
  
  db.get('SELECT COUNT(*) as pending FROM bookings WHERE status = ?', ['pending'], (err, row) => {
    if (!err && row) {
      bookingsPending.set(row.pending);
    }
  });
};

module.exports = {
  register,
  metricsMiddleware,
  updateBookingMetrics,
  databaseConnectionsActive
};

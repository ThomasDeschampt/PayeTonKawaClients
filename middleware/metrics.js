const prometheus = require('prom-client');

const register = new prometheus.Registry();

prometheus.collectDefaultMetrics({
    app: 'api-clients',
    prefix: 'api_clients_',
    timeout: 10000,
    register
});

const httpRequestDurationMicroseconds = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Nombre total de requêtes HTTP',
    labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);

const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const route = req.route ? req.route.path : 'unknown';
        
        httpRequestDurationMicroseconds
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration / 1000);
            
        httpRequestsTotal
            .labels(req.method, route, res.statusCode.toString())
            .inc();
    });
    
    next();
};

const metricsRoute = async (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
};

module.exports = {
    metricsMiddleware,
    metricsRoute,
    register,
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    activeConnections
}; 
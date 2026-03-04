# Circuit Breaker — Monitoring and Metrics

## Core Patterns

### State Change Event Monitoring

Log every CLOSED→OPEN, OPEN→HALF_OPEN, and HALF_OPEN→CLOSED transition with structured data. Silent state changes are the leading cause of missed production incidents.

```typescript
import CircuitBreaker from 'opossum';

interface StateChangeLog {
  timestamp: string;
  breaker: string;
  from: string;
  to: string;
  failureRate?: number;
}

function attachLogging(breaker: CircuitBreaker): void {
  const log = (from: string, to: string) => {
    const entry: StateChangeLog = {
      timestamp: new Date().toISOString(),
      breaker: breaker.name,
      from,
      to,
    };
    // Structured log — ingest into Datadog, CloudWatch, or similar
    console.log(JSON.stringify(entry));
  };

  breaker.on('open',     () => log('CLOSED', 'OPEN'));
  breaker.on('halfOpen', () => log('OPEN', 'HALF_OPEN'));
  breaker.on('close',    () => log('HALF_OPEN', 'CLOSED'));

  // Also log individual request outcomes
  breaker.on('success', (_result, latencyMs) => {
    console.log(JSON.stringify({ event: 'circuit.success', breaker: breaker.name, latencyMs }));
  });
  breaker.on('failure', (err) => {
    console.log(JSON.stringify({ event: 'circuit.failure', breaker: breaker.name, error: err.message }));
  });
  breaker.on('reject', () => {
    console.log(JSON.stringify({ event: 'circuit.rejected', breaker: breaker.name }));
  });
  breaker.on('timeout', () => {
    console.log(JSON.stringify({ event: 'circuit.timeout', breaker: breaker.name }));
  });
  breaker.on('fallback', (result) => {
    console.log(JSON.stringify({ event: 'circuit.fallback', breaker: breaker.name, result }));
  });
}
```

Manual breaker equivalent using the `onStateChange` hook from the hand-rolled implementation:

```typescript
const breaker = new CircuitBreaker({
  name: 'payment-service',
  failureThreshold: 5,
  windowMs: 60_000,
  recoveryTimeoutMs: 15_000,
  halfOpenProbes: 2,
  successThreshold: 2,
  onStateChange: (from, to) => {
    logger.warn('Circuit state changed', { breaker: 'payment-service', from, to });
    if (to === 'OPEN') {
      alerting.page('payment-service circuit opened', { severity: 'critical' });
    }
  },
});
```

---

### Prometheus Metrics

Define counters and a gauge to track circuit breaker state, request outcomes, and failure rates.

```typescript
import { Counter, Gauge, Histogram, register } from 'prom-client';

const circuitState = new Gauge({
  name: 'circuit_breaker_state',
  help: 'Current state of circuit breaker (0=CLOSED, 1=HALF_OPEN, 2=OPEN)',
  labelNames: ['breaker', 'service'],
  registers: [register],
});

const circuitRequests = new Counter({
  name: 'circuit_breaker_requests_total',
  help: 'Total requests through the circuit breaker by outcome',
  labelNames: ['breaker', 'service', 'outcome'],
  // outcome: success | failure | rejected | timeout | fallback
  registers: [register],
});

const circuitLatency = new Histogram({
  name: 'circuit_breaker_request_duration_ms',
  help: 'Latency of successful circuit breaker executions in ms',
  labelNames: ['breaker', 'service'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

const stateToValue: Record<string, number> = {
  CLOSED: 0,
  HALF_OPEN: 1,
  OPEN: 2,
};

function instrumentBreaker(breaker: CircuitBreaker, service: string): void {
  const labels = { breaker: breaker.name, service };

  // Set initial state
  circuitState.set(labels, 0);

  breaker.on('open',     () => circuitState.set(labels, 2));
  breaker.on('halfOpen', () => circuitState.set(labels, 1));
  breaker.on('close',    () => circuitState.set(labels, 0));

  breaker.on('success', (_r, latency) => {
    circuitRequests.inc({ ...labels, outcome: 'success' });
    circuitLatency.observe(labels, latency);
  });
  breaker.on('failure',  () => circuitRequests.inc({ ...labels, outcome: 'failure' }));
  breaker.on('reject',   () => circuitRequests.inc({ ...labels, outcome: 'rejected' }));
  breaker.on('timeout',  () => circuitRequests.inc({ ...labels, outcome: 'timeout' }));
  breaker.on('fallback', () => circuitRequests.inc({ ...labels, outcome: 'fallback' }));
}

// Expose /metrics endpoint (Prometheus scrape target)
import express from 'express';
const app = express();
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

Example Prometheus scrape output:

```text
circuit_breaker_state{breaker="payment-service",service="payment"} 2
circuit_breaker_requests_total{breaker="payment-service",service="payment",outcome="success"} 1204
circuit_breaker_requests_total{breaker="payment-service",service="payment",outcome="failure"} 87
circuit_breaker_requests_total{breaker="payment-service",service="payment",outcome="rejected"} 312
circuit_breaker_request_duration_ms_bucket{...,le="250"} 1100
```

---

### Grafana Dashboard JSON

A minimal Grafana dashboard panel configuration for circuit breaker visualization. Import into Grafana via Dashboard > Import > Paste JSON.

```json
{
  "title": "Circuit Breakers",
  "uid": "circuit-breakers-v1",
  "panels": [
    {
      "id": 1,
      "title": "Circuit State (0=CLOSED, 1=HALF_OPEN, 2=OPEN)",
      "type": "stat",
      "gridPos": { "x": 0, "y": 0, "w": 8, "h": 4 },
      "targets": [
        {
          "expr": "circuit_breaker_state",
          "legendFormat": "{{breaker}}"
        }
      ],
      "options": {
        "colorMode": "background",
        "thresholds": {
          "steps": [
            { "value": 0, "color": "green" },
            { "value": 1, "color": "yellow" },
            { "value": 2, "color": "red" }
          ]
        }
      }
    },
    {
      "id": 2,
      "title": "Request Outcomes (per minute)",
      "type": "timeseries",
      "gridPos": { "x": 8, "y": 0, "w": 16, "h": 8 },
      "targets": [
        {
          "expr": "rate(circuit_breaker_requests_total[1m])",
          "legendFormat": "{{breaker}} / {{outcome}}"
        }
      ]
    },
    {
      "id": 3,
      "title": "Failure Rate %",
      "type": "timeseries",
      "gridPos": { "x": 0, "y": 4, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "rate(circuit_breaker_requests_total{outcome='failure'}[5m]) / rate(circuit_breaker_requests_total[5m]) * 100",
          "legendFormat": "{{breaker}} failure %"
        }
      ],
      "options": {
        "thresholds": {
          "steps": [
            { "value": 0,  "color": "green" },
            { "value": 30, "color": "yellow" },
            { "value": 50, "color": "red" }
          ]
        }
      }
    },
    {
      "id": 4,
      "title": "p99 Latency (ms)",
      "type": "timeseries",
      "gridPos": { "x": 12, "y": 4, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "histogram_quantile(0.99, rate(circuit_breaker_request_duration_ms_bucket[5m]))",
          "legendFormat": "{{breaker}} p99"
        }
      ]
    }
  ]
}
```

---

### Health Check Endpoint Exposing Circuit Breaker State

Provide an HTTP endpoint that reports each breaker's state. Use this for readiness probes and monitoring dashboards.

```typescript
import express from 'express';
import CircuitBreaker from 'opossum';

const breakerRegistry = new Map<string, CircuitBreaker>();

export function registerBreaker(breaker: CircuitBreaker): void {
  breakerRegistry.set(breaker.name, breaker);
}

function getBreakerStatus(breaker: CircuitBreaker) {
  let state: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  if (breaker.opened)        state = 'OPEN';
  else if (breaker.halfOpen) state = 'HALF_OPEN';
  else                       state = 'CLOSED';

  return {
    name: breaker.name,
    state,
    stats: {
      successes:     breaker.stats.successes,
      failures:      breaker.stats.failures,
      rejected:      breaker.stats.rejected,
      timeouts:      breaker.stats.timeouts,
      fallbacks:     breaker.stats.fallbacks,
      latencyMean:   breaker.stats.latencyMean,
    },
  };
}

const app = express();

app.get('/health', (_req, res) => {
  const breakers = Array.from(breakerRegistry.values()).map(getBreakerStatus);
  const anyOpen  = breakers.some((b) => b.state === 'OPEN');

  res.status(anyOpen ? 503 : 200).json({
    status: anyOpen ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    breakers,
  });
});

// Deep health — returns 200 always but includes state for dashboards
app.get('/health/deep', (_req, res) => {
  const breakers = Array.from(breakerRegistry.values()).map(getBreakerStatus);
  res.json({ timestamp: new Date().toISOString(), breakers });
});
```

---

### Alerting Rules for Sustained OPEN State

Prometheus alerting rules. Add to `prometheus/rules/circuit-breakers.yml`.

```yaml
groups:
  - name: circuit_breaker_alerts
    rules:
      - alert: CircuitBreakerOpen
        expr: circuit_breaker_state == 2
        for: 30s
        labels:
          severity: warning
        annotations:
          summary: "Circuit breaker {{ $labels.breaker }} is OPEN"
          description: >
            The {{ $labels.breaker }} circuit breaker has been OPEN for more than 30 seconds.
            Service {{ $labels.service }} is likely unavailable. Fallbacks are active.

      - alert: CircuitBreakerOpenSustained
        expr: circuit_breaker_state == 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Circuit breaker {{ $labels.breaker }} sustained OPEN (5m)"
          description: >
            The {{ $labels.breaker }} circuit breaker has been OPEN for 5+ minutes.
            Investigate {{ $labels.service }} service health immediately.
            Fallback responses are being served to all users.

      - alert: CircuitBreakerHighFailureRate
        expr: >
          rate(circuit_breaker_requests_total{outcome="failure"}[5m])
          / rate(circuit_breaker_requests_total[5m]) > 0.4
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Circuit breaker {{ $labels.breaker }} failure rate > 40%"
          description: >
            {{ $labels.breaker }} is failing {{ $value | humanizePercentage }} of requests
            over the last 5 minutes. Circuit may open soon.

      - alert: CircuitBreakerHighRejectionRate
        expr: >
          rate(circuit_breaker_requests_total{outcome="rejected"}[5m]) > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Circuit breaker {{ $labels.breaker }} rejecting > 10 req/s"
          description: >
            {{ $labels.breaker }} is in OPEN state and rejecting requests at
            {{ $value | humanize }} req/s. Fallback load may be significant.
```

Alertmanager routing suggestion — route `severity: critical` circuit breaker alerts to PagerDuty and `severity: warning` to Slack:

```yaml
route:
  receiver: slack-default
  routes:
    - match:
        alertname: CircuitBreakerOpenSustained
      receiver: pagerduty-oncall
    - match_re:
        alertname: CircuitBreaker.*
      receiver: slack-circuit-breakers
```

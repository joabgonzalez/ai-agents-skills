# Circuit Breaker Pattern — References

Supporting implementation and monitoring references for the circuit-breaker-pattern skill.

## Quick Navigation

| File | Purpose |
|------|---------|
| [implementation-patterns.md](./implementation-patterns.md) | Manual state machine, opossum library, NestJS integration, retry composition |
| [monitoring-metrics.md](./monitoring-metrics.md) | Prometheus metrics, Grafana dashboard, alerting rules |

---

## Reading Strategy

Start with **implementation-patterns.md** to understand how to build or adopt a circuit breaker.
Then read **monitoring-metrics.md** to learn how to observe it in production.

Recommended sequence:

1. `implementation-patterns.md` — core state machine code, then library usage
2. `monitoring-metrics.md` — metrics, dashboards, and alerting

---

## File Descriptions

**implementation-patterns.md** — Full TypeScript state machine implementation for CLOSED/OPEN/HALF_OPEN states. Covers the `opossum` npm library for Node.js, a NestJS interceptor wrapping the breaker, how to compose retries with circuit breaker, and a health check endpoint that surfaces breaker state.

**monitoring-metrics.md** — Production observability. State-change event logging, Prometheus counter and gauge definitions, a Grafana dashboard JSON snippet for circuit breaker visualization, a `/health` endpoint returning breaker status, and Prometheus alerting rules for sustained OPEN state.

---

## Cross-Reference Map

```
implementation-patterns.md
  └── opossum library        → https://nodeshift.dev/opossum/
  └── NestJS interceptors    → ../../../nestjs/references/ (if present)
  └── retry composition      → see result-pattern skill for error handling

monitoring-metrics.md
  └── Prometheus metrics     → complements any service observability setup
  └── Grafana dashboard      → imports as JSON into Grafana
  └── Health check endpoint  → pairs with Kubernetes liveness/readiness probes
```

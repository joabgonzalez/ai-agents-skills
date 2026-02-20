---
name: sidecar-pattern
description: "Auxiliary service sharing lifecycle with main service. Trigger: When adding logging, monitoring, or auth proxy to microservices without code changes."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Sidecar Pattern

Deploys auxiliary services alongside the main application, sharing lifecycle. In Kubernetes, sidecars run in the same pod and share a network namespace (communicate via localhost). In Docker Compose, sidecars share a Docker network (communicate via service name). Common in microservices for cross-cutting concerns.

## When to Use

- Adding logging, monitoring, or security to microservices without code changes
- Service mesh (Envoy, Istio) for traffic management and observability
- Centralizing TLS termination or auth proxy across services
- Configuration management that updates dynamically

Don't use for:

- Monolithic applications (use middleware instead)
- Single simple services where overhead isn't justified
- Tight coupling between sidecar and main app logic

---

## Critical Patterns

### ✅ REQUIRED: Shared Lifecycle

Sidecar and main service start, stop, and scale together.

```yaml
# Docker Compose — shared lifecycle (shared Docker network, not network namespace)
# Services communicate via service name, e.g., http://order-service:3000
services:
  order-service:
    build: ./order-service
    ports: ["3000:3000"]

  order-sidecar-logger:
    image: fluent/fluentd
    volumes:
      - ./logs:/fluentd/log
      - ./fluent.conf:/fluentd/etc/fluent.conf
    depends_on: [order-service]  # Starts after; stops when compose stack stops
```

### ✅ REQUIRED: Network Transparency

Main service unaware of sidecar. Sidecar intercepts/adds capabilities transparently.

```yaml
# Kubernetes — sidecar in same pod (shared network namespace)
spec:
  containers:
    - name: app
      image: myapp:latest
      ports: [{containerPort: 3000}]
    - name: envoy-proxy
      image: envoyproxy/envoy:latest
      ports: [{containerPort: 9901}]
      # Intercepts all traffic on behalf of app
```

### ✅ REQUIRED: Single Responsibility per Sidecar

Each sidecar handles one cross-cutting concern.

```
✅ logging-sidecar    → only log aggregation
✅ metrics-sidecar    → only Prometheus scraping
✅ auth-proxy-sidecar → only authentication

❌ utility-sidecar → logging + metrics + auth (too many responsibilities)
```

### ❌ NEVER: Business Logic in Sidecar

```
❌ Sidecar validates business rules or transforms domain data
✅ Sidecar handles infrastructure concerns only (logs, metrics, TLS, retries)
```

### ✅ REQUIRED: Common Deployment Configurations

```
Service mesh (Envoy/Istio):
  → mTLS between services, circuit breaking, load balancing, observability

Logging aggregation (Fluentd/Filebeat):
  → Tail app logs → ship to Elasticsearch/Splunk

Auth proxy (oauth2-proxy):
  → Intercept HTTP requests → validate JWT/OAuth → forward to app

Config watcher (Consul/etcd agent):
  → Watch for config changes → update shared volume → app hot-reloads
```

---

## Decision Tree

```
Adding cross-cutting concern to multiple services?
  → Sidecar pattern → one sidecar per concern per service

Cross-cutting concern requires code changes to main app?
  → Not a pure sidecar → Consider library/middleware instead

Kubernetes deployment?
  → Sidecar as additional container in same Pod spec

Docker Compose deployment?
  → Sidecar as depends_on service sharing network

Business logic needed?
  → Do NOT put in sidecar → belongs in main app
```

---

## Example

```yaml
# Kubernetes — Envoy sidecar for mTLS and observability
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: payment-service
          image: payment:latest
          ports: [{containerPort: 8080}]

        - name: envoy  # Sidecar
          image: envoyproxy/envoy:v1.28
          args: ["-c", "/etc/envoy/config.yaml"]
          ports:
            - containerPort: 9090  # Metrics
            - containerPort: 9901  # Admin
```

---

## Edge Cases

**Resource sharing:** Sidecar and app share CPU/memory in the pod. Over-provisioned sidecars starve main app. Set resource limits explicitly.

**Startup ordering:** App may start before sidecar is ready. Use `initContainers` or readiness probes to ensure sidecar is healthy first.

**Debugging:** Distributed tracing (Jaeger/Zipkin) through sidecar adds correlation IDs. Ensure app propagates trace headers.

---

## Resources

- [deployment-patterns.md](references/deployment-patterns.md) — Full Docker/Kubernetes examples, service mesh config, monitoring setup

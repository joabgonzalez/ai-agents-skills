# Sidecar Pattern

Deploys auxiliary services (logging, monitoring, proxying, security) alongside main application, sharing lifecycle and resources. Common in container orchestration for microservices.

---

## Use Cases

- **Service mesh** (Envoy, Istio) - Traffic management, observability, mTLS
- **Logging aggregation** - Centralized log collection (Fluentd, Filebeat)
- **Configuration management** - Dynamic config updates (Consul, etcd)
- **Security** - Auth proxy, TLS termination (oauth2-proxy)
- **Monitoring** - Metrics collection (Prometheus, Datadog agent)

---

## Core Patterns

### ✅ REQUIRED: Shared Lifecycle

Sidecar and main service start and stop together.

```yaml
# Docker Compose - shared lifecycle
version: "3.8"
services:
  order-service:
    build: ./order-service
    ports:
      - "3000:3000"
    environment:
      LOG_ENDPOINT: http://log-sidecar:9000
    depends_on:
      - log-sidecar

  log-sidecar:
    image: fluentd:latest
    ports:
      - "9000:9000"
    volumes:
      - ./logs:/fluentd/log
      - ./fluentd.conf:/fluentd/etc/fluentd.conf
```

### ✅ REQUIRED: Shared Resources (Not Code)

Sidecars share network and storage, NOT code. Main service communicates via HTTP/gRPC to sidecar.

```typescript
// ✅ CORRECT: Sidecar logger via HTTP endpoint
export class SidecarLogger implements ILogger {
  private readonly endpoint: string;

  constructor() {
    this.endpoint = process.env.LOG_ENDPOINT || 'http://localhost:9000';
  }

  async info(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await fetch(`${this.endpoint}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'info', message, metadata, timestamp: new Date().toISOString() }),
    });
  }

  async error(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await fetch(`${this.endpoint}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'error', message, metadata, timestamp: new Date().toISOString() }),
    });
  }
}

// ❌ WRONG: Importing sidecar code directly
import { FluentdLogger } from 'fluentd-sdk'; // Tightly coupled
```

---

## Implementation Examples

### Kubernetes Pod with Sidecars

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: order-service-pod
  labels:
    app: order-service
spec:
  containers:
    # Main container
    - name: order-service
      image: order-service:latest
      ports:
        - containerPort: 3000
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app

    # Sidecar: log aggregator
    - name: log-aggregator
      image: fluentd:latest
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
          readOnly: true

    # Sidecar: auth proxy
    - name: auth-proxy
      image: oauth2-proxy:latest
      ports:
        - containerPort: 4180
      env:
        - name: UPSTREAM
          value: "http://localhost:3000"

  volumes:
    - name: shared-logs
      emptyDir: {}
```

### Docker Compose with Multiple Sidecars

```yaml
version: "3.8"
services:
  # Main application
  order-service:
    build: ./order-service
    ports:
      - "3000:3000"
    depends_on:
      - log-sidecar
      - metrics-sidecar

  # Logging sidecar
  log-sidecar:
    image: fluentd:latest
    ports:
      - "9000:9000"
    volumes:
      - ./logs:/fluentd/log

  # Monitoring sidecar
  metrics-sidecar:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  # Security sidecar (optional)
  auth-sidecar:
    image: oauth2-proxy:latest
    ports:
      - "4180:4180"
    environment:
      UPSTREAM: "http://order-service:3000"
```

### Service Mesh (Istio)

```yaml
# Istio automatically injects Envoy sidecar proxy
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  template:
    metadata:
      labels:
        app: order-service
      annotations:
        sidecar.istio.io/inject: "true"  # Envoy sidecar auto-injected
    spec:
      containers:
        - name: order-service
          image: order-service:latest
          ports:
            - containerPort: 3000
```

---

## Decision Tree

```
Need cross-cutting concerns across microservices?
→ No: Use middleware or in-process libraries
→ Yes: Continue

Running in container orchestration (K8s, Docker)?
→ No: Consider in-process alternatives
→ Yes: Sidecar pattern is good fit

Which concern?
  Logging        → Fluentd/Filebeat sidecar
  Monitoring     → Prometheus/Datadog agent sidecar
  Auth proxy     → oauth2-proxy sidecar
  Traffic mgmt   → Envoy/Istio service mesh
  TLS/mTLS       → Istio/Linkerd service mesh
  Config mgmt    → Consul/etcd sidecar

Resource constraints?
→ Tight: Minimize sidecars, combine functionality
→ Flexible: Use specialized sidecars per concern
```

---

## Advantages

- Decouples auxiliary functionality from main service code
- Shares resources (network, storage) without code coupling
- Independent deployment and scaling of sidecars
- Technology-agnostic (sidecar can use different language/runtime)
- Reusable across services (same sidecar image)
- Consistent cross-cutting concerns across all services

---

## Disadvantages

- Increased resource consumption (each sidecar uses CPU/memory)
- More complex orchestration (more containers to manage)
- Potential resource contention (shared CPU/memory limits)
- Network latency (inter-container communication, though minimal)
- Debugging complexity (more moving parts to troubleshoot)

---

## When to Use

- Microservices architecture with shared cross-cutting concerns
- Need to add functionality without modifying main service
- Consistent logging/monitoring across services
- Service mesh deployment (Istio, Linkerd)
- Need to proxy or filter traffic to/from service

---

## When NOT to Use

- Monolithic applications (use middleware instead)
- Simple services without cross-cutting concerns
- Resource overhead is unacceptable
- Serverless environments (Lambda, Cloud Functions)
- Single-container deployments

---

## Related Patterns

- **Ambassador pattern** - Sidecar that proxies outbound requests to external services
- **Adapter pattern** - Sidecar that normalizes output formats (metrics, logs)
- See [backend-integration.md](backend-integration.md) for complete backend examples
- See [hexagonal-architecture.md](hexagonal-architecture.md) for port/adapter pattern (conceptually similar)
- See [dry-principle.md](dry-principle.md) for extracting shared cross-cutting concerns

---

## References

- [Microsoft Sidecar Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sidecar)
- [Kubernetes Sidecar Containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/)
- [Istio Service Mesh](https://istio.io/latest/docs/concepts/what-is-istio/)

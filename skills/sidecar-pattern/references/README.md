# Sidecar Pattern References

This directory contains deployment configuration examples and implementation guidance for the Sidecar pattern across Docker Compose, Kubernetes, and Istio service mesh environments, including TypeScript application-side adapter code.

## Quick Navigation

| Reference File | Topics Covered | When to Read |
|---|---|---|
| [deployment-patterns.md](deployment-patterns.md) | Shared lifecycle, shared resources (HTTP communication), Kubernetes Pod with sidecars, Docker Compose with multiple sidecars, Istio service mesh auto-injection, decision tree, advantages/disadvantages, related patterns | When adding a sidecar to a containerized service, choosing a sidecar tool, or deciding between in-process and out-of-process cross-cutting concerns |

---

## Reading Strategy

### For adding a sidecar to an existing service

1. Read main [SKILL.md](../SKILL.md) for Critical Patterns and when-to-use criteria
2. MUST read: [deployment-patterns.md](deployment-patterns.md) "Core Patterns" section for shared lifecycle and shared resources patterns, then the relevant orchestration example (Docker Compose or Kubernetes)

### For choosing the right sidecar tool

1. Read main [SKILL.md](../SKILL.md) Decision Tree
2. CHECK: [deployment-patterns.md](deployment-patterns.md) Decision Tree section for the concern-to-tool mapping (logging, monitoring, auth, traffic, TLS, config)

### For setting up a service mesh

1. Read main [SKILL.md](../SKILL.md)
2. MUST read: [deployment-patterns.md](deployment-patterns.md) "Service Mesh (Istio)" section for annotation-based auto-injection

---

## File Descriptions

### [deployment-patterns.md](deployment-patterns.md)

**Complete sidecar deployment reference covering orchestration configs and application-side integration code**

- Use cases: service mesh, logging aggregation, configuration management, security proxy, and monitoring sidecars
- Shared lifecycle: Docker Compose depends_on pattern ensuring sidecar starts with the main service
- Shared resources via HTTP: TypeScript SidecarLogger class communicating with a log sidecar over HTTP (not imported code)
- Kubernetes Pod spec: multi-container pod with log-aggregator and auth-proxy sidecars sharing an emptyDir volume
- Docker Compose multi-sidecar: order-service with log, metrics, and optional auth sidecars
- Istio service mesh: Deployment with sidecar.istio.io/inject annotation for Envoy auto-injection
- Decision tree: orchestration check, concern-to-tool mapping, and resource constraint guidance
- Related patterns: Ambassador (outbound proxy) and Adapter (output normalization) sidecar variants

---

## Cross-Reference Map

- [deployment-patterns.md](deployment-patterns.md) → supplements [SKILL.md](../SKILL.md) Critical Patterns and Example section
- Related skills: [Hexagonal Architecture](../../hexagonal-architecture/SKILL.md) (port/adapter pattern conceptually similar), [DRY Principle](../../dry-principle/SKILL.md) (extracting shared cross-cutting concerns)

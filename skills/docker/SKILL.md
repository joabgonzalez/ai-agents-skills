---
name: docker
description: "Docker patterns: multistage builds, security hardening, and compose. Trigger: When writing Dockerfiles, docker-compose, or containerizing apps."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: tooling
---

# Docker

Patterns for writing production-ready Dockerfiles and Compose configurations: minimal images, security hardening, layer caching, and health checks.

## When to Use

- Writing or reviewing a Dockerfile
- Setting up docker-compose for local dev or deployment
- Containerizing a Node.js app (examples use Node.js; patterns apply to any runtime)
- Optimizing image size or build time

Don't use for:

- Kubernetes manifests (separate concern)
- CI/CD pipeline configuration
- Cloud-specific container registries

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Multistage Builds

Separate build dependencies from the runtime image. Final image ships only what runs.

```dockerfile
# ❌ WRONG — build tools in production image (bloated, attack surface)
FROM node:20
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/server.js"]

# ✅ CORRECT — build stage discarded, runtime stage is minimal
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

### ✅ REQUIRED [CRITICAL]: Non-Root User

Containers run as root by default. A compromised container = root on the host namespace.

```dockerfile
# ❌ WRONG — runs as root
FROM node:20-alpine
WORKDIR /app
COPY . .
CMD ["node", "server.js"]

# ✅ CORRECT — dedicated non-root user
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
CMD ["node", "server.js"]
```

### ✅ REQUIRED: Pin Base Image Versions

`latest` changes without warning and breaks reproducible builds.

```dockerfile
# ❌ WRONG — unpinned, changes silently
FROM node:latest
FROM node:20-alpine

# ✅ CORRECT — pinned to digest for full reproducibility
FROM node:20.19-alpine3.21
# Or pin to digest: FROM node:20-alpine@sha256:abc123...
```

### ✅ REQUIRED: Layer Cache Order — Dependencies Before Source

Copy dependency manifests first, install, then copy source. Source changes don't bust the dep cache.

```dockerfile
# ❌ WRONG — COPY . invalidates dep cache on every source change
COPY . .
RUN npm ci

# ✅ CORRECT — dep install cached until package.json changes
COPY package*.json ./
RUN npm ci
COPY . .
```

### ✅ REQUIRED: .dockerignore

Exclude everything not needed in the build context. Prevents secrets and node_modules from leaking in.

```
# .dockerignore
node_modules
.git
.env
.env.*
dist
*.log
README.md
.DS_Store
```

### ✅ REQUIRED: Health Checks

Without a health check, orchestrators can't distinguish a crashed app from a starting one.

```dockerfile
# ✅ CORRECT — health check for HTTP service
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

### ❌ NEVER: Secrets in Dockerfile or Build Args

`ARG` values appear in image history. `ENV` is readable from any running container.

```dockerfile
# ❌ WRONG — secret baked into image layer
ARG DB_PASSWORD
ENV DB_PASSWORD=${DB_PASSWORD}

# ✅ CORRECT — secrets injected at runtime via env or secret mount
# docker run -e DB_PASSWORD=... myimage
# Or use Docker secrets / BuildKit secret mounts for build-time needs
RUN --mount=type=secret,id=db_password,target=/run/secrets/db_password \
    cat /run/secrets/db_password | do_something
```

---

## Decision Tree

```
Writing a Dockerfile for a Node.js app?
  → Multistage: builder (node:20-alpine) → runtime (node:20-alpine)
  → Layer order: COPY package*.json → RUN npm ci → COPY . .
  → Add non-root user before CMD
  → Add HEALTHCHECK

Image size too large?
  → Use alpine variant of base image
  → Multistage: only copy dist/ and prod node_modules to runtime stage
  → Run npm ci --omit=dev in runtime stage

Build slow on every code change?
  → Check layer cache order — dependencies must be copied and installed BEFORE source

Secrets needed at build time?
  → Use BuildKit --mount=type=secret (never ARG/ENV)

Secrets needed at runtime?
  → Inject via docker run -e or orchestrator secrets (never bake in image)

docker-compose for local dev?
  → Use volumes for hot reload: - ./src:/app/src
  → Override CMD for dev server
  → Add depends_on with condition: service_healthy for DB dependency

Service crashes silently in compose?
  → Missing HEALTHCHECK — add to Dockerfile
  → Add depends_on: service_healthy in compose
```

---

## Example

Production Node.js Dockerfile with multistage, non-root user, and health check.

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20.19-alpine3.21 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.19-alpine3.21 AS runtime
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml — local dev with hot reload
services:
  app:
    build: .
    ports: ["3000:3000"]
    volumes:
      - ./src:/app/src
    environment:
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: dev
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
```

---

## Edge Cases

**Alpine vs Debian:** Alpine uses musl libc — some npm packages with native bindings (sharp, canvas) require Debian-based images (`node:20-slim`). Check if `npm ci` fails on alpine before committing to it.

**Python apps:** Use `python:3.12-slim` as runtime base. Layer cache order: `COPY requirements.txt → RUN pip install --no-cache-dir -r requirements.txt → COPY . .`. Use virtual env in multistage: `python -m venv /opt/venv` in builder, `COPY --from=builder /opt/venv /opt/venv` in runtime.

**Multi-platform builds:** Use `docker buildx build --platform linux/amd64,linux/arm64` for M1/M2 Mac compatibility with AMD64 deployment targets.

**Large monorepos:** Copy only the workspace package that's being built. Use `.dockerignore` aggressively to reduce build context size.

**Read-only filesystem:** For hardened deployments, add `--read-only` at runtime and mount writable tmpfs only where needed (`/tmp`, `/var/run`).

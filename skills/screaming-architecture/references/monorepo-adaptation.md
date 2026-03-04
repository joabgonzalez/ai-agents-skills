## Core Patterns

Applying screaming architecture in a monorepo means the domain-first naming moves from `src/` subdirectories to top-level workspace packages. Each domain becomes a buildable package with explicit dependency declarations.

### Turborepo: Domain-First Package Structure

In Turborepo, the workspace mirrors the domain. Package names use the domain noun, not a technical role.

```
### Turborepo workspace layout

monorepo/
├── packages/
│   ├── users/                    # domain package — user management
│   │   ├── package.json          # name: "@acme/users"
│   │   ├── src/
│   │   │   ├── user.entity.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.service.ts
│   │   │   └── index.ts          # public API — export only what others need
│   │   └── tsconfig.json
│   ├── orders/                   # domain package — order processing
│   │   ├── package.json          # name: "@acme/orders"
│   │   ├── src/
│   │   │   ├── order.aggregate.ts
│   │   │   ├── order.repository.ts
│   │   │   ├── order.service.ts
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── payments/                 # domain package — payment processing
│   │   ├── package.json          # name: "@acme/payments"
│   │   └── src/
│   │       ├── payment.entity.ts
│   │       ├── payment.service.ts
│   │       └── index.ts
│   └── shared/                   # shared infrastructure (NOT a domain concept)
│       ├── database/
│       │   ├── package.json      # name: "@acme/database"
│       │   └── src/
│       │       ├── client.ts
│       │       └── index.ts
│       ├── logger/
│       │   ├── package.json      # name: "@acme/logger"
│       │   └── src/
│       │       └── index.ts
│       └── config/
│           ├── package.json      # name: "@acme/config"
│           └── src/
│               └── index.ts
├── apps/
│   ├── api/                      # Express/Fastify app — framework at the edge
│   │   ├── package.json          # name: "@acme/api"
│   │   └── src/
│   │       ├── main.ts
│   │       └── app.ts
│   └── web/                      # React frontend
│       ├── package.json          # name: "@acme/web"
│       └── src/
│           └── features/         # domain-first within the frontend too
│               ├── orders/
│               └── users/
├── turbo.json
└── package.json                  # workspaces: ["packages/**", "apps/**"]
```

Turborepo `turbo.json` pipeline configuration:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

The `^build` dependency means Turborepo builds domain packages before the apps that consume them, respecting the dependency graph automatically.

### Nx: Domain Boundaries via Project Tags

Nx adds explicit boundary enforcement through tags and lint rules. Tag each project with its domain and layer.

```json
// packages/orders/project.json
{
  "name": "orders",
  "tags": ["domain:orders", "type:domain"],
  "targets": {
    "build": { "executor": "@nx/js:tsc" },
    "test":  { "executor": "@nx/jest:jest" }
  }
}
```

```json
// packages/shared/database/project.json
{
  "name": "database",
  "tags": ["domain:shared", "type:infrastructure"],
  "targets": {
    "build": { "executor": "@nx/js:tsc" }
  }
}
```

```json
// apps/api/project.json
{
  "name": "api",
  "tags": ["domain:app", "type:application"],
  "targets": {
    "build": { "executor": "@nx/node:build" }
  }
}
```

Enforce boundaries in `.eslintrc.json`:

```json
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        {
          "sourceTag": "type:domain",
          "onlyDependOnLibsWithTags": ["type:domain", "type:infrastructure"]
        },
        {
          "sourceTag": "type:application",
          "onlyDependOnLibsWithTags": ["type:domain", "type:infrastructure"]
        },
        {
          "sourceTag": "domain:orders",
          "notAllowedPackageTags": ["domain:payments"]
        }
      ]
    }]
  }
}
```

This makes illegal cross-domain imports a lint error. The `orders` domain cannot import from `payments` — they must communicate through an application-layer service or a shared event contract.

### Shared Library vs Domain Package

The decision boundary: does the code know about a specific business entity?

```
Decision: shared library or domain package?

Code knows about Order, User, Payment, etc.
  → domain package (packages/orders/, packages/users/)

Code is infrastructure with no domain knowledge
  → shared library (packages/shared/database/, packages/shared/logger/)

Code is a generic TypeScript utility (format dates, parse UUIDs)
  → shared library (packages/shared/utils/)

Code is a UI design system (Button, Input, Modal)
  → shared library (packages/shared/ui/)

Code is a domain EVENT or CONTRACT between two domains
  → shared domain contract package (packages/contracts/order-events/)
    — import only the contract, not the full domain package
```

Package `package.json` dependency declarations make the rule explicit:

```json
// packages/orders/package.json — orders CAN use database infrastructure
{
  "name": "@acme/orders",
  "dependencies": {
    "@acme/database": "workspace:*",
    "@acme/logger":   "workspace:*"
  }
}
```

```json
// packages/orders/package.json — orders must NOT import from payments
// If this appeared, it would be a boundary violation:
// "@acme/payments": "workspace:*"  ← WRONG: cross-domain direct import
```

When two domains need to share a concept (e.g., `Money`, `Address`, `CustomerId`), create a contracts package:

```json
// packages/contracts/package.json
{
  "name": "@acme/contracts",
  "description": "Shared value objects and event schemas — no business logic"
}
```

### Dependency Graph Visualization

Both Turborepo and Nx include dependency graph tools. Run these to visualize domain boundaries.

```bash
# Turborepo: generate dependency graph
npx turbo run build --graph

# Turborepo: view in browser (requires @turbo/gen)
npx turbo run build --graph=graph.html && open graph.html

# Nx: interactive dependency graph in browser
npx nx graph

# Nx: show dependencies for a single project
npx nx show project orders --web
```

A healthy domain-first monorepo graph has a clear shape:

```
### Healthy dependency graph (no cycles, clear direction)

    [api]          [web]
      |               |
  [orders]        [users]     [payments]
      \               |           /
       \          [contracts]    /
        \              |        /
         +---[database]--------+
                  |
              [logger]
              [config]
```

Warning signs in the graph:

- Cycles between domain packages (`orders` → `payments` → `orders`): extract to `contracts`
- A domain package importing from an `apps/` package: flip the dependency direction
- Everything importing from a single package with 40+ files: it has become a dumping ground, split it by domain

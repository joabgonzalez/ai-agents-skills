---
name: screaming-architecture
description: "Domain-first folder structure reflecting business capabilities. Trigger: When structuring projects or refactoring toward use-case-driven boundaries."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Screaming Architecture

The top-level structure of a project should **scream its domain**, not its framework. Folder names reflect business capabilities and use cases — not technical layers like controllers, models, or services.

Coined by Robert C. Martin: "Your architecture should tell readers about the system, not about the frameworks you used."

## When to Use

- Starting a new project or service
- Refactoring a codebase grown around framework conventions
- Multiple developers struggle to locate where a business concept lives
- The folder structure reads as "Express app" or "MVC project" instead of the actual domain

Don't use for:

- Very small scripts or utilities with no meaningful domain
- Projects where the entire domain is one concept (no benefit to partitioning)

---

## Critical Patterns

### ✅ REQUIRED: Domain-First Root Structure

Top-level directories name **business capabilities**, not technical layers.

```
# ❌ WRONG: structure screams "Express MVC"
src/
├── controllers/
│   ├── orderController.ts
│   ├── userController.ts
│   └── paymentController.ts
├── models/
│   ├── order.ts
│   └── user.ts
└── services/
    └── orderService.ts

# ✅ CORRECT: structure screams "E-commerce"
src/
├── orders/
│   ├── order.entity.ts
│   ├── order.service.ts
│   ├── order.routes.ts
│   └── order.test.ts
├── users/
│   ├── user.entity.ts
│   └── user.service.ts
├── payments/
│   └── payment.service.ts
└── shared/              # cross-cutting infrastructure only
    └── database.ts
```

### ✅ REQUIRED: Feature Self-Containment

Each domain module owns all the code it needs: models, services, routes, and tests together.

```
# ✅ CORRECT: self-contained feature module
src/orders/
├── order.entity.ts          # domain model
├── order.repository.ts      # persistence interface
├── order.service.ts         # application logic
├── order.routes.ts          # HTTP handlers (framework at the edge)
├── order.dto.ts             # input/output shapes
└── order.test.ts            # tests co-located

# ❌ WRONG: tests and logic scattered across technical layers
src/
├── controllers/orderController.ts
├── services/orderService.ts
├── models/order.ts
└── tests/orderController.test.ts   # far from the code it tests
```

### ✅ REQUIRED: Frontend Feature Structure (React / Component-Based)

Same principle, different naming convention. Frontend projects use React idioms — no `.entity`, `.service`, `.route` suffixes.

```
# ❌ WRONG: organized by file type (screams "React project", not the domain)
src/
├── components/
│   ├── OrderList.tsx
│   ├── UserProfile.tsx
│   └── ProductCard.tsx
├── hooks/
│   ├── useOrders.ts
│   └── useUser.ts
└── pages/
    └── OrdersPage.tsx

# ✅ CORRECT: organized by domain (screams "e-commerce")
src/
├── features/
│   ├── orders/
│   │   ├── index.ts           ← public API — only export what other features need
│   │   ├── OrderList.tsx      ← components: PascalCase, no suffix
│   │   ├── OrderCard.tsx
│   │   ├── useOrders.ts       ← business logic: hooks with "use" prefix
│   │   ├── orderStore.ts      ← state: store/slice per feature
│   │   ├── orderApi.ts        ← data fetching: Api suffix
│   │   └── order.types.ts     ← types co-located with the feature
│   ├── users/
│   │   ├── index.ts
│   │   ├── UserProfile.tsx
│   │   └── useUser.ts
│   └── products/
├── shared/
│   ├── ui/                    ← generic UI atoms (Button, Input, Modal)
│   └── hooks/                 ← cross-cutting hooks (useDebounce, useLocalStorage)
└── app/                       ← framework at the edge: routing + providers
    ├── Router.tsx
    └── providers.tsx
```

Rules:

- Cross-feature imports must go through the feature's `index.ts` — never import internals directly
- `shared/ui/` is for generic design system components, not domain-specific ones
- `app/` contains routing and providers only — framework-specific, at the edge

### ✅ REQUIRED: Framework at the Edge

Framework-specific code lives at the outermost layer. The domain core has no framework imports.

```typescript
// ✅ CORRECT: order.entity.ts — pure domain, no Express/NestJS
export class Order {
  confirm(): void {
    if (this._items.length === 0) throw new Error('Cannot confirm empty order');
    this._status = 'confirmed';
  }
}

// ✅ CORRECT: order.routes.ts — Express lives here, not in the domain
import { Router } from 'express';
import { OrderService } from './order.service';

export function orderRouter(service: OrderService): Router {
  const router = Router();
  router.post('/:id/confirm', async (req, res) => {
    await service.confirm(req.params.id);
    res.json({ status: 'confirmed' });
  });
  return router;
}

// ❌ WRONG: framework imports inside domain entity
import { Injectable } from '@nestjs/common'; // NestJS in the domain core
@Injectable()
export class Order { ... }
```

### ✅ REQUIRED: Shared Kernel for True Cross-Cutting Concerns

Infrastructure shared across all features belongs in a dedicated `shared/` or `infrastructure/` directory — not scattered across features, and never as a dumping ground.

```
src/
├── orders/            # feature module
├── users/             # feature module
├── payments/          # feature module
└── shared/            # only truly shared infrastructure
    ├── database/
    ├── logger/
    ├── config/
    └── errors/        # base error types used everywhere
```

### ❌ NEVER: Technical Layering at Root

Organizing by technical role at the root creates a structure that says nothing about what the system does.

```
# ❌ WRONG — these are all technical roles, not business concepts
src/
├── controllers/    # What business problem? Unknown.
├── middlewares/    # What domain concept? None.
├── models/         # Which models? All of them mixed together.
├── repositories/
└── utils/          # Catch-all — the danger zone
```

### ❌ NEVER: Shared Utils Catch-All

A `utils/` or `helpers/` folder that grows without domain context becomes a second dump for everything that didn't fit elsewhere.

```typescript
// ❌ WRONG: utils.ts with unrelated concerns
export function formatDate(d: Date) { ... }
export function hashPassword(p: string) { ... }
export function calculateOrderTotal(items: Item[]) { ... }  // domain logic here?!

// ✅ CORRECT: each concern lives where it belongs
// orders/order.entity.ts → calculateTotal() method on the aggregate
// users/user.entity.ts   → hashPassword() on the User entity (or a VO)
// shared/dates.ts        → formatDate() utility (truly cross-cutting)
```

---

## Decision Tree

```
New project?
  → Start with domain-first: one folder per business capability

Existing project with technical layers at root?
  → Refactor incrementally: move one feature at a time
  → Don't big-bang rewrite: create new feature folders alongside old layers

Large domain with 20+ features?
  → Group by subdomain: orders/, catalog/, identity/, fulfillment/
  → Each subdomain is its own mini screaming architecture

Monorepo?
  → packages/orders/, packages/catalog/, packages/identity/
  → Each package is self-contained; cross-package deps are explicit

Unclear whether two concepts belong in the same module?
  → Ask: do they change together for the same business reason?
  → YES → same module
  → NO  → separate modules

Something doesn't fit anywhere?
  → Try harder to find the right domain home before adding to shared/
  → Shared/ is for infrastructure, not domain concepts
```

---

## Example

**Before**: a Node.js API organized by technical layer.

```
src/
├── controllers/
│   ├── catalogController.ts
│   ├── cartController.ts
│   └── orderController.ts
├── models/
│   ├── product.ts
│   ├── cart.ts
│   └── order.ts
├── services/
│   ├── catalogService.ts
│   ├── cartService.ts
│   └── orderService.ts
└── routes/
    └── index.ts
```

**After**: same system, screaming "e-commerce".

```
src/
├── catalog/
│   ├── product.entity.ts
│   ├── product.service.ts
│   ├── product.routes.ts
│   └── product.test.ts
├── cart/
│   ├── cart.aggregate.ts
│   ├── cart.service.ts
│   ├── cart.routes.ts
│   └── cart.test.ts
├── orders/
│   ├── order.aggregate.ts
│   ├── order.repository.ts
│   ├── order.service.ts
│   ├── order.routes.ts
│   └── order.test.ts
└── shared/
    ├── database/
    └── errors/
```

A new developer opens the project and immediately understands: "This is an e-commerce system with a catalog, cart, and order management."

---

## Edge Cases

**Framework conventions conflict with screaming architecture**: NestJS defaults to module-per-feature which aligns well. Express and Fastify have no convention — apply screaming architecture explicitly. Next.js `app/` dir routes by URL path — keep domain logic in `src/domain/` or `src/features/` separate from the routing layer.

**Shared code that's actually domain logic**: If two features share a concept (e.g., `Money` used by both `orders/` and `payments/`), it belongs in a shared domain kernel — not `utils/`. Name it `shared/domain/` or `kernel/`.

**Growing beyond 15-20 feature folders**: Group by subdomain. An e-commerce system becomes `catalog/`, `fulfillment/`, `identity/`, `payments/` — each containing their own feature sub-folders.

---

## Resources

- [clean-architecture](../clean-architecture/SKILL.md) — layering rules (screaming arch is orthogonal)
- [domain-driven-design](../domain-driven-design/SKILL.md) — bounded contexts map to top-level modules
- [hexagonal-architecture](../hexagonal-architecture/SKILL.md) — ports and adapters; framework at the edge

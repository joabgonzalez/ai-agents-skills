## Core Patterns

A safe, incremental migration from technical-first to domain-first folder structure. The key principle: never do a big-bang rewrite. Move one feature at a time while keeping the application running.

### Step 1: Audit the Existing Structure

Map every file in your technical-layer folders to its owning business capability before moving anything.

```
# Audit worksheet: identify which domain each file belongs to

controllers/orderController.ts      → orders/
controllers/userController.ts       → users/
controllers/paymentController.ts    → payments/
models/order.ts                     → orders/
models/user.ts                      → users/
services/orderService.ts            → orders/
services/cartService.ts             → cart/
repositories/orderRepository.ts     → orders/
utils/dateFormatter.ts              → shared/dates/
utils/passwordHasher.ts             → users/       (domain-specific, not truly shared)
utils/emailSender.ts                → shared/email/ (infrastructure — truly shared)
```

Goal: every file gets a domain home before the first move.

### Step 2: Create the New Structure Alongside the Old

Add domain folders without deleting anything. Both structures coexist temporarily.

```
src/
├── controllers/          # old — still works, do not delete yet
│   ├── orderController.ts
│   └── userController.ts
├── models/               # old
│   └── order.ts
├── services/             # old
│   └── orderService.ts
├── orders/               # new — empty, being populated
│   └── .gitkeep
└── users/                # new — empty, being populated
    └── .gitkeep
```

This approach keeps the application deployable at every commit.

### Step 3: Migrate One Feature at a Time

Pick the smallest, most self-contained feature first. Use the strangler fig pattern: new code goes in the domain folder, old files become thin re-exports pointing to the new location.

```typescript
// Step A: create the domain file in its new home
// src/orders/order.service.ts
export class OrderService {
  async findById(id: string): Promise<Order> { /* impl */ }
  async confirm(id: string): Promise<void>   { /* impl */ }
}

// Step B: turn the old file into a re-export (keeps imports elsewhere working)
// src/services/orderService.ts  ← OLD FILE, now a shim
export { OrderService } from '../orders/order.service';

// Step C: update all imports across the codebase to point to the new path
// Run: grep -r "from '../services/orderService'" src/ to find consumers
// Then update each import one PR at a time

// Step D: delete the shim after all consumers are updated
```

### Step 4: Handle Shared Utilities During Migration

Classify each utility before moving it. Three categories:

```
Category 1 — Domain-specific (move INTO the feature):
  utils/passwordHasher.ts  → users/password.ts
  utils/orderTotals.ts     → orders/order.entity.ts (method on the aggregate)

Category 2 — Truly cross-cutting infrastructure (move to shared/):
  utils/logger.ts          → shared/logger/index.ts
  utils/httpClient.ts      → shared/http/index.ts
  utils/config.ts          → shared/config/index.ts

Category 3 — Generic helpers (keep in shared/, rename clearly):
  utils/dateFormatter.ts   → shared/dates/format.ts
  utils/crypto.ts          → shared/crypto/hash.ts
```

Rule: if a utility knows about a domain concept (Order, User, Payment), it is domain logic, not a utility.

### Step 5: Resolve Cross-Cutting Concerns

Cross-cutting concerns (logging, auth, DB connection, config) need explicit homes before features can be truly self-contained.

```
src/
└── shared/                         # infrastructure layer — never domain logic here
    ├── database/
    │   ├── connection.ts            # DB client singleton
    │   └── base-repository.ts      # abstract CRUD helper
    ├── logger/
    │   └── index.ts                 # structured logger instance
    ├── config/
    │   └── index.ts                 # env var loading and validation
    ├── errors/
    │   ├── base.error.ts            # AppError base class
    │   ├── not-found.error.ts
    │   └── validation.error.ts
    └── middleware/                  # HTTP middleware shared across features
        ├── auth.middleware.ts
        └── rate-limit.middleware.ts
```

Never put business logic in `shared/`. If code in `shared/` starts knowing about Orders or Users, it belongs in that feature.

### Step 6: Git Strategy for Large-Scale Reorganization

Big-bang folder moves cause merge conflicts and make PRs impossible to review. Use this branching strategy instead.

```
# Branch strategy: one feature per PR

main
└── feat/domain-orders          # PR 1: migrate orders feature
    └── feat/domain-users       # PR 2: migrate users feature (stacked on main)
        └── feat/domain-payments # PR 3: migrate payments (stacked on main)

# Each PR contains:
# 1. New domain folder with migrated files
# 2. Shims in old locations (backward-compatible re-exports)
# 3. Updated imports in files that consume the migrated feature
# 4. Tests confirming the feature still works

# Cleanup PR (after all features migrated):
feat/remove-technical-layers
# Deletes controllers/, services/, models/, repositories/ folders
# Removes all shims
# One final PR — easy to review because all it does is delete dead code
```

Avoid `git mv` for entire directories when files also change content — reviewers cannot see both the move and the edit in the same diff. Instead: copy file to new location with content changes, then delete the old file in a separate commit.

### Before/After: Monolith to Domain-First

Complete transformation of a Node.js/Express e-commerce backend.

```
### Before: technical layers at root

src/
├── controllers/
│   ├── catalogController.ts    # GET /products, GET /products/:id
│   ├── cartController.ts       # POST /cart/items, DELETE /cart/items/:id
│   ├── orderController.ts      # POST /orders, GET /orders/:id
│   └── userController.ts       # POST /users, GET /users/me
├── models/
│   ├── product.ts
│   ├── cart.ts
│   ├── cartItem.ts
│   ├── order.ts
│   └── user.ts
├── services/
│   ├── catalogService.ts
│   ├── cartService.ts
│   ├── orderService.ts
│   ├── emailService.ts         # used by orders AND users
│   └── userService.ts
├── repositories/
│   ├── productRepository.ts
│   ├── cartRepository.ts
│   ├── orderRepository.ts
│   └── userRepository.ts
├── middleware/
│   ├── auth.ts
│   └── validate.ts
├── routes/
│   └── index.ts
└── utils/
    ├── dateFormat.ts
    ├── passwordHash.ts
    └── orderCalculator.ts
```

```
### After: domain-first structure

src/
├── catalog/
│   ├── product.entity.ts        # was: models/product.ts
│   ├── product.repository.ts    # was: repositories/productRepository.ts
│   ├── catalog.service.ts       # was: services/catalogService.ts
│   ├── catalog.routes.ts        # was: controllers/catalogController.ts
│   └── catalog.test.ts
├── cart/
│   ├── cart.aggregate.ts        # was: models/cart.ts + cartItem.ts
│   ├── cart.repository.ts       # was: repositories/cartRepository.ts
│   ├── cart.service.ts          # was: services/cartService.ts
│   ├── cart.routes.ts           # was: controllers/cartController.ts
│   └── cart.test.ts
├── orders/
│   ├── order.aggregate.ts       # was: models/order.ts
│   ├── order.repository.ts      # was: repositories/orderRepository.ts
│   ├── order.service.ts         # was: services/orderService.ts
│   │                            #   + orderCalculator moved INTO this service
│   ├── order.routes.ts          # was: controllers/orderController.ts
│   └── order.test.ts
├── users/
│   ├── user.entity.ts           # was: models/user.ts
│   │                            #   + passwordHash moved INTO this entity
│   ├── user.repository.ts       # was: repositories/userRepository.ts
│   ├── user.service.ts          # was: services/userService.ts
│   ├── user.routes.ts           # was: controllers/userController.ts
│   └── user.test.ts
└── shared/
    ├── database/
    │   └── connection.ts
    ├── email/
    │   └── email.service.ts     # was: services/emailService.ts (truly shared)
    ├── errors/
    │   └── base.error.ts
    ├── middleware/
    │   ├── auth.ts              # was: middleware/auth.ts
    │   └── validate.ts          # was: middleware/validate.ts
    └── dates/
        └── format.ts            # was: utils/dateFormat.ts
```

Result: a new developer opens the project and sees `catalog/`, `cart/`, `orders/`, `users/` — immediately understanding the business without reading a single line of code.

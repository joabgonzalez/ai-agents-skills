# Import Organization

> Rules for grouping, ordering, and typing imports.

## Core Patterns

- Import Grouping Order
- Patterns
- Common Pitfalls
- Related Topics

---

## Import Grouping Order

Group imports in this order, with blank lines between groups:

```typescript
// 1. External libraries (node_modules)
import React, { useState, useEffect } from "react";
import { Button, TextField } from "@mui/material";

// 2. Internal modules (project code)
import { UserService } from "./services/UserService";
import { formatDate } from "./utils/date";
import { OrderList } from "./components/OrderList";

// 3. Types (always last)
import type { User, UserRole } from "./types";
import type { Order } from "./domain/entities/Order";
```

---

## Patterns

### ✅ REQUIRED: Named Imports Over Namespace

```typescript
// ✅ CORRECT: Named imports — explicit, tree-shakeable
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { load, dump } from 'js-yaml';

// ❌ WRONG: Namespace import when only using a few exports
import * as fs from 'fs';       // Only using readFileSync
import * as path from 'path';   // Only using join

// ✅ EXCEPTION: Namespace import OK when using 6+ exports
import * as p from '@clack/prompts'; // uses intro, spinner, select, multiselect, confirm, cancel, note, log
```

**Rule**: Named imports for <6 exports, namespace OK for 6+ exports.

### ✅ REQUIRED: Separate Type Imports

```typescript
// ✅ CORRECT: import type for type-only imports
import { UserService } from './services/UserService';
import type { User, UserRole } from './types';

// ✅ CORRECT: Inline type import when mixing values and types
import { Installer, type Model } from '../core/installer';

// ❌ WRONG: Importing types as values (emits unnecessary JS)
import { User, UserRole } from './types';
```

**Why**: `import type` is erased at compile time, reducing bundle size and preventing circular dependency issues.

### ✅ REQUIRED: Prefer Static Imports

```typescript
// ✅ CORRECT: Static import at module top
import fs from 'fs';
import { load } from 'js-yaml';

// ❌ WRONG: Dynamic import when static works
async function doWork() {
  const fs = await import('fs');   // unnecessary
  const yaml = require('js-yaml'); // CJS require in TS
}

// ✅ EXCEPTION: Dynamic import OK for code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### ✅ REQUIRED: No Unused Imports

```typescript
// ❌ WRONG: Import never used
import { something } from './lib'; // never referenced

// ✅ CORRECT: Every import is used
import { needed } from './lib';
const count = needed();
```

### Alphabetical Within Groups (Recommended)

```typescript
// ✅ PREFERRED: Alphabetical within each group
import { Button } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

import { formatDate } from "./utils/date";
import { UserService } from "./services/UserService";

import type { Order } from "./types/Order";
import type { User } from "./types/User";
```

---

## Common Pitfalls

**Circular dependencies**: If module A imports from B and B imports from A → extract shared types to a third module.

**Barrel exports (index.ts)**: Useful for public API, but avoid deep nesting. Re-export only what consumers need.

```typescript
// ✅ CORRECT: Selective barrel export
// components/index.ts
export { UserProfile } from './UserProfile';
export { OrderList } from './OrderList';

// ❌ WRONG: Export everything
export * from './UserProfile';
export * from './OrderList';
export * from './internal/helpers'; // Don't expose internals
```

---

## Related Topics

- See main [SKILL.md](../SKILL.md) for quick reference
- See [code-structure.md](code-structure.md) for file/folder patterns
- Linting tools enforce import ordering automatically — see [code-quality](../../code-quality/SKILL.md)

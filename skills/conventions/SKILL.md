---
name: conventions
description: "General coding conventions and best practices shared across technologies. Trigger: When writing code, establishing project structure, or defining conventions."
license: "Apache 2.0"
metadata:
  version: "1.0"
  allowed-tools:
    - file-reader
---

# Coding Conventions Skill

## Overview

This skill centralizes general coding conventions and best practices that apply across multiple technologies and frameworks. It covers code organization, documentation, naming, and type import strategies.

## Objective

Ensure consistent coding practices across the codebase regardless of technology stack. This skill delegates technology-specific conventions to their respective skills (e.g., TypeScript, React, MUI).

---

## When to Use

Use this skill when:

- Establishing general code organization patterns
- Defining naming conventions across technologies
- Setting up documentation standards
- Creating project structure guidelines
- Reviewing code for general best practices

Don't use this skill for:

- Technology-specific patterns (use typescript, react, etc.)
- Accessibility rules (use a11y skill)
- Framework-specific conventions (use framework skill)
- **Architecture patterns** (use [architecture-patterns](../architecture-patterns/SKILL.md) when project already uses SOLID, Clean Architecture, DDD)

---

## Critical Patterns

### ✅ REQUIRED: Consistent Naming Conventions

```typescript
// ✅ CORRECT: Proper naming by type
const userId = 123; // camelCase for variables
function getUserData() {} // camelCase for functions
class UserService {} // PascalCase for classes
const MAX_RETRY_COUNT = 3; // UPPER_SNAKE_CASE for constants

// ❌ WRONG: Inconsistent naming
const UserID = 123; // Wrong case
function GetUserData() {} // Wrong case
class userService {} // Wrong case
const maxRetryCount = 3; // Wrong case for constant
```

### ✅ REQUIRED: Group and Organize Imports

```typescript
// ✅ CORRECT: Grouped imports
// External libraries
import React from "react";
import { Button } from "@mui/material";

// Internal modules
import { UserService } from "./services/UserService";
import { formatDate } from "./utils/date";

// Types
import type { User } from "./types";

// ❌ WRONG: Random import order
import type { User } from "./types";
import { formatDate } from "./utils/date";
import React from "react";
import { Button } from "@mui/material";
```

### ✅ REQUIRED: Single Responsibility Principle

```typescript
// ✅ CORRECT: Each file has one clear purpose
// UserService.ts - handles user operations
// UserValidator.ts - validates user data
// UserTypes.ts - defines user types

// ❌ WRONG: Everything in one file
// utils.ts - contains validation, API calls, formatting, types...
```

### ✅ REQUIRED: Named Imports Over Namespace Imports

```typescript
// ✅ CORRECT: Named imports — explicit, tree-shakeable
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { load, dump } from 'js-yaml';

// ❌ WRONG: Namespace import when only using a few exports
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// ✅ EXCEPTION: Namespace import OK when using many exports (6+)
import * as p from '@clack/prompts'; // uses intro, spinner, select, multiselect, confirm, cancel, note, log, outro
```

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

### ✅ REQUIRED: No Dead Code

```typescript
// ❌ WRONG: Unused variables, imports, functions
import { something } from './lib'; // never used
const unused = 42;
function neverCalled() {}

// ✅ CORRECT: Every import, variable, and function is used
import { needed } from './lib';
const count = needed();
```

### ✅ REQUIRED: No `any` Type

```typescript
// ❌ WRONG: Disables type safety
function process(data: any) { return data.value; }
let presetInfo: any = null;

// ✅ CORRECT: Use specific types or unknown
function process(data: unknown) { /* narrow with guards */ }
let presetInfo: PresetInfo | null = null;
```

### ✅ REQUIRED: Avoid Variable Shadowing

```typescript
// ❌ WRONG: inner `p` shadows outer import
import * as p from '@clack/prompts';
const result = items.find(p => p.id === selected); // shadows p

// ✅ CORRECT: Use distinct names
import * as p from '@clack/prompts';
const result = items.find(item => item.id === selected);
```

### ✅ REQUIRED: Prefer Static Imports

```typescript
// ❌ WRONG: Dynamic import/require when static works
async function doWork() {
  const fs = await import('fs');   // unnecessary dynamic import
  const yaml = require('js-yaml'); // CJS require in TS
}

// ✅ CORRECT: Static import at module top
import fs from 'fs';
import { load } from 'js-yaml';
```

---

## Conventions

### Code Organization

- Group related imports together (external libraries, internal modules, types)
- Use consistent file/folder structure within projects
- Separate business logic from UI components
- Follow single responsibility principle for files and functions
- Remove dead code (unused imports, variables, functions)
- Prefer static imports over dynamic require/import
- Use `import type` for type-only imports

### Documentation

- Add JSDoc comments for exported functions, classes, and interfaces
- Document complex logic with inline comments
- Keep README files updated with setup instructions and architecture notes
- Use descriptive variable and function names that reduce need for comments

### Naming

- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that reveal intent

### Type Imports

- Import types separately using `import type` when supported
- Keep type imports organized and grouped
- Avoid circular dependencies in type definitions

## Decision Tree

**New component or file?** → Check naming conventions (camelCase/PascalCase/UPPER_SNAKE_CASE), place in appropriate directory structure.

**Adding imports?** → Group by category: external libraries first, internal modules second, types last. Use `import type` for TypeScript.

**Complex logic?** → Add inline comments for "why", not "what". Refactor if complexity exceeds file responsibility.

**Naming unclear?** → Use descriptive names that reveal intent. Avoid abbreviations unless widely known (e.g., `userId` OK, `usrId` not OK).

**Cross-file logic?** → Extract to shared utility/service. Avoid circular dependencies by separating interfaces from implementations.

**Technology-specific convention?** → Delegate to specific skill (typescript, react, mui, etc.). This skill only covers cross-technology patterns.

**Documentation needed?** → Add JSDoc for public APIs, inline comments for complex logic, update README for architectural changes.

**Importing types only?** → Use `import type { ... }` or inline `type` keyword.

**Using <6 exports from a module?** → Named imports: `import { x, y } from 'mod'`.

**Using 6+ exports from a module?** → Namespace import OK: `import * as mod from 'mod'`.

**Unused import/variable/function?** → Delete it. No dead code.

**Variable name conflicts with outer scope?** → Rename to avoid shadowing.

---

## Edge Cases

**Abbreviations:** Use well-known abbreviations (HTTP, API, URL, ID) but avoid custom ones. `userId` is OK, `usrId` is not.

**Acronyms in names:** Treat as words: `HttpService` not `HTTPService`, `apiKey` not `aPIKey`.

**File naming:** Match export name: `UserService.ts` exports `UserService`, `index.ts` for barrel exports.

**Boolean naming:** Use `is`, `has`, `should` prefixes: `isActive`, `hasPermission`, `shouldRender`.

**Callback naming:** Use `handle` or `on` prefix: `handleClick`, `onSubmit`.

---

## References

- Individual technology skills for specific conventions
- Project-specific style guides

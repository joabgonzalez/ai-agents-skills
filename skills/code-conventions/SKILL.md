---
name: code-conventions
description: "Universal naming, structure, and organization conventions. Trigger: When establishing coding standards or reviewing conventions across any technology."
license: "Apache 2.0"
metadata:
  version: "2.0"
  type: universal
  allowed-tools:
    - file-reader
---

# Code Conventions

Universal meta-conventions: naming, file structure, code organization. Rules that apply regardless of language or framework. Tech-specific conventions live in their respective skills.

## When to Use

- Naming variables, functions, classes, files across any technology
- Organizing code structure and project layout
- Reviewing code for general best practices
- Establishing cross-project standards

Don't use for:

- TypeScript-specific patterns (import type, no any) → use typescript skill
- Framework-specific patterns (hooks, JSX) → use react/vue/etc skill
- Accessibility → a11y skill
- Architecture decisions → architecture-patterns skill
- Linting/formatting tools → code-quality skill

---

## Critical Patterns

> Universal rules only. TypeScript/JS-specific patterns (import type, no any, static imports) → see **typescript** skill.

### ✅ REQUIRED: Consistent Naming

Apply across any language:

```
Variables/functions: camelCase  → userId, getUserData
Classes/components:  PascalCase → UserService, LoginForm
Constants:           UPPER_SNAKE_CASE → MAX_RETRY_COUNT
Files (non-component): kebab-case → user-service.ts, api-client.ts
Files (components):  PascalCase → UserCard.tsx, LoginForm.vue
```

**Booleans:** `is`, `has`, `should` prefixes (`isActive`, `hasPermission`).

**Callbacks:** `handle` or `on` prefix (`handleClick`, `onSubmit`).

**Abbreviations:** Well-known OK (HTTP, API, URL, ID). Avoid custom (`userId` OK, `usrId` not).

**Acronyms:** Treat as words (`HttpService` not `HTTPService`, `apiKey` not `aPIKey`).

### ✅ REQUIRED: Single Responsibility per File

```
✅ UserService.ts   → handles user CRUD operations only
✅ UserValidator.ts → validates user data only
✅ UserTypes.ts     → defines user types only

❌ utils.ts         → validation + API calls + formatting + types (too many responsibilities)
```

**Rule:** File name = single, clear responsibility. If you can't name it clearly, it does too much.

### ✅ REQUIRED: No Dead Code

```
❌ Unused import → delete it
❌ Unused variable → delete it
❌ Commented-out code → delete it (use git history instead)
❌ Unreachable code after return → delete it

✅ Every import, variable, and function has an active caller
```

### ✅ REQUIRED: Avoid Variable Shadowing

```javascript
// ❌ WRONG: inner variable shadows outer
const items = [...];
const result = items.find(items => items.id === id); // 'items' shadows outer

// ✅ CORRECT: distinct names
const items = [...];
const result = items.find(item => item.id === id);
```

**Rule:** Inner scope names must not shadow outer scope names.

### DELEGATE: Import Organization (TypeScript/JS)

For `import type`, named vs namespace imports, barrel exports → see **typescript** or **javascript** skill.

```
external libraries first → internal modules → types last
```

---

## Decision Tree

```
Is this convention universal (any language/framework)?
  → YES: Belongs here
    Naming (camelCase, PascalCase, UPPER_SNAKE_CASE)
    File responsibility (SRP)
    No dead code
    Variable shadowing

  → NO: Belongs in technology-specific skill
    TypeScript specifics (import type, no any, type safety) → typescript skill
    Import organization details                              → typescript/javascript skill
    React/Vue/Svelte patterns                               → framework skill
    Linting/formatting tools                                → code-quality skill
    Architecture decisions                                  → architecture-patterns skill
    Accessibility                                           → a11y skill
```

**Quick reference:**

- Naming a variable/function? → camelCase
- Naming a class/component? → PascalCase
- Naming a constant? → UPPER_SNAKE_CASE
- Naming a file? → kebab-case (non-component), PascalCase (component)
- File has too many responsibilities? → Split by SRP
- Unused import/variable/function? → Delete it
- Variable name conflicts with outer scope? → Rename to avoid shadowing
- TypeScript-specific question? → See typescript skill

---

## Example

Naming and structure conventions applied to a user authentication module.

```
src/
├── auth/
│   ├── auth.service.ts        # kebab-case file; single responsibility: orchestrates auth
│   ├── auth.validator.ts      # single responsibility: input validation only
│   ├── auth.types.ts          # single responsibility: type definitions only
│   └── AuthForm.tsx           # PascalCase: React component
```

```typescript
// auth.service.ts — all names follow conventions
const MAX_LOGIN_ATTEMPTS = 5;          // UPPER_SNAKE_CASE constant

class AuthService {                    // PascalCase class
  async loginUser(userId: string): Promise<AuthToken> {  // camelCase method + param
    const isLocked = await this.isAccountLocked(userId); // boolean: "is" prefix
    if (isLocked) throw new AccountLockedError();
    // ...
  }

  private isAccountLocked(userId: string): Promise<boolean> {}  // camelCase, boolean prefix
}

// auth.validator.ts — no dead code, no shadowing
function validateLoginInput(input: LoginInput): ValidationResult {
  const { email, password } = input;
  // ✅ `email` and `password` don't shadow outer scope names
  if (!email.includes("@")) return { valid: false, error: "Invalid email" };
  if (password.length < 8)  return { valid: false, error: "Password too short" };
  return { valid: true };
}
```

Every file has one clear name that matches its single responsibility. No `utils.ts`, no shadowed variables, no commented-out code.

---

## Edge Cases

**File naming conflicts:** Match export name (`UserService.ts` exports `UserService`). Use `index.ts` for barrel exports.

**Shared utilities:** A file named `utils.ts` with 10+ unrelated helpers violates SRP. Split by domain (`dateUtils.ts`, `stringUtils.ts`).

**Dead code in tests:** Test helpers are used by tests. Not dead code. Only delete helpers with zero test callers.

**Shadowing in destructuring:** `const { id } = user; const { id } = item;` — avoid repeated names in same scope. Rename: `const { id: userId } = user;`

---

## Resources

- [naming-conventions.md](references/naming-conventions.md) — Boolean prefixes, acronyms, descriptive names
- [code-structure.md](references/code-structure.md) — SRP for files, feature vs layer grouping, colocation
- [documentation-standards.md](references/documentation-standards.md) — JSDoc, inline comments, README guidelines

**TypeScript-specific conventions** (import type, no any, static imports) → [typescript](../typescript/SKILL.md)

Related: [code-quality](../code-quality/SKILL.md), [architecture-patterns](../architecture-patterns/SKILL.md)

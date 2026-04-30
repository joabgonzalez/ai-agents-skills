---
name: code-conventions
description: "Universal coding principles: DRY, security by default, null guards, and YAGNI. Trigger: When writing or reviewing code in any language or technology."
license: "Apache 2.0"
metadata:
  version: "3.0"
  type: universal
  allowed-tools:
    - file-reader
---

# Code Conventions

Universal coding principles and meta-conventions: how to write clean, secure, and robust code regardless of language or framework. Covers naming, file structure, organization, and active quality principles. Tech-specific conventions live in their respective skills.

## When to Use

- Writing new functions, classes, or modules in any language
- Applying quality principles during code generation
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

### ✅ REQUIRED: DRY — No Duplicate Logic

Before writing new logic, check if it already exists. Extract when the same logic appears in 2+ places.

```typescript
// ❌ WRONG: same validation duplicated
function createUser(email: string) {
  if (!email.includes("@")) throw new Error("Invalid email")
}
function updateUser(email: string) {
  if (!email.includes("@")) throw new Error("Invalid email")
}

// ✅ CORRECT: extracted once
function validateEmail(email: string) {
  if (!email.includes("@")) throw new Error("Invalid email")
}
function createUser(email: string) { validateEmail(email) }
function updateUser(email: string) { validateEmail(email) }
```

```javascript
// ❌ WRONG: formatting logic copy-pasted in 3 components
const price = `$${(amount / 100).toFixed(2)}`  // in CartItem
const price = `$${(amount / 100).toFixed(2)}`  // in OrderSummary
const price = `$${(amount / 100).toFixed(2)}`  // in Invoice

// ✅ CORRECT: one utility
const formatPrice = (amount) => `$${(amount / 100).toFixed(2)}`
```

### ✅ REQUIRED: Security by Default (Non-Negotiable)

These rules are inviolable — never produce code that violates them.

```typescript
// ❌ WRONG: user input concatenated into query
const rows = await db.query(`SELECT * FROM users WHERE id = ${userId}`)

// ✅ CORRECT: parameterized
const rows = await db.query("SELECT * FROM users WHERE id = $1", [userId])

// ❌ WRONG: hardcoded secret
const apiKey = "sk-1234abcd"

// ✅ CORRECT: from environment
const apiKey = process.env.API_KEY

// ❌ WRONG: state-changing endpoint with no auth check
app.post("/admin/delete-user", async (req, res) => {
  await deleteUser(req.body.userId)
})

// ✅ CORRECT: auth check before action
app.post("/admin/delete-user", requireAdmin, async (req, res) => {
  await deleteUser(req.body.userId)
})
```

```javascript
// ❌ WRONG: shell command with user input (command injection)
exec(`convert ${req.query.file} output.pdf`)

// ✅ CORRECT: validated and escaped
const safeName = path.basename(req.query.file)
execFile("convert", [safeName, "output.pdf"])
```

Rules:
- Never concatenate external input into queries or shell commands
- Never hardcode secrets, tokens, or credentials in source
- Validate all external input at the system boundary, not in inner layers
- State-changing endpoints require an auth check

### ✅ REQUIRED: Robustness — Fail Fast, No Swallow

```typescript
// ❌ WRONG: null dereference without guard
function getUsername(user: User | null) {
  return user.name
}

// ✅ CORRECT: guard at entry
function getUsername(user: User | null): string {
  if (user === null) throw new Error("User is required")
  return user.name
}

// ❌ WRONG: exception silenced
try {
  await sendEmail(user)
} catch (e) {}

// ✅ CORRECT: fail fast with context
try {
  await sendEmail(user)
} catch (e) {
  logger.error("Failed to send email", { userId: user.id, error: e })
  throw e
}
```

```javascript
// ❌ WRONG: deeply nested happy-path, no early return
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.payment) {
        return charge(order)
      }
    }
  }
}

// ✅ CORRECT: fail fast with early returns
function processOrder(order) {
  if (!order) throw new Error("Order is required")
  if (order.items.length === 0) throw new Error("Order has no items")
  if (!order.payment) throw new Error("Payment method missing")
  return charge(order)
}
```

### ✅ REQUIRED: YAGNI — Don't Build What Isn't Needed Today

```typescript
// ❌ WRONG: abstraction for a hypothetical future
class UserRepositoryFactory {
  create(type: "postgres" | "mysql" | "mongo") { ... }  // only postgres exists
}

// ✅ CORRECT: implement what exists now
class UserRepository {
  async findById(id: string): Promise<User> { ... }
}
```

Signals of YAGNI violation:
- Config parameters with only one possible value today
- Abstractions for "when we eventually need X"
- Commented-out code "just in case"
- Feature flags for unplanned functionality

---

## Decision Tree

```
Is this convention universal (any language/framework)?
  → YES: Belongs here
    Naming (camelCase, PascalCase, UPPER_SNAKE_CASE)
    File responsibility (SRP)
    No dead code
    Variable shadowing
    DRY, Security, Robustness, YAGNI

  → NO: Belongs in technology-specific skill
    TypeScript specifics (import type, no any, type safety) → typescript skill
    Import organization details                              → typescript/javascript skill
    React/Vue/Svelte patterns                               → framework skill
    Linting/formatting tools                                → code-quality skill
    Architecture decisions                                  → architecture-patterns skill
    Accessibility                                           → a11y skill

Writing new code?
  → Logic already exists in codebase?
    → YES: reuse it (DRY)
    → NO: proceed
  → Touches external input (user, API, file)?
    → YES: validate at boundary, parameterize queries
    → NO: proceed
  → Value could be null or undefined?
    → YES: guard at function entry, fail fast on invalid state
    → NO: proceed
  → Adding abstraction or configuration?
    → Needed today with a real use case?
      → YES: implement
      → NO: YAGNI — skip
  → Catching an exception?
    → Log with context and re-throw — never swallow silently
```

**Quick reference:**

- Naming a variable/function? → camelCase
- Naming a class/component? → PascalCase
- Naming a constant? → UPPER_SNAKE_CASE
- Naming a file? → kebab-case (non-component), PascalCase (component)
- File has too many responsibilities? → Split by SRP
- Unused import/variable/function? → Delete it
- Variable name conflicts with outer scope? → Rename to avoid shadowing
- Logic duplicated in 2+ places? → Extract (DRY)
- Input from user, API, or file? → Validate at boundary, parameterize queries
- Value could be null? → Guard at entry, fail fast
- Building for a future use case? → YAGNI — don't
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

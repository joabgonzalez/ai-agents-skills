# Naming Conventions

> Consistent naming rules for variables, functions, classes, files, and constants.

## Core Patterns

- Core Rules
- Patterns
- Related Topics

---

## Core Rules

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `userId`, `isActive`, `orderItems` |
| Functions | camelCase | `getUserData()`, `handleSubmit()` |
| Classes | PascalCase | `UserService`, `OrderRepository` |
| Components | PascalCase | `UserProfile`, `CheckoutButton` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Files | Match export | `UserService.ts`, `orderUtils.ts` |
| Directories | lowercase-with-hyphens | `user-management/`, `order-service/` |
| Interfaces | PascalCase (I prefix for ports) | `IUserRepository`, `IPaymentGateway` |
| Types | PascalCase | `UserRole`, `OrderStatus` |
| Enums | PascalCase (members UPPER_SNAKE_CASE) | `enum Status { ACTIVE, INACTIVE }` |

---

## Patterns

### ✅ REQUIRED: Descriptive Names Revealing Intent

```typescript
// ✅ CORRECT: Clear intent
const activeUserCount = users.filter(u => u.isActive).length;
function calculateOrderTotal(items: OrderItem[]): number { /* ... */ }
const isEligibleForDiscount = order.total > 100;

// ❌ WRONG: Cryptic or abbreviated
const cnt = users.filter(u => u.a).length;
function calc(items: any[]): number { /* ... */ }
const flag = order.total > 100;
```

### ✅ REQUIRED: Boolean Prefixes

```typescript
// ✅ CORRECT: is/has/should/can prefixes
const isActive = true;
const hasPermission = user.role === 'admin';
const shouldRender = items.length > 0;
const canEdit = isOwner && !isLocked;

// ❌ WRONG: No prefix (ambiguous)
const active = true;      // Is it a function? A component?
const permission = true;  // What about permission?
```

### ✅ REQUIRED: Event Handler Prefixes

```typescript
// ✅ CORRECT: handle/on prefixes
function handleClick() { /* ... */ }
function handleSubmit(data: FormData) { /* ... */ }
<Button onClick={handleClick} onSubmit={handleSubmit} />

// Props use "on" prefix
interface Props {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
}
```

### ✅ REQUIRED: Acronym Treatment

Treat acronyms as words in camelCase/PascalCase:

```typescript
// ✅ CORRECT: Acronyms as words
const httpClient = new HttpClient();
const apiKey = process.env.API_KEY;
class XmlParser {}
function getHtmlContent() {}

// ❌ WRONG: All-caps acronyms break readability
const HTTPClient = new HTTPClient();
const APIKey = process.env.API_KEY;
class XMLParser {}
function getHTMLContent() {}
```

### ✅ REQUIRED: Well-Known Abbreviations Only

```typescript
// ✅ OK: Widely understood abbreviations
const userId = 123;     // ID is universal
const apiUrl = '...';   // URL, API are universal
const httpMethod = 'GET'; // HTTP is universal

// ❌ WRONG: Custom abbreviations
const usrId = 123;      // What's "usr"?
const ordTtl = 50;      // What's "ord" or "ttl"?
const btnClk = () => {};// Unreadable
```

### ✅ REQUIRED: File Naming Matches Exports

```typescript
// ✅ CORRECT: File name matches primary export
// UserService.ts → exports class UserService
// orderUtils.ts → exports multiple order utility functions
// types.ts → exports types only
// index.ts → barrel exports

// ❌ WRONG: Misleading file names
// utils.ts → contains UserService class
// helpers.ts → contains 15 unrelated functions
```

---

## Related Topics

- See main [SKILL.md](../SKILL.md) for quick reference
- See [code-structure.md](code-structure.md) for file/folder organization
- Technology-specific naming: React components, Redux slices, etc. belong in respective skills

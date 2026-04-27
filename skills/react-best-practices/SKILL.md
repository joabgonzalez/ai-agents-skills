---
name: react-best-practices
description: "React quality patterns for component design, state location, and code review. Trigger: When reviewing React code quality or component architecture."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# React Best Practices

Quality patterns for React component design, state architecture, and performance. Complements the `react` skill (which covers correctness) — this skill covers design decisions.

## When to Use

- Reviewing a React codebase for quality, not just correctness
- Deciding whether to split a component or lift state
- Evaluating prop API design before a PR merges
- Diagnosing unnecessary re-renders or premature optimization

Don't use for:

- Hooks rules or useEffect dependencies (use react)
- TypeScript annotations (use typescript)
- Redux patterns (use redux-toolkit)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Single Responsibility Components

If you can't describe a component in one noun phrase without "and" — split it.

```tsx
// ❌ WRONG — fetches, formats, renders table, handles modal
function UserDashboard() { /* 300 lines */ }

// ✅ CORRECT — each component has one job
function UserDashboard() {
  const { users } = useUserData();
  return <UserTable users={users} />;
}
```

### ✅ REQUIRED: Prop Count Signal

3–5 props: fine. 6+: smell. 8+: split trigger.

```tsx
// ❌ WRONG — god component (11 props)
<Card title name avatar bio followers following isVerified isPremium onClick />

// ✅ CORRECT — pass structured data
<Card user={user} onSelect={onClick} />
```

### ❌ NEVER: Boolean Prop Trap

Mutually exclusive booleans signal a missing variant prop.

```tsx
// ❌ WRONG — impossible states (primary + secondary both true?)
<Button primary secondary loading disabled />

// ✅ CORRECT — explicit state model
<Button variant="primary" state="loading" />
```

### ✅ REQUIRED: State Location Ladder

State lives at the lowest common ancestor. Escalate only when needed.

```
local state → lift to parent → Context → global store
```

```tsx
// ❌ WRONG — global store for UI toggle local to one component
dispatch(setModalOpen(true));

// ✅ CORRECT — local state for local concern
const [isOpen, setIsOpen] = useState(false);
```

### ✅ REQUIRED: Test Behavior, Not Implementation

Test what the user sees and does. If a no-behavior-change refactor breaks the test, the test is wrong.

```tsx
// ❌ WRONG — tests implementation details
expect(useUserStore.getState().count).toBe(1);

// ✅ CORRECT — tests user-visible outcome
expect(screen.getByText('1 item in cart')).toBeInTheDocument();
```

### ❌ NEVER: Premature Memo/Callback

useMemo and useCallback have overhead. Profile before optimizing.

```tsx
// ❌ WRONG — wrapping everything preemptively
const handleClick = useCallback(() => doThing(), []); // no deps, no benefit

// ✅ CORRECT — memoize only after profiling shows a problem
```

### ❌ NEVER: Inline Object/Array Props

New reference on every render breaks memo and triggers child re-renders.

```tsx
// ❌ WRONG — new object reference every render
<Chart config={{ color: 'red', size: 'lg' }} />

// ✅ CORRECT — stable reference
const chartConfig = { color: 'red', size: 'lg' };
<Chart config={chartConfig} />
```

### Symptom → Solution

| Symptom | Cause | Fix |
|---------|-------|-----|
| Props passed through 3+ components | State too high or not co-located | Context or co-locate state |
| Component file > 200 lines | Too many responsibilities | Split by responsibility |
| useEffect with fetch + transform | Logic mixed with lifecycle | Extract to custom hook |
| Test breaks on behavior-neutral refactor | Tests implementation | Rewrite against user behavior |
| Re-render on every parent render | Inline object/array prop | Extract to constant or useMemo |
| Component named "Manager" or "Handler" | Too many responsibilities | Split by single concern |

---

## Decision Tree

```
Component > 150 lines?
  → Check single responsibility — can you describe it without "and"?
  → Yes: split into focused components

6+ props?
  → Check for god component — consider passing structured data object

Boolean props that are mutually exclusive?
  → Replace with variant or state enum prop

State needed in 2+ sibling components?
  → Lift to lowest common ancestor

State needed in 5+ branches of the tree?
  → Context or global store

Test fails after behavior-neutral refactor?
  → Test is wrong — rewrite against user-visible behavior

useMemo or useCallback added preemptively?
  → Remove — profile first, optimize second

Inline object or array passed as prop?
  → Extract to module-level constant or useMemo with stable deps

Prop drilling past 2 levels in 3+ branches of the tree?
  → Context or global store

Prop drilling past 2 levels in a single branch?
  → Try component composition first — pass children or render props
  → Context only if composition makes the API awkward
```

---

## Example

Before: `UserProfile` (150+ lines, 9 props, fetches + renders + manages modal).

```tsx
// ✅ CORRECT — after applying single responsibility + state ladder

function useUserData(userId: string) {
  // fetch logic isolated in hook
}

function UserAvatar({ src, alt }: { src: string; alt: string }) { /* ... */ }
function UserBio({ bio, joinDate }: UserBioProps) { /* ... */ }
function FollowButton({ userId }: { userId: string }) { /* ... */ }

function UserProfile({ userId }: { userId: string }) {
  const { user } = useUserData(userId);
  return (
    <>
      <UserAvatar src={user.avatar} alt={user.name} />
      <UserBio bio={user.bio} joinDate={user.joinDate} />
      <FollowButton userId={userId} />
    </>
  );
}
```

---

## Edge Cases

**Shared state between distant components:** Before reaching for Context or a store, consider co-location — can both components move under a common parent? Often simpler.

**useMemo for expensive derivations:** Acceptable when the derivation is provably expensive (profiled) and deps are stable. Not as a default.

**Test utilities that render internals:** If you must test internal state (e.g., async flows), use `@testing-library/user-event` to simulate user actions, not direct state access.

**Large forms with 10+ fields:** Controlled inputs at this scale cause re-renders on every keystroke. Use `react-hook-form` or uncontrolled inputs with refs.

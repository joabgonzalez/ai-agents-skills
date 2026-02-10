---
name: frontend-dev
description: "Frontend workflow with componentization and state management. Trigger: When building, refactoring, or scaling frontend apps."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: "behavioral-technical"
  skills:
    - conventions
    - typescript
    - react
    - architecture-patterns
    - a11y

---

# Frontend Development Skill

## Overview

This skill provides universal patterns for front-end development workflow, focusing on componentization, state management, testing, and deployment. It is technology-agnostic and emphasizes maintainability, scalability, and quality.

## When to Use

- Building, refactoring, or scaling front-end applications
- Managing state, side effects, or data flow
- Preparing for deployment or CI/CD
- Reviewing or improving code quality and structure

## Skill Type

**frontend-dev is a behavioral-technical skill** that guides HOW frontend developers think and make architectural decisions, orchestrating technical skills without duplicating their patterns.

### Key Characteristics

- **Role-based thinking**: Embodies Frontend Developer mindset and decision-making
- **Orchestrates technical skills**: Delegates to react, typescript, a11y, composition-patterns
- **NO code examples**: All code patterns live in technical skills
- **Architectural guidance**: Provides decision trees for component hierarchy, state management, data fetching

### Related Behavioral Skills

- [brainstorming](../brainstorming/SKILL.md) - Planning and ideation workflow
- [systematic-debugging](../systematic-debugging/SKILL.md) - Debugging methodology
- [interface-design](../interface-design/SKILL.md) - UI/UX design thinking
- [writing-plans](../writing-plans/SKILL.md) - Executable plan creation
- [code-review](../code-review/SKILL.md) - Two-stage code review process

### Orchestrated Technical Skills

- [react](../react/SKILL.md) - React patterns and hooks
- [typescript](../typescript/SKILL.md) - Type-safe frontend development
- [a11y](../a11y/SKILL.md) - Accessibility requirements
- [composition-patterns](../composition-patterns/SKILL.md) - Component composition
- [architecture-patterns](../architecture-patterns/SKILL.md) - Design patterns
- [tailwindcss](../tailwindcss/SKILL.md) - Utility-first CSS
- [form-validation](../form-validation/SKILL.md) - Form validation patterns
- [react-testing-library](../react-testing-library/SKILL.md) - User-centric testing

---

## Critical Patterns

### ✅ REQUIRED: Componentization with Single Responsibility

Build small, reusable components that do one thing well.

**Decision Tree**:
- Component doing >1 thing? → Split into focused components
- Logic mixed with presentation? → Extract custom hooks
- Component >100 lines? → Decompose into smaller units

**Implementation**: Delegate to [react](../react/SKILL.md) for component patterns

**Example Decomposition**:
```
Monolithic UserDashboard (200 lines)
  ↓
UserDashboard (layout coordinator, 20 lines)
  → UserList (renders list, 15 lines)
    → UserCard (single user, 25 lines)
      → Avatar (image display, 10 lines)
      → Button (action trigger, 8 lines)
  → LoadingSpinner (loading state, 5 lines)
```

**When to Stop Decomposing**:
- Component <30 lines AND single responsibility
- No reusable parts remain
- Further splitting hurts readability

### ✅ REQUIRED: State Management with Colocated State

Keep state as local as possible. Lift to global only when necessary.

**Decision Tree**:
```
Need state?
  → Used by 1 component? → Local state (useState)
  → Used by 2-3 sibling components? → Lift to parent
  → Used across component tree? → Context API
  → Shared across entire app + complex updates? → Redux/Zustand

Data from server?
  → Use React Query/SWR (NOT Redux for server state)

Derived state?
  → Compute during render (NOT useState)
  → Expensive computation? → useMemo
```

**Implementation**: Delegate to [react](../react/SKILL.md) for state patterns

**Colocated State Examples**:
- Modal open/closed → Local state in Modal component
- Form input values → Local state in Form component (or form library)
- Theme (light/dark) → Global context (shared across app)
- User authentication → Global context or Redux
- Shopping cart items → Global Redux (shared + complex updates)

### ✅ REQUIRED: Testing with User-Centric Approach

Test behavior, not implementation. Simulate real user interactions.

**Decision Tree**:
```
What to test?
  → User flows (registration, checkout)? → Integration tests (react-testing-library)
  → Edge cases + error states? → Unit tests (jest)
  → Full app workflows? → E2E tests (playwright)

How to query elements?
  → Prefer: getByRole, getByLabelText (accessible queries)
  → Avoid: getByTestId (implementation detail)
```

**Implementation**: Delegate to [react-testing-library](../react-testing-library/SKILL.md) and [unit-testing](../unit-testing/SKILL.md)

**Testing Priorities**:
1. Critical user flows (login, checkout, payment)
2. Error states (network failure, validation errors)
3. Edge cases (empty state, loading, no permissions)
4. Accessibility (keyboard navigation, screen reader)

### ✅ REQUIRED: Environment-Based Configuration

Use environment variables for configuration. Never hardcode.

**Decision Tree**:
```
Need configuration?
  → API URL? → VITE_API_URL / NEXT_PUBLIC_API_URL
  → Feature flags? → VITE_ENABLE_FEATURE=true/false
  → Environment detection? → import.meta.env.MODE / process.env.NODE_ENV

Sensitive data (API keys)?
  → NEVER in frontend code
  → Use backend proxy for API calls
```

**Implementation**: Delegate to framework-specific skills ([next](../next/SKILL.md), [vite](../vite/SKILL.md))

**Configuration Pattern**:
```
config.ts
  → apiUrl (from env var, fallback to localhost)
  → environment (development | production)
  → features (object with boolean flags)

.env.example
  → Documents all required env vars
  → Committed to repo

.env.local
  → Actual values (NOT committed)
```

---

## Architectural Decision-Making

### Component Hierarchy

**When designing component tree**:

1. **Identify data flow**: Where does data originate? Where is it consumed?
2. **Find common ancestor**: Lowest component that can own state
3. **Minimize prop drilling**: If passing props >2 levels, consider context
4. **Separate concerns**: Layout components (div, flex) vs logic components (data fetching, state)

**Red Flags**:
- Props passed through 3+ levels without being used
- Parent component knowing too much about child internals
- Component receiving >8 props (too many responsibilities)

### Data Fetching Strategy

**Decision Tree**:
```
Fetching data?
  → Static content (marketing page)? → SSG (Static Site Generation)
  → Dynamic content + SEO critical? → SSR (Server-Side Rendering)
  → Dynamic content + NOT SEO critical? → CSR (Client-Side Rendering)

Which library?
  → REST API? → React Query / SWR
  → GraphQL? → Apollo Client / urql
  → Real-time updates? → WebSockets + React Query
```

**Implementation**: Delegate to framework skills ([next](../next/SKILL.md), [react](../react/SKILL.md))

### Performance Optimization

**When to optimize**:
1. Measure FIRST (React DevTools Profiler, Lighthouse)
2. Identify bottlenecks (slow renders, large bundles)
3. Apply targeted fixes (NOT premature optimization)

**Common Optimizations**:
- Lazy load routes → React.lazy + Suspense
- Lazy load images → Intersection Observer
- Memoize expensive calculations → useMemo
- Prevent unnecessary re-renders → React.memo, useCallback
- Code splitting → Dynamic imports

**Red Flags (Premature Optimization)**:
- Using React.memo everywhere "just in case"
- useCallback for simple functions
- Optimizing before measuring

---

## Decision Tree

- New feature? → Create isolated, testable component
- State needed? → Use local or global store
- Deployment? → Automate with CI/CD
- Bug found? → Add/expand test coverage

---

## Edge Cases

- **State sync bugs**: Race conditions occur when async operations complete out of order. Use cleanup functions in useEffect. Consider using state management libraries (Redux, Zustand) for complex async flows.

- **Build pipeline failures**: Environment variables not set cause production builds to fail. Validate required env vars at build time. Use .env.example to document required variables.

- **Cross-browser or device-specific issues**: Test on multiple browsers (Chrome, Firefox, Safari) and devices (mobile, tablet, desktop). Use feature detection instead of browser detection. Polyfill missing APIs.

- **Memory leaks**: Event listeners, subscriptions, and timers not cleaned up cause memory leaks. Always return cleanup function from useEffect. Unsubscribe from observables.

- **Bundle size bloat**: Importing entire libraries increases bundle size. Use tree-shaking compatible libraries. Import only what you need (import { Button } from 'library' not import * as Library).

---

## Checklist

- [ ] Components follow single responsibility principle
- [ ] State colocated (local when possible, global only when shared)
- [ ] Prop drilling avoided (context, stores, or composition)
- [ ] User-centric tests written (unit + integration)
- [ ] Accessibility requirements met (a11y skill)
- [ ] Environment variables for all configuration
- [ ] Loading and error states handled
- [ ] Form inputs validated (client-side + server-side)
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size analyzed and optimized
- [ ] TypeScript strict mode enabled
- [ ] CI/CD pipeline configured (lint, test, build, deploy)
- [ ] Responsive design tested on mobile and desktop
- [ ] Browser compatibility verified (Chrome, Firefox, Safari)

---

## Workflow Integration

**E2E Development Workflow**:

1. **brainstorming** → Evaluate alternatives, high-level planning
2. **writing-plans** → Break into executable tasks (2-5 min, file paths)
3. **frontend-dev** (this skill) → Apply Frontend Developer thinking and architecture
4. **plan-execution** → Execute in batches of 3 with checkpoints
5. **verification-protocol** → Verify each task (IDENTIFY → RUN → READ → VERIFY → CLAIM)
6. **code-review** → Two-stage review (spec compliance → code quality)

---

## Resources

- [conventions](../conventions/SKILL.md) - Code organization and naming
- [architecture-patterns](../architecture-patterns/SKILL.md) - Design patterns (Composition, HOC, Render Props)
- [react](../react/SKILL.md) - React patterns and hooks
- [typescript](../typescript/SKILL.md) - Type-safe frontend development
- [a11y](../a11y/SKILL.md) - Accessibility requirements
- [interface-design](../interface-design/SKILL.md) - UI/UX design patterns
- [tailwindcss](../tailwindcss/SKILL.md) - Utility-first CSS
- [form-validation](../form-validation/SKILL.md) - Form validation patterns
- [react-testing-library](../react-testing-library/SKILL.md) - User-centric testing
- https://reactpatterns.com/ - React design patterns
- https://web.dev/patterns/ - Web platform patterns

---
name: critical-partner
description: "Rigorous code review and improvement partner. Trigger: When validating code quality, reviewing implementations, or providing critical feedback."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: behavioral
---

# Critical Partner

Rigorous, constructive code review and technical feedback. Act as analytical partner that challenges assumptions, identifies issues, and suggests improvements with clear rationale.

## When to Use

Use when:

- Reviewing pull requests or code submissions
- Analyzing implementation approaches and architecture decisions
- Identifying potential improvements in existing code
- Validating technical solutions for correctness, performance, security
- Evaluating test coverage and testability
- Providing feedback on API design or component interfaces
- Assessing adherence to project patterns and conventions

Don't use for:

- Simple syntax fixes (use code-conventions skill directly)
- Generating new code without review context
- Automated linting (use code-quality skill)

---

## Critical Patterns

### ✅ REQUIRED: Operating Modes

Choose mode based on task context.

**Debate Mode** (Intellectual rigor, non-complacent):

- Challenge assumptions and ideas with counter-arguments
- Refute weak arguments with counter-examples and edge cases
- Correct logical fallacies and unsupported claims
- Push back on vague or incomplete proposals
- Don't affirm everything - be intellectually rigorous
- Question "why" before accepting "what"

**Review Mode** (Technical analysis):

- Identify bugs, security issues, performance problems
- Suggest concrete improvements with code examples
- Challenge technical approach and architecture decisions
- Evaluate patterns, conventions, and best practices
- Point to specific lines with fixes
- Balance criticism with recognition of good practices

Use Debate Mode for architectural decisions, design proposals, or conceptual discussions. Use Review Mode for code reviews, PRs, or implementation validation.

### ✅ REQUIRED: Structured Review Process

Follow systematic review approach for comprehensive feedback.

```markdown
## Code Review Template

### 1. Initial Assessment (30 seconds)
- Purpose: What is this code trying to accomplish?
- Scope: Does it match the stated goal?
- Approach: Is this the right pattern for the problem?

### 2. Correctness Analysis (2-3 minutes)
- Logic: Are there bugs or edge cases?
- Error handling: What happens when things fail?
- Type safety: Are types enforced correctly?
- Testing: Is the code testable? Are tests present?

### 3. Quality Evaluation (2-3 minutes)
- Readability: Can others understand this code?
- Maintainability: Can this be changed safely?
- Performance: Are there obvious bottlenecks?
- Security: Are there vulnerabilities?

### 4. Recommendations (1-2 minutes)
- Critical issues (must fix)
- Improvements (should fix)
- Suggestions (nice to have)
```

### ✅ REQUIRED: Challenge Assumptions

Question design decisions and explore alternatives.

```markdown
# ❌ WRONG: Accept implementation without analysis
"This looks good. The code works as expected."

# ✅ CORRECT: Question approach and explore alternatives
"This works, but I have concerns about the approach:

**Current implementation:** Uses useEffect to fetch data on mount
**Issue:** Race conditions if component re-renders before fetch completes
**Alternative 1:** Use React Query for automatic caching and deduplication
**Alternative 2:** Use useSWR with revalidation strategy
**Alternative 3:** Debounce requests if triggered by user input

**Recommendation:** Alternative 1 (React Query) for production apps with multiple data sources.
**Rationale:** Eliminates race conditions, provides caching, handles loading/error states automatically."
```

### ✅ REQUIRED: Identify Concrete Issues

Point to specific lines and explain problems with examples.

```typescript
// ❌ WRONG: Vague feedback
"The error handling could be better"

// ✅ CORRECT: Specific issue with fix
/**
 * Issue on lines 34-38: Error swallowed without logging or user feedback
 *
 * Current code:
 * ```typescript
 * try {
 *   await updateUser(id, data);
 * } catch (error) {
 *   // Silent failure - user doesn't know what happened
 * }
 * ```
 *
 * Recommended fix:
 * ```typescript
 * try {
 *   await updateUser(id, data);
 *   toast.success("User updated successfully");
 * } catch (error) {
 *   console.error("Failed to update user:", error);
 *   toast.error(`Update failed: ${error.message}`);
 *   // Optionally: Report to error tracking (Sentry, etc.)
 * }
 * ```
 */
```

### ✅ REQUIRED: Balance Criticism with Recognition

Acknowledge good practices to reinforce positive patterns.

```markdown
# ❌ WRONG: Only negative feedback
"This has several issues: missing types, no error handling, poor naming..."

# ✅ CORRECT: Balanced feedback
"**What works well:**
- TypeScript interfaces clearly define data shapes
- Components are properly decomposed (single responsibility)
- Unit tests cover happy path scenarios

**Areas for improvement:**
1. **Error handling (critical):** API calls don't handle network failures
2. **Type safety (high):** `any` used in 3 places (lines 45, 67, 89)
3. **Testing (medium):** Error cases not covered in tests"
```

---

## Decision Tree

```
Is this a code review?
  → Use Structured Review Process (Initial → Correctness → Quality → Recommendations)

Is this an architecture decision?
  → Challenge Assumptions → Explore alternatives → Recommend with rationale

Is this a bug report?
  → Identify Concrete Issues → Point to specific lines → Provide fix example

Is this a design discussion?
  → Balance Criticism with Recognition → Highlight trade-offs → Suggest improvements

Is this about testing?
  → Evaluate test coverage → Check edge cases → Assess testability

Is this about performance?
  → Profile bottlenecks → Suggest optimizations → Measure impact

Is this about security?
  → Identify vulnerabilities → Recommend mitigations → Reference security skills (a11y for XSS, architecture-patterns for auth)
```

---

## Example

Critical review of an authentication PR using the structured review process.

```markdown
## Code Review: PR #42 — JWT Authentication Middleware

### 1. Initial Assessment
- **Purpose:** Add JWT middleware to protect API routes
- **Scope:** Matches PR description — middleware + tests included
- **Approach:** Custom middleware instead of passport.js — reasonable for this codebase size

### 2. Correctness Analysis
**Issue (Critical) — Line 23: Token not verified, only decoded**
```typescript
// Current:
const decoded = jwt.decode(token);  // ❌ Does NOT verify signature
// Fix:
const decoded = jwt.verify(token, process.env.JWT_SECRET!);  // ✅ Verifies signature
```

**Issue (High) — Line 41: Error message leaks internals**

```typescript
// Current: res.status(401).json({ error: err.message });  // exposes stack info
// Fix:     res.status(401).json({ error: "Unauthorized" });
```

### 3. Quality Evaluation

**What works well:**

- Middleware correctly attached to protected routes only
- Tests cover the happy path with a valid token

**Missing:**

- No test for expired token or tampered signature
- No test for missing Authorization header

### 4. Recommendations

- **Critical:** Replace `jwt.decode` with `jwt.verify` — current code accepts unsigned tokens
- **High:** Sanitize error messages before sending to client
- **Medium:** Add tests for expired/invalid token cases

```

---

## Edge Cases

- **Subjective style preferences**: Distinguish between objective issues (bugs, security) and subjective preferences (naming, formatting). Only push back on style if violates project conventions.

- **Over-engineering vs under-engineering**: Balance between "too complex" and "too simple". Consider maintainability, not just current requirements.

- **Legacy code context**: If reviewing legacy code, acknowledge constraints (no tests, old patterns). Suggest incremental improvements, not full rewrites.

- **Time pressure**: If tight deadline, prioritize critical issues (correctness, security) over nice-to-haves (refactoring, optimization).

- **Beginner vs expert**: Adjust feedback depth based on skill level. For beginners, explain *why* patterns matter. For experts, focus on trade-offs.

---

## Checklist

Before providing feedback, verify:

- [ ] **Understood the goal**: What is this code supposed to do?
- [ ] **Analyzed correctness**: Are there bugs or edge cases?
- [ ] **Checked error handling**: What happens when things fail?
- [ ] **Evaluated type safety**: Are types enforced?
- [ ] **Assessed testability**: Can this code be tested?
- [ ] **Considered alternatives**: Are there better approaches?
- [ ] **Balanced feedback**: Acknowledged good practices?
- [ ] **Provided specifics**: Pointed to concrete issues with line numbers?
- [ ] **Explained rationale**: Why are recommendations important?
- [ ] **Prioritized issues**: Critical → High → Medium → Low?

---

## Resources

- [code-conventions](../code-conventions/SKILL.md) - General coding standards
- [architecture-patterns](../architecture-patterns/SKILL.md) - Design patterns and trade-offs
- [typescript](../typescript/SKILL.md) - Type safety and strict typing
- [a11y](../a11y/SKILL.md) - Accessibility compliance
- [code-quality](../code-quality/SKILL.md) - Linting and formatting standards
- [systematic-debugging](../systematic-debugging/SKILL.md) - Debugging methodology

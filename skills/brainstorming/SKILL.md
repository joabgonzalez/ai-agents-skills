---
name: brainstorming
description: "Structured planning, ideation, and decision-making for software projects. Trigger: When planning features, evaluating alternatives, or making architectural decisions."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
---

# Brainstorming

Structured approach to planning, ideation, problem decomposition, and trade-off analysis for software projects. Produces actionable decisions with documented rationale.

## When to Use

- Planning a new feature or system
- Evaluating multiple implementation approaches
- Making technology or architecture decisions
- Decomposing a complex problem into smaller tasks
- User asks "how should we approach X?" or "what are the options for Y?"

Don't use for:
- Trivial changes (one-line fixes, obvious implementations)
- Pure code review (use critical-partner)
- Debugging (use systematic-debugging)

---

## Critical Patterns

### ✅ REQUIRED: Problem Definition First

Before generating solutions, define the problem clearly.

```markdown
## Problem Statement
**What:** [Describe the problem or feature needed]
**Why:** [Business reason or user need]
**Constraints:** [Time, tech stack, performance, budget]
**Success criteria:** [How do we know it's solved?]
```

### ✅ REQUIRED: Generate Multiple Alternatives

Never propose a single solution. Always generate 2-4 alternatives.

```markdown
## Alternatives

### Option A: [Name]
- **Approach:** [Brief description]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Effort:** [T-shirt size: S/M/L/XL]
- **Risk:** [Low/Medium/High]

### Option B: [Name]
- **Approach:** [Brief description]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Effort:** [T-shirt size]
- **Risk:** [Low/Medium/High]

### Recommendation: Option [X]
**Rationale:** [Why this option best fits constraints]
```

### ✅ REQUIRED: Trade-Off Analysis

Evaluate options against project priorities.

```markdown
## Trade-Off Matrix

| Criteria        | Weight | Option A | Option B | Option C |
|----------------|--------|----------|----------|----------|
| Performance    | High   | ✅ Good  | ⚠️ Fair  | ✅ Good  |
| Maintainability| High   | ✅ Good  | ✅ Good  | ⚠️ Fair  |
| Time to build  | Medium | ⚠️ 2w   | ✅ 3d    | ⚠️ 1w   |
| Team familiarity| Low   | ✅ Known | ❌ New   | ✅ Known |
```

### ✅ REQUIRED: Task Decomposition

Break features into ordered, actionable tasks.

```markdown
## Implementation Plan

### Phase 1: Foundation (Day 1-2)
1. [ ] Create data model and migrations
2. [ ] Implement repository interface
3. [ ] Add unit tests for domain logic

### Phase 2: Core Feature (Day 3-5)
4. [ ] Implement use case
5. [ ] Create API endpoint
6. [ ] Add integration tests

### Phase 3: Polish (Day 6-7)
7. [ ] Error handling and edge cases
8. [ ] Documentation
9. [ ] Code review
```

### ✅ REQUIRED: Document Decisions

Record decisions with context so future developers understand the "why."

```markdown
## Decision Record

**Decision:** Use WebSocket for real-time updates (not polling)
**Date:** 2026-02-09
**Context:** Users need <1s latency for order status updates
**Alternatives considered:**
- Polling (simpler but 5-10s latency)
- SSE (one-directional, insufficient for bidirectional needs)
- WebSocket (chosen — bidirectional, low latency)
**Consequences:** Need WebSocket server infrastructure, handle reconnection logic
```

### ❌ NEVER: Skip Problem Definition

```markdown
# ❌ WRONG: Jump straight to solution
"Let's use Redis for caching"

# ✅ CORRECT: Define problem first
"We're seeing 2s response times on the product catalog API.
The bottleneck is DB queries for 50K+ products.
Options: Redis cache, DB query optimization, CDN for static data..."
```

---

## Decision Tree

```
User asks about approach/options?
  → Generate alternatives with trade-off analysis

Planning a new feature?
  → Problem definition → Alternatives → Recommendation → Task decomposition

Evaluating technology choices?
  → Trade-off matrix with weighted criteria

Complex problem needs breaking down?
  → Hierarchical decomposition into phases and tasks

Need to record an important decision?
  → Decision record with context and alternatives
```

---

## Edge Cases

**Analysis paralysis**: If more than 4 alternatives, filter to top 3 using constraints. Bias toward action.

**Unknown requirements**: Flag assumptions explicitly. Propose "spike" tasks to validate assumptions before committing.

**Competing priorities**: Use weighted trade-off matrix. Ask user to rank priorities (performance vs speed vs maintainability).

**Reversible vs irreversible decisions**: For reversible decisions (can change later), bias toward the faster option. For irreversible (database schema, public API), invest more in analysis.

---

## Checklist

- [ ] Problem clearly defined with constraints and success criteria
- [ ] 2-4 alternatives generated (never just one)
- [ ] Each alternative has pros, cons, effort, and risk
- [ ] Trade-off analysis against project priorities
- [ ] Clear recommendation with rationale
- [ ] Tasks decomposed into actionable phases
- [ ] Key decisions documented with context

---

## Resources

- [architecture-patterns](../architecture-patterns/SKILL.md) — For architecture decisions
- [critical-partner](../critical-partner/SKILL.md) — For validating proposals

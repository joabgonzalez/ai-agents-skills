# Reference File Templates

Full structural templates and real-world examples for creating reference files.

---

## Core Patterns

### Reference File Structure Template

Each reference file follows this structure:

```
# {Sub-Topic Name}

{1-2 sentence summary: what this covers and why it matters.}

---

### Core Patterns

#### REQUIRED: {Pattern Name 1}
{Explanation with inline example}

---

### Common Pitfalls

#### Pitfall 1: {Common Mistake}
**Problem:** {Description}
**Solution:** {Code/approach}

---

### Real-World Examples

#### Example 1: {Use Case}
{Complete working code}

---

### Related Topics
- See [other-reference.md](other-reference.md) for...
```

**CRITICAL rules:**

- NO "Overview" or "Purpose" section. Start with concise summary (1-2 lines) after title.
- Apply token efficiency: remove filler words, condense verbose phrases, eliminate redundancy.
- Every word must add value. If removing a word doesn't lose meaning, remove it.
- Use H3 (`###`) for sub-sections inside reference files (NOT H2 `##`) to avoid duplicate heading violations.

---

### Real Example: hooks.md

A reference file for a React skill covering hook patterns:

```markdown
# React Hooks

State, effects, and custom hooks. Covers 25 patterns not in SKILL.md.

---

### Core Patterns

#### useState: Functional Updates

Use functional form when next state depends on previous:

[code example]

#### useEffect: Cleanup Pattern

Always return cleanup from effects with subscriptions:

[code example]

#### Custom Hooks: Extraction Rule

Extract when: same stateful logic appears in 2+ components.

[code example]

---

### Common Pitfalls

#### Stale Closure in useEffect

**Problem:** Effect captures initial value, never updates.
**Solution:** Add value to dependency array or use ref.

---

### Related Topics
- See [components.md](components.md) for composition patterns using hooks
- See [performance.md](performance.md) for useMemo/useCallback optimization
```

---

### Real Example: components.md

A reference file for a React skill covering component patterns:

```markdown
# React Components

Composition, prop patterns, and HOCs. Covers 18 patterns not in SKILL.md.

---

### Core Patterns

#### Compound Components

Group related components under a parent namespace:

[code example]

#### Render Props

Pass render function as prop for flexible composition:

[code example]

#### HOC: Naming Convention

Prefix with `with`: `withAuth`, `withTheme`, `withData`.

---

### Common Pitfalls

#### Props Drilling Beyond 2 Levels

**Problem:** Passing props through 3+ component layers.
**Solution:** Use context or composition instead.

---

### Related Topics
- See [hooks.md](hooks.md) for stateful logic extraction
- See [performance.md](performance.md) for memo and PureComponent
```

---

## Related Topics

- See [README.md](README.md) for navigation guide
- [reference-creation SKILL.md](../SKILL.md) — Main workflow and decision tree

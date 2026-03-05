# Content Patterns and Writing Guidelines

Patterns for writing skill content with Critical Patterns, Decision Trees, inline examples, and token-efficient documentation.

---

## Core Patterns

- Critical Patterns Section
- Inline Examples
- Decision Tree Section
- Decision Tree

---

## Critical Patterns Section

Critical Patterns are the CORE of skill content - the most important rules AI must follow. Use visual markers (✅/❌) and inline examples for instant comprehension.

### Pattern Structure

````markdown
### ✅ REQUIRED: Pattern Name

{Brief explanation of what and why (1-2 sentences)}

```language
// ✅ CORRECT: What good looks like
{working example}

// ❌ WRONG: Common mistake
{anti-pattern}
```
````

````

### Visual Markers

| Marker | Usage | When to Use |
|--------|-------|-------------|
| `✅ REQUIRED` | Must-follow pattern | Essential rules that should always be followed |
| `❌ NEVER` | Anti-pattern to avoid | Common mistakes that cause bugs/issues |
| `⚠️ WARNING` | Important caution | Edge cases or gotchas |
| `💡 TIP` | Optional enhancement | Nice-to-have improvements |

### Priority Labels (Optional - Complex Skills Only)

For skills with 30+ patterns, optionally add priority after marker:

```markdown
### ✅ REQUIRED [CRITICAL]: Must Follow Every Time
{Pattern that prevents critical bugs}

### ✅ REQUIRED [HIGH]: Follow In Most Cases
{Pattern that prevents common issues}
````

**When to use priority labels:**

- Skill has 30+ patterns
- Clear distinction between must-have vs nice-to-have
- Helps AI prioritize when context is limited

**When to skip:**

- <30 patterns (everything is equally important)
- All patterns are critical
- Adds noise without value

---

## Inline Examples

Place focused examples IMMEDIATELY after each pattern for instant comprehension. No need to scroll to Examples section.

### Structure

````markdown
### ✅ REQUIRED: Hook Dependencies

Always include all values used inside useEffect in the dependency array.

```typescript
// ✅ CORRECT: All dependencies included
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ WRONG: Missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // userId will be stale
```
````

````

### Guidelines

**Size:** Keep examples under 15 lines
- Focus on ONE concept
- Remove irrelevant code
- Use comments to explain why

**Clarity:** Show both correct and wrong
- `// ✅ CORRECT:` followed by good example
- `// ❌ WRONG:` followed by anti-pattern
- Comment explaining the issue

**Language:** Use appropriate syntax highlighting
- TypeScript: `typescript` for .ts/.tsx
- JavaScript: `javascript` for .js/.jsx
- Bash: `bash` for shell commands
- YAML: `yaml` for configs
- JSON: `json` for data

### Example Types

**1. Comparison (correct vs wrong):**

```typescript
// ✅ CORRECT: Immutable update
setState(items => [...items, newItem]);

// ❌ WRONG: Mutation
setState(items => items.push(newItem));
````

**2. Progressive enhancement:**

```typescript
// ✅ BASIC: Simple case
const [count, setCount] = useState(0);

// ✅ BETTER: With type
const [count, setCount] = useState<number>(0);

// ✅ BEST: With initial state function
const [count, setCount] = useState<number>(() => expensiveComputation());
```

**3. Before/After:**

```typescript
// Before refactoring
function handleClick() {
  setCount(count + 1);
}

// After: Using functional update
function handleClick() {
  setCount((c) => c + 1);
}
```

---

## Decision Tree Section

Help AI make decisions with clear condition→action mappings. Every skill MUST include Decision Tree.

### Structure

```markdown
## Decision Tree
```

{Question or condition}? → {Action A}
{Question or condition}? → {Action B}
Otherwise → {Default action}

```

```

### Patterns

**1. Binary decisions:**

```
TypeScript file? → Use strict typing
JavaScript file? → Use JSDoc comments
Otherwise → Skip typing
```

**2. Multi-level decisions:**

```
How many patterns?
  → <15 patterns? → Simple (SKILL.md only)
  → 15-40 patterns? → Medium (consider references/)
  → 40+ patterns? → Complex (references/ required)

Has 2+ natural sub-topics? → Use references/
```

**3. Conditional workflows:**

```
Creating new component?
  → Needs state? → Use useState/useReducer
  → Needs side effects? → Add useEffect
  → Needs context? → Use useContext
  → Pure presentation? → Function component only
```

**4. Tool selection:**

```
Styling approach?
  → Tailwind class exists? → className="..."
  → Dynamic value? → style={{ ... }}
  → Conditional styles? → cn("base", condition && "variant")
  → Static only? → className="..." (no cn() needed)
```

### Best Practices

- Keep conditions clear and testable
- Use action-oriented outcomes
- Include "Otherwise" for catch-all
- Order by likelihood (most common first)
- Use indentation for nested decisions

---

## When to Use Section

Help AI and users identify when skill applies. Critical for auto-invocation.

### Structure

```markdown
## When to Use

Use this skill when:

- {Specific scenario 1}
- {Specific scenario 2}
- {Specific scenario 3}

Don't use this skill when:

- {Out of scope scenario 1}
- {Out of scope scenario 2}
```

### Guidelines

**Be specific:**

```markdown
# ❌ VAGUE

Use this skill when:

- Working with React
- Building components

# ✅ SPECIFIC

Use this skill when:

- Creating React functional components with hooks
- Refactoring class components to hooks
- Implementing custom hooks for shared logic
```

**Include negatives:**

```markdown
Don't use this skill when:

- Component has no state or effects (use pure function)
- Class component is required (legacy codebase)
- React version <16.8 (hooks not available)
```

---

## Conventions Section

Define rules and best practices. Always delegate to general skills first, then add skill-specific rules.

### Delegation Pattern

```markdown
### Conventions

Refer to [code-conventions](../code-conventions/SKILL.md) for:

- Naming patterns
- Code organization
- Documentation standards

Refer to [a11y](../a11y/SKILL.md) for:

- Semantic HTML
- ARIA attributes
- Keyboard navigation

### Skill-Specific Rules

- TypeScript strict mode required
- No `any` types without explicit comment
- Prefer `unknown` over `any` for uncertain types
```

### Anti-Pattern: Don't Duplicate

```markdown
# ❌ WRONG: Duplicating code-conventions

### Conventions

- Use camelCase for variables
- Use PascalCase for classes
- Use kebab-case for file names
- Indent with 2 spaces
- ...

# ✅ CORRECT: Delegate + specific rules

### Conventions

Refer to code-conventions for general coding standards.

### TypeScript-Specific

- Enable `strict` mode in tsconfig.json
- Use `satisfies` for type checking without widening
```

---

## Edge Cases Section

Document boundary conditions, limitations, and special scenarios.

### Structure

````markdown
## Edge Cases

### Edge Case Name

{Description of scenario}

```language
// Example showing edge case
```
````

**Workaround:** {How to handle}

````

### Common Edge Case Types

**1. Browser/Environment limitations:**

```markdown
### Server-Side Rendering

`useState` runs on server during SSR, ensure initial state is serializable.

```typescript
// ❌ WRONG: Non-serializable initial state
const [state] = useState(new Date());

// ✅ CORRECT: Use string or number
const [state] = useState(Date.now());
````

````

**2. Version compatibility:**

```markdown
### React <18 Concurrent Features

Concurrent features (useTransition, useDeferredValue) only available in React 18+.

**Fallback for React 17:** Use setTimeout for non-blocking updates.
````

**3. Performance considerations:**

```markdown
### Large Lists

Rendering 10,000+ items causes performance issues.

**Solutions:**

- Use virtual scrolling (react-window)
- Implement pagination
- Add search/filter to reduce visible items
```

---

## Writing Style Guidelines

### Voice and Tone

- **Imperative:** "Use useState for state" not "You should use useState"
- **Active:** "Add dependency" not "Dependencies should be added"
- **Direct:** "Avoid mutations" not "It's best to avoid mutations"

### Token Efficiency

**Eliminate filler:**

```markdown
# ❌ WORDY (22 words)

In order to effectively manage state in your React components, it is highly recommended that you use the useState hook.

# ✅ CONCISE (7 words)

Use useState hook for component state.
```

**Remove redundancy:**

```markdown
# ❌ REDUNDANT

- Use clear and concise naming
- Keep names short and readable
- Choose descriptive identifiers

# ✅ UNIFIED (one clear statement)

- Use clear, concise, descriptive names
```

**Every word adds value:**

```markdown
# ❌ NO VALUE ADDED

This section provides comprehensive information about...

# ✅ VALUE ADDED (or omit entirely)

{Just start with the content}
```

### Formatting

**Typography:**

- Use ASCII apostrophes (`'`) not typographic (`'`)
- Use hyphens (`-`) for compounds, em dashes (`—`) for breaks
- Avoid smart quotes, use straight quotes (`"` not `"`)

**Structure:**

- Use horizontal rules (`---`) to separate major sections
- Use headings hierarchically (h2 → h3 → h4)
- Use code fences with language specifiers
- Use tables for comparisons

**Emphasis:**

- Use **bold** for important terms
- Use `code` for identifiers, file names, commands
- Use _italics_ sparingly (for emphasis only)
- Use ✅/❌ for visual contrast in patterns

---

## Complete Pattern Example

Putting it all together:

````markdown
### ✅ REQUIRED [CRITICAL]: Immutable State Updates

Never mutate state directly - always create new object/array.

```typescript
// ✅ CORRECT: Immutable update
setItems((items) => [...items, newItem]);

// ❌ WRONG: Direct mutation
setItems((items) => {
  items.push(newItem); // Mutates original array
  return items;
});
```
````

**Why:** React uses reference equality to detect changes. Mutations don't trigger re-renders.

See [references/hooks.md](references/hooks.md) for advanced state patterns with useReducer.

```

**Elements:**
1. Visual marker (✅) + priority ([CRITICAL])
2. Clear pattern name
3. Brief explanation (1-2 sentences)
4. Inline example with ✅ CORRECT and ❌ WRONG
5. "Why" explanation (optional but helpful)
6. Link to reference for advanced content (if applicable)

---

## Summary

**Critical Patterns:**
- Use ✅/❌ visual markers
- Add priority labels for 30+ pattern skills (optional)
- Include inline examples under 15 lines
- Show correct and wrong approaches

**Decision Trees:**
- Condition→Action format
- Include "Otherwise" catch-all
- Order by likelihood

**Writing:**
- Imperative, active, direct voice
- Token-efficient: no filler, no redundancy
- Every word adds value

---

## Reference

- Main guide: [SKILL.md](../SKILL.md)
- Structure: [structure.md](structure.md)
- Token efficiency: [token-efficiency.md](token-efficiency.md)
- Examples: [examples.md](examples.md)

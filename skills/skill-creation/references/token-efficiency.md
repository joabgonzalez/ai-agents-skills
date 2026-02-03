# Token Efficiency Guide

> Complete strategies for creating token-efficient skills without sacrificing clarity or precision

## Overview

Token efficiency means maximizing information density while maintaining clarity. Every word must add unique value. This guide covers frontmatter optimization, content compression, and writing techniques for minimal tokens with maximum precision.

---

## Why Token Efficiency Matters

### Impact on AI Performance

- **Context limits:** GPT-4 has 128k token context, Claude 200k
- **Cost:** Each token costs money in API calls
- **Speed:** Fewer tokens = faster processing
- **Comprehension:** Concise content is easier to parse

### Target Metrics

| Skill Type | SKILL.md Target | With References    |
| ---------- | --------------- | ------------------ |
| Simple     | 150-300 lines   | N/A                |
| Medium     | 300-400 lines   | +200-300/reference |
| Complex    | 300 lines max   | +200-500/reference |

**Golden rule:** SKILL.md should never exceed 300 lines for complex skills (move details to references).

---

## Frontmatter Optimization

### Omit Empty Fields

```yaml
# ❌ WASTES 3 LINES (42 tokens)
name: prettier
description: Prettier code formatting. Trigger: When configuring Prettier.
skills: []
dependencies: {}
allowed-tools: []

# ✅ SAVES 3 LINES (28 tokens, 33% reduction)
name: prettier
description: Prettier code formatting. Trigger: When configuring Prettier.
```

**Savings:** 14 tokens per skill × 30 skills = **420 tokens saved**

### Description Precision

```yaml
# ❌ WORDY (142 characters, ~35 tokens)
description: This comprehensive skill provides detailed guidance and best practices for creating and maintaining skills in the project using proper conventions and standards. Trigger: When creating skills.

# ✅ CONCISE (89 characters, ~22 tokens, 37% reduction)
description: Guide for creating standards-compliant skills with templates and validation. Trigger: When creating a new skill.
```

**Technique:** Remove filler words ("comprehensive", "detailed", "various", "proper")

### Input/Output Specificity

```yaml
# ❌ OBVIOUS (adds no value, wastes tokens)
input: "User request | string"
output: "Response | string"

# ✅ OMIT (obvious from description)
# (no input/output fields)

# ✅ INCLUDE WHEN SPECIFIC
input: "Skill name, patterns list, complexity level | string, array, enum"
output: "Validated SKILL.md file with frontmatter | markdown"
```

**Rule:** Include input/output ONLY when they add specificity beyond description.

---

## Content Compression

### Eliminate Filler Phrases

| Filler Phrase                  | Replacement | Savings     |
| ------------------------------ | ----------- | ----------- |
| "In order to"                  | "To"        | 3 words → 1 |
| "It is important to note that" | "Note:"     | 6 words → 1 |
| "You should make sure to"      | "Ensure"    | 5 words → 1 |
| "In most cases"                | "Usually"   | 3 words → 1 |
| "As a result of"               | "Because"   | 4 words → 1 |

**Example:**

```markdown
# ❌ FILLER (32 words)

In order to effectively manage state in your React components, it is important to note that you should make sure to use the useState hook in most cases.

# ✅ DIRECT (11 words, 66% reduction)

Use useState hook for component state management in React.
```

### Unify Redundant Points

```markdown
# ❌ REDUNDANT (3 bullets, 15 words)

- Use clear naming conventions
- Keep names short and readable
- Choose descriptive identifiers

# ✅ UNIFIED (1 bullet, 7 words, 53% reduction)

- Use clear, concise, descriptive names
```

### Remove Introductory Statements

```markdown
# ❌ WASTES 2 LINES

This section provides comprehensive information about critical patterns.

## Critical Patterns

# ✅ DIRECT (save 1 line + tokens)

## Critical Patterns
```

**Rule:** Section headings are self-explanatory; skip introductions.

---

## Code Example Optimization

### Keep Examples Focused

```typescript
// ❌ BLOATED (25 lines with imports, types, full component)
import React, { useState, useEffect } from 'react';
import type { User } from './types';

interface Props {
  userId: string;
}

export function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    }
    fetchUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}

// ✅ FOCUSED (6 lines, shows only the pattern)
useEffect(() => {
  async function fetchUser() {
    const data = await fetch(`/api/users/${userId}`).then(r => r.json());
    setUser(data);
  }
  fetchUser();
}, [userId]);
```

**Technique:** Remove imports, types, UI code - show only the relevant pattern.

### Use Comments for Explanation

```typescript
// ❌ VERBOSE EXPLANATION (4 lines of text + 3 lines of code)
When using useEffect for data fetching, you must include all dependencies
in the dependency array. In this case, userId is used inside the effect,
so it must be in the array. Failing to do so will cause stale closures.

useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ INLINE COMMENT (3 lines total, 43% reduction)
// Include all dependencies to prevent stale closures
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Comparison Pattern

```typescript
// ✅ EFFICIENT: Show correct and wrong in same block
// ✅ CORRECT: All dependencies included
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ WRONG: Missing dependency causes stale closure
useEffect(() => {
  fetchData(userId);
}, []);
```

**Benefit:** Single code block, inline explanation, visual contrast.

---

## Section Organization

### Combine Related Content

````markdown
# ❌ SEPARATED (multiple small sections)

## Installation

```bash
npm install prettier
```
````

## Configuration

```json
{
  "semi": true
}
```

## Usage

```bash
npx prettier --write .
```

# ✅ COMBINED (single cohesive section)

## Setup and Usage

```bash
# Install
npm install prettier

# Configure (.prettierrc)
{
  "semi": true
}

# Format
npx prettier --write .
```

````

**Savings:** 3 headings → 1, fewer transitions, more coherent flow.

### Use Tables for Comparison

```markdown
# ❌ VERBOSE (8 lines)
For simple skills with fewer than 15 patterns, use SKILL.md only.
For medium skills with 15-40 patterns, use SKILL.md plus assets directory.
For complex skills with more than 40 patterns, use SKILL.md plus assets and references directories.

# ✅ TABLE (5 lines, includes more information)
| Complexity | Patterns | Structure |
|------------|----------|-----------|
| Simple     | <15      | SKILL.md only |
| Medium     | 15-40    | SKILL.md + assets/ |
| Complex    | 40+      | SKILL.md + assets/ + references/ |
````

**Benefit:** More information in less space, easier to scan.

---

## Decision Tree Efficiency

### Compact Format

```markdown
# ❌ VERBOSE (10 lines)

If the file is a TypeScript file, then use strict typing.
If the file is a JavaScript file, then use JSDoc comments.
If the file type is neither, then skip typing.

If you need state management, use useState hook.
If you need side effects, use useEffect hook.
Otherwise, use a pure function component.

# ✅ COMPACT (6 lines, 40% reduction)
```

TypeScript file? → Use strict typing
JavaScript file? → Use JSDoc comments
Otherwise → Skip typing

Needs state? → useState hook
Needs effects? → useEffect hook
Otherwise → Pure function

```

```

---

## Reference Links Efficiency

### Inline References

```markdown
# ❌ VERBOSE (7 lines)

For more information about hooks, see the hooks reference.
For more information about components, see the components reference.
For more information about performance, see the performance reference.

Links:

- [Hooks](references/hooks.md)
- [Components](references/components.md)
- [Performance](references/performance.md)

# ✅ INLINE (3 lines, 57% reduction)

See [hooks](references/hooks.md) for state patterns,
[components](references/components.md) for composition,
[performance](references/performance.md) for optimization.
```

### Contextual Links

```markdown
# ✅ EFFICIENT: Link where pattern is mentioned

### ✅ REQUIRED: Custom Hooks

{Brief inline example}

See [hooks.md](references/hooks.md) for advanced patterns.
```

**Benefit:** User gets reference exactly when they need it.

---

## Writing Techniques

### Active Voice

```markdown
# ❌ PASSIVE (wordy)

State should be updated using the setState function.

# ✅ ACTIVE (concise)

Update state using setState.
```

### Imperative Mood

```markdown
# ❌ SUGGESTIVE

You should use TypeScript for type safety.

# ✅ IMPERATIVE

Use TypeScript for type safety.
```

### Direct Address (sparingly)

```markdown
# ❌ INDIRECT

When creating a skill, developers need to ensure...

# ✅ DIRECT

Ensure your skill includes...
```

### Eliminate Hedging

```markdown
# ❌ HEDGING (uncertainty)

It might be a good idea to consider using...

# ✅ CONFIDENT (direct)

Use...
```

---

## Validation Checklist

Before finalizing, verify:

### Frontmatter

- [ ] Empty arrays/objects omitted
- [ ] Description under 150 characters
- [ ] input/output omitted if obvious
- [ ] No redundant words in description

### Content

- [ ] No introductory paragraphs before sections
- [ ] Filler phrases removed ("in order to", "it is important")
- [ ] Redundant points unified
- [ ] Examples under 15 lines
- [ ] Tables used for comparisons
- [ ] Decision tree in compact format

### Overall

- [ ] SKILL.md under 300 lines (complex skills)
- [ ] Every word adds unique value
- [ ] No redundancy across sections
- [ ] Links inline where needed (not separate list)
- [ ] Active voice, imperative mood
- [ ] ASCII characters only (no typographic quotes)

---

## Metrics and Targets

### Token Calculations

Rough estimates:

- **1 word ≈ 1.3 tokens**
- **1 line of code ≈ 4-8 tokens**
- **1 Markdown heading ≈ 3-5 tokens**

### Target Reductions

| Optimization         | Target Reduction            |
| -------------------- | --------------------------- |
| Description          | 30-40%                      |
| Filler phrases       | 50-70%                      |
| Code examples        | 40-60%                      |
| Section intros       | 100% (eliminate)            |
| Redundant bullets    | 50-70%                      |
| **Overall SKILL.md** | **40-50% from first draft** |

### Before/After Comparison

**Before optimization (775 lines):**

- Frontmatter: 8 fields (some empty)
- Description: 180 characters
- Code examples: 30-40 lines each
- Multiple introductory paragraphs
- Redundant bullets
- Verbose explanations

**After optimization (300 lines, 61% reduction):**

- Frontmatter: 3 fields (no empty)
- Description: 95 characters
- Code examples: 6-15 lines each
- No introductory paragraphs
- Unified bullets
- Inline comments for explanation
- Details moved to 9 reference files

---

## Real Example: skill-creation

### Before (775 lines)

```yaml
---
name: skill-creation
description: This comprehensive skill provides detailed guidance for creating and maintaining standards-compliant skills from simple to complex, with extensive templates, references architecture, inline examples, proper frontmatter, delegation patterns, and JSON schema validation. It supports any topic or technology with a comprehensive 9-step workflow process. Includes optional priority labels for complex skills with 30 or more patterns. Ensures unique responsibilities and token-efficient documentation throughout. Trigger: When creating a new skill, adding agent instructions, or documenting patterns for AI systems to follow.
skills:
  - critical-partner
  - process-documentation
  - skill-sync
allowed-tools:
  - file-operations
  - read-file
  - write-file
---

{775 lines of content with verbose explanations}
```

### After (300 lines + 9 references, 61% reduction in SKILL.md)

```yaml
---
name: skill-creation
description: Guide for creating standards-compliant skills with templates, references, and validation. Trigger: When creating a new skill or documenting patterns.
skills:
  - critical-partner
  - process-documentation
  - skill-sync
allowed-tools:
  - file-operations
  - read-file
  - write-file
---

{300 lines with top patterns + links to 9 focused references}
```

**Improvements:**

- Description: 180 → 95 characters (47% reduction)
- SKILL.md: 775 → 300 lines (61% reduction)
- Details: Extracted to 9 references (~1200 lines total)
- Total content: Better organized, more navigable
- Token efficiency: 40% reduction in core file

---

## Summary

**Key principles:**

- Omit empty frontmatter fields
- Remove filler phrases and redundancy
- Keep examples under 15 lines (focused on pattern)
- Use tables for comparisons
- No introductory paragraphs
- Inline references where mentioned
- Active voice, imperative mood
- Every word adds unique value

**Target:** 40-50% reduction from first draft while maintaining clarity and precision.

---

## Reference

- Main guide: [SKILL.md](../SKILL.md)
- Frontmatter: [frontmatter.md](frontmatter.md)
- Content patterns: [content-patterns.md](content-patterns.md)
- Validation: [validation.md](validation.md)

# Skill Structure and Organization

> Complete guide to organizing skills from simple single-file to complex multi-reference architecture

## Overview

Skill structure varies by complexity: simple skills use SKILL.md only, medium skills add assets/ for templates, and complex skills include references/ for detailed sub-topic guides. This document covers all structural patterns and organization strategies.

---

## Complexity Assessment

**BEFORE creating structure, assess complexity:**

| Complexity  | Indicators                                     | Structure                              |
| ----------- | ---------------------------------------------- | -------------------------------------- |
| **Simple**  | <15 patterns, single concern, no sub-topics    | `SKILL.md` only                        |
| **Medium**  | 15-40 patterns, 2-3 sub-topics                 | `SKILL.md` + `assets/` (optional)      |
| **Complex** | 40+ patterns, 4+ sub-topics, multiple contexts | `SKILL.md` + `assets/` + `references/` |

### Decision Questions

Ask these questions to determine structure:

1. **How many critical patterns?**
   - <15 → Simple (SKILL.md only)
   - 15-40 → Medium (consider assets/)
   - 40+ → Complex (use references/)

2. **Does topic have natural sub-divisions?**
   - Yes (hooks, components, performance) → Use references/
   - No (single linear workflow) → Keep in SKILL.md

3. **Will SKILL.md exceed 300 lines?**
   - Yes → Use references/
   - No → Keep in SKILL.md

4. **Are there distinct themes that could be separate guides?**
   - Yes → Use references/
   - No → Keep in SKILL.md

5. **Are there templates/schemas needed?**
   - Yes → Create assets/
   - No → Skip assets/

**Key insight:** Use references/ when skill has **natural sub-topics**, not just when it hits pattern count threshold.

---

## Simple Skill Structure

**Use when:** <15 patterns, single concern, linear workflow

```
skills/{skill-name}/
└── SKILL.md              # All content (200-300 lines)
```

### Content Organization

```markdown
---
name: prettier
description: ...
---

# Skill Name

## Overview

{2-3 sentences}

## Objective

{Clear purpose}

## When to Use

{Bullet points}

## Critical Patterns

{10-15 patterns with inline examples}

## Decision Tree

{Condition→Action mappings}

## Conventions

{Delegate + skill-specific rules}

## Example

{1-2 complete examples}

## Edge Cases

{Boundary conditions}

## Commands (if applicable)

{Shell commands}

## Resources

{Links to docs}
```

### Examples

- **prettier**: Formatting config (simple)
- **yup**: Validation schemas (simple)
- **eslint**: Linting rules (simple)

---

## Medium Skill Structure

**Use when:** 15-40 patterns, 2-3 sub-topics, templates/schemas needed

```
skills/{skill-name}/
├── SKILL.md              # Main patterns (300-400 lines)
└── assets/               # Templates and schemas
    ├── template.{ext}
    ├── schema.json
    └── config.example.{ext}
```

### When to Create assets/

Create `assets/` when you have:

- **Templates:** Boilerplate code users copy-paste
- **Schemas:** JSON/YAML validation schemas
- **Configs:** Example configuration files
- **Snippets:** Reusable code fragments

### assets/ Organization

```
assets/
├── {THING}-TEMPLATE.{ext}     # Templates for copying
├── {thing}-schema.json        # Validation schemas
├── config.example.{ext}       # Example configurations
└── snippets/                  # Optional: code snippets
    ├── {pattern-1}.{ext}
    └── {pattern-2}.{ext}
```

### Linking from SKILL.md

```markdown
## Resources

- Templates: See [assets/](assets/) for templates and schemas
  - [SKILL-TEMPLATE.md](assets/SKILL-TEMPLATE.md) - Main skill template
  - [frontmatter-schema.json](assets/frontmatter-schema.json) - Validation schema
```

### Examples

- **formik**: Forms with template (medium)
- **eslint**: Config patterns with examples (medium)
- **vite**: Build config with templates (medium)

---

## Complex Skill Structure

**Use when:** 40+ patterns, 4+ sub-topics, multiple contexts

```
skills/{skill-name}/
├── SKILL.md                    # Overview + critical patterns (300 lines max)
├── assets/                     # Templates, schemas, configs
│   ├── component-template.tsx
│   └── schema.json
└── references/                 # Detailed sub-topic guides
    ├── {sub-topic-1}.md       # 10-20 patterns (200-500 lines)
    ├── {sub-topic-2}.md       # Another sub-topic
    ├── {sub-topic-3}.md       # Advanced patterns
    └── {sub-topic-4}.md       # Edge cases
```

### Content Distribution

**SKILL.md should contain:**

- Overview and objective (30 lines)
- When to Use (10 lines)
- Top 10-15 CRITICAL patterns with inline examples (120 lines)
- Comprehensive Decision Tree (30 lines)
- Conventions and delegation (20 lines)
- Basic example (30 lines)
- Resources linking to ALL references (30 lines)
- **Total: ~300 lines**

**Reference files should contain:**

- Deep dive into 10-20 patterns for ONE sub-topic
- Real-world examples (complete working code)
- Common pitfalls and how to avoid them
- Advanced techniques and optimizations
- Edge cases and gotchas
- Performance considerations
- Testing strategies
- Debugging tips

### When to Create references/

Create `references/` when skill meets ANY criteria:

- **40+ patterns** in Critical Patterns section
- **4+ distinct sub-topics** (hooks, components, performance, server)
- **Main SKILL.md exceeds 300 lines** with all patterns
- **Multiple contexts** (browser vs Node vs Edge)
- **Version-specific patterns** needing isolation

### Identifying Sub-Topics

Common sub-topic patterns by domain:

**Frontend (React, Vue, Svelte):**

- `hooks.md` - State management hooks
- `components.md` - Component patterns
- `performance.md` - Optimization
- `server-features.md` - SSR/RSC

**TypeScript/JavaScript:**

- `types.md` - Type system
- `generics.md` - Generic programming
- `async.md` - Promises, async/await
- `modules.md` - Import/export

**Backend/API:**

- `authentication.md` - Auth patterns
- `database.md` - DB access
- `validation.md` - Input validation
- `error-handling.md` - Error strategies

**See [references-overview.md](references-overview.md) for complete sub-topic extraction process.**

### Examples

- **react**: Hooks, components, performance, server features
- **typescript**: Types, generics, decorators, tooling
- **next-js**: Routing, data fetching, rendering, deployment

---

## Directory Naming

### Rules

- **Lowercase only:** `skill-name`, not `Skill-Name` or `skill_name`
- **Hyphens:** Use `-` between words, never `_` or spaces
- **Descriptive:** Clear what skill covers
- **Concise:** 1-3 words preferred

### Naming Patterns

| Type             | Pattern                        | Examples                                             |
| ---------------- | ------------------------------ | ---------------------------------------------------- |
| Generic skill    | `{technology}`                 | `typescript`, `react`, `python`                      |
| Framework skill  | `{action}-{target}`            | `skill-creation`, `agent-creation`                   |
| UI library       | `{library-name}`               | `mui`, `tailwindcss`, `ag-grid`                      |
| Version-specific | `{technology}-{major-version}` | `react-19`, `tailwind-4` (only for breaking changes) |

---

## File Organization Best Practices

### SKILL.md Structure

**Order matters for AI consumption:**

1. Frontmatter (metadata)
2. Title (h1)
3. Overview (context)
4. Objective (purpose)
5. When to Use (triggers)
6. Critical Patterns (most important content)
7. Decision Tree (AI guidance)
8. Conventions (rules)
9. Example (practical application)
10. Edge Cases (boundaries)
11. Commands (if applicable)
12. Resources (links)
13. References (external docs)

### Section Sizing

| Section           | Target Lines | Purpose                      |
| ----------------- | ------------ | ---------------------------- |
| Overview          | 3-5          | Quick context                |
| Objective         | 5-10         | Clear purpose                |
| When to Use       | 10-15        | Trigger identification       |
| Critical Patterns | 100-150      | Core content (simple/medium) |
| Critical Patterns | 30-50        | Top patterns only (complex)  |
| Decision Tree     | 20-40        | AI decision support          |
| Conventions       | 20-40        | Rules and delegation         |
| Example           | 30-60        | Practical demonstration      |
| Edge Cases        | 20-40        | Boundary conditions          |
| Resources         | 10-30        | Links to references/assets   |

---

## Common Mistakes

### Mistake 1: Creating references/ Too Early

```
# ❌ BAD: 10 patterns, no sub-topics
skills/prettier/
├── SKILL.md (100 lines)
└── references/
    └── advanced.md (50 lines)

# ✅ GOOD: Keep simple
skills/prettier/
└── SKILL.md (150 lines, all patterns inline)
```

### Mistake 2: Not Using references/ When Needed

```
# ❌ BAD: 80 patterns in one file
skills/react/
└── SKILL.md (1200 lines, overwhelming)

# ✅ GOOD: Split into sub-topics
skills/react/
├── SKILL.md (300 lines, top patterns)
└── references/
    ├── hooks.md (400 lines)
    ├── components.md (300 lines)
    └── performance.md (250 lines)
```

### Mistake 3: Poor Sub-Topic Division

```
# ❌ BAD: Vague names
references/
├── basic.md
├── advanced.md
└── misc.md

# ✅ GOOD: Clear topics
references/
├── hooks.md
├── components.md
└── performance.md
```

### Mistake 4: assets/ vs references/ Confusion

```
# ❌ BAD: Mixing concerns
assets/
├── template.tsx        # ✅ Correct
├── schema.json         # ✅ Correct
└── hooks-guide.md      # ❌ Should be in references/

# ✅ GOOD: Proper separation
assets/
├── template.tsx
└── schema.json
references/
└── hooks.md
```

---

## Migration Paths

### Simple → Medium (Adding assets/)

1. Identify templates/schemas needed
2. Create `assets/` directory
3. Move templates from Examples section to assets/
4. Update Resources section with links

### Medium → Complex (Adding references/)

1. Identify natural sub-topics (4+)
2. Create `references/` directory
3. Extract detailed patterns from SKILL.md
4. Create reference files (use REFERENCE-TEMPLATE.md)
5. Keep top 10-15 critical patterns in SKILL.md
6. Link to references in Critical Patterns and Resources
7. Ensure SKILL.md stays under 300 lines

**See [references-implementation.md](references-implementation.md) for step-by-step migration guide.**

---

## Summary

**Structure selection:**

- **Simple (<15 patterns):** SKILL.md only
- **Medium (15-40 patterns):** SKILL.md + assets/
- **Complex (40+ patterns):** SKILL.md + assets/ + references/

**Key principles:**

- Structure follows complexity
- Natural sub-topics → references/
- SKILL.md stays focused (300 lines max)
- Templates/schemas → assets/
- Detailed guides → references/

---

## Reference

- Main guide: [SKILL.md](../SKILL.md)
- Frontmatter: [frontmatter.md](frontmatter.md)
- References overview: [references-overview.md](references-overview.md)
- References implementation: [references-implementation.md](references-implementation.md)
- Examples: [examples.md](examples.md)

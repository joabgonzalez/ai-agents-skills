---
name: reference-creation
description: "Reference files for complex skills (40+ patterns). Trigger: When creating complex skill with 40+ patterns or 4+ natural sub-topics."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - critical-partner
    - process-documentation
    - english-writing
  allowed-tools:
    - file-operations
    - read-file
    - write-file
---

# Reference Creation

Create `references/` directories for complex skills. Reference files organize content into focused sub-topic guides, improving navigability and token efficiency.

## When to Use

- Skill has 40+ patterns or 4+ distinct sub-topics
- SKILL.md would exceed 300 lines with all patterns inline
- Advanced techniques would overwhelm beginners in main SKILL.md

Don't use for:

- Simple skills (<15 patterns, 1 topic)
- Skills that fit comfortably in SKILL.md alone

---

## Critical Patterns

### ✅ REQUIRED: Assess Complexity First

Before creating references, verify skill meets threshold:

```
At least 2 of:
- 40+ patterns?
- 4+ sub-topics?
- Natural groupings?
- SKILL.md would exceed 300 lines?
```

### ✅ REQUIRED: Identify Sub-Topics

```
1. List ALL patterns in SKILL.md
2. Group by theme (what goes together?)
3. Identify clusters of 10-20 related patterns
4. Name clusters descriptively (not "advanced" or "misc")
5. Validate: Each cluster independently learnable?
```

**Example (React skill):**

```
70 patterns →
  - hooks.md (25 patterns: useState, useEffect, custom hooks)
  - components.md (18 patterns: composition, props, HOCs)
  - performance.md (15 patterns: memo, useMemo, code splitting)
  - server-features.md (12 patterns: SSR, RSC, data fetching)
```

### ✅ REQUIRED: Name Files Descriptively

```bash
# ✅ CORRECT
hooks.md
server-components.md
type-guards.md

# ❌ WRONG
advanced.md        # Too vague
misc.md            # Catch-all
part2.md           # Meaningless ordering
```

Rule: `{topic-description}.md` (lowercase, hyphens, descriptive)

### ✅ REQUIRED [CRITICAL]: Create README.md

Every `references/` directory MUST have README.md:

```text
# {Skill Name} References

> {One-line description}

## Quick Navigation

| Reference                    | Purpose   | Read When     |
| ---------------------------- | --------- | ------------- |
| [sub-topic.md](sub-topic.md) | {Purpose} | {When needed} |

## Reading Strategy

### For Simple Use Cases
- Read main SKILL.md only

### For Complex Use Cases
- MUST read: {reference1}, {reference2}
- Optional: {reference3}
```

### ✅ REQUIRED: Content Distribution

**SKILL.md (300 lines max):**

- Top 10-15 CRITICAL patterns only
- Basic examples (<15 lines each)
- Decision Tree with reference links
- Resources section listing ALL references

**Reference files (200-600 lines each):**

- Deep dive into ONE sub-topic
- 10-20 patterns for that topic
- Real-world examples (complete code)
- Common pitfalls and edge cases

```text
### ✅ REQUIRED [CRITICAL]: Custom Hooks

{Brief inline example}

**For advanced hook patterns:** See [references/hooks.md](references/hooks.md).
```

### ✅ REQUIRED: Cross-Link Files

**From SKILL.md to references:**

```text
## Resources

- [Hooks](references/hooks.md) - useState, useEffect, custom hooks
- [Components](references/components.md) - Composition, HOCs, render props

**See [references/README.md](references/README.md) for complete navigation.**
```

**Between references:**

```text
## Related Topics

- See [components.md](components.md) for component composition patterns
- See [performance.md](performance.md) for optimization techniques
```

### ✅ REQUIRED: Reference File Structure

Each reference file follows:

```text
# {Sub-Topic Name}

> {One-line description}

## Core Patterns

### Pattern Name 1
{Explanation with inline example}

---

## Common Pitfalls
- **Pitfall 1**: {Description and solution}

---

## Real-World Examples

### Example: {Use Case}
{Complete working code}

---

## Related Topics
- See [other-reference.md](other-reference.md) for...
```

### ❌ NEVER: Create Catch-All References

```bash
# ❌ WRONG
references/advanced.md    # What's "advanced"?
references/misc.md        # No focus
references/extras.md      # Vague

# ✅ CORRECT
references/optimization.md     # Specific topic
references/server-actions.md   # Specific feature
references/type-inference.md   # Specific concept
```

### ❌ NEVER: Duplicate Content

References EXPAND on SKILL.md, never repeat it:

- SKILL.md: basic useState example (5 lines)
- hooks.md: 5-7 useState patterns NOT in SKILL.md

### ❌ NEVER: Create Too Many Small Files

```
# ❌ Bad: 10 files, 50 lines each
references/useState.md (50 lines)
references/useEffect.md (60 lines)

# ✅ Good: 1 file, 400 lines, organized
references/hooks.md (400 lines)
  - useState section
  - useEffect section
  - useContext section
```

Guideline: 4-9 references optimal. More = harder to discover.

---

## Decision Tree

```
Skill complexity: <40 patterns?
→ Yes: Use SKILL.md only (no references needed)
→ No: Continue assessment

Natural sub-topics exist (4+)?
→ No: Consider if patterns are truly related to same skill
→ Yes: Plan references/ directory

Each sub-topic has 10+ patterns?
→ No: Merge sub-topics or keep inline in SKILL.md
→ Yes: Create reference file for each sub-topic

References count: 4-9 files?
→ No: Consolidate (if >9) or add more sub-topics (if <4)
→ Yes: Create references/ with README.md

README.md created with navigation?
→ No: MUST create (CRITICAL)
→ Yes: Validate cross-links and sync
```

---

## Workflow

1. **Assess complexity** → Verify 40+ patterns or 4+ sub-topics
2. **Identify sub-topics** → Group patterns into 4-9 clusters of 10-20
3. **Create structure** → `mkdir references/` + README.md + topic files
4. **Distribute content** → Top 15 in SKILL.md, deep dives in references
5. **Cross-link** → SKILL.md↔references, references↔references
6. **Validate** → Run checklist, verify links work

---

## Example

Complete reference structure for React skill (70 patterns):

```
skills/react/
├── SKILL.md (300 lines)
│   ├── Top 15 critical patterns
│   ├── Decision tree
│   └── Links to 4 references
└── references/
    ├── README.md
    ├── hooks.md (400 lines)
    ├── components.md (350 lines)
    ├── performance.md (300 lines)
    └── server-features.md (250 lines)
```

---

## Edge Cases

**Version-specific patterns:** Create separate files (`hooks-react-17.md`, `hooks-react-18.md`) or sections within file.

**Cross-cutting concerns:** Create dedicated reference (e.g., `token-efficiency.md` in skill-creation).

**Too few patterns per sub-topic:** Merge sub-topics or keep inline in SKILL.md.

**References exceeding 800 lines:** Split into sub-references (`hooks-state.md`, `hooks-effects.md`).

---

## Checklist

- [ ] Complexity justified (40+ patterns or 4+ sub-topics)
- [ ] README.md exists with Quick Navigation table
- [ ] 4-9 reference files (optimal range)
- [ ] Each file 200-600 lines (max 800 before splitting)
- [ ] Descriptive file names (no "advanced", "misc", "other")
- [ ] SKILL.md retains top 15 critical patterns, under 300 lines
- [ ] References expand (not duplicate) SKILL.md content
- [ ] Cross-links: SKILL.md→references, references→SKILL.md, references↔references
- [ ] Consistent structure across all reference files
- [ ] Token-efficient (omit empty sections)
- [ ] Synced to model directories

---

## Resources

- [REFERENCE-TEMPLATE.md](assets/REFERENCE-TEMPLATE.md) - Template for individual reference files
- [skill-creation](../skill-creation/SKILL.md) - Main skill creation workflow
- [conventions](../conventions/SKILL.md) - Coding standards
- [critical-partner](../critical-partner/SKILL.md) - Quality validation

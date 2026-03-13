---
name: reference-creation
description: "Reference files for complex skills (40+ patterns). Trigger: When creating complex skill with 40+ patterns or 4+ natural sub-topics."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: behavioral
  skills:
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

```
# {Skill Name} References

> {One-line description}

### Quick Navigation

| Reference                    | Purpose   | Read When     |
| ---------------------------- | --------- | ------------- |
| [sub-topic.md](sub-topic.md) | {Purpose} | {When needed} |

### Reading Strategy

For Simple Use Cases:
- Read main SKILL.md only

For Complex Use Cases:
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

```
### ✅ REQUIRED [CRITICAL]: Custom Hooks

{Brief inline example}

**For advanced hook patterns:** See [references/hooks.md](references/hooks.md).
```

### ✅ REQUIRED: Cross-Link Files

**From SKILL.md to references:**

```
### Resources

- [Hooks](references/hooks.md) - useState, useEffect, custom hooks
- [Components](references/components.md) - Composition, HOCs, render props

**See [references/README.md](references/README.md) for complete navigation.**
```

**Between references:**

```
### Related Topics

- See [components.md](components.md) for component composition patterns
- See [performance.md](performance.md) for optimization techniques
```

### ✅ REQUIRED [CRITICAL]: Token Efficiency

References must be precise yet economical. Remove filler, condense verbose phrases, eliminate redundancy.

**Filler words to remove:** "comprehensive", "detailed", "robust", "various", "multiple", "This reference provides...", "It is important to note...", "In order to", "Keep in mind"

**Condensing patterns:**

```markdown
# ❌ WRONG (verbose)
This section provides comprehensive guidance on how to implement custom hooks.

# ✅ CORRECT (token-efficient)
Covers custom hook implementation in React.
```

**Rule:** Every word must add value. If removing a word doesn't lose meaning, remove it.

See [references/templates.md](references/templates.md) for the full reference file structural template.

### ✅ REQUIRED: Reference File Structure

Each reference file follows: `# Title` → 1-2 sentence summary → `## Core Patterns` (FIRST H2) → patterns with inline examples → `## Common Pitfalls` → `## Real-World Examples` → `## Related Topics`.

**Key constraints:**

- `## Core Patterns` must be the FIRST H2 heading in every reference file
- NO "Overview" or "Purpose" section before Core Patterns
- Use H3 (`###`) inside reference files to avoid duplicate H2 violations

### ❌ NEVER: Create Catch-All References

```bash
# ❌ WRONG
references/advanced.md    # What's "advanced"?
references/misc.md        # No focus

# ✅ CORRECT
references/optimization.md     # Specific topic
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

# ✅ Good: 1 file, 400 lines, organized
references/hooks.md (400 lines)
  - useState section
  - useEffect section
```

Target 2-9 references. Hard limit: 10 (enforced by tests). More = harder to discover.

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

References count: 2-10 files?
  → No (>10): Consolidate — hard limit is 10 (enforced by tests)
  → Yes: Create references/ with README.md

README.md created with navigation?
  → No: MUST create (CRITICAL)
  → Yes: Validate cross-links and sync

Token efficiency applied?
  → No: Remove filler words, condense verbose phrases, eliminate redundancy
  → Yes: Ready for review
```

---

## Workflow

1. **Assess complexity** → Verify 40+ patterns or 4+ sub-topics (at least 2 criteria met)
2. **Identify sub-topics** → Group into 4-9 clusters of 10-20, descriptively named
3. **Create structure** → `mkdir references/` + README.md (Quick Navigation, Reading Strategy) + topic files
4. **Distribute content** → Top 15 in SKILL.md, deep dives in references (200-600 lines each, no duplication)
5. **Apply token efficiency** → Remove filler words, condense verbose phrases, eliminate redundancy
6. **Cross-link** → SKILL.md↔references, references↔references, Resources section lists all references
7. **Validate** → Run checklist, verify links, sync to model directories

---

## Example

React skill (70 patterns) split into 4 references:

```
skills/react/
├── SKILL.md (300 lines — top 15 patterns, decision tree, links)
└── references/
    ├── README.md (navigation + reading strategy)
    ├── hooks.md (400 lines — useState, useEffect, custom hooks)
    ├── components.md (350 lines — composition, props, HOCs)
    ├── performance.md (300 lines — memo, useMemo, code splitting)
    └── server-features.md (250 lines — SSR, RSC, data fetching)
```

README.md has 4 required sections: Quick Navigation table (with line counts), Reading Strategy per use case, File Descriptions, Cross-Reference Map. See [interface-design/references/README.md](../interface-design/references/README.md) for a real example.

---

## Edge Cases

**Version-specific patterns:** Create separate files (`hooks-react-17.md`, `hooks-react-18.md`) or sections within file.

**Cross-cutting concerns:** Create dedicated reference (e.g., `token-efficiency.md` in skill-creation).

**Too few patterns per sub-topic:** Merge sub-topics or keep inline in SKILL.md.

**References exceeding 800 lines:** Split into sub-references (`hooks-state.md`, `hooks-effects.md`).

---

## Checklist

- [ ] Complexity justified (40+ patterns or 4+ sub-topics)
- [ ] README.md exists with 4 required sections:
  - [ ] Quick Navigation table (with ~line counts for each file)
  - [ ] Reading Strategies by use case (how to navigate content)
  - [ ] File Descriptions (what each reference covers, ~line count)
  - [ ] Cross-Reference Map (topic interconnections between files)
- [ ] ≤10 reference files (2-9 recommended)
- [ ] Each file 200-600 lines (max 800 before splitting)
- [ ] Descriptive file names (no "advanced", "misc", "other")
- [ ] SKILL.md retains top 15 critical patterns, under 300 lines
- [ ] References expand (not duplicate) SKILL.md content
- [ ] Cross-links: SKILL.md→references, references→SKILL.md, references↔references
- [ ] Consistent structure across all reference files (# Title, summary, ## Core Patterns)
- [ ] `---` separator between every major `## ` section in each file (except before the first)
- [ ] No decorative emojis in headings (✅ ❌ ⚠️ are allowed; pictographic emoji are not)
- [ ] Token efficiency applied:
  - [ ] No filler words ("comprehensive", "detailed", "robust", "various")
  - [ ] No verbose phrases ("This reference provides...", "It is important to note...")
  - [ ] Condensed edge cases (brief descriptions, no redundancy)
  - [ ] Efficient lists (no "You should...", direct statements)
- [ ] Synced to model directories

---

## Resources

- [REFERENCE-TEMPLATE.md](assets/REFERENCE-TEMPLATE.md) - Template for individual reference files
- [skill-creation](../skill-creation/SKILL.md) - Main skill creation workflow
- [code-conventions](../code-conventions/SKILL.md) - Coding standards
- [critical-partner](../critical-partner/SKILL.md) - Quality validation
- [references/README.md](references/README.md) - Reference file navigation
- [references/templates.md](references/templates.md) - Full reference file template and examples

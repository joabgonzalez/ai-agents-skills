---
name: skill-creation
description: "Standards-compliant skill creation with templates and validation. Trigger: When creating a new skill or documenting patterns."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: behavioral
  skills:
    - reference-creation
    - skill-sync
    - english-writing
  allowed-tools:
    - file-operations
    - read-file
    - write-file
---

# Skill Creation

Create skills from simple single-file to complex multi-reference architectures. Each skill must have unique responsibility and be self-sufficient.

## When to Use

- Creating new skill from scratch
- Pattern is used repeatedly and AI needs guidance
- Project conventions differ from generic best practices
- Technology has multiple sub-topics requiring organization

Don't create when:

- Pattern is trivial or self-explanatory
- It's a one-off task

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Read Template Before Creating

**ALWAYS read the template FIRST** before creating any skill or reference:

```bash
# For new skill:
# 1. Read skills/skill-creation/assets/SKILL-TEMPLATE.md
# 2. Copy template
cp skills/skill-creation/assets/SKILL-TEMPLATE.md skills/{skill-name}/SKILL.md

# For new reference:
# 1. Read skills/skill-creation/assets/REFERENCE-TEMPLATE.md
# 2. Follow structure exactly
```

**Why:** Templates define canonical structure. Reading them ensures consistency and prevents structural errors.

### ✅ REQUIRED: Include Trigger in Description

```yaml
# ✅ CORRECT
description: "TypeScript strict patterns. Trigger: When implementing TypeScript in .ts/.tsx files."

# ❌ WRONG: Missing Trigger
description: "TypeScript strict patterns."
```

### ✅ REQUIRED: Frontmatter Structure

```yaml
---
name: skill-name              # Required: lowercase-with-hyphens
description: "What it does. Trigger: When to activate." # Required: include Trigger
license: "Apache 2.0"         # Optional: for npx distribution
metadata:
  version: "1.0"              # Required: semantic versioning (X.Y or X.Y.Z)
  type: framework             # Required: behavioral|universal|language|framework|library|tooling|domain
  skills:                     # Skill dependencies (see dependencies-matrix.md)
    - react
    - typescript
  dependencies:                # Package version ranges (if applicable)
    react: ">=17.0.0 <19.0.0"
  allowed-tools:               # Optional: only if skill needs specific tools
    - file-operations
---
```

**CRITICAL**: The `type` field determines which dependencies are allowed. See [dependencies-matrix.md](references/dependencies-matrix.md) for type rules.

See [frontmatter.md](references/frontmatter.md) for full field reference.

### ✅ REQUIRED: Include Inline Examples

Place focused example (<15 lines) after each Critical Pattern showing correct vs incorrect.

### ✅ REQUIRED: Add Decision Tree

Every skill MUST include a `## Decision Tree` section. Content MUST be inside a ` ``` ` code fence (no language tag). Rules inside the fence:

1. Conditions at column 0 (no leading spaces)
2. Actions indented with `  →` (2 spaces + Unicode arrow)
3. Use `→` not `->` (ASCII)
4. No markdown links `[text](url)` — use plain text (`see file.md`)
5. No inline backtick code — use plain text names
6. No bullet markers (`- ` or `* `) at line start
7. Blank line between each condition block

```
✅ CORRECT

Simple condition?
  → Single action

Complex condition?
  → Step A → Step B → Step C

Parallel options?
  → Option A (if X)
  → Option B (if Y)
```

```markdown
❌ WRONG: outside fence, bullet list, ASCII arrows, backticks, links

- **Condition?** -> Use `someApi()`. See [file.md](references/file.md)
```

### ✅ REQUIRED: Create References for Complex Skills

When skill has 40+ patterns or 4+ sub-topics:

```
skills/{skill-name}/
├── SKILL.md (400 lines max)
└── references/
    ├── {sub-topic-1}.md
    └── {sub-topic-2}.md
```

For complex skills, invoke [reference-creation](../reference-creation/SKILL.md) skill.

### ✅ REQUIRED: Self-Sufficient Content

Don't duplicate universal rules (naming, formatting, accessibility) — they apply everywhere. Include only skill-specific content. Each skill must work on its own without relying on the reader having other skills loaded.

### ✅ REQUIRED: Token Efficiency

- Omit empty frontmatter arrays/objects
- Description under 150 characters
- Remove filler words ("comprehensive", "detailed")
- Every word must add unique value

See [token-efficiency.md](references/token-efficiency.md) for compression strategies.

### ❌ NEVER: Duplicate Conventions

Don't rewrite rules that already apply universally (naming, formatting). Skills are self-sufficient — include only skill-specific conventions.

### ✅ REQUIRED: references/ README.md Structure (Complex Skills Only)

When creating references/ directory, ALWAYS include README.md with this 4-section structure:

```markdown
# [Skill Name] References

## Quick Navigation

| Reference | Lines | Topic |
|-----------|-------|-------|
| [file1.md](file1.md) | ~300 | Brief description |
| [file2.md](file2.md) | ~450 | Brief description |

## Reading Strategy

**Planning new feature:** Read main SKILL.md → file1.md → file2.md → Implement
**Debugging issue:** Read file2.md → file3.md
**Building design system:** Read file1.md, file3.md

## File Descriptions

### file1.md (~300 lines)
Detailed description of what this reference covers...

### file2.md (~450 lines)
Detailed description...

## Cross-Reference Map

**Topic A:** See file1.md → Links to file2.md section X
**Topic B:** See file2.md → Also covered in file3.md
```

See [interface-design/references/README.md](../interface-design/references/README.md) for complete example.

---

## Decision Tree

```
Creating new skill? (CRITICAL FIRST STEP)
  → Read assets/SKILL-TEMPLATE.md BEFORE creating
  → Understand structure: # Title, summary (1-2 lines), ## When to Use, ## Critical Patterns
  → NO "Overview" or "Objective" sections

Creating new reference file?
  → Read assets/REFERENCE-TEMPLATE.md BEFORE creating
  → Follow structure: # Title, summary (1-2 lines), ## Core Patterns
  → NO "Overview" or "Purpose" sections

Complexity?
  → <15 patterns, 1 topic → Simple: SKILL.md only
  → 15-40 patterns, 2-3 topics → Medium: SKILL.md + assets/
  → 40+ patterns, 4+ topics → Complex: SKILL.md + references/ (invoke reference-creation)

Exceeding 300 lines? → Move content to references/
Need templates/schemas? → Create assets/ directory

Determining skill type? (CRITICAL - type determines dependencies)
  → Read references/dependencies-matrix.md for full guide
  → Is it process/methodology (not tech-specific)? → type: behavioral
  → Tech-agnostic workflow orchestration? → type: universal
  → Programming language (JS, TS, Python)? → type: language
  → Framework (React, Express, Next)? → type: framework
  → Library (MUI, Redux, Zod)? → type: library
  → Dev tool (Vite, Jest, ESLint)? → type: tooling
  → Domain knowledge (a11y, CSS, patterns)? → type: domain

Determining dependencies based on type?
  → Read references/dependencies-matrix.md for type-specific rules
  → behavioral → Can ONLY depend on other behavioral (prefer NONE)
  → universal → Can ONLY depend on behavioral
  → language → Prefer NONE (self-sufficient)
  → framework → Can depend on framework, language, domain, behavioral
  → library → Can depend on library, framework, language, domain, behavioral
  → tooling → Can depend on what it wraps
  → domain → Prefer NONE (or related domain, behavioral)

Check for transitive redundancy? (CRITICAL)
  → Does any current dependency already provide what you need?
  → If YES → Remove redundant dependency
  → If NO → Keep it
  → Example: ag-grid depends on react → Gets javascript + a11y transitively

After creation? → Run ai-agents-skills sync or make sync
```

---

## Workflow

1. **Assess complexity** → Determine simple/medium/complex (see Decision Tree)
   - Checkpoint: ✅ Complexity level determined, structure chosen
2. **Create structure** → `mkdir skills/{name}` + copy SKILL-TEMPLATE.md
   - Checkpoint: ✅ Directory exists, template copied
3. **Determine type and dependencies** → Identify skill type (behavioral/universal/language/framework/library/tooling/domain), then determine dependencies per [dependencies-matrix.md](references/dependencies-matrix.md)
   - Checkpoint: ✅ Type correctly identified, dependencies follow type rules, no transitive redundancies
4. **Fill template** → Frontmatter (name, description+Trigger, version, type, skills), all required sections
   - Checkpoint: ✅ Frontmatter complete with type field, description includes Trigger, dependencies verified
5. **Add patterns** → Critical Patterns with inline examples, Decision Tree, Edge Cases
   - Checkpoint: ✅ Each pattern has ✅/❌ example, Decision Tree covers all cases, no duplication
6. **Validate and sync** → Run `ai-agents-skills validate --skill {name}` then `make sync`
   - Checkpoint: ✅ Validation passes, skill synced to model directories, SKILL.md under 300 lines (complex)

---

## Example

See [examples.md](references/examples.md) for complete examples:

- Simple skill (Prettier, <15 patterns)
- Medium skill (Formik, 15-40 patterns)
- Complex skill (React, 40+ patterns with references/)

---

## Edge Cases

**Migrating to complex:** If skill grows beyond 40 patterns, invoke reference-creation skill. Keep top 10-15 patterns in SKILL.md, move rest to references/. REQUIRED: Create README.md in references/ with 4 sections: Quick navigation table (with line counts), Reading strategies by use case, File descriptions, Cross-reference map. See [interface-design/references/README.md](../interface-design/references/README.md) and [tailwindcss/references/README.md](../tailwindcss/references/README.md) for examples.

**Version-specific patterns:** Use `references/current.md`, `references/legacy.md`, `references/migration.md`. For major versions (e.g., Tailwind v3 → v4), create dedicated migration guide with breaking changes table.

**Transversal topics:** Create separate reference file, link from multiple patterns. Examples: design-system.md for token hierarchy patterns (brand → semantic → component), dry-principle.md for DRY across frontend/backend.

---

## Checklist

Before finalizing any skill:

### Structure & Frontmatter

- [ ] Directory under `skills/` (lowercase-with-hyphens)
- [ ] Based on SKILL-TEMPLATE.md
- [ ] `name` and `description` (with Trigger) present
- [ ] `metadata.version` set — new skill starts at `1.0`; minor update → `1.x`; breaking change → `2.0`
- [ ] `metadata.type` set (behavioral|universal|language|framework|library|tooling|domain)
- [ ] `metadata.skills` follows type rules from [dependencies-matrix.md](references/dependencies-matrix.md)
- [ ] No transitive redundancies (verified against dependency chains)
- [ ] Empty arrays/objects omitted
- [ ] Complex skills: references/ directory created

### Content

- [ ] H1 title is the topic name only — no "Skill" suffix (e.g., `# React`, not `# React Skill`)
- [ ] When to Use (with Don't use when)
- [ ] Critical Patterns with ✅/❌ markers and inline examples (<15 lines each)
- [ ] Decision Tree: inside ``` fence, `→` arrows, no links/backticks/bullets inside fence
- [ ] Example section
- [ ] Edge Cases
- [ ] `---` separator between every major `## ` section (except before the first)
- [ ] No decorative emojis in headings (✅ ❌ ⚠️ are allowed; pictographic emoji are not)
- [ ] Delegates to code-conventions/a11y/humanizer (not duplicated)

### Quality

- [ ] Token-efficient (no filler, every word adds value)
- [ ] SKILL.md under 300 lines (complex skills)
- [ ] All referenced skills exist
- [ ] Synced to model directories

---

## Resources

| Reference | When to Read |
|-----------|-------------|
| [frontmatter.md](references/frontmatter.md) | Creating any skill |
| [structure.md](references/structure.md) | Medium/complex skills |
| [content-patterns.md](references/content-patterns.md) | Writing patterns/examples |
| [dependencies-matrix.md](references/dependencies-matrix.md) | Determining skill dependencies |
| [token-efficiency.md](references/token-efficiency.md) | Optimizing content |
| [examples.md](references/examples.md) | Learning from examples |
| [validation.md](references/validation.md) | Pre-finalization checks |

- [SKILL-TEMPLATE.md](assets/SKILL-TEMPLATE.md) - Main skill template
- `assets/frontmatter-schema.json` - Validation schema (reference only, not enforced by CLI)
- [Agent Skills Spec](https://agentskills.io/) - Official specification

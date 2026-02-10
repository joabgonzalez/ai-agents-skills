---
name: skill-creation
description: "Standards-compliant skill creation with templates and validation. Trigger: When creating a new skill or documenting patterns."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - reference-creation
    - critical-partner
    - skill-sync
    - english-writing
  allowed-tools:
    - file-operations
    - read-file
    - write-file
---

# Skill Creation

Create skills from simple single-file to complex multi-reference architectures. Each skill must have unique responsibility and delegate to conventions/a11y when applicable.

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

### ✅ REQUIRED: Use Template for Consistency

```bash
cp skills/skill-creation/assets/SKILL-TEMPLATE.md skills/{skill-name}/SKILL.md
```

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
  skills:                     # Skill dependencies (see dependencies-matrix.md)
    - conventions
    - typescript
  dependencies:                # Package version ranges (if applicable)
    react: ">=17.0.0 <19.0.0"
  allowed-tools:               # Optional: only if skill needs specific tools
    - file-operations
---
```

See [frontmatter.md](references/frontmatter.md) for full field reference.

### ✅ REQUIRED: Include Inline Examples

Place focused example (<15 lines) after each Critical Pattern showing correct vs incorrect.

### ✅ REQUIRED: Add Decision Tree

Every skill MUST include a Decision Tree section using condition→action format.

### ✅ REQUIRED: Create References for Complex Skills

When skill has 40+ patterns or 4+ sub-topics:

```
skills/{skill-name}/
├── SKILL.md (300 lines max)
└── references/
    ├── {sub-topic-1}.md
    └── {sub-topic-2}.md
```

For complex skills, invoke [reference-creation](../reference-creation/SKILL.md) skill.

### ✅ REQUIRED: Delegate to General Skills

Don't duplicate rules from conventions, a11y, humanizer, or architecture-patterns. Declare them in `metadata.skills` and add only skill-specific rules.

### ✅ REQUIRED: Token Efficiency

- Omit empty frontmatter arrays/objects
- Description under 150 characters
- Remove filler words ("comprehensive", "detailed")
- Every word must add unique value

See [token-efficiency.md](references/token-efficiency.md) for compression strategies.

### ❌ NEVER: Duplicate Conventions

Don't rewrite rules from conventions or a11y. Delegate first, then add skill-specific rules.

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

### Modern Pattern Examples

**Design systems:** Token hierarchy (brand → semantic → component), CVA (Class Variance Authority) for type-safe variants, OKLCH color space. See [tailwindcss/references/design-system.md](../tailwindcss/references/design-system.md).

**Design thinking:** Validation checkpoints at each stage (User flow → Component → State → A11y). See [interface-design/SKILL.md](../interface-design/SKILL.md).

**Behavioral workflows:** Structured review templates, decision trees with rationale. See [critical-partner/SKILL.md](../critical-partner/SKILL.md) and [systematic-debugging/SKILL.md](../systematic-debugging/SKILL.md).

---

## Decision Tree

```
Complexity?
  → <15 patterns, 1 topic → Simple: SKILL.md only
  → 15-40 patterns, 2-3 topics → Medium: SKILL.md + assets/
  → 40+ patterns, 4+ topics → Complex: SKILL.md + references/ (invoke reference-creation)

Exceeding 300 lines? → Move content to references/
Need templates/schemas? → Create assets/ directory

Determining skill dependencies?
  → Read references/dependencies-matrix.md
  → Match skill category (Frontend/Backend/Testing/etc.)
  → Frontend: conventions, a11y, typescript, javascript, architecture-patterns, humanizer
  → Backend: conventions, nodejs, typescript, architecture-patterns (NO humanizer)
  → Testing: conventions, typescript, javascript (NO humanizer)
  → Build tools: conventions only

Generic rules? → Delegate to conventions
Accessibility rules? → Delegate to a11y
User-facing content/UI? → Add humanizer to skills
Architecture patterns? → Delegate to architecture-patterns

After creation? → Run ai-agents-skills sync or make sync
```

---

## Workflow

1. **Assess complexity** → Determine simple/medium/complex (see Decision Tree)
   - Checkpoint: ✅ Complexity level determined, structure chosen
2. **Create structure** → `mkdir skills/{name}` + copy SKILL-TEMPLATE.md
   - Checkpoint: ✅ Directory exists, template copied
3. **Fill template** → Frontmatter (name, description+Trigger, version, skills via [dependencies-matrix.md](references/dependencies-matrix.md)), all required sections
   - Checkpoint: ✅ Frontmatter complete, description includes Trigger, dependencies correct per matrix
4. **Add patterns** → Critical Patterns with inline examples, Decision Tree, Edge Cases
   - Checkpoint: ✅ Each pattern has ✅/❌ example, Decision Tree covers all cases, no duplication of conventions/a11y
5. **Validate and sync** → Run `ai-agents-skills validate --skill {name}` then `make sync`
   - Checkpoint: ✅ Validation passes, skill synced to model directories, SKILL.md under 300 lines (complex)

### Version Management

| Change Type | Version Bump | Example |
|------------|-------------|---------|
| Add/update patterns, examples, docs | Minor (1.0→1.1) | New pattern added |
| Breaking: remove patterns, change responsibility | Major (1.x→2.0) | Skill restructured |
| New skill | Start at 1.0 | Always |

---

## Conventions

Delegate to conventions (naming, code org), a11y (semantics, ARIA), english-writing (generated content). Add only skill-creation-specific rules below.

### Skill-Creation-Specific

- Lowercase-with-hyphens for directory/file names
- Include Trigger clause in description
- Decision Tree in every skill
- Inline examples under 15 lines
- SKILL.md max 300 lines for complex skills

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
- [ ] `metadata.version` set (start at "1.0")
- [ ] `metadata.skills` follows [dependencies-matrix.md](references/dependencies-matrix.md) for skill category
- [ ] Empty arrays/objects omitted
- [ ] Complex skills: references/ directory created

### Content
- [ ] When to Use (with Don't use when)
- [ ] Critical Patterns with ✅/❌ markers and inline examples (<15 lines each)
- [ ] Decision Tree (condition→action format)
- [ ] Example section
- [ ] Edge Cases
- [ ] Delegates to conventions/a11y/humanizer (not duplicated)

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
- [frontmatter-schema.json](assets/frontmatter-schema.json) - Validation schema (reference only, not enforced by CLI)
- [Agent Skills Spec](https://agentskills.io/) - Official specification

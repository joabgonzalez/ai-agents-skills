# Frontmatter Standards

> Complete guide to skill frontmatter requirements, YAML syntax, and validation

## Required Fields

### name (required)

**Format:** lowercase-with-hyphens, must match directory name

```yaml
name: skill-creation    # ✅ CORRECT
name: Skill Creation    # ❌ WRONG: uppercase
name: skill_creation    # ❌ WRONG: underscores
```

### description (required)

**Format:** `"{Brief description}. Trigger: {When AI should invoke}."`

```yaml
# ✅ CORRECT: Includes Trigger, concise
description: "TypeScript strict patterns. Trigger: When implementing TypeScript in .ts/.tsx files."

# ❌ WRONG: Missing Trigger
description: "TypeScript strict patterns and best practices."

# ❌ WRONG: Redundant/wordy
description: "This skill provides comprehensive guidance for TypeScript. Trigger: When working with TypeScript."
```

Rules:
- Include "Trigger:" clause (mandatory)
- Under 150 characters
- Eliminate filler words

### metadata.version (required)

**Format:** Semantic version (`X.Y` or `X.Y.Z`). Start at `1.0` for new skills.

```yaml
metadata:
  version: "1.0"     # ✅ New skill
  version: "1.1"     # ✅ Minor update (patterns added)
  version: "2.0"     # ✅ Major update (breaking changes)
```

---

## Optional Fields

**CRITICAL RULE:** Include optional fields ONLY when they add specificity. Omit empty arrays/objects completely.

### license (optional)

**When to include:** For skills distributed via npx.

```yaml
license: "Apache 2.0"    # ✅ For npx distribution
license: "MIT"            # ✅ Alternative
```

### metadata.skills (optional)

**Purpose:** Internal skill dependencies. The CLI resolves these during installation.

```yaml
# ✅ CORRECT: YAML list syntax
metadata:
  skills:
    - conventions
    - a11y

# ❌ WRONG: Array syntax
metadata:
  skills: ["conventions", "a11y"]

# ✅ OMIT if no dependencies
```

See [dependencies-matrix.md](dependencies-matrix.md) for recommended skills by category.

### metadata.dependencies (optional)

**Purpose:** External libraries/packages with version ranges.

```yaml
# ✅ CORRECT: YAML object with version ranges
metadata:
  dependencies:
    prettier: ">=2.0.0 <4.0.0"
    typescript: ">=4.0.0 <6.0.0"

# ❌ WRONG: No version range
metadata:
  dependencies:
    prettier: latest

# ✅ OMIT if no external dependencies
```

### metadata.allowed-tools (optional)

**Purpose:** Specific tools the AI agent needs. Only include when the skill requires particular tools (e.g., file operations). **Do not add generic tools** like `documentation-reader` or `web-search`.

```yaml
# ✅ CORRECT: Skill-specific tools
metadata:
  allowed-tools:
    - file-operations
    - read-file
    - write-file

# ❌ WRONG: Generic tools (omit these)
metadata:
  allowed-tools:
    - documentation-reader
    - web-search

# ✅ OMIT for skills that don't need specific tools
```

---

## Complete Frontmatter Examples

### Minimal (no dependencies)

```yaml
---
name: prettier
description: "Prettier code formatting. Trigger: When configuring code formatting or setting up Prettier."
metadata:
  version: "1.0"
---
```

### Medium complexity

```yaml
---
name: formik
description: "Formik form handling patterns. Trigger: When implementing forms with Formik in React."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - react
    - conventions
  dependencies:
    formik: ">=2.0.0 <3.0.0"
---
```

### Complex skill

```yaml
---
name: skill-creation
description: "Standards-compliant skill creation with templates. Trigger: When creating a new skill or documenting patterns."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - reference-creation
    - critical-partner
    - process-documentation
    - skill-sync
    - english-writing
  allowed-tools:
    - file-operations
    - read-file
    - write-file
---
```

---

## Formatting Rules

### YAML Syntax

**Arrays:** Always use `- item` syntax, never `[]`

```yaml
# ✅ CORRECT
metadata:
  skills:
    - conventions
    - a11y

# ❌ WRONG
metadata:
  skills: ["conventions", "a11y"]
```

**Empty fields:** OMIT completely (saves tokens)

```yaml
# ❌ WRONG
metadata:
  skills: []
  dependencies: {}
  allowed-tools: []

# ✅ CORRECT: Just omit them
metadata:
  version: "1.0"
  skills:
    - conventions
```

---

## Validation

### Manual Checklist

- [ ] Enclosed in triple dashes (`---`)
- [ ] `name` present, lowercase-with-hyphens, matches directory
- [ ] `description` present, includes "Trigger:" clause, under 150 chars
- [ ] `metadata.version` present (start at "1.0")
- [ ] Arrays use `- item` syntax
- [ ] Empty arrays/objects omitted
- [ ] All referenced skills exist in `skills/` directory
- [ ] Version ranges for dependencies (if present)

### Schema Reference

Schema: [frontmatter-schema.json](../assets/frontmatter-schema.json) (reference only, not enforced by CLI)

---

## Common Mistakes

**Missing Trigger:**
```yaml
description: "TypeScript patterns."                           # ❌
description: "TypeScript patterns. Trigger: When using TS."   # ✅
```

**Empty arrays/objects:**
```yaml
metadata:
  skills: []              # ❌ Omit entirely
  dependencies: {}        # ❌ Omit entirely
```

**Wrong array syntax:**
```yaml
metadata:
  skills: ["conventions"] # ❌
  skills:
    - conventions          # ✅
```

**Name mismatch:**
```yaml
# Directory: skills/react-native/
name: react_native    # ❌ Underscore
name: ReactNative     # ❌ Uppercase
name: react-native    # ✅ Matches directory
```

---

## Reference

- Schema: [frontmatter-schema.json](../assets/frontmatter-schema.json)
- Template: [SKILL-TEMPLATE.md](../assets/SKILL-TEMPLATE.md)
- Dependencies: [dependencies-matrix.md](dependencies-matrix.md)
- Main guide: [SKILL.md](../SKILL.md)

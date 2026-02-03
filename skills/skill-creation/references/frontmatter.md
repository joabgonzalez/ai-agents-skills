# Frontmatter Standards

> Complete guide to skill frontmatter requirements, YAML syntax, and validation

## Overview

Frontmatter defines skill metadata using YAML enclosed in triple dashes. This guide covers required fields, optional fields, formatting rules, validation, and common mistakes.

---

## Required Fields

### name (required)

**Purpose:** Unique skill identifier  
**Format:** lowercase-with-hyphens  
**Rules:**

- No spaces, underscores, or special characters
- Keep concise (1-3 words)
- Match directory name exactly

```yaml
name: skill-creation    # ✅ CORRECT
name: Skill Creation    # ❌ WRONG: uppercase
name: skill_creation    # ❌ WRONG: underscores
```

### description (required)

**Purpose:** Clear summary including Trigger clause  
**Format:** `"{Brief description}. Trigger: {When AI should invoke this skill}."`  
**Rules:**

- Single sentence with period
- Include "Trigger:" clause (mandatory)
- Token-efficient: eliminate filler words
- Every word must add value

```yaml
# ✅ CORRECT: Includes Trigger, concise
description: TypeScript strict patterns and best practices. Trigger: When implementing or refactoring TypeScript in .ts/.tsx files.

# ❌ WRONG: Missing Trigger
description: TypeScript strict patterns and best practices.

# ❌ WRONG: Redundant/wordy
description: This skill provides comprehensive guidance for TypeScript development including patterns and best practices. Trigger: When working with TypeScript.
```

---

## Optional Fields

**CRITICAL RULE:** Include optional fields ONLY when they add specificity beyond description. Omit empty arrays/objects completely.

### input (optional)

**When to include:**

- Input format is non-obvious from description
- Multiple input types accepted
- Specific data structure required

**Format:** `"description | data_type"`

```yaml
# ✅ INCLUDE: Adds specificity
input: "Skill name and patterns list | string, array"

# ❌ OMIT: Obvious from description
input: "User request | string"
```

### output (optional)

**When to include:**

- Output format is non-obvious
- Returns structured data
- Multiple output types possible

**Format:** `"description | data_type"`

```yaml
# ✅ INCLUDE: Adds specificity
output: "Validated SKILL.md file with frontmatter | markdown"

# ❌ OMIT: Obvious from description
output: "Success confirmation | string"
```

### dependencies (optional)

**Purpose:** External libraries/packages with version ranges  
**When to include:** Skill requires specific external dependencies  
**Format:** YAML object with semantic version ranges

```yaml
# ✅ CORRECT: YAML object syntax
dependencies:
  prettier: ">=2.0.0 <4.0.0"
  typescript: ">=4.0.0 <6.0.0"

# ❌ WRONG: Array syntax
dependencies:
  - prettier: ">=2.0.0 <4.0.0"

# ❌ WRONG: No version range
dependencies:
  prettier: latest

# ✅ OMIT if no external dependencies (don't include empty object)
```

### skills (optional)

**Purpose:** Internal skill references  
**When to include:** Skill delegates to or depends on other skills  
**Format:** YAML list with `- item` syntax

```yaml
# ✅ CORRECT: YAML list syntax
skills:
  - conventions
  - a11y

# ❌ WRONG: Array syntax
skills: ["conventions", "a11y"]

# ❌ WRONG: Object syntax
skills:
  conventions: true
  a11y: true

# ✅ OMIT if no skill dependencies (don't include empty array)
```

### allowed-tools (optional)

**Purpose:** Tools the AI agent can use  
**When to include:** Skill requires specific tool access  
**Format:** YAML list with `- item` syntax

```yaml
# ✅ CORRECT
allowed-tools:
  - file-operations
  - read-file
  - web-search

# ❌ WRONG: Array syntax
allowed-tools: ["file-operations", "read-file"]

# ✅ OMIT if no tool restrictions (don't include empty array)
```

---

## Formatting Rules

### YAML Syntax

**Arrays:** Always use `- item` syntax, never `[]`

```yaml
# ✅ CORRECT
skills:
  - conventions
  - a11y

# ❌ WRONG
skills: []
skills: ["conventions", "a11y"]
```

**Objects:** Use proper YAML indentation, never `{}`

```yaml
# ✅ CORRECT
dependencies:
  prettier: ">=2.0.0 <4.0.0"

# ❌ WRONG
dependencies: {}
dependencies: {prettier: ">=2.0.0"}
```

**Empty fields:** OMIT completely (saves tokens)

```yaml
# ✅ CORRECT: Omit if empty
skills:
  - conventions

# ❌ WRONG: Don't include empty fields
skills:
  - conventions
allowed-tools: []
dependencies: {}
```

---

## Validation

### Using JSON Schema

Validate frontmatter against schema:

```bash
# Extract frontmatter from SKILL.md
sed -n '/^---$/,/^---$/p' SKILL.md > temp-frontmatter.yml

# Validate (requires yq or similar)
yq eval -o=json temp-frontmatter.yml | \
  yq eval-all '.' skills/skill-creation/assets/frontmatter-schema.json -
```

### Manual Checklist

- [ ] Enclosed in triple dashes (`---`)
- [ ] Required fields present: `name`, `description`
- [ ] Description includes "Trigger:" clause
- [ ] `name` matches directory name (lowercase, hyphens)
- [ ] Arrays use `- item` syntax
- [ ] Objects use proper YAML indentation
- [ ] Empty arrays/objects omitted
- [ ] Version ranges for dependencies
- [ ] All referenced skills exist in `skills/` directory

---

## Common Mistakes

### Mistake 1: Missing Trigger

```yaml
# ❌ WRONG
description: TypeScript patterns and best practices.

# ✅ CORRECT
description: TypeScript patterns and best practices. Trigger: When implementing TypeScript in .ts/.tsx files.
```

### Mistake 2: Empty Arrays/Objects

```yaml
# ❌ WRONG: Wastes tokens
skills: []
dependencies: {}
allowed-tools: []

# ✅ CORRECT: Omit completely
skills:
  - conventions
```

### Mistake 3: Wrong Array Syntax

```yaml
# ❌ WRONG
skills: ["conventions", "a11y"]

# ✅ CORRECT
skills:
  - conventions
  - a11y
```

### Mistake 4: Name Mismatch

```yaml
# Directory: skills/react-native/
name: react_native    # ❌ WRONG: underscore
name: ReactNative     # ❌ WRONG: uppercase
name: react-native    # ✅ CORRECT: matches directory
```

### Mistake 5: Redundant Description

```yaml
# ❌ WRONG: Redundant words
description: This comprehensive skill provides detailed guidance and best practices for creating and maintaining skills in the project using proper conventions and standards. Trigger: When creating skills.

# ✅ CORRECT: Token-efficient
description: Guide for creating standards-compliant skills with templates, references, and validation. Trigger: When creating a new skill.
```

---

## Examples

### Minimal Skill (No Dependencies)

```yaml
---
name: prettier
description: Prettier code formatting configuration and integration. Trigger: When configuring code formatting or setting up Prettier.
---
```

### Medium Complexity

```yaml
---
name: formik
description: Formik form handling patterns with validation. Trigger: When implementing forms with Formik in React.
skills:
  - react
  - yup
dependencies:
  formik: ">=2.0.0 <3.0.0"
---
```

### Complex Skill

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
```

---

## Token Efficiency Guidelines

**Be precise and concise:**

- Eliminate filler words ("comprehensive", "detailed", "various")
- Remove redundancy ("patterns and best practices" → "patterns")
- Use active voice ("Create skills" vs "Skills should be created")
- Omit obvious information
- Every word must add unique value

**Before:**

> This comprehensive skill provides detailed guidance for TypeScript development including various patterns and best practices for strict typing. Trigger: When working with TypeScript.

**After (60% shorter):**

> TypeScript strict patterns and best practices. Trigger: When implementing TypeScript in .ts/.tsx files.

---

## Reference

- Schema: [frontmatter-schema.json](../assets/frontmatter-schema.json)
- Template: [SKILL-TEMPLATE.md](../assets/SKILL-TEMPLATE.md)
- Main guide: [SKILL.md](../SKILL.md)

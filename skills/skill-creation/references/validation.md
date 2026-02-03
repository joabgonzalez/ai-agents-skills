# Validation and Compliance

> Complete checklist and validation procedures for ensuring skill quality and standards compliance

## Overview

Validation ensures skills meet all structural, content, and formatting requirements. This guide provides comprehensive checklists, automated validation tools, and manual review procedures.

---

## Pre-Creation Validation

### Context Gathering

Before creating skill, answer:

- [ ] **Purpose:** What problem does this skill solve?
- [ ] **Scope:** What's included/excluded?
- [ ] **Complexity:** Simple (<15), Medium (15-40), or Complex (40+) patterns?
- [ ] **Sub-topics:** Natural divisions (hooks, components, etc.)?
- [ ] **Dependencies:** External libraries needed?
- [ ] **Overlap:** Does conventions/a11y already cover this?

---

## Structure Validation

### Directory Structure

- [ ] Directory created under `skills/`
- [ ] Name is lowercase with hyphens (no spaces, underscores, uppercase)
- [ ] Directory name matches frontmatter `name` field exactly
- [ ] `SKILL.md` file exists
- [ ] `assets/` directory created (if templates/schemas needed)
- [ ] `references/` directory created (if 40+ patterns or 4+ sub-topics)

### File Naming

- [ ] Main file is `SKILL.md` (not `README.md` or `skill.md`)
- [ ] Reference files use lowercase-with-hyphens.md
- [ ] No special characters in file names (only letters, numbers, hyphens)
- [ ] Reference names are descriptive (not `advanced.md` or `misc.md`)

---

## Frontmatter Validation

### Required Fields

- [ ] Enclosed in triple dashes (`---`)
- [ ] `name` field present (lowercase, hyphens)
- [ ] `description` field present
- [ ] Description includes "Trigger: {when to invoke}"
- [ ] Name matches directory name

### Optional Fields (When Present)

- [ ] `input`/`output` add specificity (not obvious)
- [ ] `dependencies` uses YAML object syntax (not array)
- [ ] `dependencies` includes version ranges (not "latest")
- [ ] `skills` uses YAML list syntax with `- item`
- [ ] `allowed-tools` uses YAML list syntax with `- item`
- [ ] All referenced skills exist in `skills/` directory
- [ ] Empty arrays/objects are OMITTED (not `[]` or `{}`)

### Syntax Validation

```bash
# Extract and validate frontmatter
sed -n '/^---$/,/^---$/p' SKILL.md > temp.yml
yq eval . temp.yml  # Should parse without errors

# Validate against schema
yq eval -o=json temp.yml | \
  yq eval-all '.' skills/skill-creation/assets/frontmatter-schema.json -
```

---

## Content Validation

### Required Sections

- [ ] `# Skill Name` (h1 heading)
- [ ] `## Overview` (2-5 sentences)
- [ ] `## Objective` (clear purpose statement)
- [ ] `## When to Use` (with "Don't use when")
- [ ] `## Critical Patterns` (with ✅/❌ markers)
- [ ] `## Decision Tree` (condition→action format)
- [ ] `## Conventions` (with delegation to conventions/a11y)
- [ ] `## Example` (practical demonstration)
- [ ] `## Edge Cases` (boundary conditions)
- [ ] `## Resources` (if assets/ or references/ exist)

### Section Quality

- [ ] Overview: 2-5 sentences (not essay)
- [ ] Objective: Clear purpose, not redundant with overview
- [ ] When to Use: Specific scenarios (not vague)
- [ ] Critical Patterns: Each has inline example under 15 lines
- [ ] Decision Tree: Uses `condition? → action` format
- [ ] Conventions: Delegates before adding skill-specific rules
- [ ] Example: Complete working code (not fragments)
- [ ] Edge Cases: Includes workarounds/solutions

---

## Critical Patterns Validation

### Pattern Structure

Each pattern should have:

- [ ] Visual marker (✅/❌/⚠️)
- [ ] Descriptive name
- [ ] Brief explanation (1-2 sentences)
- [ ] Inline code example (under 15 lines)
- [ ] Example shows ✅ CORRECT and ❌ WRONG (when applicable)
- [ ] Comments explain why

### Priority Labels (Optional - 30+ patterns only)

If using priority labels:

- [ ] Used only for skills with 30+ patterns
- [ ] Format: `[CRITICAL]` or `[HIGH]` after marker
- [ ] CRITICAL: Must-follow patterns (prevents bugs)
- [ ] HIGH: Follow in most cases (best practices)
- [ ] Not overused (max 30% of patterns are CRITICAL)

### Examples

````markdown
# ✅ VALID: Complete pattern

### ✅ REQUIRED: Hook Dependencies

Always include all values used inside useEffect.

```typescript
// ✅ CORRECT
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ WRONG
useEffect(() => {
  fetchData(userId);
}, []);
```
````

# ❌ INVALID: Missing example

### ✅ REQUIRED: Hook Dependencies

Always include all values used inside useEffect.

{No example provided}

````

---

## Decision Tree Validation

### Format Requirements

- [ ] Wrapped in triple backticks (```...```)
- [ ] Uses `condition? → action` format
- [ ] Includes "Otherwise" catch-all
- [ ] Conditions are clear and testable
- [ ] Actions are specific and actionable
- [ ] Ordered by likelihood (most common first)

### Example Validation

```markdown
# ✅ VALID: Clear conditions and actions
````

TypeScript file? → Use strict typing
JavaScript file? → Use JSDoc comments
Otherwise → Skip typing

```

# ❌ INVALID: Vague conditions
```

Modern project? → Do modern things
Old project? → Do old things

```

# ❌ INVALID: Missing Otherwise
```

TypeScript? → Use strict
JavaScript? → Use JSDoc
{No catch-all}

```

```

---

## Reference Files Validation (Complex Skills)

### When Required

- [ ] Skill has 40+ patterns
- [ ] Skill has 4+ natural sub-topics
- [ ] SKILL.md would exceed 300 lines with all patterns

### Reference Structure

Each reference file should have:

- [ ] Created in `references/` directory
- [ ] Name is descriptive (lowercase-with-hyphens.md)
- [ ] Contains 10-20 patterns on ONE sub-topic
- [ ] Includes sections: Overview, Core Patterns, Common Pitfalls, Examples
- [ ] Linked from main SKILL.md (in Critical Patterns and Resources)
- [ ] Links back to main SKILL.md
- [ ] Cross-links to related references
- [ ] Under 800 lines (split if larger)

### Reference Linking

- [ ] Mentioned in relevant Critical Pattern
- [ ] Listed in Resources section
- [ ] Link format: `[Title](references/file.md)`
- [ ] Link text is descriptive (not "click here")

---

## Delegation Validation

### Conventions Skill

- [ ] Generic coding standards delegated to `conventions`
- [ ] Conventions referenced in `skills` field
- [ ] Conventions section says "Refer to conventions for:"
- [ ] Only skill-specific rules added after delegation

### A11y Skill

- [ ] Accessibility concerns delegated to `a11y`
- [ ] A11y referenced in `skills` field (if applicable)
- [ ] Conventions section says "Refer to a11y for:"
- [ ] Only skill-specific a11y rules added

### Verification

```markdown
# ✅ VALID: Proper delegation

## Conventions

Refer to conventions for:

- Naming patterns
- Code organization

Refer to a11y for:

- Semantic HTML
- ARIA attributes

### Skill-Specific

- TypeScript strict mode required

# ❌ INVALID: Duplicating conventions

## Conventions

- Use camelCase for variables
- Use PascalCase for classes
- ...
```

---

## Token Efficiency Validation

### Frontmatter

- [ ] Description under 150 characters
- [ ] No empty arrays/objects
- [ ] input/output omitted if obvious
- [ ] No redundant words ("comprehensive", "detailed")

### Content

- [ ] No introductory paragraphs before sections
- [ ] Filler phrases removed
- [ ] Redundant points unified
- [ ] Code examples under 15 lines
- [ ] Tables used for comparisons
- [ ] Decision tree in compact format

### Overall

- [ ] SKILL.md under 300 lines (complex skills)
- [ ] Every word adds unique value
- [ ] No redundancy across sections
- [ ] Active voice, imperative mood

**See [token-efficiency.md](token-efficiency.md) for detailed optimization techniques.**

---

## Writing Quality Validation

### Typography

- [ ] ASCII apostrophes (`'`) not typographic (`'`)
- [ ] Hyphens (`-`) for compounds
- [ ] Em dashes (`—`) for breaks (sparingly)
- [ ] Straight quotes (`"`) not smart quotes (`"`)
- [ ] No emojis except ✅/❌ for visual contrast

### Language

- [ ] All content in English (American spelling)
- [ ] Active voice ("Use useState" not "useState should be used")
- [ ] Imperative mood ("Add dependency" not "You should add")
- [ ] Direct address (minimal "you")
- [ ] No hedging ("Use" not "Consider using")

### Formatting

- [ ] Horizontal rules (`---`) separate major sections
- [ ] Headings hierarchical (h2 → h3 → h4)
- [ ] Code fences with language specifiers
- [ ] Tables aligned and formatted
- [ ] Lists use consistent markers

---

## Automated Validation

### Shell Script

```bash
#!/bin/bash
# validate-skill.sh - Validate skill structure and content

SKILL_DIR="$1"
ERRORS=0

# Check directory exists
[ ! -d "$SKILL_DIR" ] && echo "ERROR: Directory not found" && exit 1

# Check SKILL.md exists
[ ! -f "$SKILL_DIR/SKILL.md" ] && echo "ERROR: SKILL.md missing" && ((ERRORS++))

# Check frontmatter
if grep -q "^---$" "$SKILL_DIR/SKILL.md"; then
  # Check required fields
  grep -q "^name:" "$SKILL_DIR/SKILL.md" || { echo "ERROR: Missing 'name' field"; ((ERRORS++)); }
  grep -q "^description:" "$SKILL_DIR/SKILL.md" || { echo "ERROR: Missing 'description' field"; ((ERRORS++)); }
  grep -q "Trigger:" "$SKILL_DIR/SKILL.md" || { echo "ERROR: Missing 'Trigger' in description"; ((ERRORS++)); }
else
  echo "ERROR: Missing frontmatter"
  ((ERRORS++))
fi

# Check required sections
grep -q "^## Overview" "$SKILL_DIR/SKILL.md" || { echo "WARNING: Missing Overview section"; }
grep -q "^## Critical Patterns" "$SKILL_DIR/SKILL.md" || { echo "ERROR: Missing Critical Patterns"; ((ERRORS++)); }
grep -q "^## Decision Tree" "$SKILL_DIR/SKILL.md" || { echo "ERROR: Missing Decision Tree"; ((ERRORS++)); }

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ Validation passed"
  exit 0
else
  echo "❌ Validation failed with $ERRORS errors"
  exit 1
fi
```

### Usage

```bash
# Validate specific skill
./scripts/validate-skill.sh skills/react

# Validate all skills
for dir in skills/*/; do
  echo "Validating $(basename "$dir")..."
  ./scripts/validate-skill.sh "$dir"
done
```

---

## Post-Creation Validation

### Integration

- [ ] Skill added to AGENTS.md Available Skills table
- [ ] Skill added to AGENTS.md Mandatory Skills table (if auto-invoke)
- [ ] Skill synced to model directories (`.github/`, `.claude/`, etc.)

### Review

- [ ] Reviewed by critical-partner skill
- [ ] Feedback incorporated
- [ ] Changes documented with process-documentation

### Testing

- [ ] Invoked skill with test scenario
- [ ] AI read entire SKILL.md before executing
- [ ] AI consulted Decision Tree
- [ ] AI followed Critical Patterns
- [ ] If complex: AI read required references

---

## Complete Compliance Checklist

### Structure ✓

- [ ] Directory under `skills/` (lowercase, hyphens)
- [ ] `SKILL.md` file exists
- [ ] Complexity assessed (simple/medium/complex)
- [ ] `assets/` directory (if needed)
- [ ] `references/` directory (if 40+ patterns)
- [ ] All files follow naming conventions

### Frontmatter ✓

- [ ] Required fields: `name`, `description` (with Trigger)
- [ ] Optional fields add value (not obvious)
- [ ] Empty arrays/objects omitted
- [ ] Arrays use `- item` syntax
- [ ] Objects use proper YAML indentation
- [ ] Version ranges for dependencies
- [ ] All referenced skills exist
- [ ] Validates against schema

### Content ✓

- [ ] All required sections present
- [ ] Overview (2-5 sentences)
- [ ] Objective (clear purpose)
- [ ] When to Use (with negatives)
- [ ] Critical Patterns (with inline examples <15 lines)
- [ ] Decision Tree (condition→action format)
- [ ] Conventions (delegate to conventions/a11y first)
- [ ] Edge Cases (with workarounds)
- [ ] Resources (link assets/ and references/)

### Quality ✓

- [ ] Delegates to conventions/a11y (not duplicated)
- [ ] Token-efficient (no redundancy, filler removed)
- [ ] Inline examples under 15 lines
- [ ] Decision tree helps AI decide
- [ ] Complex skills: references/ properly structured
- [ ] Active voice, imperative mood
- [ ] ASCII characters only

### Post-Creation ✓

- [ ] Added to AGENTS.md tables
- [ ] Synced to model directories
- [ ] Reviewed by critical-partner
- [ ] Documented with process-documentation

---

## Common Validation Failures

### 1. Missing Trigger in Description

```yaml
# ❌ FAILS
description: TypeScript patterns and best practices.

# ✅ PASSES
description: TypeScript patterns and best practices. Trigger: When implementing TypeScript.
```

### 2. Empty Arrays in Frontmatter

```yaml
# ❌ FAILS
skills: []
dependencies: {}

# ✅ PASSES (omit completely)
skills:
  - conventions
```

### 3. No Inline Examples

````markdown
# ❌ FAILS

### ✅ REQUIRED: Hook Dependencies

Always include dependencies.

# ✅ PASSES

### ✅ REQUIRED: Hook Dependencies

Always include dependencies.

```typescript
useEffect(() => { ... }, [deps]);
```
````

````

### 4. Missing Decision Tree

```markdown
# ❌ FAILS: No Decision Tree section

# ✅ PASSES
## Decision Tree

````

TypeScript? → Use strict
JavaScript? → Use JSDoc
Otherwise → Skip typing

```

```

---

## Reference

- Main guide: [SKILL.md](../SKILL.md)
- Frontmatter: [frontmatter.md](frontmatter.md)
- Token efficiency: [token-efficiency.md](token-efficiency.md)
- Examples: [examples.md](examples.md)

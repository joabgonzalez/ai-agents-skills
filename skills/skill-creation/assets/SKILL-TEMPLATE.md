---
name: {skill-name}
description: {One-line precise description of what this skill does}. Trigger: {When the AI should invoke this skill - be specific about actions, tasks, or contexts}.
skills:
  - conventions
  - a11y
dependencies:
  {package-name}: "{version-range}"
allowed-tools:
  - documentation-reader
  - web-search
---

# {Skill Name}

## Overview

{Brief summary of purpose and scope in 2-3 sentences. What problem does this skill solve?}

## Objective

{Clear statement of purpose, expected behavior, and boundaries. What should the AI agent accomplish when using this skill?}

---

## When to Use

Use this skill when:

- {Condition 1}
- {Condition 2}
- {Condition 3}

---

## Critical Patterns

{The MOST important rules - what AI MUST follow. Mark priority with REQUIRED or NEVER.}

### ✅ REQUIRED Pattern: {Name}

```{language}
// Example of required pattern
{code example showing correct approach}
```

### ❌ NEVER: {Anti-pattern Name}

```{language}
// Example of what to avoid
{code example showing incorrect approach}
```

---

## Decision Tree

```
{Question or condition}? → {Action A}
{Question or condition}? → {Action B}
Otherwise                → {Default action}
```

---

## Conventions

Refer to conventions for:

- {General convention 1}
- {General convention 2}

Refer to a11y for:

- {Accessibility concern 1}
- {Accessibility concern 2}

### {Skill}-Specific Conventions

- {Unique rule specific to this technology/framework}
- {Another skill-specific convention}
- {Best practice unique to this domain}

---

## Example

```{language}
// Practical, minimal example demonstrating core usage
{code example}
```

### Example: {Specific Use Case}

```{language}
// Example for specific scenario
{code example}
```

---

## Edge Cases

- {Special scenario or limitation 1}
- {Boundary condition 2}
- {Known issue or workaround 3}

---

## Commands

```bash
{command-1}  # {description}
{command-2}  # {description}
{command-3}  # {description}
```

---

## Resources

- Templates: See [assets/](assets/) for {description of templates}
- Documentation: See [references/](references/) for local documentation links

## References

- Official documentation: {URL}
- Additional resources: {URL}

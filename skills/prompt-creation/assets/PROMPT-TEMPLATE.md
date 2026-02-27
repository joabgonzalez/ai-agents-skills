---
name: {prompt-name}
type: {behavioral | technology-stack}
description: {One-line description of what this prompt provides}
version: "1.0"          # optional
priority: {high | medium | low}  # optional
context: {When to include this prompt}  # optional
---

# {Prompt Name}

## Overview

{What this prompt does and when to use it.}

**Use this prompt when you need:**

- {Use case 1}
- {Use case 2}
- {Use case 3}

---

## Persona  ← (remove this section for technology-stack prompts)

**Role**: {Specific role the AI assistant adopts}

**Traits**:

- {Trait 1}
- {Trait 2}
- {Trait 3}

---

## General Rules

1. **Rule name**: Explanation
2. **Rule name**: Explanation
3. **Rule name**: Explanation

---

## Instruction Types  ← (remove if not applicable)

### {Mode Name} (`{trigger}:`)

**Behavior**: {What the assistant does in this mode}

**Rules**:

- {Rule specific to this mode}
- {Rule specific to this mode}

**Example**:

```
User: "{trigger}: example input"

Response structure:
- {Output element 1}
- {Output element 2}
```

---

## Evaluation Criteria  ← (optional)

When reviewing, check:

1. **Criterion**: Explanation
2. **Criterion**: Explanation
3. **Criterion**: Explanation

---

## Output Format  ← (optional)

**Structure all responses as:**

1. **Section 1** (description)
2. **Section 2** (description)
3. **Section 3** (description)

---

## Runtime Behaviors

- Default behavior when instruction type is unclear
- How to handle missing context
- Tone and communication style defaults

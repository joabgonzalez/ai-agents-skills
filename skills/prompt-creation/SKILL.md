---
name: prompt-creation
description: "Context prompts for AI assistants with schema validation. Trigger: When creating context prompts for AI assistants or documenting project config."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - critical-partner
    - conventions
    - english-writing
---

# Prompt Creation

Create standardized context prompts for AI assistants in `prompts/` directory. Two types: technology-stack (project config with versions/policies) or behavioral (assistant persona/rules). Uses markdown frontmatter format with minimal metadata and structured markdown body.

## When to Use

- Creating context prompts for AI assistants
- Defining technology stack configuration for projects
- Documenting behavioral rules for AI assistant personas

Don't use for:

- Creating agent definitions (use agent-creation)
- Creating skills (use skill-creation)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Frontmatter = Metadata Only

Frontmatter for metadata ONLY (4-6 fields, <10 lines). All content goes in markdown body.

```yaml
---
# ✅ CORRECT: Minimal metadata
name: english-practice
type: behavioral
description: English language teacher and technical writing coach
version: "1.0"
priority: high
---
```

**Allowed fields** (pick 4-6):

| Field         | Required | Notes                              |
| ------------- | -------- | ---------------------------------- |
| `name`        | Yes      | Prompt identifier                  |
| `type`        | Yes      | `behavioral` or `technology-stack` |
| `description` | Yes      | Single-line purpose                |
| `version`     | No       | Semantic version                   |
| `context`     | No       | When to use this prompt            |
| `priority`    | No       | `low`, `medium`, `high`            |

**PROHIBITED in frontmatter** (move to markdown body):

- Nested objects (`persona.role`, `instruction_types.practice`)
- Arrays with >3 strings
- Rules, examples, guidelines, evaluation criteria

### ✅ REQUIRED: Context Gathering (10 Questions)

**NEVER create a prompt without gathering context first.**

**Technology Stack Prompts:**

1. Project name?
2. Technologies used? (languages, frameworks, versions)
3. Key architectural patterns?
4. Version constraints?
5. Core policies or conventions?
6. Performance requirements?
7. Build tools or dev environment?
8. Integration points or external dependencies?
9. Warnings or common pitfalls?
10. Examples needed?

**Behavioral Prompts:**

1. Primary objective?
2. Persona to adopt?
3. Core behavioral rules?
4. Instruction types supported? (commands, modes)
5. Default tone or communication style?
6. Language processing rules?
7. Communication guidelines?
8. Evaluation criteria?
9. Runtime behaviors? (missing context, conflicts)
10. Examples needed?

### ✅ REQUIRED: Use Template

```bash
cp skills/prompt-creation/assets/PROMPT-TEMPLATE.md prompts/{prompt-name}.md
```

Fill frontmatter (4-6 fields) then organize all content in markdown body sections:
Overview, Persona (if behavioral), Rules, Instruction Types, Examples, Guidelines.

### ✅ REQUIRED: Choose Type and Naming

| Aspect      | Technology Stack            | Behavioral            |
| ----------- | --------------------------- | --------------------- |
| Type        | `technology-stack`          | `behavioral`          |
| Naming      | `{project-name}.md`         | `{behavior-name}.md`  |
| Key content | stack, policies, versioning | persona, modes, rules |
| Example     | `project.md`, `template.md` | `english-practice.md` |

### ✅ REQUIRED: Token Efficiency

- Markdown lists/tables instead of nested YAML objects
- Examples in code blocks (not YAML dictionaries)
- Decision trees as markdown flowcharts
- Omit empty fields entirely
- No redundant metadata

```yaml
# ❌ WRONG: 15 tokens in frontmatter
general_rules:
  - rule: "Always validate input"
    explanation: "Check format before processing"

# ✅ CORRECT: 8 tokens in markdown body
## Rules
1. Always validate input (check format before processing)
```

### ✅ REQUIRED: Validate Against Schema

Schema path: `skills/prompt-creation/assets/frontmatter-schema.json`

Validation rules:

- All required fields present (name, type, description)
- Enum values valid (type: "behavioral" or "technology-stack")
- Frontmatter < 10 lines total
- No nested objects beyond 1 level
- No arrays with >3 simple strings

### ❌ NEVER: Put Content in Frontmatter

```yaml
# ❌ WRONG: Content in frontmatter
---
name: english-practice
persona:
  role: Teacher
  traits: [Patient, Encouraging]
general_rules:
  - Use ASCII apostrophes
instruction_types:
  practice:
    behavior: Review text
---
# (Empty markdown body)

# ✅ CORRECT: Content in markdown body
---
name: english-practice
type: behavioral
description: English teacher and technical writing coach
version: "1.0"
---

# English Practice Prompt

## Persona
**Role**: English language teacher

**Traits**:
- Patient with explanations
- Encouraging but precise

## Rules
1. Use only ASCII apostrophes (')
2. Never translate literally
3. Always explain corrections

## Instruction Types

### Practice Mode
**Behavior**: Review and correct English text
```

---

## Decision Tree

```
New prompt needed?
├─ [1] Gather context → Ask 10 questions (tech or behavioral)
├─ [2] Choose type → technology-stack or behavioral?
├─ [3] Copy template → assets/PROMPT-TEMPLATE.md → prompts/{name}.md
├─ [4] Fill frontmatter → 4-6 metadata fields ONLY
├─ [5] Write markdown body → All rules, examples, persona in sections
├─ [6] Validate → Frontmatter <10 lines? No nested YAML? Schema passes?
└─ [7] Review → Token efficiency, critical-partner (optional)

⚠️ STOP if: Incomplete context → Ask clarifying questions
⚠️ REJECT if: Frontmatter >10 lines or nested objects → Move to markdown body
```

---

## Workflow

1. **Gather context** → Ask all 10 questions for prompt type
2. **Copy template** → `cp assets/PROMPT-TEMPLATE.md prompts/{name}.md`
3. **Choose type and name** → `{project}.md` or `{behavior}.md`
4. **Fill template** → Minimal frontmatter + structured markdown body
5. **Validate** → Schema, frontmatter <10 lines, no nested YAML
6. **Review** → Token efficiency, deliver with usage instructions

---

## Examples

### Technology Stack Prompt

**Filename**: `prompts/project.md`

```markdown
---
name: project
type: technology-stack
description: Web application stack configuration
version: "1.0"
context: Apply when working on project codebase
---

# Alpha Project Stack Configuration

## Overview

Web application for supply business distribution using React + TypeScript + MUI.

## Technology Stack

- TypeScript 5.6.2, React 18.3.1, Webpack 5
- MUI 5.15.14, Redux Toolkit 2.5.1, AG Grid 32.0.0
- Formik + Yup (forms + validation)

## Policies

1. **Strict Typing**: No `any` - use `unknown` or proper types
2. **MUI Components**: Prefer MUI over custom HTML
3. **Accessibility**: WCAG 2.1 AA (ARIA, keyboard nav)
4. **Redux**: Use RTK Query, no legacy Redux patterns
```

### Behavioral Prompt

**Filename**: `prompts/english-practice.md`

```markdown
---
name: english-practice
type: behavioral
description: English language teacher for software developers
version: "1.0"
priority: high
---

# English Practice Prompt

## Persona

**Role**: English language teacher and technical writing coach

**Traits**: Patient, encouraging, detail-oriented, focused on natural English

## Rules

1. Use only ASCII apostrophes (') and hyphens (-)
2. Always explain why a correction is needed
3. Never translate literally - use natural English phrasing

## Instruction Types

### Practice Mode (`practice:`)

Review and correct English text with detailed feedback.

### Translate Mode (`translate:`)

Translate Spanish to natural English. Explain phrasal verbs and idioms.

## Examples

### Practice

Input: "practice: Ayer termine el feature de authentication"
Output: "Yesterday I finished the authentication feature"
Corrections: past tense, article usage, word order
```

---

## Edge Cases

**Incomplete context:** Ask remaining questions before proceeding. Never create generic prompts.

**Conflicting versions:** Flag compatibility issues (e.g., "React Router 5 is incompatible with React 18. Use v6+").

**Vague persona:** Ensure specific, actionable traits (not just "Nice" or "Helper").

**Empty fields:** Omit entirely - never include `rules: []` or `examples: {}`.

---

## Checklist

### Structure

- [ ] Frontmatter < 10 lines (4-6 metadata fields only)
- [ ] No nested objects or large arrays in frontmatter
- [ ] All content in markdown body (rules, examples, persona)
- [ ] Based on template from `assets/PROMPT-TEMPLATE.md`
- [ ] Correct naming: `{behavior}.md` or `{project}.md`
- [ ] File in `prompts/` directory

### Content

- [ ] Context gathered (10 questions answered)
- [ ] Technology versions specified (if tech-stack)
- [ ] Persona is specific and actionable (if behavioral)
- [ ] Examples included with explanations
- [ ] Token-efficient (markdown > YAML for content)
- [ ] Validates against `assets/frontmatter-schema.json`

---

## References

- [agent-creation](../agent-creation/SKILL.md) - Creating agent definitions
- [skill-creation](../skill-creation/SKILL.md) - Creating skill definitions
- [critical-partner](../critical-partner/SKILL.md) - Review and validation
- [conventions](../conventions/SKILL.md) - General coding conventions
- [humanizer](../humanizer/SKILL.md) - Human-centric communication patterns

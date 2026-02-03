---
name: prompt-creation
description: Create context prompts for AI assistants in JSON or markdown frontmatter. Enforces mandatory context gathering (10 questions), validates schema compliance, ensures token efficiency. Two types: technology-stack (project config) or behavioral (assistant persona). Trigger: When creating context prompts for AI assistants or documenting project configuration.
skills:
  - critical-partner
  - conventions
---

# Prompt Creation Skill

## Purpose

Create standardized context prompts for AI assistants in `prompts/` directory. Two types: technology-stack (project config with versions/policies) or behavioral (assistant persona/rules). Enforces context gathering, validates schema compliance, ensures token efficiency. Uses JSON or markdown frontmatter format.

---

## When to Use

Use this skill when:

- Creating context prompts for AI assistants
- Defining technology stack configuration for projects
- Documenting behavioral rules for AI assistant personas
- Setting up language processing or communication guidelines

Don't use this skill for:

- Creating agent definitions (use agent-creation instead)
- Creating skills (use skill-creation instead)
- Modifying existing prompts without full context gathering

---

## Critical Patterns

### Pattern 1: Mandatory Context Gathering (10 Questions)

**CRITICAL**: NEVER create a prompt without gathering context first.

**Technology Stack Prompts - Ask:**

1. Project name? (filename)
2. Technologies used? (languages, frameworks, libraries + versions)
3. Key architectural patterns? (SSG, SPA, microservices)
4. Version constraints or compatibility requirements?
5. Core policies or conventions? (strict typing, accessibility)
6. Performance targets or optimization requirements?
7. Build tools or development environment?
8. Integration points or external dependencies?
9. Warnings or common pitfalls?
10. Examples needed? (patterns, configurations)

**Behavioral Prompts - Ask:**

1. Primary objective? (what should assistant help with?)
2. Persona to adopt? (teacher, reviewer, translator)
3. Core behavioral rules? (always/never do X)
4. Instruction types supported? (commands, modes, prefixes)
5. Default tone or communication style?
6. Language processing rules? (output language, translation)
7. Communication guidelines? (tone, structure, formatting)
8. Evaluation criteria? (accuracy, clarity, constructiveness)
9. Runtime behaviors? (missing context, version conflicts)
10. Examples needed? (Jira tickets, commit messages, translations)

```bash
# ❌ WRONG: Skip context gathering
Create English practice prompt
# [Agent creates generic prompt]

# ✅ CORRECT: Gather context first
What is the primary objective?
What persona should the assistant adopt?
# [After gathering 10 answers, create prompt]
```

### Pattern 2: Use Template from assets/

```bash
# Copy template to prompts directory
cp skills/prompt-creation/assets/PROMPT-TEMPLATE.md prompts/{prompt-name}.md

# Fill placeholders: {prompt-name}, {type}, {description}, etc.
```

### Pattern 3: Choose Prompt Type and Naming

**Two types:**

1. **technology-stack**: Project configuration
   - Naming: `{project-name}.md` (e.g., `sbd.md`, `usn.md`)
   - Contains: stack, policies, versioning, warnings, examples

2. **behavioral**: Assistant persona/rules
   - Naming: `{behavior-name}.md` (e.g., `english-practice.md`)
   - Contains: objective, persona, general_rules, instruction_types

### Pattern 4: Token Efficiency

```yaml
# ❌ WRONG: Empty fields waste tokens
general_rules: []
examples: {}
warnings: []

# ✅ CORRECT: Omit empty fields
# (no general_rules, examples, or warnings field at all)

# ❌ WRONG: Redundant nesting
stack:
  languages:
    list:
      - TypeScript

# ✅ CORRECT: Direct lists
stack:
  languages:
    - TypeScript

# Always use YAML list syntax (- item), never JSON arrays []
```

### Pattern 5: Validate Against Schema

```bash
# Always validate frontmatter structure
cat prompts/my-prompt.md | yq eval '.frontmatter' - | \
  yq eval-all '.' skills/prompt-creation/assets/frontmatter-schema.json -
```

### Pattern 6: Markdown Frontmatter (RECOMMENDED)

```markdown
---
name: project-name
type: tech-stack
stack:
  languages:
    - TypeScript 5.x
policies:
  - Strict typing required
---

# Additional markdown content if needed
```

JSON format available but markdown frontmatter preferred (more readable, same validation).

---

## Decision Tree

```
New prompt needed?
├─ Technology stack? → type: tech-stack, ask 10 tech questions
├─ Behavioral rules? → type: behavioral, ask 10 behavioral questions
├─ Missing context?  → STOP, ask user for clarification
├─ Format choice?    → Markdown frontmatter (RECOMMENDED) or JSON
├─ Need examples?    → Add to examples section with clear context
└─ Ready to create?  → Copy template → Fill → Validate → Review
```

---

## Edge Cases

### Case 1: User Provides Incomplete Context

```
# ❌ WRONG: Proceed anyway
User: "Create a prompt for my React project"
Agent: [Creates generic React prompt]

# ✅ CORRECT: Ask remaining questions
User: "Create a prompt for my React project"
Agent: "I need more context. Please answer:
1. What is the project name?
2. What React version?
3. What other libraries? (state management, UI, routing)
4. Any strict policies? (TypeScript, accessibility)
# ... (ask all 10 questions)
```

### Case 2: Conflicting Technology Versions

```yaml
# ❌ WRONG: Ignore conflicts
stack:
  frameworks:
    - React 18.x
  libraries:
    - react-router-dom 5.x  # Incompatible with React 18

# ✅ CORRECT: Flag compatibility issues
# Agent warns: "React Router 5 is incompatible with React 18. Use v6+"
stack:
  frameworks:
    - React 18.x
  libraries:
    - react-router-dom 6.x
warnings:
  - React Router must be v6+ for React 18 compatibility
```

### Case 3: Behavioral Prompt Without Clear Persona

```yaml
# ❌ WRONG: Vague persona
persona:
  role: Helper
  traits:
    - Nice

# ✅ CORRECT: Specific persona with actionable traits
persona:
  role: English teacher and technical writing coach
  traits:
    - Patient with explanations
    - Encouraging but precise with corrections
    - Detail-oriented in grammar feedback
```

### Case 4: Empty or Redundant Fields

```yaml
# ❌ WRONG: Include empty fields
warnings: []
examples: {}
optional_field: null

# ✅ CORRECT: Omit entirely (saves tokens)
# (no warnings, examples, or optional_field at all)
```

---

## Step-by-Step Workflow

### Step 1: Gather Context

**CRITICAL**: See [Pattern 1: Mandatory Context Gathering](#pattern-1-mandatory-context-gathering-10-questions) above.

Ask all 10 questions for the prompt type. Do not proceed without sufficient context.

---

### Step 2: Copy Template

See [Pattern 2: Use Template from assets/](#pattern-2-use-template-from-assets).

```bash
cp skills/prompt-creation/assets/PROMPT-TEMPLATE.md prompts/{prompt-name}.md
```

---

### Step 3: Determine Type and Name

See [Pattern 3: Choose Prompt Type and Naming](#pattern-3-choose-prompt-type-and-naming).

- Technology stack: `{project-name}.md` (type: `tech-stack`)
- Behavioral: `{behavior-name}.md` (type: `behavioral`)

---

### Step 4: Fill Template

Replace placeholders:

- `{prompt-name}`: Prompt identifier
- `{technology-stack | behavioral}`: Select type
- `{description}`: Brief purpose
- All section-specific placeholders

See [Examples](#examples) section below for complete templates.

---

### Step 5: Validate

See [Pattern 5: Validate Against Schema](#pattern-5-validate-against-schema).

**Validation checklist:**

- [ ] File created in `prompts/` directory
- [ ] Correct naming convention (see Pattern 3)
- [ ] Format chosen (markdown frontmatter recommended)
- [ ] All required fields present
- [ ] YAML syntax valid
- [ ] Lists use `- item` syntax (not `[]`)
- [ ] Empty fields omitted (token efficiency)
- [ ] Examples included if helpful
- [ ] Validates against schema
- [ ] Reviewed by critical-partner (recommended)

---

## Examples

### Technology Stack Prompt (Markdown)

**Filename**: `prompts/2 sbd.md`

```markdown
---
name: sbd
type: tech-stack
description: SBD web application stack configuration
stack:
  languages:
    - TypeScript 5.6.2
    - JavaScript (ES2020+)
  frameworks:
    - React 18.3.1
    - Webpack
  libraries:
    - MUI 5.15.14
    - Redux Toolkit 2.5.1
    - AG Grid
policies:
  - Strict typing required (no any)
  - MUI components preferred over custom HTML
  - Accessibility required (WCAG 2.1 AA)
versioning:
  typescript: ">=5.0.0 <6.0.0"
  react: ">=18.0.0 <19.0.0"
  "@mui/material": ">=5.0.0 <6.0.0"
warnings:
  - Avoid legacy Redux patterns
  - Test accessibility with screen readers
---
```

### Behavioral Prompt (Markdown)

**Filename**: `prompts/1 english-practice.md`

```markdown
---
objective: Help users practice technical English writing for software development contexts
persona:
  role: English teacher and technical writing coach
  traits:
    - Patient
    - Encouraging
    - Detail-oriented
general_rules:
  - Use only ASCII apostrophes (')
  - Always explain corrections
  - Ensure consistent punctuation
instruction_types:
  practice:
    prefix: "practice:"
    behavior: Correct text and provide detailed feedback
  translate:
    prefix: "translate:"
    behavior: Translate Spanish to natural English
evaluation_criteria:
  - Correct grammar and punctuation
  - Natural phrasing
  - Technical vocabulary
output_format: Corrected text followed by detailed explanations
language_processing:
  default_output: English
  translation_mode: Spanish to English (fluent, not literal)
---
```

---

## 🔍 Self-Check Protocol (For AI Agents)

**Before completing prompt creation, verify you have:**

### 1. Context Gathering

- [ ] Asked all 10 questions for prompt type (tech-stack or behavioral)
- [ ] Received sufficient answers (not vague or incomplete)
- [ ] Clarified ambiguous responses
- [ ] Confirmed prompt type matches user intent

### 2. Structure & Format

- [ ] Copied template from assets/
- [ ] Chosen correct naming convention
- [ ] Selected format (markdown frontmatter recommended)
- [ ] Replaced all placeholders with actual content
- [ ] Included only required fields (omitted empty ones)

### 3. Content Quality

- [ ] Technology versions specified (if tech-stack)
- [ ] Persona is specific and actionable (if behavioral)
- [ ] Policies/rules are clear and enforceable
- [ ] Examples included if helpful (not mandatory)
- [ ] Token-efficient (no redundancy)

### 4. Validation & Review

- [ ] YAML syntax validated
- [ ] Lists use `- item` format (not `[]`)
- [ ] Schema validation passed
- [ ] Critical-partner review (recommended)

**Confidence check:**

1. Does this prompt provide sufficient context for AI assistants?
2. Are technology versions/policies specific enough to guide behavior?
3. Would I understand the expected behavior if I were the AI assistant?

**If you answered NO to any:** Gather more context or refine content before finalizing.

**For complete validation:** See [Validation Checklist](#validation-checklist) below.

---

## Validation Checklist

Before finalizing:

- [ ] Context gathered (10 questions)
- [ ] Template copied from assets/
- [ ] Type determined (tech-stack or behavioral)
- [ ] File in `prompts/` with correct naming
- [ ] Required fields present
- [ ] YAML syntax valid
- [ ] Lists use `- item` (not `[]`)
- [ ] Empty fields omitted
- [ ] Validates against schema
- [ ] Reviewed by critical-partner

---

## Quick Reference

| Aspect      | Technology Stack            | Behavioral                        |
| ----------- | --------------------------- | --------------------------------- |
| Type        | `tech-stack`                | `behavioral`                      |
| Naming      | `{project}.md`              | `{behavior}.md`                   |
| Key Fields  | stack, policies, versioning | objective, persona, general_rules |
| Examples    | `sbd.md`, `usn.md`          | `english-practice.md`             |
| Context Q's | 10 tech questions           | 10 behavioral questions           |

---

## References

- [agent-creation](../agent-creation/SKILL.md): Creating agent definitions
- [skill-creation](../skill-creation/SKILL.md): Creating skill definitions
- [critical-partner](../critical-partner/SKILL.md): Review and validation
- [conventions](../conventions/SKILL.md): General coding conventions

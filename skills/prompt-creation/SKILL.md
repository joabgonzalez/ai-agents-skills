---
name: prompt-creation
description: Guides agents to create context prompts for AI assistants using templates in JSON or markdown frontmatter format. Enforces mandatory context gathering through structured questions and validates compliance with JSON schema for technology stacks or behavioral configurations. Token-efficient documentation required. Trigger: When creating a new context prompt, defining AI assistant behavior, or documenting technology stack configuration.
skills:
  - critical-partner
  - conventions
allowed-tools:
  - documentation-reader
  - web-search
  - file-reader
---

# Prompt Creation Skill

## Overview

This skill provides step-by-step instructions for creating context prompts using templates. Prompts provide configuration, behavior, and technology stack information to AI assistants in either JSON or markdown frontmatter format, stored in the project's `prompts/` directory for reuse across AI tools.

## Objective

Enable agents to create well-structured context prompts using templates that effectively configure AI assistant behavior or provide technology stack context. Ensures proper format, naming conventions, JSON schema validation, and comprehensive coverage of project requirements while maintaining token efficiency.

---

## When to Use

Use this skill when:

- Creating a new context prompt for AI assistants
- Defining technology stack configuration for a project
- Documenting behavioral rules for AI assistant personas
- Setting up language processing or communication guidelines
- Providing examples and patterns for AI to follow

Don't use this skill for:

- Creating agent definitions (use agent-creation instead)
- Creating skills (use skill-creation instead)
- Modifying existing prompts without gathering full context

---

## Step-by-Step Workflow

### Step 1: Gather Context (CRITICAL - DO NOT SKIP)

**Before creating a prompt, you MUST gather context. Do not proceed without sufficient information.**

**For Technology Stack Prompts, ask:**

1. **What is the project name?** (used for filename)
2. **What technologies are used?** (languages, frameworks, libraries with versions)
3. **What are the key architectural patterns?** (e.g., SSG, SPA, microservices)
4. **Are there version constraints or compatibility requirements?**
5. **What are the core policies or conventions?** (e.g., strict typing, accessibility)
6. **Are there performance targets or optimization requirements?**
7. **What build tools or development environment is used?**
8. **Are there integration points or external dependencies?**
9. **What warnings or common pitfalls should be highlighted?**
10. **Should examples be included?** (common patterns, configurations)

**For Behavioral Prompts, ask:**

1. **What is the primary objective?** (what should the assistant help with?)
2. **What persona should the assistant adopt?** (teacher, reviewer, translator, etc.)
3. **What are the core behavioral rules?** (always/never do X)
4. **What instruction types are supported?** (commands, modes, prefixes)
5. **What is the default tone or communication style?**
6. **What are the language processing rules?** (e.g., always output in English, translate Spanish input first)
7. **What are the communication guidelines?** (e.g., tone, structure, formatting)
8. **What are the evaluation criteria?** (e.g., accuracy, clarity, constructiveness)
9. **Are there any runtime behaviors?** (e.g., how to handle missing context, version conflicts)
10. **Should examples be included?** (e.g., Jira tickets, commit messages, translations)

**Do not proceed until you have gathered sufficient context for the prompt type.**

---

### Step 2: Copy Template and Confirm Format

**Copy the appropriate template:**

```bash
# Copy template to prompts directory
cp skills/prompt-creation/assets/PROMPT-TEMPLATE.md prompts/{prompt-name}.md
```

**Ask the user which format to use:**

- **Markdown frontmatter format** (`.md`): Human-readable, combines YAML metadata with markdown content (RECOMMENDED)
- **JSON format** (`.json`): Structured data, easier for programmatic parsing

Wait for user confirmation before proceeding.

---

### Step 3: Determine Prompt Type and Naming

**Prompt types:**

1. **Technology Stack Prompts** (project context):
   - Naming convention: `{project-name}.md` or `{project-name}.json`
   - Example: `sbd.md`, `usn.md`
   - Type field: `technology-stack`
   - Contains: stack, policies, versioning, warnings, examples

2. **Behavioral Prompts** (assistant configuration):
   - Naming convention: `{behavior-name}.md` or `{behavior-name}.json`
   - Example: `english-practice.md`, `code-review.md`
   - Type field: `behavioral`
   - Contains: objective, persona, behavior, instructions, language_processing

**Token efficiency**: Be precise and concise. Eliminate redundancy. Use YAML list syntax (`- item`) never `[]`. Omit empty fields.

**Validation:** Use `skills/prompt-creation/assets/frontmatter-schema.json` to validate your frontmatter.

**Ask the user for the prompt name and confirm the type.**

---

### Step 4: Fill Template Placeholders

Replace all placeholders in the template:

- `{prompt-name}`: The prompt identifier
- `{technology-stack | behavioral}`: Select appropriate type
- `{description}`: Brief description of prompt purpose
- `{When this prompt should be included}`: Context clause
- `{high | medium | low}`: Priority level
- All section-specific placeholders

---

### Step 5: Structure the Prompt

#### For Technology Stack Prompts (Markdown frontmatter):

```json
{
  "name": "project-name",
  "type": "tech-stack",
  "description": "Brief description of the project",
  "stack": {
    "languages": ["TypeScript 5.x", "JavaScript"],
    "frameworks": ["React 18.x", "Vite"],
    "libraries": ["MUI 5.x", "Redux Toolkit 2.x"]
  },
  "policies": [
    "Strict typing required (no any)",
    "Accessibility compliance (WCAG 2.1 AA)",
    "Follow MUI component patterns"
  ],
  "versioning": {
    "typescript": ">=5.0.0 <6.0.0",
    "react": ">=18.0.0 <19.0.0"
  },
  "warnings": ["Avoid legacy Redux patterns", "Always validate form inputs"],
  "examples": {
    "component": "// Example React component with TypeScript\nconst Example: React.FC = () => <div>Hello</div>;"
  }
}
```

#### For Technology Stack Prompts (Markdown frontmatter):

```markdown
---
name: project-name
type: tech-stack
description: Brief description
stack:
  languages:
    - TypeScript 5.x
    - JavaScript
  frameworks:
    - React 18.x
    - Vite
  libraries:
    - MUI 5.x
policies:
  - Strict typing required
  - Accessibility compliance
versioning:
  typescript: ">=5.0.0 <6.0.0"
  react: ">=18.0.0 <19.0.0"
warnings:
  - Avoid legacy patterns
---

# Project Name Stack

[Additional markdown content if needed]
```

#### For Behavioral Prompts (JSON format):

```json
{
  "objective": "Primary goal of the assistant",
  "persona": {
    "role": "Teacher, reviewer, etc.",
    "traits": ["Patient", "Encouraging", "Detail-oriented"]
  },
  "general_rules": [
    "Use only ASCII apostrophes",
    "Always explain corrections",
    "Ask for missing context"
  ],
  "instruction_types": {
    "practice": {
      "prefix": "practice:",
      "behavior": "Correct and provide feedback"
    },
    "review": {
      "prefix": "review:",
      "behavior": "Review without treating as practice"
    }
  },
  "tone_modifiers": {
    "formal": "(formal)",
    "casual": "(casual)",
    "default": "semi-casual"
  },
  "examples": {
    "input": "practice: example text",
    "output": "Corrected version with explanations"
  },
  "evaluation_criteria": ["Accuracy", "Clarity", "Constructiveness"],
  "output_format": "Description of expected output",
  "language_processing": {
    "default_output": "English",
    "translation_mode": "Spanish to English",
    "input_acceptance": "English or Spanish"
  }
}
```

#### For Behavioral Prompts (Markdown frontmatter):

```markdown
---
objective: Primary goal of the assistant
persona:
  role: Teacher, reviewer, etc.
  traits:
    - Patient
    - Encouraging
general_rules:
  - Use only ASCII apostrophes
  - Always explain corrections
instruction_types:
  practice:
    prefix: "practice:"
    behavior: Correct and provide feedback
  review:
    prefix: "review:"
    behavior: Review without treating as practice
evaluation_criteria:
  - Accuracy
  - Clarity
output_format: Description of expected output
language_processing:
  default_output: English
  translation_mode: Spanish to English
---

# Behavioral Prompt Name

[Additional documentation, examples, or usage instructions]
```

---

### Step 6: Validation

**Validate the prompt against schema and criteria:**

```bash
# Validate frontmatter against schema
cat prompts/{prompt-name}.md | yq eval '.frontmatter' - | \
  yq eval-all '.' skills/prompt-creation/assets/frontmatter-schema.json -
```

**Validate against checklist:**

- [ ] File created in `prompts/` directory
- [ ] Correct naming convention used
- [ ] Format chosen (JSON or markdown frontmatter)
- [ ] All required fields present for prompt type
- [ ] YAML/JSON syntax valid
- [ ] Lists use `- item` syntax (not `[]`)
- [ ] Empty fields omitted
- [ ] Token-efficient: concise and precise
- [ ] Examples included if helpful
- [ ] Content in English with proper formatting
- [ ] Validates against `assets/frontmatter-schema.json`

---

## Critical Patterns

### ✅ REQUIRED: Use Template for Consistency

```bash
# Copy template to prompts directory
cp skills/prompt-creation/assets/PROMPT-TEMPLATE.md prompts/{prompt-name}.md

# Fill in placeholders: {prompt-name}, {type}, {description}, etc.
```

### ✅ REQUIRED: Gather Context First

```
# ❌ WRONG: Creating prompt without context
# Create English practice prompt
# [Agent creates generic prompt]

# ✅ CORRECT: Gather context first
What is the primary objective?
What persona should the assistant adopt?
What are the core behavioral rules?
[After gathering answers, create prompt]
```

### ✅ REQUIRED: Validate Against Schema

```bash
# Always validate frontmatter structure
cat prompts/my-prompt.md | yq eval '.frontmatter' - | \
  yq eval-all '.' skills/prompt-creation/assets/frontmatter-schema.json -
```

### ❌ NEVER: Use Empty Arrays or Objects

```yaml
# ❌ WRONG: Empty fields waste tokens
general_rules: []
examples: {}

# ✅ CORRECT: Omit empty fields completely
# (no general_rules or examples field at all)
```

---

## Decision Tree

```
Technology stack prompt? → Use tech-stack type, include stack/policies/versioning
Behavioral prompt?       → Use behavioral type, include objective/persona/rules
Need examples?           → Add to examples section with clear context
JSON format needed?      → Use .json extension, validate JSON syntax
Markdown preferred?      → Use .md extension, YAML frontmatter (RECOMMENDED)
Missing context?         → STOP and ask user for clarification
```

---

## Naming Conventions

| Prompt Type      | Format          | Example                                 |
| ---------------- | --------------- | --------------------------------------- |
| Technology Stack | `{project}.md`  | `sbd.md`, `usn.md`                      |
| Behavioral       | `{behavior}.md` | `english-practice.md`, `code-review.md` |
| JSON format      | `{name}.json`   | `project.json`, `behavior.json`         |

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

## Compliance Checklist

Before finalizing a new prompt, verify:

### Context & Planning

- [ ] Context gathered (10 questions for tech stack or behavioral)
- [ ] Prompt type determined (technology-stack or behavioral)
- [ ] Format confirmed (JSON or markdown frontmatter)
- [ ] Template copied from `skills/prompt-creation/assets/`

### Structure

- [ ] File created in `prompts/` directory
- [ ] Correct naming convention followed
- [ ] All placeholders replaced

### Frontmatter

- [ ] Required fields present: `name`, `type`, `description`, `context`
- [ ] Type is `technology-stack` or `behavioral`
- [ ] Priority set (`high`, `medium`, or `low`)
- [ ] YAML/JSON syntax valid
- [ ] Lists use `- item` format (never `[]`)
- [ ] Empty fields omitted
- [ ] Validates against `assets/frontmatter-schema.json`

### Content Quality

- [ ] Token-efficient: concise and precise
- [ ] Examples included if helpful
- [ ] Decision tree provided (if applicable)
- [ ] Guidelines with ✅ Do / ❌ Don't sections
- [ ] Content in English with proper formatting

### Post-Creation

- [ ] Validated against JSON schema
- [ ] Tested with target AI assistant
- [ ] Reviewed by critical-partner skill (recommended)

---

## Resources

- Templates: See [assets/](assets/) for PROMPT-TEMPLATE.md and frontmatter-schema.json
- Documentation: See [references/](references/) for prompt usage guides (if applicable)

## References

- [agent-creation](../agent-creation/SKILL.md): Creating agent definitions
- [skill-creation](../skill-creation/SKILL.md): Creating skill definitions
- [critical-partner](../critical-partner/SKILL.md): Review and validation
- [conventions](../conventions/SKILL.md): General coding conventions

---
name: prompt-creation
description: Guides agents to create context prompts for AI assistants in JSON or markdown frontmatter format. Enforces mandatory context gathering through structured questions and validates compliance with prompt standards for technology stacks or behavioral configurations. Token-efficient documentation required.
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

This skill provides step-by-step instructions for creating context prompts that provide configuration, behavior, and technology stack information to AI assistants. Prompts are created in either JSON or markdown frontmatter format and stored in the project's `prompts/` directory for reuse across AI tools and assistants.

## Objective

Enable agents to create well-structured context prompts that effectively configure AI assistant behavior or provide technology stack context. Ensures proper format, naming conventions, and comprehensive coverage of project requirements while maintaining token efficiency.

---

## Instructions

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

### Step 2: Confirm Format

**Ask the user which format to use:**

- **JSON format** (`.json`): Structured data, easier for programmatic parsing
- **Markdown frontmatter format** (`.md`): Human-readable, combines YAML metadata with markdown content

Wait for user confirmation before proceeding.

---

### Step 3: Determine Prompt Type and Naming

**Prompt types:**

1. **Technology Stack Prompts** (project context):
   - Naming convention: `<project-name>.md` or `<project-name>.json`
   - Example: `sbd.md`, `usn.md`
   - Contains: stack, policies, versioning, warnings, examples

2. **Behavioral Prompts** (assistant configuration):
   - Naming convention: `<behavior-name>.md` or `<behavior-name>.json`
   - Example: `english-practice.md`, `code-review.md`
   - Contains: objective, persona, behavior, instructions, language_processing

**Token efficiency**: Be precise and concise. Eliminate redundancy. Use YAML list syntax (`- item`) never `[]`. Omit empty fields.

**Ask the user for the prompt name and confirm the type.**

---

### Step 4: Structure the Prompt

#### For Technology Stack Prompts (JSON format):

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

### Step 5: Create the File

- Place the file in `prompts/` directory at project root
- Use the determined naming convention
- Validate YAML/JSON syntax
- Ensure all fields are properly formatted
- Omit empty fields to save tokens

---

### Step 6: Validation

**Validate the prompt against these criteria:**

- [ ] File created in `prompts/` directory
- [ ] Correct naming convention used (`1 <behavior>.md` or `2 <project>.md`)
- [ ] Format chosen (JSON or markdown frontmatter)
- [ ] All required fields present for prompt type
- [ ] YAML/JSON syntax valid
- [ ] Lists use `- item` syntax (not `[]`)
- [ ] Empty fields omitted
- [ ] Token-efficient: concise and precise
- [ ] Examples included if helpful
- [ ] Content in English with proper formatting

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

- [ ] Context gathered (10 questions for tech stack or behavioral)
- [ ] Format confirmed (JSON or markdown frontmatter)
- [ ] Prompt type determined (tech stack or behavioral)
- [ ] Naming convention followed (`1 <behavior>` or `2 <project>`)
- [ ] File created in `prompts/` directory
- [ ] Required fields present
- [ ] YAML/JSON syntax valid
- [ ] Lists use `- item` format
- [ ] Empty fields omitted
- [ ] Token-efficient documentation
- [ ] Examples included if helpful
- [ ] Content in English with proper formatting

---

## References

- [agent-creation](../agent-creation/SKILL.md): Creating agent definitions
- [critical-partner](../critical-partner/SKILL.md): Review and validation
- [conventions](../conventions/SKILL.md): General coding conventions

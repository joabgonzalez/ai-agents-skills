---
name: agent-creation
description: Guides agents and users to create standards-compliant agent definitions using templates in markdown frontmatter format, ensuring context gathering, clarity, and proper metadata. Forces agents to ask clarifying questions when context is insufficient. Token-efficient documentation required. Trigger: When creating a new agent definition, setting up project agents, or documenting agent workflows.
---

# Agent Creation Skill

## Overview

Provides actionable instructions for creating standards-compliant agent definitions using templates. Agents are defined in markdown files (AGENTS.md) with YAML frontmatter specifying metadata and a clear, readable structure. This skill enforces context gathering before agent creation to ensure robust and well-defined agents.

## Objective

Enable agents and users to generate agent definitions that strictly follow the required structure and conventions using the provided template. Ensure sufficient context is gathered through clarifying questions before proceeding with agent creation. Validate each agent against the JSON schema and provide a compliance checklist to ensure all requirements are met.

---

## When to Use

Use this skill when:

- Creating a new agent definition from scratch
- Setting up project-specific agents
- Documenting agent workflows and responsibilities
- Defining agent context and skill requirements

Don't use this skill for:

- Creating individual skills (use skill-creation instead)
- Creating context prompts (use prompt-creation instead)
- Modifying existing agents without full context

---

## References

- https://agents.md/
- https://agents.md/#examples
- [Agent Skills Home](https://agentskills.io/home)

---

## Instructions

### Step 1: Gather Context (CRITICAL - DO NOT SKIP)

**Before creating an agent definition, you MUST ask clarifying questions when context is missing. Do not proceed until you have sufficient information.**

**Required context to gather:**

- What is the primary purpose of this agent?
- What type of input will the agent receive? (e.g., files, text, objects, user queries)
- What is the expected output format? (e.g., markdown, JSON, text, files)
- Which skills does the agent need to accomplish its tasks?
- Are there any specific workflows, policies, or constraints the agent must follow?
- Who is the target audience for this agent? (e.g., developers, end-users, AI assistants)
- What technologies, frameworks, or tools will the agent interact with?
- What is the project context where this agent will operate?
- Are there any tone or communication style requirements? (e.g., formal, casual, technical)

**Do not proceed with creating the agent until you have:**

- A clear understanding of the agent's purpose and responsibilities
- Defined input and output formats (if applicable)
- Identified all required skills
- Understood any special policies, constraints, or workflows
- Gathered sufficient context about the project environment

### Step 2: Directory and File Structure

- Create a new directory under `agents/` named after the project or agent (lowercase, hyphens, no spaces).
- Add an `AGENTS.md` file inside the directory.

### Step 3: YAML Frontmatter

The frontmatter must include:

**Required fields:**

- **name**: Agent identifier (lowercase, hyphens only, e.g., `my-project-agent`). Keep concise.
- **description**: Clear, concise explanation of purpose and responsibilities. Token-efficient: eliminate redundancy, keep specificity.
- **skills**: List required skills using YAML `- item` syntax (never `[]`). Must be existing skills from `skills/` directory.
  - **Mandatory for ALL agents**: Always include `critical-partner`
  - **Mandatory for technical/management agents**: Always include `process-documentation`

**Optional fields (include only if they add specificity):**

- **input**: Expected input type/format (e.g., `"user query | string"`). Omit if obvious from description.
- **output**: Expected output type/format (e.g., `"markdown report"`). Omit if obvious from description.

**Formatting rules:**

- Use YAML list syntax: `- item` (never `[]` for arrays)
- Omit empty fields completely
- Be precise and token-efficient: every word must serve AI and human understanding

Example frontmatter:

```yaml
---
name: my-project-agent
description: Development assistant for Project X. Expert in TypeScript, React, and MUI.
skills:
  - typescript
  - react
  - mui
  - critical-partner
  - process-documentation
  - conventions
  - a11y
---
```

### Step 4: Content Structure

After the frontmatter, include the following sections:

1. **# Agent Name** (h1): Title describing the agent (e.g., "SBD Project Agent").
2. **## Purpose**: Clear statement of the agent's primary goal and responsibilities. Be specific and actionable.
3. **## Supported stack** (if applicable): List technologies, frameworks, libraries, and versions used in the project.
4. **## Skills Reference** (optional but recommended): Table listing all skills with descriptions and paths.
5. **## Workflows** (optional): Common workflows the agent handles (e.g., "Feature Development," "Code Review").
6. **## Policies** (optional): Project-specific rules, constraints, or guidelines the agent must follow.

### Step 5: Writing Guidelines

- Write all content in English with American spelling
- Use only ASCII apostrophes (') and hyphens (-)
- Ensure consistent punctuation, spacing, and capitalization
- Be token-efficient: precise and concise without losing specificity
- Use clear, direct language for both AI and human readers
- Organize content with proper markdown structure

### Step 6: Validation

Before finalizing, verify:

- [ ] Directory created under `agents/` with correct naming
- [ ] `AGENTS.md` file exists with proper frontmatter
- [ ] Required fields: `name`, `description`, `skills`
- [ ] `critical-partner` included in skills (mandatory for ALL agents)
- [ ] `process-documentation` included for technical/management agents
- [ ] All referenced skills exist in `skills/` directory
- [ ] Skills use YAML list syntax (`- item`), not arrays (`[]`)
- [ ] Empty fields omitted
- [ ] Content sections present: Purpose, and others as appropriate
- [ ] Token-efficient documentation: no redundancy
- [ ] Content in English with American spelling

---

## Example: Complete Agent Definition

```markdown
---
name: example-agent
description: Development assistant for Example Project. Provides guidance on TypeScript, React, and accessibility standards.
skills:
  - typescript
  - react
  - critical-partner
  - process-documentation
  - conventions
  - a11y
---

# Example Project Agent

## Purpose

This agent serves as the primary development assistant for the Example Project, ensuring code quality, accessibility compliance, and adherence to TypeScript and React best practices.

## Supported stack

- **Languages**: TypeScript 5.0+, JavaScript (ES2020+)
- **Framework**: React 18+
- **Build**: Vite

## Skills Reference

| Skill Name            | Description                 | Path                                  |
| --------------------- | --------------------------- | ------------------------------------- |
| typescript            | TypeScript best practices   | skills/typescript/SKILL.md            |
| react                 | React patterns and hooks    | skills/react/SKILL.md                 |
| critical-partner      | Code review and improvement | skills/critical-partner/SKILL.md      |
| process-documentation | Change documentation        | skills/process-documentation/SKILL.md |
| conventions           | General coding conventions  | skills/conventions/SKILL.md           |
| a11y                  | Accessibility standards     | skills/a11y/SKILL.md                  |

## Workflows

### Feature Development

1. Gather requirements
2. Design component architecture
3. Implement with TypeScript and React
4. Ensure accessibility compliance
5. Document changes

## Policies

- All code must be strictly typed (no `any`)
- Components must be keyboard-accessible
- Follow React hooks best practices
```

---

## Compliance Checklist

- [ ] Context gathered (9 key questions answered)
- [ ] Directory and AGENTS.md file created
- [ ] Frontmatter includes required fields
- [ ] `critical-partner` in skills list
- [ ] `process-documentation` in skills (if technical/management agent)
- [ ] All skills exist in `skills/` directory
- [ ] YAML syntax correct (lists use `- item`)
- [ ] Empty fields omitted
- [ ] Token-efficient documentation
- [ ] Purpose section clear and actionable
- [ ] Content in English with proper formatting

---

## References

- [skill-creation](../skill-creation/SKILL.md): Creating new skills
- [critical-partner](../critical-partner/SKILL.md): Code review guidance
- [process-documentation](../process-documentation/SKILL.md): Change documentation

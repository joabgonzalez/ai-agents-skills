---
name: {agent-name}
description: {One-line precise description of agent purpose and responsibilities}. Trigger: {When this agent should be activated - specific contexts or project types}.
skills:
  - critical-partner
  - process-documentation
  - {skill-1}
  - {skill-2}
input: "{description of expected input | data_type}"
output: "{description of expected output | data_type}"
---

# {Agent Name}

## Purpose

{Clear explanation of what this agent does, its primary responsibilities, and its role in the project.}

---

## ⚠️ MANDATORY SKILL READING

**CRITICAL INSTRUCTION: You MUST read the corresponding skill file BEFORE executing any task that matches a trigger below.**

### Skill Reading Protocol

1. **Identify task context** from user request
2. **Match task to trigger** in Mandatory Skills table below
3. **Read the ENTIRE skill file** before proceeding with implementation
4. **Check Extended Mandatory Read Protocol** in [AGENTS.md](../../../AGENTS.md#extended-mandatory-read-protocol) if:
   - Skill has `references/` directory
   - Decision Tree indicates "MUST read {reference}"
   - Critical Pattern says "[CRITICAL] See {reference}"
   - Task involves 40+ patterns or complex edge cases
5. **Notify user** which skills you're using for multi-skill tasks (2+ skills)
6. **Follow skill guidelines** strictly during execution

**⚠️ WARNING**: Do NOT proceed with tasks without reading the skill file first. Skill tables provide reference only—actual patterns, decision trees, and edge cases are in the skill files themselves.

**⚠️ CRITICAL**: For complex skills with references, consult [Extended Mandatory Read Protocol](../../../AGENTS.md#extended-mandatory-read-protocol) to determine which reference files are required vs optional.

### Notification Policy

For multi-skill tasks (2+ skills):

- **Notify user** which skills you're using at the start
- **Proceed immediately** after notification (no confirmation needed)
- **Skip notification** for trivial single-skill tasks

Example notification:

> "Using these skills for your request:
>
> - `{skill-1}` for {purpose}
> - `{skill-2}` for {purpose}"

---

## Mandatory Skills (READ BEFORE EXECUTION)

**⚠️ CRITICAL**: Read the skill file BEFORE performing any task that matches these triggers.

| Trigger (When to Read)                         | Required Skill          | Path                                                      |
| ---------------------------------------------- | ----------------------- | --------------------------------------------------------- |
| {Task trigger description}                     | {skill-name}            | [SKILL.md](../../skills/{skill-name}/SKILL.md)            |
| {Task trigger description}                     | {skill-name}            | [SKILL.md](../../skills/{skill-name}/SKILL.md)            |
| Create TypeScript types/interfaces             | typescript              | [SKILL.md](../../skills/typescript/SKILL.md)              |
| Create React components with hooks             | react                   | [SKILL.md](../../skills/react/SKILL.md)                   |
| Implement accessibility requirements           | a11y                    | [SKILL.md](../../skills/a11y/SKILL.md)                    |
| Write commit messages, PRs, or documentation   | technical-communication | [SKILL.md](../../skills/technical-communication/SKILL.md) |
| Code quality review or improvement suggestions | critical-partner        | [SKILL.md](../../skills/critical-partner/SKILL.md)        |
| Document changes, features, or decisions       | process-documentation   | [SKILL.md](../../skills/process-documentation/SKILL.md)   |
| Writing or reviewing general code patterns     | conventions             | [SKILL.md](../../skills/conventions/SKILL.md)             |

**Example triggers for your specific agent:**

- Replace generic "{Task trigger description}" with specific actions like:
  - "Configure build tool" → webpack/vite skill
  - "Implement state management" → redux-toolkit skill
  - "Style with Material-UI" → mui skill
  - "Create form validation" → formik + yup skills

---

## Core Responsibilities

- **{Responsibility category 1}**: {Description of what agent handles}
- **{Responsibility category 2}**: {Description of what agent handles}
- **{Responsibility category 3}**: {Description of what agent handles}

---

## When to Use This Agent

Use this agent when:

- {Scenario 1}
- {Scenario 2}
- {Scenario 3}

---

## Workflow

### Phase 1: {Phase Name}

1. {Step 1}
2. {Step 2}
3. {Step 3}

### Phase 2: {Phase Name}

1. {Step 1}
2. {Step 2}
3. {Step 3}

---

## Supported Skills

- **{skill-name}**: {Brief description of how this skill is used}
- **{skill-name}**: {Brief description of how this skill is used}
- **{skill-name}**: {Brief description of how this skill is used}

---

## Skills Reference

| Skill Name   | Description         | Path                                           |
| ------------ | ------------------- | ---------------------------------------------- |
| {skill-name} | {Brief description} | [SKILL.md](../../skills/{skill-name}/SKILL.md) |
| {skill-name} | {Brief description} | [SKILL.md](../../skills/{skill-name}/SKILL.md) |

---

## Policies and Recommendations

- **{Policy category 1}**: {Description}
- **{Policy category 2}**: {Description}
- **{Policy category 3}**: {Description}

---

## Decision Tree

```
{Question or condition}? → {Action or workflow A}
{Question or condition}? → {Action or workflow B}
Otherwise                → {Default action}
```

---

## Example Invocations

### Example 1: {Use Case}

```
User: {Example user request}

Agent: {Brief description of agent response and workflow}
```

### Example 2: {Use Case}

```
User: {Example user request}

Agent: {Brief description of agent response and workflow}
```

---

## Resources

- Templates: See [assets/](assets/) for agent-specific templates
- Documentation: See [references/](references/) for project-specific documentation

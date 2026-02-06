---
name: agent-creation
description: "Standards-compliant agent definitions with templates. Trigger: When creating agent definitions, setting up project agents, or documenting workflows."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - english-writing
---

# Agent Creation

Create project-specific agent definitions (AGENTS.md) with YAML frontmatter and structured markdown. Agents define purpose, skills, workflows, and policies for AI assistants working on a project.

## When to Use

- Creating a new agent definition from scratch
- Setting up project-specific agents
- Documenting agent workflows and responsibilities

Don't use for:

- Creating individual skills (use skill-creation)
- Creating context prompts (use prompt-creation)

---

## Critical Patterns

### ✅ REQUIRED: Gather Context First (9 Questions)

Before creating an agent, gather answers to:

1. What is the primary purpose of this agent?
2. What input will it receive? (files, text, user queries)
3. What is the expected output format?
4. Which skills does it need?
5. Specific workflows, policies, or constraints?
6. Target audience? (developers, end-users, AI assistants)
7. Technologies, frameworks, or tools involved?
8. Project context where this agent operates?
9. Tone or communication style? (formal, casual, technical)

**Do not proceed until you have sufficient context.**

### ✅ REQUIRED: Frontmatter Structure

```yaml
---
name: my-project-agent        # Required: lowercase-with-hyphens
description: Development assistant for Project X. Expert in TypeScript, React, MUI.
skills:                        # Required: existing skills from skills/
  - typescript
  - react
  - critical-partner           # Mandatory for ALL agents
  - process-documentation      # Mandatory for technical/management agents
  - conventions
  - a11y
---
```

Rules:
- `name`, `description`, `skills` are required
- Always include `critical-partner` in skills
- Use YAML list syntax (`- item`), never `[]`
- Omit empty fields completely

### ✅ REQUIRED: Content Sections

After frontmatter, include:

1. **# Agent Name** - Title (e.g., "SBD Project Agent")
2. **## Purpose** - Clear statement of responsibilities
3. **## Skills Reference** - Table: Trigger | Skill | Path
4. **## Supported Stack** (if applicable) - Technologies and versions
5. **## Workflows** (optional) - Feature dev, code review, bug fix flows
6. **## Policies** (optional) - Typing rules, accessibility, version constraints

### ❌ NEVER: Skip Context Gathering

Don't create an agent without answering the 9 context questions. Incomplete context leads to vague, unhelpful agents.

---

## Decision Tree

```
Context gathered (9 questions)? → NO → Stop: Ask clarifying questions
All required skills identified? → NO → Ask: Which skills needed?
Technical/management agent? → YES → Include process-documentation
Agent has complex workflows? → YES → Add Workflows section
Agent has version constraints? → YES → Add Policies section with versions
All referenced skills exist in skills/? → NO → Stop: Verify paths
critical-partner in skills? → NO → Stop: Must include (mandatory)
```

---

## Workflow

1. **Gather context** → Ask 9 questions, understand project needs
2. **Create structure** → `mkdir presets/{project-name}` + create `AGENTS.md`
3. **Write frontmatter** → name, description, skills list
4. **Write content** → Purpose, Skills Reference table, Workflows, Policies
5. **Validate** → Run checklist below, verify all skills exist

---

## Example

```yaml
---
name: example-agent
description: Development assistant for Example Project. TypeScript, React, accessibility.
skills:
  - typescript
  - react
  - critical-partner
  - process-documentation
  - conventions
  - a11y
---
```

```markdown
# Example Project Agent

## Purpose

Primary development assistant ensuring code quality, accessibility, and TypeScript/React best practices.

## Skills Reference

| Trigger | Skill | Path |
|---------|-------|------|
| TypeScript types/interfaces | typescript | skills/typescript/SKILL.md |
| React components/hooks | react | skills/react/SKILL.md |
| Code review | critical-partner | skills/critical-partner/SKILL.md |
| Document changes | process-documentation | skills/process-documentation/SKILL.md |

## Supported Stack

- TypeScript 5.0+, React 18+, Vite

## Policies

- Strict typing (no `any`), keyboard-accessible components, React hooks best practices
```

---

## Edge Cases

**Agent with 20+ skills:** Group skills in the reference table by category (Framework, Testing, Standards).

**Multiple agents per project:** Each agent should have distinct responsibility. Avoid skill overlap.

**Modifying existing agents:** Re-gather context for changed requirements before updating.

---

## Checklist

- [ ] Context gathered (9 questions answered)
- [ ] Directory under `presets/` (lowercase-with-hyphens)
- [ ] `AGENTS.md` with frontmatter: `name`, `description`, `skills`
- [ ] `critical-partner` in skills (mandatory for all)
- [ ] `process-documentation` in skills (if technical/management)
- [ ] All referenced skills exist in `skills/`
- [ ] Purpose section is clear and actionable
- [ ] Skills Reference table with triggers and paths
- [ ] Token-efficient (no filler words)
- [ ] Follows english-writing skill guidelines

---

## References

- [agents.md spec](https://agents.md/)
- [Agent Skills](https://agentskills.io/)
- [skill-creation](../skill-creation/SKILL.md)
- [critical-partner](../critical-partner/SKILL.md)

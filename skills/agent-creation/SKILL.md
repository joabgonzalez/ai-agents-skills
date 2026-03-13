---
name: agent-creation
description: "Standards-compliant agent definitions with templates. Trigger: When creating agent definitions, setting up project agents, or documenting workflows."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: behavioral
  skills:
    - critical-partner
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

### ✅ REQUIRED: Select Mode Before Anything Else

Before gathering context or writing any content, determine which mode to use.

**Precedence order:**

1. **Explicit mode** (user specifies) — always respect this
   - Keywords: "interview mode", "no context", "ask me questions"
   - Keywords: "analysis mode", "analyze the project", "read the project"
2. **Auto-detect** (if no mode specified):

```
Is destination project context visible (not the framework itself)?
  YES → Analysis Mode (confirm with user before proceeding)
  NO  → Interview Mode
```

**Auto-detect warning:** If the current working directory appears to be the `ai-agents-skills` framework (e.g., `package.json` shows `"name": "ai-agents-skills"`), do **not** auto-select Analysis Mode. Confirm with the user which project to analyze or switch to Interview Mode.

Signals that destination project context is available:

- `package.json` with a project name different from the framework
- `README.md` describing the destination project
- `src/` directory with application source code

---

### ✅ REQUIRED: Gather Context — Two Modes

#### Interview Mode (no project context available)

Ask these 9 questions in order. Wait for answers before proceeding.

1. What is the primary purpose of this agent?
2. What input will it receive? (files, text, user queries)
3. What is the expected output format?
4. Which skills does it need?
5. Specific workflows, policies, or constraints?
6. Target audience? (developers, end-users, AI assistants)
7. Technologies, frameworks, or tools involved?
8. Project context where this agent operates?
9. Tone or communication style? (formal, casual, technical)

**Do not proceed until all required questions are answered.**

#### Analysis Mode (destination project context is available)

Read files in this order and extract answers to the 9 questions above:

| File | Extract |
|------|---------|
| `package.json` | Project name, dependencies, framework versions |
| `README.md` | Project purpose, architecture overview, tech stack |
| `tsconfig.json` | TypeScript strictness, target, paths |
| `src/` structure | Main patterns, component organization, layers |
| `.github/workflows/` | CI/CD tools, test runners, linting setup |
| `AGENTS.md` (existing) | Current skills, workflows already defined |

After analysis, **only ask the user about gaps** — information that could not be inferred from the files.

Always confirm your findings before writing: "Based on your project, I found: X, Y, Z. Does this look correct?"

---

### ✅ REQUIRED: Frontmatter Structure

```yaml
name: my-project-agent # Required: lowercase-with-hyphens
description: "Development assistant for Project X. Expert in TypeScript, React, MUI."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - typescript
    - react
    - critical-partner # Mandatory for ALL agents
    - code-conventions # Mandatory for coding-related agents
    - a11y
---
```

Rules:

- `name`, `description`, `skills` are required
- Always include `critical-partner` in skills
- Use YAML list syntax (`- item`), never `[]`
- Omit empty fields completely

---

### ✅ REQUIRED: Content Sections

After frontmatter, include:

1. **# Agent Name** — Title (e.g., "Alpha Project Agent")
2. **## Purpose** — Clear statement of responsibilities
3. **## How to Use Skills** — Auto-discovery workflow (BEFORE Skills Reference table)
4. **## Skills Reference** — Table: Trigger | Skill | Path (**only if skills are already installed**)
5. **## Project Structure & Skills Storage** — Symlink explanation (AFTER Skills Reference table)
6. **## Supported Stack** (if applicable) — Technologies and versions
7. **## Workflows** (optional) — Feature dev, code review, bug fix flows
8. **## Policies** (optional) — Typing rules, accessibility, version constraints

---

### ✅ REQUIRED: How to Use Skills Section

AGENTS.md must include this section BEFORE the Skills Reference table. It must always include auto-discovery as the primary mechanism.

**Key steps (copy full template from references):**

1. **Step 1 — Discover**: List `.{model}/skills/` to find installed skills; read each `SKILL.md` description
2. **Step 2 — Match**: Check Skills Reference table; if absent, scan directory for best match
3. **Step 3 — Read**: Open `.{model}/skills/{skill-name}/SKILL.md`
4. **Step 4 — Dependencies**: Read every skill listed in `metadata.skills` before proceeding
5. **Step 5 — Apply**: Follow Critical Patterns (✅ REQUIRED), Decision Tree, and inline examples

> Full section template with all sub-steps: [agent-templates.md](./references/agent-templates.md)

**Why auto-discovery matters:** Skills Reference table reflects skills at creation time only; directory listing always reflects current state. Both together ensure 100% coverage.

---

### ✅ REQUIRED: Skills Reference Table (Conditional)

Include this section **only if skills have been identified** — either specified by the user (Interview Mode Q4) or detected from project files (Analysis Mode). If no skills were identified at all, omit this section entirely.

Every identified skill must appear in **both** places:

1. `metadata.skills` in the frontmatter
2. A row in the Skills Reference table

When included, place it AFTER the `How to Use Skills` section. Use `{model}` placeholders for model-agnostic paths.

> Full table template: [agent-templates.md](./references/agent-templates.md)

---

### ✅ REQUIRED: Add "Project Structure & Skills Storage" Section

AGENTS.md must include this section AFTER the Skills Reference table. Explains the 3-layer symlink structure for LLMs that struggle with symlink resolution.

> Full section template with symlink diagram: [agent-templates.md](./references/agent-templates.md)

---

### ❌ NEVER: Skip Mode Selection

Always determine the mode (Interview or Analysis) before gathering any context. Jumping straight to writing the AGENTS.md leads to incomplete or incorrect agent definitions.

### ❌ NEVER: Analyze the Framework as the Destination Project

If running from within `ai-agents-skills`, confirm the destination project before using Analysis Mode. Reading the framework's own `package.json` or `README.md` produces an agent definition for the wrong project.

### ❌ NEVER: Include Skills Reference Table When No Skills Are Installed

An empty table or a table with placeholder rows provides no value and misleads the model. Omit the section entirely if no skills exist yet.

---

## Decision Tree

```
Explicit mode specified by user?
  YES → Use that mode directly
  NO  → Auto-detect:
          Working directory = ai-agents-skills framework?
            YES → Interview Mode (or confirm with user)
            NO  → Destination project files visible?
                    YES → Analysis Mode (confirm findings with user first)
                    NO  → Interview Mode

Interview Mode:
  All 9 questions answered? → NO → Stop: Ask clarifying questions
  → Proceed to create AGENTS.md

Analysis Mode:
  Files read and findings confirmed? → NO → Confirm with user
  All gaps filled? → NO → Ask only about missing information
  → Proceed to create AGENTS.md

Both modes:
  All required skills identified? → NO → Ask: Which skills needed?
  Agent has complex workflows? → YES → Add Workflows section
  Agent has version constraints? → YES → Add Policies section
  Skills installed in project? → YES → Add Skills Reference table
                               → NO  → Omit Skills Reference table
  All referenced skills exist? → NO → Verify paths
  critical-partner in skills? → NO → Must include (mandatory)
```

---

## Workflow

0. **Select mode** → Explicit (user-specified) or auto-detect
1. **Gather context** → Analysis Mode: read project files, infer 9 answers, ask only gaps | Interview Mode: ask all 9 questions
2. **Confirm context** → Show findings to user before writing (both modes)
3. **Create structure** → `mkdir presets/{project-name}` + create `AGENTS.md`
4. **Write frontmatter** → name, description, skills list
5. **Add "How to Use Skills" section** → Complete workflow with auto-discovery (BEFORE Skills Reference table)
6. **Write Skills Reference table** → Only if skills are installed; use `{model}` placeholders
7. **Add "Project Structure & Skills Storage" section** → Complete symlink documentation (AFTER Skills Reference table)
8. **Write content** → Purpose, Supported Stack, Workflows, Policies
9. **Validate** → Run checklist below, verify all skills exist

---

## Example

### Interview Mode

```yaml
name: example-agent
description: "Development assistant for Example Project. TypeScript, React, accessibility."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - typescript
    - react
    - critical-partner
    - code-conventions
    - a11y
```

Resulting AGENTS.md structure (abbreviated):

```
# Example Project Agent

Purpose: Primary development assistant for TypeScript/React best practices and accessibility.

How to Use Skills (MANDATORY WORKFLOW):
  Step 1 — Discover  | Step 2 — Match | Step 3 — Read
  Step 4 — Dependencies | Step 5 — Apply

Skills Reference:
  TypeScript types/interfaces | typescript       | {model}/skills/typescript/SKILL.md
  React components/hooks      | react            | {model}/skills/react/SKILL.md
  Code review                 | critical-partner | {model}/skills/critical-partner/SKILL.md

Project Structure & Skills Storage: 3-layer symlink structure (see template for full diagram)

Supported Stack: TypeScript 5.0+, React 18+, Vite
Policies: Strict typing (no `any`), keyboard-accessible components, React hooks best practices
```

> Full AGENTS.md content with all section templates: [agent-templates.md](./references/agent-templates.md)

---

## Edge Cases

**Agent with 20+ skills:** Group skills in the reference table by category (Framework, Testing, Standards).

**Multiple agents per project:** Each agent should have distinct responsibility. Avoid skill overlap.

**Modifying existing agents:** Re-gather context for changed requirements before updating.

**No skills installed yet:** Omit the Skills Reference table. The auto-discovery section in `How to Use Skills` is sufficient — the model will find skills as they are installed.

**Skills added after creation:** The auto-discovery section handles this automatically. No need to update the AGENTS.md when new skills are installed.

**When to split one agent into multiple:** Split when the agent prompt exceeds ~400 tokens OR the agent covers 2+ unrelated workflows (e.g., frontend development + infrastructure provisioning). Each agent should have one primary job so skill routing stays predictable. Overlap between agents causes the model to load multiple agents unnecessarily.

**Updating agent description when project scope changes:** The `description` field in `AGENTS.md` frontmatter is the routing key — the model uses it to decide which agent to activate. If the project's scope changes (new framework, added backend), re-run the creation workflow to regenerate the description. A stale description causes the wrong agent to be selected or the right one to be skipped.

**Skill version conflicts across agents:** Skills are installed project-wide, not per-agent. If two agents in the same project reference the same skill, they share the same installed version. After updating a skill with `skills sync`, both agents get the update simultaneously — verify both agents' behavior after any skill update that changes critical patterns.

---

## Checklist

- [ ] Mode selected (Interview or Analysis) before gathering context
- [ ] In Analysis Mode: confirmed that analyzed context belongs to the destination project, not the framework
- [ ] Context gathered and confirmed with user (both modes)
- [ ] Directory under `presets/` (lowercase-with-hyphens)
- [ ] `AGENTS.md` with frontmatter: `name`, `description`, `skills`
- [ ] `critical-partner` in skills (mandatory for all)
- [ ] "How to Use Skills" section added BEFORE Skills Reference table, with auto-discovery as Step 1
- [ ] Skills Reference table included ONLY if skills are already installed in the project
- [ ] Skills Reference table uses `{model}` placeholders (model-agnostic paths)
- [ ] "Project Structure & Skills Storage" section added AFTER Skills Reference table
- [ ] All referenced skills exist in `.agents/skills/`
- [ ] Purpose section is clear and actionable
- [ ] Token-efficient (no filler words)
- [ ] Follows english-writing skill guidelines

---

## Resources

- [agent-templates.md](./references/agent-templates.md) — Full How to Use Skills template, Skills Reference table, Project Structure & Skills Storage template, complete Interview and Analysis Mode examples
- [agents.md spec](https://agents.md/)
- [Agent Skills](https://agentskills.io/)
- [skill-creation](../skill-creation/SKILL.md)
- [critical-partner](../critical-partner/SKILL.md)

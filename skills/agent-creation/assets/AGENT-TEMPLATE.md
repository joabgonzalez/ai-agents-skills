---
name: { agent-name }
description: "{One-line precise description of agent purpose and responsibilities}."
metadata:
  version: "1.0"
  skills:
    - critical-partner
    - process-documentation
    - { skill-1 }
    - { skill-2 }
input: "{description of expected input | data_type}"
output: "{description of expected output | data_type}"
---

# {Agent Name}

## Purpose

{Clear explanation of what this agent does, its primary responsibilities, and its role in the project.}

---

## How to Use Skills (MANDATORY WORKFLOW)

This project has skills installed in your model's skills directory. Follow this protocol for ALL coding tasks:

### Step 1: Find the Trigger
Check the "Skills Reference" table below. Match your task to the "Trigger" column.

### Step 2: Read the Skill
**Path format:** `.{model}/skills/{skill-name}/SKILL.md`

Replace `{model}` with your coding agent:
- **Cursor:** `.cursor/skills/typescript/SKILL.md`
- **Claude:** `.claude/skills/typescript/SKILL.md`
- **Copilot:** `.github/skills/typescript/SKILL.md`
- **Gemini:** `.gemini/skills/typescript/SKILL.md`
- **Codex:** `.codex/skills/typescript/SKILL.md`

### Step 3: Read Dependencies
Every skill lists dependencies in its frontmatter (`metadata.skills`). Read each dependency skill before proceeding.

**Example:** `react` skill depends on: `conventions`, `a11y`, `typescript`, `javascript`, `architecture-patterns`, `humanizer`

You must read all 6 skills.

### Step 4: Apply Patterns
- Follow "Critical Patterns" marked with ✅ REQUIRED
- Use "Decision Tree" for implementation choices
- Reference inline code examples

### Example Workflow

**Task:** "Create TypeScript interface for User model"

1. **Check table below** → Trigger: "TypeScript types/interfaces" → Skill: `typescript`
2. **Read:** `.{model}/skills/typescript/SKILL.md`
3. **Check frontmatter** → Dependencies: `conventions`, `javascript`
4. **Read dependencies:**
   - `.{model}/skills/conventions/SKILL.md`
   - `.{model}/skills/javascript/SKILL.md`
5. **Apply patterns:** Use `interface` (not `type`), PascalCase names, export from `types/` directory

## Skills Reference

**IMPORTANT:** Paths shown are model-agnostic. See "How to Use Skills" above for your model's actual path.

| Trigger                     | Skill                   | Relative Path                                 |
| --------------------------- | ----------------------- | --------------------------------------------- |
| {Task trigger description}  | {skill-name}            | {model}/skills/{skill-name}/SKILL.md          |
| {Task trigger description}  | {skill-name}            | {model}/skills/{skill-name}/SKILL.md          |
| TypeScript types/interfaces | typescript              | {model}/skills/typescript/SKILL.md            |
| React components/hooks      | react                   | {model}/skills/react/SKILL.md                 |
| Accessibility               | a11y                    | {model}/skills/a11y/SKILL.md                  |
| Commit messages, PRs, docs  | technical-communication | {model}/skills/technical-communication/SKILL.md |
| Code review                 | critical-partner        | {model}/skills/critical-partner/SKILL.md      |
| Document changes            | process-documentation   | {model}/skills/process-documentation/SKILL.md |
| Coding standards            | conventions             | {model}/skills/conventions/SKILL.md           |

**Example triggers for your specific agent:**

- Replace generic "{Task trigger description}" with specific actions like:
  - "Configure build tool" → webpack/vite skill
  - "Implement state management" → redux-toolkit skill
  - "Style with Material-UI" → mui skill
  - "Forms, validation schemas" → form-validation skill
  - "Linting, formatting" → code-quality skill

## Project Structure & Skills Storage

**IMPORTANT FOR LLMs:** Skills use a 3-layer symlink structure:

```
your-project/
├── .agents/skills/        # Canonical symlinks to framework skills/ (shared across models)
│   ├── react/            → ../../skills/react/
│   ├── typescript/       → ../../skills/typescript/
│   └── ...
├── .claude/skills/        # Claude-specific symlinks to .agents/skills/
│   ├── react/            → ../../.agents/skills/react/
│   └── typescript/       → ../../.agents/skills/typescript/
├── .cursor/skills/        # Cursor-specific symlinks to .agents/skills/
├── .github/skills/        # Copilot-specific symlinks to .agents/skills/
├── .gemini/skills/        # Gemini-specific symlinks to .agents/skills/
├── .codex/skills/         # Codex-specific symlinks to .agents/skills/
└── AGENTS.md             # This file
```

**How to access skills:**
- **Preferred:** Read from `.{model}/skills/<skill-name>/SKILL.md` (your model's directory)
- **If symlinks fail:** Skills are stored in the ai-agents-skills framework installation (referenced via symlinks)
- **Real files location:** All source skills are in the framework's `skills/` directory

**Why 3 layers?**
1. **Layer 1 (framework skills/):** Source of truth maintained by framework
2. **Layer 2 (.agents/skills/):** Canonical shared location in your project
3. **Layer 3 (.{model}/skills/):** Model-specific access for your AI assistant

**Benefits:**
- **Zero duplication:** Skills installed once, available to all 5 AI models
- **Always up-to-date:** Changes propagate instantly via symlinks
- **Token-efficient:** Your AI reads only the skills it needs

---

## Core Responsibilities

- **{Responsibility category 1}**: {Description of what agent handles}
- **{Responsibility category 2}**: {Description of what agent handles}
- **{Responsibility category 3}**: {Description of what agent handles}

---

## Supported Stack

{Description of technologies, frameworks, versions, and tools used in the project}

**Example:**
- **Languages:** TypeScript 5.0+, JavaScript (ES2020+)
- **Frameworks:** React 18+, Next.js 14+
- **Build:** Vite/Webpack
- **Styling:** TailwindCSS 3+
- **State:** Redux Toolkit (if applicable)
- **Forms:** Context-aware (see form-validation skill — checks package.json for installed library)
- **Code Quality:** Context-aware (see code-quality skill — checks package.json for installed tools)

---

## Workflows

### Feature Development

1. {Step 1 - Gather requirements}
2. {Step 2 - Design architecture}
3. {Step 3 - Implement}
4. {Step 4 - Test}
5. {Step 5 - Document and review}

### Code Review

1. {Verification point 1}
2. {Verification point 2}
3. {Verification point 3}

## Policies

**{Policy category 1}:** {Description}

**{Policy category 2}:** {Description}

**{Policy category 3}:** {Description}

**Example policies:**
- **Typing:** strict mode, no `any`, explicit return types
- **Code quality:** Context-aware linting and formatting (see code-quality skill)
- **Accessibility:** Semantic HTML, keyboard-accessible elements, proper ARIA labels
- **Versions:** Document exact versions and acceptable ranges

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

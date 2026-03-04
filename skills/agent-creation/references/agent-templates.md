## Core Patterns

Full templates and worked examples for agent creation.

---

### How to Use Skills — Complete Section Template

Copy this section into AGENTS.md BEFORE the Skills Reference table.

````markdown
### How to Use Skills (MANDATORY WORKFLOW)

This project has skills installed in your model's skills directory. Follow this protocol for ALL coding tasks:

#### Step 1: Discover Available Skills

List the contents of your model's skills directory:

- **Cursor:** `.cursor/skills/`
- **Claude:** `.claude/skills/`
- **Copilot:** `.github/skills/`
- **Gemini:** `.gemini/skills/`
- **Codex:** `.codex/skills/`

Each installed skill has a `SKILL.md` file. Read the `description` field to understand when to use it.

#### Step 2: Match Task to Skill

Check the "Skills Reference" table below (if present) for a quick lookup.
If your task is not in the table, or the table is absent, scan `.{model}/skills/` for the most relevant skill.

#### Step 3: Read the Skill

**Path format:** `.{model}/skills/{skill-name}/SKILL.md`

Replace `{model}` with your coding agent:

- **Cursor:** `.cursor/skills/typescript/SKILL.md`
- **Claude:** `.claude/skills/typescript/SKILL.md`
- **Copilot:** `.github/skills/typescript/SKILL.md`
- **Gemini:** `.gemini/skills/typescript/SKILL.md`
- **Codex:** `.codex/skills/typescript/SKILL.md`

#### Step 4: Read Dependencies

Every skill lists dependencies in its frontmatter (`metadata.skills`). Read each dependency before proceeding.

#### Step 5: Apply Patterns

- Follow "Critical Patterns" marked with ✅ REQUIRED
- Use "Decision Tree" for implementation choices
- Reference inline code examples

#### Example Workflow

**Task:** "Create TypeScript interface for User model"

1. **Scan** `.{model}/skills/` → find `typescript/SKILL.md`
2. **Read:** `.{model}/skills/typescript/SKILL.md`
3. **Check frontmatter** → Dependencies: `javascript`
4. **Read dependency:** `.{model}/skills/javascript/SKILL.md`
5. **Apply patterns:** Use `interface` (not `type`), PascalCase names, export from `types/` directory
````

**Why auto-discovery matters:**

- Skills Reference table reflects skills known at creation time — new skills installed later are not listed
- Auto-discovery via directory listing always reflects the current installed state
- Both mechanisms together ensure 100% coverage at all times

---

### Skills Reference Table — Template

Copy this section into AGENTS.md AFTER the How to Use Skills section. Include only if skills have been identified.

````markdown
### Skills Reference

**IMPORTANT:** Paths shown are model-agnostic. See "How to Use Skills" above for your model's actual path.
New skills installed after this file was created are auto-discovered via `.{model}/skills/`.

| Trigger                     | Skill                 | Relative Path                                 |
| --------------------------- | --------------------- | --------------------------------------------- |
| TypeScript types/interfaces | typescript            | {model}/skills/typescript/SKILL.md            |
| React components/hooks      | react                 | {model}/skills/react/SKILL.md                 |
| Code review                 | critical-partner      | {model}/skills/critical-partner/SKILL.md      |
````

---

### Project Structure and Skills Storage — Template

Copy this section into AGENTS.md AFTER the Skills Reference table.

````markdown
### Project Structure & Skills Storage

**IMPORTANT FOR LLMs:** Skills use a 3-layer symlink structure:

```
your-project/
├── .agents/skills/      # Canonical symlinks to framework skills/ (shared across models)
│   ├── react/           → ../../skills/react/
│   ├── typescript/      → ../../skills/typescript/
│   └── ...
├── .claude/skills/      # Claude-specific symlinks to .agents/skills/
│   ├── react/           → ../../.agents/skills/react/
│   └── typescript/      → ../../.agents/skills/typescript/
├── .cursor/skills/      # Cursor-specific symlinks to .agents/skills/
├── .github/skills/      # Copilot-specific symlinks to .agents/skills/
├── .gemini/skills/      # Gemini-specific symlinks to .agents/skills/
├── .codex/skills/       # Codex-specific symlinks to .agents/skills/
└── AGENTS.md            # This file
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
````

---

### Interview Mode — Full Worked Example

The complete AGENTS.md produced after an Interview Mode session.

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

````markdown
# Example Project Agent

### Purpose

Primary development assistant ensuring code quality, accessibility, and TypeScript/React best practices.

### How to Use Skills (MANDATORY WORKFLOW)

#### Step 1: Discover Available Skills

List your model's skills directory (`.{model}/skills/`) to see all installed skills.
Each skill has a `SKILL.md` with a `description` field showing when to use it.

#### Step 2: Match Task to Skill

Check the Skills Reference table below for a quick lookup.
If your task is not listed, scan `.{model}/skills/` for the most relevant skill.

#### Step 3: Read the Skill

**Path format:** `.{model}/skills/{skill-name}/SKILL.md`

...

### Skills Reference

**IMPORTANT:** Paths shown are model-agnostic. See "How to Use Skills" above for your model's actual path.
New skills installed after this file was created are auto-discovered via `.{model}/skills/`.

| Trigger                     | Skill                 | Relative Path                                 |
| --------------------------- | --------------------- | --------------------------------------------- |
| TypeScript types/interfaces | typescript            | {model}/skills/typescript/SKILL.md            |
| React components/hooks      | react                 | {model}/skills/react/SKILL.md                 |
| Code review                 | critical-partner      | {model}/skills/critical-partner/SKILL.md      |

### Project Structure & Skills Storage

**IMPORTANT FOR LLMs:** Skills use a 3-layer symlink structure:
...

### Supported Stack

- TypeScript 5.0+, React 18+, Vite

### Policies

- Strict typing (no `any`), keyboard-accessible components, React hooks best practices
````

---

### Analysis Mode — Worked Example

**Scenario:** User runs the skill from a React + TypeScript project directory.

```
Agent reads: package.json → { "name": "my-store", "dependencies": { "react": "^18", "typescript": "5" } }
Agent reads: README.md → "E-commerce platform built with React, TypeScript, and Redux Toolkit"
Agent reads: tsconfig.json → { "strict": true }
Agent reads: src/ → components/, store/, hooks/, pages/

Agent infers:
  Q1 (purpose): E-commerce development assistant
  Q2 (input): User stories, bug reports, code review requests
  Q3 (output): TypeScript components, Redux slices, hooks
  Q4 (skills): typescript, react, redux-toolkit, critical-partner
  Q7 (tech): React 18, TypeScript 5, Redux Toolkit, Vite

Agent confirms: "Based on your project, I found: React 18 + TypeScript 5 e-commerce app.
  Skills to include: typescript, react, redux-toolkit, critical-partner.
  Does this look correct? Anything to add or change?"

User confirms → Agent creates AGENTS.md
```

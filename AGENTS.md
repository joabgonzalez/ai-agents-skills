---
name: ai-agents-skills
description: "CLI framework for managing and distributing AI agent skills across multiple models (Copilot, Claude, Gemini, Codex, Cursor)."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - skill-creation
    - agent-creation
    - typescript
    - nodejs
    - conventions
    - critical-partner
---

# AI Agents Skills Framework

CLI for creating, managing, and distributing AI agent skills across 5 AI models. Local-first architecture with symlink-based installation, dependency resolution, and token-efficient model instructions.

## How to Use Skills (MANDATORY WORKFLOW)

This project has skills installed in your model's skills directory. Follow this protocol for ALL coding tasks:

### Step 1: Find the Trigger

Check the "Mandatory Skills" table below. Match your task to the "Trigger" column.

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

## Mandatory Skills

**IMPORTANT:** Paths shown are model-agnostic. See "How to Use Skills" above for your model's actual path.

| Trigger                     | Skill            | Relative Path                            |
| --------------------------- | ---------------- | ---------------------------------------- |
| Create or modify skills     | skill-creation   | {model}/skills/skill-creation/SKILL.md   |
| Create agent definitions    | agent-creation   | {model}/skills/agent-creation/SKILL.md   |
| Code review or improvements | critical-partner | {model}/skills/critical-partner/SKILL.md |
| Coding standards            | conventions      | {model}/skills/conventions/SKILL.md      |
| TypeScript code             | typescript       | {model}/skills/typescript/SKILL.md       |
| Node.js / CLI development   | nodejs           | {model}/skills/nodejs/SKILL.md           |

## Skills Reference

52 skills organized by category:

- **Frameworks:** React, Next.js, Astro, Express, Nest, Hono, React Native, Expo
- **Testing:** Jest, Playwright, React Testing Library, React Native Testing Library, E2E Testing, Unit Testing
- **Standards:** TypeScript, JavaScript, HTML, CSS, TailwindCSS, A11y
- **Backend:** Node.js, Express, Nest, Hono, Bun, Backend Development
- **Build Tools:** Vite, Webpack
- **Libraries:** MUI, AG Grid, Redux Toolkit, Stagehand
- **Quality & Architecture:** Conventions, Code Quality, Form Validation, Critical Partner, Code Refactoring, Architecture Patterns, Composition Patterns, English Writing, Technical Communication, Humanizer, Frontend Development
- **Behavioral:** Brainstorming, Systematic Debugging, Interface Design, Writing Plans, Code Review, Verification Protocol, Plan Execution, Subagent Orchestration
- **Meta:** Skill Creation, Agent Creation, Reference Creation, Prompt Creation, Skill Sync

## Project Structure

```
ai-agents-skills/
├── skills/                # 52 skill definitions (SKILL.md format) - SOURCE OF TRUTH
│   ├── react/
│   │   ├── SKILL.md
│   │   └── references/    # Progressive disclosure for complex skills
│   ├── typescript/
│   │   └── SKILL.md
│   └── ...
├── .agents/skills/        # Canonical symlinks to skills/ (shared across models)
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
├── presets/               # Project Starter Preset (AGENTS.md + skills bundle)
├── src/                   # TypeScript CLI source
│   ├── commands/          # CLI commands (local, add, remove, sync, validate, list)
│   ├── core/              # Dependency resolver, installer, skill parser
│   └── utils/             # Logger, YAML parser, instruction generator
├── templates/             # Model instruction templates (5 models)
└── AGENTS.md             # This file
```

**IMPORTANT FOR LLMs:** When reading skills, you will encounter a 3-layer symlink structure:

1. **Source of truth:** `skills/<skill-name>/SKILL.md` (real files, always read from here)
2. **Canonical layer:** `.agents/skills/<skill-name>/` → `skills/<skill-name>/` (shared symlinks)
3. **Model-specific layer:** `.{model}/skills/<skill-name>/` → `.agents/skills/<skill-name>/` (per-model symlinks)

**How to access skills:**

- **Preferred:** Read directly from `skills/<skill-name>/SKILL.md` (bypasses symlinks)
- **Alternative:** Follow symlinks from `.{model}/skills/<skill-name>/SKILL.md` if your IDE resolves them automatically
- **If symlinks fail:** All real skill files are in `skills/` directory

### Skills Storage Architecture

**Why 3 layers?**

1. **Layer 1 (skills/):** Single source of truth — edit once, affects all models
2. **Layer 2 (.agents/skills/):** Canonical shared location — prevents duplication across 5 models
3. **Layer 3 (.{model}/skills/):** Model-specific access — each AI model reads from its own directory

**Benefits:**

- **Zero duplication:** 48 skills stored once, available to 5 models
- **Always up-to-date:** Changes propagate instantly (symlinks reference same files)
- **Vercel-compatible:** Matches vercel-labs/skills standard (individual skill symlinks)
- **Token-efficient:** Models read only the skills they need

**Example flow:**

```
User edits: skills/react/SKILL.md
      ↓
Symlink: .agents/skills/react/ → skills/react/
      ↓
Symlinks: .claude/skills/react/ → .agents/skills/react/
          .cursor/skills/react/ → .agents/skills/react/
          .github/skills/react/ → .agents/skills/react/
          .gemini/skills/react/ → .agents/skills/react/
          .codex/skills/react/  → .agents/skills/react/
      ↓
All 5 models see updated react skill instantly
```

## Workflows

### Create a Skill

1. Read `skills/skill-creation/SKILL.md`
2. `mkdir skills/{name}` + copy SKILL-TEMPLATE.md
3. Write SKILL.md with frontmatter and sections
4. Validate: `npx ai-agents-skills validate --skill {name}`
5. Install: `npx ai-agents-skills local`

### Create an Agent

1. Read `skills/agent-creation/SKILL.md`
2. Gather context (9 questions)
3. Create `presets/{project-name}/AGENTS.md`
4. Validate all referenced skills exist

### Install Skills

```bash
npx ai-agents-skills local                    # Install to all detected models
npx ai-agents-skills local --models claude     # Install to specific model
npx ai-agents-skills validate --all            # Validate all skills
```

## Policies

- **Explicit dependencies:** Skills declare all their dependencies in `metadata.skills` — no hidden auto-includes
- **Dependency resolution:** Auto-resolve with cycle detection and topological sort
- **Symlink architecture:** 3-layer structure for zero duplication across models:
  - **Layer 1:** `skills/` (source of truth — real files)
  - **Layer 2:** `.agents/skills/` → `skills/` (canonical shared symlinks)
  - **Layer 3:** `.{model}/skills/` → `.agents/skills/` (model-specific symlinks)
  - **Individual skill symlinks:** Each skill gets its own symlink (Vercel-compatible, NOT directory-level)
  - **Instant propagation:** Changes to source files visible to all models immediately
- **Auto-generated instructions:** Each model gets an instruction file listing all installed skills with their metadata
- **Dependency-safe removal:** `remove` command validates dependencies before removing skills
- **5 models supported:** GitHub Copilot, Claude, Gemini, Codex, Cursor

## References

- [AGENTS.md Spec](https://agents.md/)
- [Agent Skills](https://agentskills.io/)

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
    - code-conventions
    - critical-partner
    - unit-testing
    - jest
    - brainstorming
    - astro
    - tailwindcss
    - a11y
    - frontend-dev
    - interface-design
    - technical-communication
    - reference-creation
    - skill-sync
    - systematic-debugging
    - html
    - css
    - javascript
    - english-writing
    - code-review
    - writing-plans
    - verification-protocol
    - prompt-creation
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

Every skill lists dependencies in its frontmatter (`metadata.skills`). Read each direct dependency before proceeding.

**Example:** `react` skill depends on: `a11y`, `typescript`, `javascript`, `architecture-patterns`

Read these 4 direct dependencies. Dependencies are resolved transitively - when you read `typescript`, you'll see it depends on `javascript`, which depends on `code-conventions`. The dependency chain ensures you have all required context.

### Step 4: Apply Patterns

- Follow "Critical Patterns" marked with ✅ REQUIRED
- Use "Decision Tree" for implementation choices
- Reference inline code examples

### Example Workflow

**Task:** "Create TypeScript interface for User model"

1. **Check table below** → Trigger: "TypeScript types/interfaces" → Skill: `typescript`
2. **Read:** `.{model}/skills/typescript/SKILL.md`
3. **Check frontmatter** → Dependencies: `javascript`
4. **Read dependency:**
   - `.{model}/skills/javascript/SKILL.md` (which depends on `code-conventions`)
5. **Apply patterns:** Use `interface` (not `type`), PascalCase names, export from `types/` directory

## Mandatory Skills

**Path format:** `.{model}/skills/{skill-name}/SKILL.md` (see Step 2 above)

| Trigger                          | Skill            |
| -------------------------------- | ---------------- |
| Create or modify skills          | skill-creation   |
| Create agent definitions         | agent-creation   |
| Code review or improvements      | critical-partner |
| Coding standards                 | code-conventions |
| TypeScript code                  | typescript       |
| Node.js / CLI development        | nodejs           |
| Writing unit tests               | unit-testing     |
| Jest test suite or config        | jest             |
| Exploring ideas or approaches    | brainstorming    |
| Astro pages, layouts, components | astro                  |
| Tailwind utilities or styling    | tailwindcss            |
| Accessibility or UI components   | a11y                   |
| Frontend workflow or components  | frontend-dev           |
| UI/UX decisions or design review | interface-design       |
| Commit messages or documentation | technical-communication|
| Creating reference files         | reference-creation     |
| Syncing skills across models     | skill-sync             |
| Debugging errors or root cause   | systematic-debugging   |
| HTML markup or structure         | html                   |
| CSS properties or animations     | css                    |
| JavaScript patterns or scripts   | javascript             |
| Writing skill content in English | english-writing        |
| Formal code review checklist     | code-review            |
| Planning implementation tasks    | writing-plans          |
| Verifying task completion        | verification-protocol  |
| Creating model prompt files      | prompt-creation        |

## Skills Reference

61 skills organized by category:

- **Frameworks:** React, Next.js, Astro, Express, Nest, Hono, React Native, Expo
- **Testing:** Jest, Playwright, React Testing Library, React Native Testing Library, E2E Testing, Unit Testing
- **Standards:** TypeScript, JavaScript, HTML, CSS, TailwindCSS, A11y
- **Backend:** Node.js, Express, Nest, Hono, Bun, Backend Development
- **Build Tools:** Vite, Webpack
- **Libraries:** MUI, AG Grid, Redux Toolkit, Stagehand
- **Quality & Architecture:** Code Conventions, Code Quality, Form Validation, Critical Partner, Code Refactoring
- **Architecture Patterns:** Architecture Patterns, SOLID, Clean Architecture, Domain-Driven Design, Hexagonal Architecture, Result Pattern, DRY Principle, Mediator Pattern, Sidecar Pattern, Composition Pattern
- **Behavioral:** English Writing, Technical Communication, Humanizer, Frontend Development, Brainstorming, Systematic Debugging, Interface Design, Writing Plans, Code Review, Verification Protocol, Plan Execution, Subagent Orchestration
- **Meta:** Skill Creation, Agent Creation, Reference Creation, Prompt Creation, Skill Sync

## Project Structure

```
ai-agents-skills/
├── skills/                # 61 skill definitions (SKILL.md format) - SOURCE OF TRUTH
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
├── website/               # Astro SSG skill catalog website
│   ├── src/
│   │   ├── content/       # Content collections (skills, references)
│   │   ├── layouts/       # BaseLayout, SkillLayout
│   │   ├── pages/         # Index, getting-started, skills/[name], references/[ref]
│   │   ├── components/    # SkillMeta, ReferenceSidebar, TableOfContents, etc.
│   │   └── styles/        # global.css (Tailwind v4 CSS-based config)
│   ├── astro.config.mjs
│   └── package.json
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

- **Zero duplication:** 61 skills stored once, available to 5 models
- **Always up-to-date:** Changes propagate instantly (symlinks reference same files)
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

### Update Website

The website (`website/`) is an Astro SSG site that auto-renders skills from `skills/` via content collections.

1. Read `skills/astro/SKILL.md` and `skills/tailwindcss/SKILL.md`
2. Pages live in `website/src/pages/` — skills rendered via `[name]/index.astro`
3. Layouts: `BaseLayout.astro` (shell), `SkillLayout.astro` (two-column with sidebar)
4. Components: `SkillMeta`, `ReferenceSidebar`, `TableOfContents`, `Breadcrumb`
5. Styles: Tailwind v4 via `@theme` in `website/src/styles/global.css` (no `tailwind.config.*`)
6. Build: `cd website && npm run build` — deploys via GitHub Actions on push to `main`

**Key conventions:**
- Reference sidebar uses `{slug, title}[]` — titles extracted from H1 of each reference file
- Skills H1: topic name only, no "Skill" suffix (e.g., `# React`, not `# React Skill`)
- `---` separator required before every `##` section except the first

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
  - **Individual skill symlinks:** Each skill gets its own symlink (NOT directory-level)
  - **Instant propagation:** Changes to source files visible to all models immediately
- **Auto-generated instructions:** Each model gets an instruction file listing all installed skills with their metadata
- **Dependency-safe removal:** `remove` command validates dependencies before removing skills
- **5 models supported:** GitHub Copilot, Claude, Gemini, Codex, Cursor

## References

- [AGENTS.md Spec](https://agents.md/)
- [Agent Skills](https://agentskills.io/)

---
name: ai-agents-skills
description: "CLI framework for managing and distributing 50+ AI agent skills across 11 AI agents (3 dedicated + 8 universal)."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - skill-creation
    - agent-creation
    - typescript
    - nodejs
    - nodejs-best-practices
    - code-conventions
    - critical-partner
    - unit-testing
    - jest
    - brainstorming
    - astro
    - astro-best-practices
    - tailwindcss
    - css-best-practices
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
    - receiving-code-review
    - writing-plans
    - verification-protocol
    - prompt-creation
    - sharp-execution
    - lean-output
    - ship-branch
    - grill-me
    - context-handoff
---

# AI Agents Skills Framework

CLI for creating, managing, and distributing AI agent skills across 11 AI agents. Local-first architecture with symlink-based installation, dependency resolution, and token-efficient model instructions.

## How to Use Skills (MANDATORY WORKFLOW)

This project has skills installed in your model's skills directory. Follow this protocol for ALL coding tasks:

### Step 1: Find the Trigger

Check the "Mandatory Skills" table below. Match your task to the "Trigger" column.

### Step 2: Read the Skill

Find your agent below and use the corresponding path:

| Agent | Skills path |
|-------|------------|
| Claude Code | `.claude/skills/{skill-name}/SKILL.md` |
| Antigravity | `.agent/skills/{skill-name}/SKILL.md` |
| OpenClaw | `skills/{skill-name}/SKILL.md` |
| Amp, Cline, Codex, Cursor, Gemini CLI, GitHub Copilot, Kimi, OpenCode | `.agents/skills/{skill-name}/SKILL.md` |

**Shortcut:** All skill source files live at `skills/{skill-name}/SKILL.md` — if your agent can't resolve symlinks, read from there directly.

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
2. **Read:** `skills/typescript/SKILL.md` (or your agent's path from Step 2)
3. **Check frontmatter** → Dependencies: `javascript`
4. **Read dependency:**
   - `skills/javascript/SKILL.md` (which depends on `code-conventions`)
5. **Apply patterns:** Use `interface` (not `type`), PascalCase names, export from `types/` directory

## Mandatory Skills

**Path:** Use the table in Step 2 above to find the correct path for your agent.

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
| Writing architecture or spike docs | tech-docs            |
| Commit messages or documentation | technical-communication|
| Creating reference files         | reference-creation     |
| Syncing skills across models     | skill-sync             |
| Debugging errors or root cause   | systematic-debugging   |
| HTML markup or structure         | html                   |
| CSS properties or animations     | css                    |
| JavaScript patterns or scripts   | javascript             |
| Writing skill content in English | english-writing        |
| Formal code review checklist     | code-review            |
| Processing incoming review feedback | receiving-code-review |
| Planning implementation tasks    | writing-plans          |
| Verifying task completion        | verification-protocol  |
| Creating model prompt files      | prompt-creation        |
| Agent overthinking or hesitation | sharp-execution        |
| Minimize response tokens         | lean-output            |
| Shipping or closing a branch     | ship-branch            |
| Clarify requirements before acting | grill-me             |
| Summarize session for new chat   | context-handoff        |
| Auth, JWT, OAuth, password hashing | authentication       |
| Dockerfiles or containerization  | docker                 |
| GraphQL schemas or resolvers     | graphql                |
| Documenting a design system      | design-system-spec     |
| React code quality review        | react-best-practices   |
| Astro site quality review        | astro-best-practices   |
| CSS architecture review          | css-best-practices     |
| Node.js service quality review   | nodejs-best-practices  |

## Skills Reference

50+ skills organized by category (exact count shown as nearest lower multiple of 50: 50+, 100+, 150+, etc.):

- **Frameworks:** React, Next.js, Astro, Express, Nest, Hono, React Native, Expo
- **Best Practices:** React Best Practices, Astro Best Practices, CSS Best Practices, Node.js Best Practices
- **Testing:** Jest, Playwright, React Testing Library, React Native Testing Library, E2E Testing, Unit Testing, Testing Strategy
- **Standards:** TypeScript, JavaScript, HTML, CSS, TailwindCSS, A11y
- **Backend & Infrastructure:** Node.js, Express, Nest, Hono, Bun, Backend Development, Authentication, Docker, GraphQL
- **Web:** Web Performance, Web SEO, Design System Spec
- **Build Tools:** Vite, Webpack
- **Libraries:** MUI, AG Grid, Redux Toolkit, Stagehand
- **Quality & Architecture:** Code Conventions, Code Quality, Form Validation, Critical Partner, Code Refactoring
- **Architecture Patterns:** Architecture Patterns, SOLID, Clean Architecture, Domain-Driven Design, Hexagonal Architecture, Result Pattern, DRY Principle, Mediator Pattern, Sidecar Pattern, Composition Pattern, Circuit Breaker Pattern, State Machines Pattern, Screaming Architecture
- **Documentation:** Tech Docs
- **Behavioral:** English Writing, Technical Communication, Humanizer, Frontend Development, Brainstorming, Systematic Debugging, Interface Design, Writing Plans, Code Review, Receiving Code Review, Verification Protocol, Plan Execution, Subagent Orchestration, Sharp Execution, Lean Output, Ship Branch, Grill Me, Context Handoff
- **Meta:** Skill Creation, Agent Creation, Reference Creation, Prompt Creation, Skill Sync

## Project Structure

```
ai-agents-skills/
├── skills/                # 50+ skill definitions (SKILL.md format) - SOURCE OF TRUTH
│   ├── react/
│   │   ├── SKILL.md
│   │   └── references/    # Progressive disclosure for complex skills
│   ├── typescript/
│   │   └── SKILL.md
│   └── ...
├── .agents/skills/        # Canonical symlinks → skills/ (universal: 8 agents read here natively)
│   ├── react/            → ../../skills/react/
│   ├── typescript/       → ../../skills/typescript/
│   └── ...
├── .claude/skills/        # Claude Code symlinks → .agents/skills/
│   ├── react/            → ../../.agents/skills/react/
│   └── typescript/       → ../../.agents/skills/typescript/
├── .agent/skills/         # Antigravity symlinks → .agents/skills/
├── presets/               # Project Starter Preset (AGENTS.md + skills bundle)
├── src/                   # TypeScript CLI source
│   ├── commands/          # CLI commands (local, add, remove, sync, validate, list)
│   ├── core/              # Dependency resolver, installer, skill parser
│   └── utils/             # Logger, YAML parser, instruction generator
├── templates/             # Model instruction templates
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
3. **Model-specific layer:** `.claude/skills/` and `.agent/skills/` → `.agents/skills/` (dedicated model symlinks)

**How to access skills:**

- **Preferred:** Read directly from `skills/<skill-name>/SKILL.md` (bypasses symlinks — always works)
- **Alternative:** Use your agent's path from Step 2 if your IDE resolves symlinks automatically
- **If symlinks fail:** All real skill files are in `skills/` directory

### Skills Storage Architecture

**Why 3 layers?**

1. **Layer 1 (skills/):** Single source of truth — edit once, affects all agents
2. **Layer 2 (.agents/skills/):** Canonical shared location — 8 universal agents read here natively
3. **Layer 3 (.claude/skills/, .agent/skills/):** Dedicated model symlinks for Claude Code and Antigravity

**Benefits:**

- **Zero duplication:** Skills stored once, available to all 11 agents
- **Always up-to-date:** Changes propagate instantly (symlinks reference same files)
- **Token-efficient:** Models read only the skills they need

**Example flow:**

```
User edits: skills/react/SKILL.md
      ↓
Symlink: .agents/skills/react/ → skills/react/
      ↓
Universal agents (Amp, Cline, Codex, Cursor, Gemini, Copilot, Kimi, OpenCode)
      read: .agents/skills/react/ directly
      ↓
Dedicated agents get additional symlinks:
  .claude/skills/react/ → .agents/skills/react/   (Claude Code)
  .agent/skills/react/  → .agents/skills/react/   (Antigravity)
      ↓
OpenClaw reads: skills/react/ directly (project root, no symlink needed)
      ↓
All 11 agents see updated react skill instantly
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
- **Two-tier model architecture:**
  - **Dedicated models** — require their own skills directory:
    - Claude Code (`.claude/skills/`), Antigravity (`.agent/skills/`), OpenClaw (`skills/`)
  - **Universal models** — read `.agents/skills/` natively, no extra directory needed:
    - Amp, Cline, Codex, Cursor, Gemini CLI, GitHub Copilot, Kimi, OpenCode
- **Symlink architecture:** 3-layer structure for zero duplication:
  - **Layer 1:** `skills/` (source of truth — real files; also OpenClaw's native path)
  - **Layer 2:** `.agents/skills/` → `skills/` (canonical shared symlinks — universal coverage)
  - **Layer 3:** `.claude/skills/` and `.agent/skills/` → `.agents/skills/` (dedicated model symlinks)
  - **Individual skill symlinks:** Each skill gets its own symlink (NOT directory-level)
  - **Instant propagation:** Changes to source files visible to all agents immediately
- **Auto-generated instructions:** Each model gets an instruction file listing all installed skills with their metadata
- **Dependency-safe removal:** `remove` command validates dependencies before removing skills
- **11 agents supported:** 3 dedicated (Claude Code, Antigravity, OpenClaw) + 8 universal (Amp, Cline, Codex, Cursor, Gemini CLI, GitHub Copilot, Kimi, OpenCode)

## Git & Release Workflow

### Branching

- **`main`** — production, always stable, tagged releases only
- **`development`** — integration branch, all feature work merges here first
- Feature branches off `development`, never off `main`

### Commit Strategy

- **Use skill:** `technical-communication` for all commit messages
- **Format:** single line, imperative, no co-author
- **Examples:**
  - `fix: show interactive selector when all AGENTS.md skills installed`
  - `feat: add PostHog analytics for web and CLI`
  - `chore: update OG image to match logo`
- **Group by feature:** separate commits per logical change, never batch unrelated changes

### Merge to Main (Squash)

Merges from `development` → `main` use **squash merge**. The squash commit message format encodes the release type and triggers the auto-release pipeline:

```
release(patch|minor|major): {brief summary of what's in the squash}
```

Examples:
- `release(patch): telemetry + PostHog analytics + CI release pipeline`
- `release(minor): preset system overhaul + new skills`

### Versioning & Release

Versions follow **semver**: `MAJOR.MINOR.PATCH`

| Change type | Squash merge prefix | Example |
|---|---|---|
| Bug fix, small improvement | `release(patch): ...` | 1.6.0 → 1.6.1 |
| New feature, backwards-compatible | `release(minor): ...` | 1.6.0 → 1.7.0 |
| Breaking change | `release(major): ...` | 1.6.0 → 2.0.0 |

**Release flow:**
1. Work on `development`, commit with single-line messages
2. Squash merge to `main` with a `release(patch|minor|major): {summary}` message
3. `auto-release.yml` detects the prefix on push to `main`, runs `npm version <type>`, and pushes the version commit + tag — no manual command needed
4. `auto-release.yml` bumps the version, builds, publishes to npm, updates the README badge, and syncs back to `development` — all in one pipeline

**Tags always go on `main`**, never on `development`.

## References

- [AGENTS.md Spec](https://agents.md/)
- [Agent Skills](https://agentskills.io/)

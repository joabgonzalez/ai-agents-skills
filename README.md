<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-wordmark-dark.svg">
  <img src="assets/logo-wordmark.svg" alt="Agents Skills" width="200">
</picture>

**v1.6.1** - A modular CLI for distributing reusable AI agent skills across multiple coding assistants.

Install 68 curated skills for React, TypeScript, testing, architecture, and more — to 11 AI agents across two tiers. Features project presets, interactive setup, dependency resolution, version tracking, and seamless multi-model sync.

Browse the full skill catalog at **[joabgonzalez.github.io/ai-agents-skills](https://joabgonzalez.github.io/ai-agents-skills/)**

## Quick Start

```bash
# Interactive mode (recommended)
npx ai-agents-skills add

# Install a preset
npx ai-agents-skills add --preset astro-template

# Install specific skills
npx ai-agents-skills add --skill react --skill typescript
```

## Supported Models

11 agents across two tiers. Install once — all agents stay in sync automatically.

**Universal** — read from `.agents/skills/` natively, no extra setup:

Amp · Cline · Codex · Cursor · Gemini CLI · GitHub Copilot · Kimi Code CLI · OpenCode

**Dedicated** — also get a symlink in their own directory:

| Model       | Directory        | `--model` ID  |
| ----------- | ---------------- | ------------- |
| Claude Code | `.claude/skills/`| `claude`      |
| Antigravity | `.agent/skills/` | `antigravity` |
| OpenClaw    | `skills/`        | `openclaw`    |

## Commands

### `add` — Install skills

```bash
# Interactive (prompts for skills, models, and presets)
npx ai-agents-skills add

# Install a preset
npx ai-agents-skills add --preset astro-template

# Target specific models
npx ai-agents-skills add --model claude --model copilot

# Install specific skills
npx ai-agents-skills add --skill react --skill typescript

# Preview without changes — shows exact paths that would be created
npx ai-agents-skills add --skill react --dry-run
```

**Options:**

| Flag                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `-p, --preset <id>`  | Install a project starter preset                |
| `-s, --skill <name>` | Install a specific skill (repeatable)           |
| `-m, --model <name>` | Target a specific model (repeatable)            |
| `-d, --dry-run`      | Preview changes — shows exact symlink paths     |

### `list` — Show installed skills

```bash
npx ai-agents-skills list
```

### `sync` — Add models or update skills

```bash
# Interactive (prompts for actions: add models and/or update skills)
npx ai-agents-skills sync

# Update ALL installed skills to latest versions (no prompts)
npx ai-agents-skills sync --update

# Update specific skills to latest versions
npx ai-agents-skills sync --skill react --skill typescript

# Add models to existing installation
npx ai-agents-skills sync --model copilot --model cursor

# Preview without changes
npx ai-agents-skills sync --dry-run
```

**Options:**

| Flag                 | Description                                        |
| -------------------- | -------------------------------------------------- |
| `-u, --update`       | Update all installed skills to latest (no prompts) |
| `-s, --skill <name>` | Update a specific skill (repeatable)               |
| `-m, --model <name>` | Add a specific model (repeatable)                  |
| `-d, --dry-run`      | Preview changes without applying                   |

### `remove` — Remove skills with dependency checking

```bash
# Interactive — first choose: select skills or remove all (purge)
npx ai-agents-skills remove

# Remove specific skills (with dependency check)
npx ai-agents-skills remove --skill react --skill typescript

# Remove all skill entries from all models + ask about AGENTS.md
npx ai-agents-skills remove --purge

# Skip confirmation prompt (useful for automation)
npx ai-agents-skills remove --skill react --confirm

# Dry-run: same interactive flow, no changes applied
npx ai-agents-skills remove --skill react --dry-run
```

**Options:**

| Flag                 | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `-s, --skill <name>` | Remove a specific skill (repeatable)                                      |
| `-m, --model <name>` | Target a specific model (repeatable)                                      |
| `-p, --purge`        | Remove all skill entries from all models; asks separately about AGENTS.md |
| `--confirm`          | Skip confirmation prompt (works in both normal and dry-run mode)          |
| `-d, --dry-run`      | Same flow as normal — prompts included — but no changes applied           |

## How It Works

```
npx ai-agents-skills add --skill react
```

1. Clones the skill repository to `~/.cache/ai-agents-skills/`
2. Resolves dependencies: `react` → `javascript`, `typescript`, `code-conventions`
3. Copies skills to `.agents/skills/` — the shared directory all 8 universal agents read natively
4. Creates symlinks in dedicated model directories (`.claude/skills/`, `.agent/skills/`, `skills/`)
5. Updates AGENTS.md with complete "How to Use Skills" workflow (push context)

### Installed Structure

```
your-project/
├── AGENTS.md                 # Push context — complete workflow for ALL models ✨
├── .agents/skills/           # Shared directory — all 8 universal agents read here natively
│   ├── react/
│   ├── typescript/
│   └── code-conventions/
├── .claude/skills/           # Symlinks → .agents/skills/* (Claude Code)
└── .agent/skills/            # Symlinks → .agents/skills/* (Antigravity)
```

## Available Skills (68)

### Frameworks

React, Next.js, Astro, Express, Nest, Hono, React Native, Expo

### Testing

Jest, Playwright, React Testing Library, React Native Testing Library, E2E Testing, Unit Testing, Testing Strategy

### Standards

TypeScript, JavaScript, HTML, CSS, TailwindCSS, A11y

### Web

Web Performance, Web SEO

### Backend

Node.js, Express, Nest, Hono, Bun, Backend Development

### Build Tools

Vite, Webpack

### Libraries

MUI, AG Grid, Redux Toolkit, Stagehand

### Quality & Architecture

Code Conventions, Code Quality, Form Validation, Critical Partner, Code Refactoring

### Architecture Patterns

Architecture Patterns, SOLID, Clean Architecture, Domain-Driven Design, Hexagonal Architecture, Screaming Architecture, Result Pattern, DRY Principle, Mediator Pattern, Sidecar Pattern, Composition Pattern, Circuit Breaker Pattern, State Machines Pattern

### Behavioral

English Writing, Technical Communication, Humanizer, Frontend Development, Brainstorming, Systematic Debugging, Interface Design, Writing Plans, Code Review, Verification Protocol, Plan Execution, Subagent Orchestration, Slides

### Meta (creation tools)

Skill Creation, Agent Creation, Reference Creation, Prompt Creation, Skill Sync

## Creating Skills

Each skill is a directory with a `SKILL.md`:

```
skills/my-skill/
├── SKILL.md          # Required — frontmatter + content
└── references/       # Optional — detailed guides
```

```markdown
---
name: my-skill
description: "Short description. Trigger: When to activate this skill."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - code-conventions
---

# My Skill

## When to Use

...

## Critical Patterns

...

## Decision Tree

...
```

## Telemetry

`ai-agents-skills` collects **anonymous usage data** to help prioritize new skills and improvements. No personally identifiable information is ever collected.

**To opt out:**

```bash
ai-agents-skills telemetry disable  # disable
ai-agents-skills telemetry enable   # re-enable
ai-agents-skills telemetry status   # check current setting
```

**What IS collected:**

- Names of skills installed
- Preset name used (if any)
- Number of target models
- Whether `--dry-run` was used
- CLI version, Node.js version, OS platform

**What is NEVER collected:** file paths, usernames, hostnames, environment variables, or any personally identifiable information.

Telemetry is automatically disabled in CI environments (`CI`, `GITHUB_ACTIONS`, `CONTINUOUS_INTEGRATION`). Data is sent to a private PostHog instance and never shared with third parties.

---

## Troubleshooting

**Stale cache after an update or clone issue:**

```bash
rm -rf ~/.cache/ai-agents-skills
```

This removes the local skill cache. The next `npx ai-agents-skills` run re-downloads it fresh.

## License

Apache 2.0

# ai-agents-skills

**v1.3.0** - A modular CLI for distributing reusable AI agent skills across multiple coding assistants.

Install 52 curated skills for React, TypeScript, testing, architecture, and more — to Claude, GitHub Copilot, Cursor, Gemini, and Codex. Features project presets, interactive setup, dependency resolution, version tracking, and seamless multi-model sync.

**✨ New in v1.3.0**: Follows [Vercel Skills](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) standard with push context in AGENTS.md. No instruction files needed - models auto-discover skills!

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

| Model          | Directory  | ID                            |
| -------------- | ---------- | ----------------------------- |
| GitHub Copilot | `.github/` | `copilot` or `github-copilot` |
| Claude         | `.claude/` | `claude`                      |
| Cursor         | `.cursor/` | `cursor`                      |
| Gemini         | `.gemini/` | `gemini`                      |
| OpenAI Codex   | `.codex/`  | `codex`                       |

## Commands

### `add` — Install skills

```bash
# Interactive (prompts for skills, models, and presets)
npx ai-agents-skills add

# Install a preset with specific models
npx ai-agents-skills add --preset astro-template --models claude,copilot

# Install specific skills
npx ai-agents-skills add --skill react --skill typescript

# Preview without changes
npx ai-agents-skills add --skill react --dry-run
```

**Options:**

| Flag                  | Description                           |
| --------------------- | ------------------------------------- |
| `-p, --preset <id>`   | Install a project starter preset      |
| `-s, --skill <name>`  | Install a specific skill (repeatable) |
| `-m, --models <list>` | Target models, comma-separated        |
| `-d, --dry-run`       | Preview changes without installing    |

**Features:**

- Shows dependency tree before installation (requested skills + dependencies)
- Auto-resolves transitive dependencies
- Prevents circular dependencies
- **Vercel standard** - Updates AGENTS.md with push context

### `list` — Show installed skills

```bash
npx ai-agents-skills list
```

### `sync` — Add models or update skills

```bash
# Interactive (prompts for actions: add models and/or update skills)
npx ai-agents-skills sync

# Add models to existing installation
npx ai-agents-skills sync --add-models copilot,cursor

# Update skills to latest versions
npx ai-agents-skills sync --update-skills

# Preview without changes
npx ai-agents-skills sync --dry-run
```

**Options:**

| Flag                  | Description                      |
| --------------------- | -------------------------------- |
| `--add-models <list>` | Add models, comma-separated      |
| `--update-skills`     | Update skills to latest versions |
| `-d, --dry-run`       | Preview changes without applying |

**Features:**

- **Version tracking** - Compares installed skill versions with remote repository
- **Multi-select support** - Can select both "Add models" AND "Update skills" in one command
- Shows currently installed models before selection
- Checks for updates BEFORE showing options (improved UX)
- Only shows "Update skills" option if updates are available
- Executes in optimal order: updates first, then adds models
- **Vercel standard** - Updates AGENTS.md with push context (no instruction files)
- Stateless - no registry files needed

### `remove` — Remove skills with dependency checking

```bash
# Interactive removal
npx ai-agents-skills remove

# Remove specific skills
npx ai-agents-skills remove --skills react,typescript

# Remove all skills (confirmation required)
npx ai-agents-skills remove --all

# Skip confirmation
npx ai-agents-skills remove --skills react --confirm
```

**Options:**

| Flag                  | Description                       |
| --------------------- | --------------------------------- |
| `-s, --skills <list>` | Skills to remove, comma-separated |
| `-m, --models <list>` | Target models, comma-separated    |
| `-a, --all`           | Remove all skills                 |
| `--confirm`           | Skip confirmation prompt          |
| `-d, --dry-run`       | Preview without making changes    |

## How It Works

```
npx ai-agents-skills add --skill react
```

1. Clones the skill repository to `~/.cache/ai-agents-skills/`
2. Resolves dependencies: `react` → `javascript`, `typescript`, `conventions`
3. Copies skills to `.agents/skills/` in your project
4. Creates symlinks in each model directory (`.claude/skills/`, `.github/skills/`, etc.)
5. Updates AGENTS.md with complete "How to Use Skills" workflow (push context)

### Installed Structure

```
your-project/
├── AGENTS.md                 # Push context - complete workflow for ALL models ✨
├── .agents/skills/           # Canonical copy (symlinks to framework)
│   ├── react/
│   ├── typescript/
│   └── conventions/
├── .claude/skills/           # Symlinks → .agents/skills/* (auto-discovered)
├── .cursor/skills/           # Symlinks → .agents/skills/* (auto-discovered)
├── .github/skills/           # Symlinks → .agents/skills/* (auto-discovered)
├── .gemini/skills/           # Symlinks → .agents/skills/* (auto-discovered)
└── .codex/skills/            # Symlinks → .agents/skills/* (auto-discovered)
```

## Available Skills (52)

### Frameworks

React, Next.js, Astro, Express, Nest, Hono, React Native, Expo

### Testing

Jest, Playwright, React Testing Library, React Native Testing Library, E2E Testing, Unit Testing

### Standards

TypeScript, JavaScript, HTML, CSS, TailwindCSS, A11y

### Backend

Node.js, Express, Nest, Hono, Bun, Backend Development

### Build Tools

Vite, Webpack

### Libraries

MUI, AG Grid, Redux Toolkit, Stagehand

### Quality & Architecture

Conventions, Code Quality, Form Validation, Critical Partner, Architecture Patterns, Composition Patterns, English Writing, Technical Communication, Humanizer, Frontend Development

### Behavioral

Brainstorming, Systematic Debugging, Interface Design, Writing Plans, Code Review, Verification Protocol, Plan Execution, Subagent Orchestration

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
    - conventions
---

# My Skill

## When to Use

...

## Critical Patterns

...

## Decision Tree

...
```

## License

Apache 2.0

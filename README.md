# ai-agents-skills

A modular CLI for distributing reusable AI agent skills across multiple coding assistants.

Install 49+ curated skills for React, TypeScript, testing, architecture, and more — to Claude, GitHub Copilot, Cursor, Gemini, and Codex. Features project presets, interactive setup, dependency resolution, version tracking, and seamless multi-model sync.

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
- Generates instruction files for each model

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

| Flag                      | Description                              |
| ------------------------- | ---------------------------------------- |
| `--add-models <list>`     | Add models, comma-separated              |
| `--update-skills`         | Update skills to latest versions         |
| `-d, --dry-run`           | Preview changes without applying         |

**Features:**

- **Version tracking** - Compares installed skill versions with remote repository
- **Multi-select support** - Can select both "Add models" AND "Update skills" in one command
- Shows currently installed models before selection
- Checks for updates BEFORE showing options (improved UX)
- Only shows "Update skills" option if updates are available
- Executes in optimal order: updates first, then adds models
- Auto-generates instruction files for each model
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

**Features:**

- Shows removal preview with requested skills and their dependencies
- Validates dependencies before removal (prevents breaking other skills)
- Shows which dependencies will be kept (used by other skills)
- Auto-removes unused dependencies
- Updates instruction files after removal
- Alias: `uninstall` still works for backwards compatibility

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
4. Creates symlinks in each model directory (`.claude/skills/`, `.github/copilot/skills/`, etc.)
5. Auto-generates instruction files (`instructions.md`, `copilot-instructions.md`) with skill metadata

### Installed structure

```
your-project/
├── .agents/skills/           # Actual skill files (single source)
│   ├── react/
│   ├── typescript/
│   └── conventions/
├── .claude/skills/           # Symlinks → .agents/skills/*
├── .github/copilot/skills/   # Symlinks → .agents/skills/*
└── .cursor/skills/           # Symlinks → .agents/skills/*
```

- Skills stored once, shared via symlinks across all models
- No registry files — stateless architecture
- Clean removal: `rm -rf .agents/`
- Auto-detection of installed models

## Available Skills (49)

### Frameworks

React, Next.js, Astro, Express, Nest, Hono, React Native, Expo

### Testing

Jest, Playwright, React Testing Library, React Native Testing Library, E2E Testing, Unit Testing

### Standards

TypeScript, JavaScript, ESLint, Prettier, HTML, CSS, TailwindCSS, A11y

### Backend

Node.js, Express, Nest, Hono, Bun, Backend Development

### Build Tools

Vite, Webpack

### Libraries

MUI, MUI X Charts, AG Grid, Formik, Yup, Zod, Redux Toolkit, Stagehand

### Quality & Architecture

Conventions, Critical Partner, Architecture Patterns, English Writing, Technical Communication, Process Documentation, Humanizer, Frontend Design, Frontend Development

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

See [skills/skill-creation/SKILL.md](skills/skill-creation/SKILL.md) for the full guide.

## Contributing

1. Fork the repository
2. Create a skill following the [skill-creation](skills/skill-creation/SKILL.md) guide
3. Validate: `npm run build && npm run dev -- validate --all`
4. Submit a pull request

## License

Apache 2.0

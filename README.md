# ai-agents-skills

A CLI for distributing reusable AI agent skills across multiple coding assistants.

Install curated skills for React, TypeScript, testing, architecture, and more — to Claude, GitHub Copilot, Cursor, Gemini, and Codex — with a single command.

## Quick Start

```bash
# Interactive mode (recommended)
npx ai-agents-skills add

# Install a preset
npx ai-agents-skills add --preset project-sbd

# Install specific skills
npx ai-agents-skills add --skill react --skill typescript
```

## Supported Models

| Model | Directory | ID |
|---|---|---|
| GitHub Copilot | `.github/copilot/` | `github-copilot` |
| Claude | `.claude/` | `claude` |
| Cursor | `.cursor/` | `cursor` |
| Gemini | `.gemini/` | `gemini` |
| OpenAI Codex | `.codex/` | `codex` |

## Commands

### `add` — Install skills

```bash
# Interactive (prompts for skills, models, and presets)
npx ai-agents-skills add

# Install from a custom repository
npx ai-agents-skills add user/repo

# Install a preset with specific models
npx ai-agents-skills add --preset project-sbd --models claude,github-copilot

# Preview without changes
npx ai-agents-skills add --skill react --dry-run
```

**Options:**

| Flag | Description |
|---|---|
| `-p, --preset <id>` | Install an agent preset |
| `-s, --skill <name>` | Install a specific skill (repeatable) |
| `-m, --models <list>` | Target models, comma-separated |
| `-d, --dry-run` | Preview changes without installing |

### `list` — Show installed skills

```bash
npx ai-agents-skills list
```

### `sync` — Add models to existing installation

```bash
# Already have skills in Claude, add to Copilot
npx ai-agents-skills sync --add-models github-copilot

# Interactive model selection
npx ai-agents-skills sync
```

### `uninstall` — Remove skills

```bash
npx ai-agents-skills uninstall --all --confirm
npx ai-agents-skills uninstall --skills react,typescript
```

## How It Works

```
npx ai-agents-skills add --skill react
```

1. Clones the skill repository to `~/.cache/ai-agents-skills/`
2. Resolves dependencies: `react` → `javascript`, `typescript`, `conventions`
3. Copies skills to `.agents/skills/` in your project
4. Creates symlinks in each model directory (`.claude/skills/`, `.github/copilot/skills/`, etc.)

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

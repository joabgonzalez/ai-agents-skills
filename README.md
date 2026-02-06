# ai-agents-skills

A modular AI agent and skill distribution framework for managing reusable skills across AI coding assistants.

---

## Overview

**ai-agents-skills** is a CLI framework that enables developers to create, manage, and distribute modular skills across multiple AI coding assistants (Claude, GitHub Copilot, Cursor, Gemini, OpenAI Codex). It provides:

- **49+ curated skills** for frameworks, testing, standards, and best practices
- **Dependency resolution** with automatic cycle detection
- **Multi-model support** with a single installation
- **Agent presets** for common development workflows
- **Stateless architecture** for reliable skill management

---

## Quick Start

### Local Installation (Manage This Repository)

```bash
# Install dependencies
npm install

# Build CLI
npm run build

# Install skills locally
npm run local -- --models claude,copilot

# Or use make
make install
```

### Remote Installation (Install from GitHub)

```bash
# Install agent preset
npx ai-agents-skills add --preset backend-dev

# Install specific skills
npx ai-agents-skills add --skill react --skill typescript

# Interactive mode
npx ai-agents-skills add
```

---

## Features

### ✅ Multi-Model Support

Install skills to **5 AI assistants** simultaneously:

- **Claude** (`.claude/`)
- **GitHub Copilot** (`.github/copilot/`)
- **Cursor** (`.cursor/`)
- **Gemini** (`.gemini/`)
- **OpenAI Codex** (`.codex/`)

### ✅ Dependency Resolution

Automatically resolves and installs skill dependencies:

```bash
npx ai-agents-skills add repo --skill react
# Installs: react, javascript, typescript, conventions (4 total)
```

- Topological sorting ensures correct installation order
- Cycle detection prevents infinite loops
- Transitive dependency handling

### ✅ Agent Presets

Pre-configured skill bundles for common workflows:

```bash
npx ai-agents-skills add --preset backend-dev
# Installs: nodejs, typescript, express, jest, + dependencies
```

### ✅ Stateless Architecture

No registry files to maintain:

- Skills stored in `.agents/skills/`
- Detects installed models automatically
- Symlink-based (always up-to-date)
- Clean `rm -rf .agents/` to reset

### ✅ Token-Optimized Templates

Model instruction files are optimized for minimal token usage:

- 73% smaller than verbose alternatives
- Dynamic skill counts
- Grouped categorization
- No redundant metadata

---

## Commands

### `local` - Manage Local Installation

For managing skills within this repository:

```bash
# Interactive model selection
npm run local

# Specific models
npm run local -- --models claude,copilot

# Specific skills only
npm run local -- --skills react,typescript --no-meta

# Dry run
npm run local -- --dry-run
```

### `add` - Install from Remote Repository

Install skills from any GitHub repository:

```bash
# Install agent preset
npx ai-agents-skills add --preset backend-dev

# Install specific skill
npx ai-agents-skills add --skill react --models claude

# Interactive mode
npx ai-agents-skills add
```

**Options:**

- `-p, --preset <preset>` - Install agent preset by ID
- `-s, --skill <skill>` - Install specific skill
- `-m, --models <models>` - Target models (comma-separated)
- `-d, --dry-run` - Preview changes without installing

### `list` - Show Installed Skills

```bash
npx ai-agents-skills list

# Output:
# 📦 Installed Skills (15 total)
#   ✓ react
#   ✓ typescript
#   ...
# 🤖 Models (2 total)
#   ✓ Claude
#   ✓ GitHub Copilot
```

### `sync` - Add Models to Existing Installation

Add new models without reinstalling skills:

```bash
# Already have skills in Claude, add to Copilot
npx ai-agents-skills sync --add-models copilot

# Interactive mode
npx ai-agents-skills sync
```

### `validate` - Validate Skills

```bash
# Validate all skills
npm run validate

# Validate specific skill
npm run validate -- --skill react

# Validate installed skills
npm run validate -- --installed
```

### `uninstall` - Remove Skills

```bash
# Remove all skills
make uninstall

# Remove specific skills
npx ai-agents-skills uninstall --skills react,typescript

# Remove from all models
npx ai-agents-skills uninstall --all --confirm
```

---

## Project Structure

```
ai-agents-skills/
├── skills/              # 49 skill definitions (SKILL.md format)
├── presets/             # Agent presets (pre-configured skill bundles)
├── src/                 # TypeScript CLI source
│   ├── commands/        # CLI commands (local, add, sync, list)
│   ├── core/            # Core logic (resolver, installer, detector)
│   └── utils/           # Utilities (logger, fs, yaml)
├── templates/           # Model instruction templates
├── package.json         # NPM package configuration
└── tsconfig.json        # TypeScript configuration
```

---

## Skill Categories

**49 skills** organized by domain:

### Frameworks

React, Next.js, Astro, Express, Nest, Hono, React Native, Expo

### Testing

Jest, Playwright, React Testing Library, E2E Testing, Unit Testing

### Standards

TypeScript, JavaScript, ESLint, Prettier, HTML, CSS, TailwindCSS, A11y

### Backend

Node.js, Express, Nest, Hono, Backend Development

### Build Tools

Vite, Webpack, Bun

### Libraries

MUI, AG Grid, Formik, Yup, Zod, Redux Toolkit

### Meta Skills

Critical Partner, Architecture Patterns, Technical Communication, Process Documentation

### Specialized

Skill Creation, Agent Creation, Skill Sync, Stagehand

---

## Creating Skills

### Skill Structure

Each skill is a directory with a `SKILL.md` file:

```
skills/
└── react/
    ├── SKILL.md           # Skill definition (required)
    └── references/        # Optional detailed guides
        ├── hooks.md
        └── patterns.md
```

### SKILL.md Format

```markdown
---
name: react
description: "React best practices and patterns"
version: "1.0"
dependencies:
  - javascript
  - typescript
---

# React Skill

## When to Use

- Building React components
- Managing state and effects

## Critical Patterns

- Use functional components
- Prefer hooks over classes

## Decision Tree

**New component?** → Use function component + hooks
**State management?** → useState for local, Context for global
```

See [skills/skill-creation/SKILL.md](skills/skill-creation/SKILL.md) for complete guide.

---

## Creating Agent Presets

Agent presets are pre-configured skill bundles in `presets/`:

```
presets/
└── backend-dev/
    └── AGENTS.md
```

### AGENTS.md Format

```markdown
---
name: backend-dev
description: "Backend development with Node.js"
skills:
  - nodejs
  - typescript
  - express
  - jest
---

# Backend Development Agent

Specialized for Node.js backend development...
```

See [skills/agent-creation/SKILL.md](skills/agent-creation/SKILL.md) for complete guide.

---

## Architecture

### Installation Flow

```
1. User runs: npx ai-agents-skills add repo --skill react
2. Repository Manager clones repo to ~/.cache/ai-agents-skills/repos/
3. Dependency Resolver builds graph (react → javascript, typescript, conventions)
4. Skills copied to .agents/skills/
5. Symlinks created in model directories (.claude/skills/, .github/copilot/skills/)
```

### Directory Structure (Installed Project)

```
project/
├── .agents/
│   └── skills/              # Installed skills (real files)
│       ├── react/
│       ├── typescript/
│       └── ...
├── .claude/
│   └── skills/              # Symlinks to .agents/skills/
│       ├── react -> ../../.agents/skills/react
│       └── typescript -> ../../.agents/skills/typescript
└── .github/copilot/
    └── skills/              # Symlinks to .agents/skills/
        └── react -> ../../../.agents/skills/react
```

### Benefits

- **Single source**: Skills stored once in `.agents/skills/`
- **Multi-model**: All models share the same skills via symlinks
- **Stateless**: No registry to maintain
- **Clean**: `rm -rf .agents/` removes everything

---

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Validate Skills

```bash
npm run validate
```

### Clean

```bash
make clean  # Remove all generated directories
```

---

## Contributing

1. Fork the repository
2. Create skill following [skill-creation](skills/skill-creation/SKILL.md) guide
3. Validate: `npm run validate`
4. Test locally: `npm run local`
5. Submit pull request

---

## License

Apache 2.0

---

## Links

- [AGENTS.md Spec](https://agents.md/)
- [Agent Skills Community](https://agentskills.io/)

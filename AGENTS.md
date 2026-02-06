---
name: ai-agents-skills
description: CLI framework for managing and distributing AI agent skills across multiple models (Copilot, Claude, Gemini, Codex, Cursor). With local-first architecture and planned npx distribution.
version: "1.0"
skills:
  - skill-creation
  - agent-creation
  - critical-partner
  - process-documentation
  - conventions
  - typescript
  - nodejs
---

# AI Agents Skills Framework

## Purpose

This framework provides a standardized system for creating, managing, and distributing AI agent skills across multiple AI models. Currently in Phase 1 (local mode), it enables skill reuse through symlink-based installation with dependency resolution, intelligent skip logic, and token-efficient model instructions.

**Primary responsibilities:**

- Maintain 49+ skills across frameworks, testing, backend, and standards
- Provide TypeScript CLI for local skill management (`ai-agents-skills local`)
- Enable dependency resolution with cycle detection
- Support 5 AI models: GitHub Copilot, Claude, Gemini, Codex, Cursor
- Future: npx-based distribution system (Phase 2) and Astro documentation site (Phase 3)

## ⚠️ Mandatory Skill Reading

**CRITICAL**: Before performing ANY task, you MUST read the relevant skill files from `.claude/skills/` to understand requirements, patterns, and constraints. Do NOT rely on general knowledge alone.

### Skill Reading Protocol

1. **Identify task type** - Determine which skill(s) apply to your current task
2. **Consult Mandatory Skills table below** - Check triggers to find required skills
3. **Read SKILL.md first** - Always start with the skill's main documentation
4. **Check for references/** - If skill has `references/` directory, read relevant files
5. **Apply learned patterns** - Follow skill instructions strictly

**WARNING**: Proceeding without reading skills leads to:

- Non-compliant code patterns
- Missed critical requirements
- Inconsistent architecture decisions
- Violations of project conventions

### Notification Policy

When a task requires 2+ skills, notify the user which skills you're consulting before proceeding.

### Extended Mandatory Read Protocol

For skills with 40+ patterns or complex decision trees, consult the skill's **Decision Tree** and **Quick Reference Table** sections to determine if reading `references/` is required. These sections indicate:

- When to read reference files ([CRITICAL], MUST, SHOULD, MAY, RARELY)
- Which reference files are essential vs. optional
- Project-specific requirements

## Mandatory Skills

| Trigger (When to Read)                       | Required Skill          | Path                                              |
| -------------------------------------------- | ----------------------- | ------------------------------------------------- |
| Create or modify skills                      | skill-creation          | `.claude/skills/skill-creation/SKILL.md`          |
| Create or modify agent definitions           | agent-creation          | `.claude/skills/agent-creation/SKILL.md`          |
| Write commit messages, PRs, or documentation | technical-communication | `.claude/skills/technical-communication/SKILL.md` |
| Code review or suggest improvements          | critical-partner        | `.claude/skills/critical-partner/SKILL.md`        |
| Document changes or processes                | process-documentation   | `.claude/skills/process-documentation/SKILL.md`   |
| Define coding standards                      | conventions             | `.claude/skills/conventions/SKILL.md`             |
| Work with TypeScript code                    | typescript              | `.claude/skills/typescript/SKILL.md`              |
| Work with Node.js or CLI development         | nodejs                  | `.claude/skills/nodejs/SKILL.md`                  |

## Skills Reference

49 skills organized by category:

### Framework Skills

React, Next.js, Vue, Angular, Astro, Express, Nest, Hono, React Native, Expo

### Testing Skills

Jest, Playwright, React Testing Library, React Native Testing Library, E2E Testing, Unit Testing

### Standards Skills

TypeScript, JavaScript, ESLint, Prettier, HTML, CSS, TailwindCSS, A11y, Conventions

### Backend Skills

Node.js, Express, Nest, Hono, Backend Development

### Build Tools

Vite, Webpack, Bun

### Libraries

MUI, MUI X Charts, AG Grid, Formik, Yup, Zod, Redux Toolkit

### Meta Skills

Critical Partner, Architecture Patterns, Process Documentation, Technical Communication, English Writing, Humanizer

### Specialized

Skill Creation, Agent Creation, Reference Creation, Prompt Creation, Skill Sync, Stagehand

**Complete list**: See `.claude/skills/` directory or future documentation site.

## Project Structure

```
ai-agents-skills/
├── skills/               # 49 skill definitions (SKILL.md format)
├── presets/             # Agent presets (e.g., backend-dev, frontend-dev)
├── src/                 # TypeScript CLI source
│   ├── commands/        # CLI commands (local, validate, sync)
│   ├── core/            # Dependency resolver, installer, registry
│   └── utils/           # Logger, YAML parser, file system
├── templates/           # Model instruction templates (5 models)
├── scripts/             # Setup, install, sync scripts
├── registry.yml         # Skill installation registry
└── AGENTS.md           # This file
```

## Workflows

### Skill Creation

1. Read `skills/skill-creation/SKILL.md` for structure requirements
2. Create skill directory under `skills/`
3. Write `SKILL.md` with frontmatter and sections
4. Add references if needed
5. Validate with `npm run validate`
6. Test locally with `ai-agents-skills local`

### Agent Creation

1. Read `skills/agent-creation/SKILL.md` for standards
2. Gather context (9 required questions)
3. Create agent directory under `presets/`
4. Write `AGENTS.md` with frontmatter
5. Include Mandatory Skill Reading section
6. Add to registry

### Local Installation

1. Run `ai-agents-skills local --models <model-names>`
2. CLI resolves dependencies and installs skills as symlinks
3. Generates model-specific instructions in `.claude/`, `.copilot/`, etc.
4. Updates `registry.yml` with installation metadata
5. Intelligently skips already-installed symlinks (always up-to-date)

### Skill Sync

1. Modify skills or add new ones
2. Run `make sync` or `ai-agents-skills sync`
3. Updates all installed model directories
4. Regenerates instruction files with current skill count

## Policies

### Token Efficiency

- All instruction templates optimized for minimal token usage (73% reduction achieved)
- Dynamic skill counts (`{{SKILL_COUNT}}` placeholder)
- Skills grouped by category, not listed individually
- No timestamps or verbose metadata

### Dependency Management

- Skills declare dependencies in frontmatter
- Installer auto-resolves and installs dependencies
- Cycle detection prevents infinite loops
- Topological sort ensures correct installation order

### Skip Logic (Local Mode)

- If skill already installed as symlink → skip (always up-to-date)
- Track statistics: installed vs. skipped
- Display clear UI: "Installed (X)" for existing, "Installing (Y)" for new

### Model Support

- GitHub Copilot (`.github/copilot-instructions.md`)
- Claude (`.claude/instructions.md`)
- Gemini (`.gemini/instructions.md`)
- Codex (`.codex/instructions.md`)
- Cursor (`.cursor/instructions.md`)

### Multi-Phase Roadmap

- **Phase 1 (COMPLETE)**: Local mode - manage skills in this repo
- **Phase 2 (PLANNED)**: npx distribution - `npx ai-agents-skills add <repo>`
  - Remote repository fetching
  - Project auto-detection
  - Interactive UI with @clack/prompts
  - Install agents/skills from any GitHub repo
- **Phase 3 (FUTURE)**: Astro documentation site
  - Searchable skill catalog
  - Agent browsing
  - Installation guides
  - Live examples

**Note**: Astro documentation will provide comprehensive skill discovery and installation guides. See roadmap in README.md for implementation timeline.

## Development

### Commands

```bash
# Local management (current repo)
npm run local -- --models copilot,claude

# Validate all skills
npm run validate

# Sync skills to installed models
npm run sync

# Build CLI
npm run build

# Clean generated directories
make clean
```

### Adding New Skills

1. Follow `skills/skill-creation/SKILL.md` structure
2. Include proper frontmatter (name, description, version, dependencies)
3. Add Decision Tree and Self-Check Protocol
4. Test with validation
5. Update this AGENTS.md if skill is meta/foundational

### Registry Format (v2.0)

```yaml
schema_version: "2.0"
installations:
  main:
    installed_at: "2026-02-05T20:00:00.000Z"
    models:
      - copilot
      - claude
    skills:
      - name: react
        version: "1.0"
        path: skills/react
```

## References

- [AGENTS.md Spec](https://agents.md/) - Agent definition standards
- [Agent Skills](https://agentskills.io/) - Community skill repository
- Future documentation: Astro site (Phase 3)

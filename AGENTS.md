---
name: ai-agents-skills
description: CLI framework for managing and distributing AI agent skills across multiple models (Copilot, Claude, Gemini, Codex, Cursor).
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

CLI for creating, managing, and distributing AI agent skills across 5 AI models. Local-first architecture with symlink-based installation, dependency resolution, and token-efficient model instructions.

## Mandatory Skills

Before performing any task, read the relevant skill from `.claude/skills/` (or your model's skills directory).

| Trigger | Skill | Path |
|---------|-------|------|
| Create or modify skills | skill-creation | skills/skill-creation/SKILL.md |
| Create agent definitions | agent-creation | skills/agent-creation/SKILL.md |
| Code review or improvements | critical-partner | skills/critical-partner/SKILL.md |
| Document changes | process-documentation | skills/process-documentation/SKILL.md |
| Coding standards | conventions | skills/conventions/SKILL.md |
| TypeScript code | typescript | skills/typescript/SKILL.md |
| Node.js / CLI development | nodejs | skills/nodejs/SKILL.md |

## Skills Reference

49 skills organized by category:

- **Frameworks:** React, Next.js, Astro, Express, Nest, Hono, React Native, Expo
- **Testing:** Jest, Playwright, React Testing Library, E2E Testing, Unit Testing
- **Standards:** TypeScript, JavaScript, ESLint, Prettier, HTML, CSS, TailwindCSS, A11y, Conventions
- **Backend:** Node.js, Express, Nest, Hono, Bun
- **Build Tools:** Vite, Webpack, Bun
- **Libraries:** MUI, MUI X Charts, AG Grid, Formik, Yup, Zod, Redux Toolkit
- **Meta:** Critical Partner, Architecture Patterns, Process Documentation, English Writing, Humanizer
- **Specialized:** Skill Creation, Agent Creation, Reference Creation, Prompt Creation, Skill Sync, Stagehand

## Project Structure

```
ai-agents-skills/
├── skills/             # 49 skill definitions (SKILL.md format)
├── presets/            # Agent presets (project-sbd, project-usn)
├── src/                # TypeScript CLI source
│   ├── commands/       # CLI commands (local, add, validate, list)
│   ├── core/           # Dependency resolver, installer, skill parser
│   └── utils/          # Logger, YAML parser, file system
├── templates/          # Model instruction templates (5 models)
└── AGENTS.md          # This file
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

- **Token efficiency:** Instruction templates optimized for minimal token usage
- **Dependency resolution:** Auto-resolve with cycle detection and topological sort
- **Symlink architecture:** `skills/` → `.agents/skills/` → `.{model}/skills/` (always up-to-date)
- **5 models supported:** GitHub Copilot, Claude, Gemini, Codex, Cursor

## References

- [AGENTS.md Spec](https://agents.md/)
- [Agent Skills](https://agentskills.io/)

# AI Agents Framework

A modular framework for building, managing, and deploying intelligent agents, reusable skills, and context prompts for AI assistants. Focused on maintainability, scalability, and standards compliance.

## Objective

Enable the construction and orchestration of AI agents through:

- **Skills**: Modular guides for technologies, frameworks, and best practices (e.g., TypeScript, React, Next, Node.js, Testing, Humanizer, etc.)
- **Agents**: Combinations of skills with project-defined responsibilities and workflows
- **Prompts**: Configuration files (markdown/JSON) that define technology stack or behavioral context

## Project Structure

```
ai-agents-framework/
├── skills/                    # Reusable skill definitions
│   ├── {skill-name}/
│   │   ├── SKILL.md           # Main skill documentation (80% of cases)
│   │   ├── assets/            # Templates, schemas, configs
│   │   │   ├── SKILL-TEMPLATE.md
│   │   │   └── frontmatter-schema.json
│   │   └── references/        # Deep-dive guides for complex skills (40+ patterns)
│   │       ├── README.md      # Navigation and reading strategy
│   │       └── {topic}.md     # Detailed pattern guides
│   └── ...
├── agents/                    # Agent definitions
│   ├── {project-name}/
│   │   └── AGENTS.md          # Agent configuration
│   └── ...
├── prompts/                   # Context prompts
│   ├── {behavior}.md
│   └── {project}.md
└── scripts/                   # Installation utilities
    ├── setup.sh               # Interactive wizard
    ├── install.sh             # Core installation
    ├── sync.sh                # Multi-model sync
    └── uninstall.sh           # Removal wizard
```

### Core Skills (always included)

- **skill-creation**: Create skills with validation and templates
- **agent-creation**: Create agents with mandatory context
- **prompt-creation**: Create context prompts
- **process-documentation**: Document changes and processes
- **critical-partner**: Rigorous review of code and skills
- **conventions**: General coding standards
- **a11y**: Universal accessibility
- **skill-sync**: Multi-model synchronization

### Extended Mandatory Read Protocol

Complex skills (40+ patterns) use a **two-tier architecture**:

1. **SKILL.md**: Critical patterns and decision tree (handles 80% of cases)
2. **references/**: Deep-dive guides with 40+ patterns per topic (for complex scenarios)

**When to read references:**

- SKILL.md Decision Tree indicates "**MUST read** {reference}"
- Critical Pattern says "**[CRITICAL] See** {reference} for..."
- Task involves advanced features (e.g., Redux normalization, MUI theming, React Native navigation)

**Skills with references/**:

- **redux-toolkit**: 6 references (slices, async, selectors, normalization, TypeScript, RTK Query)
- **mui**: 5 references (components, theming, customization, data-display, forms)
- **react-native**: 5 references (navigation, gestures, platform-specific, performance, native-modules)
- **astro**: 4 references (view-transitions, middleware, env-variables, prefetch)
- **skill-creation**: 7 references (structure, content patterns, frontmatter, validation, token efficiency)

See [AGENTS.md Extended Mandatory Read Protocol](AGENTS.md#extended-mandatory-read-protocol) for complete guidance.

## Featured Skills

| Skill                        | Brief Description                                        |
| ---------------------------- | -------------------------------------------------------- |
| conventions                  | General coding standards                                 |
| a11y                         | Universal accessibility                                  |
| architecture-patterns        | SOLID, Clean, DDD, Hexagonal for backend/frontend        |
| frontend-design              | UI/UX patterns, layout, color, typography, accessibility |
| frontend-dev                 | Frontend workflow, components, testing                   |
| backend-dev                  | Backend workflow, API, data modeling, deployment         |
| humanizer                    | Empathy, clarity, and human-centric communication        |
| unit-testing                 | Unit testing for frontend/backend                        |
| e2e-testing                  | End-to-end testing, automation, CI                       |
| next                         | Next.js fullstack, SSR/SSG, routing, middleware          |
| nodejs                       | Node.js backend, async, processes, CLI                   |
| bun                          | Bun runtime, bundling, testing, edge                     |
| express                      | Express.js, routing, middleware, errors                  |
| nest                         | NestJS modular, DI, controllers, providers               |
| hono                         | Hono edge/serverless, routing, middleware                |
| jest                         | JS/TS testing, unit/integration                          |
| react-testing-library        | React user-centric testing                               |
| react-native-testing-library | React Native user-centric testing                        |
| playwright                   | E2E browser automation, selectors, CI                    |
| stagehand                    | Flow automation, data seeding, orchestration             |
| react                        | React UI, hooks, advanced patterns                       |
| mui                          | Material UI for React                                    |
| astro                        | Astro SSG/SSR, modern integration                        |
| javascript                   | Modern JavaScript                                        |
| typescript                   | Strict TypeScript and integration                        |
| css                          | Modern, accessible CSS                                   |
| ag-grid                      | AG Grid integration and usage                            |
| agent-creation               | Create agents with context                               |
| critical-partner             | Rigorous review and improvement of skills/agents         |
| eslint                       | Linting configuration and best practices                 |
| expo                         | Expo for React Native                                    |
| formik                       | Forms and validation with Formik                         |
| html                         | Semantic HTML and best practices                         |
| mui-x-charts                 | Visualization with MUI X Charts                          |
| prettier                     | Code formatting with Prettier                            |
| process-documentation        | Process and change documentation                         |
| prompt-creation              | Create context prompts for AI                            |
| react-native                 | React Native, navigation, performance                    |
| redux-toolkit                | Redux Toolkit and RTK Query                              |
| skill-creation               | Create skills with standards                             |
| skill-sync                   | Multi-model synchronization                              |
| tailwindcss                  | TailwindCSS usage and conventions                        |
| technical-communication      | Technical communication best practices                   |
| translation                  | Translation and localization                             |
| vite                         | Vite build tool                                          |
| webpack                      | Webpack build tool                                       |
| yup                          | Validation with Yup                                      |
| zod                          | Validation with Zod                                      |

## How it works

- The system auto-invokes the appropriate skill based on the detected task (e.g., "Create React component" → react skill).
- All skills, agents, and prompts use templates validated by JSON/YAML schema.
- Complex skills may have assets/ and references/ for advanced patterns.
- Changes to skills are synced to all models with `make sync`.

## Usage Example

- "Create a skill for Playwright" → skill-creation is auto-invoked and structure is generated.
- "Add validation with Zod" → zod skill is auto-invoked.
- "Review this code" → critical-partner is auto-invoked.

## Installation and synchronization

- Run `make` for the interactive setup.
- Use `make sync` to update skills in all models (Copilot, Claude, Codex, Gemini).
- Installation and uninstall scripts are in `scripts/`.

## References and contributing

- [AGENTS.md](AGENTS.md): Central documentation for agents and skills.
- [skills/conventions/SKILL.md](skills/conventions/SKILL.md): Coding standards.
- [skills/skill-creation/SKILL.md](skills/skill-creation/SKILL.md): How to create new skills.
- [skills/agent-creation/SKILL.md](skills/agent-creation/SKILL.md): How to create new agents.

**Notes:**

- Each skill has a unique responsibility and delegates to conventions/a11y when appropriate.
- Scripts ensure dependencies and multi-model configuration.
- Meta-skills are always included for self-management and consistency.
- Prompts use descriptive names and efficient YAML.

# AI Agents Framework

A modular framework for building, managing, and deploying intelligent agents, reusable skills, and context prompts for AI assistants, following strict standards for maintainability, scalability, and compliance.

## Overview

This project provides three core capabilities:

1. **Skills**: Reusable, modular guidelines for technologies, frameworks, and best practices (TypeScript, React, Astro, MUI, etc.)
2. **Agents**: Project-specific combinations of skills with defined responsibilities and workflows
3. **Context Prompts**: Structured configuration files (JSON or markdown) that provide technology stack or behavioral context to AI assistants

### Key Features

- **Template-Based Creation**: Use pre-built templates for consistent skill, agent, and prompt creation
- **Auto-Invoke System**: Automatic skill detection and invocation based on task patterns
- **JSON Schema Validation**: Validate frontmatter structure for skills, agents, and prompts
- **Decision Trees**: AI-friendly condition→action mappings in every skill
- **Trigger-Based Invocation**: Inline trigger clauses help AI know when to invoke skills
- **Token-Efficient**: Optimized documentation to reduce AI context size while maintaining precision
- **Multi-Model Support**: Works with GitHub Copilot, Claude, Codex, and Gemini

## Project Structure

```
ai-agents-framework/
├── skills/                    # Reusable skill definitions
│   ├── {skill-name}/
│   │   ├── SKILL.md           # Main skill documentation
│   │   ├── assets/            # Templates, schemas, configs
│   │   │   ├── SKILL-TEMPLATE.md
│   │   │   └── frontmatter-schema.json
│   │   └── references/        # Links to local documentation
│   │       └── docs.md
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

### Meta-Skills (Always Included)

Core skills for self-management, automatically included in all installations:

- **skill-creation**: Create new skills with templates and validation
- **agent-creation**: Create new agents with context gathering
- **prompt-creation**: Create context prompts
- **process-documentation**: Document features, bugs, refactors, ADRs
- **critical-partner**: Review and improve code/skills
- **conventions**: General coding standards
- **a11y**: Universal accessibility standards
- **skill-sync**: Synchronize changes across model directories

## Skills Table

| Skill Name              | Description                                                            | Path                                    |
| ----------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| conventions             | General coding conventions and best practices                          | skills/conventions/SKILL.md             |
| a11y                    | Universal accessibility standards for all technologies                 | skills/a11y/SKILL.md                    |
| react                   | React-specific UI development guidelines                               | skills/react/SKILL.md                   |
| mui                     | Material UI conventions for React                                      | skills/mui/SKILL.md                     |
| astro                   | Astro framework best practices                                         | skills/astro/SKILL.md                   |
| javascript              | Modern JavaScript conventions                                          | skills/javascript/SKILL.md              |
| typescript              | TypeScript conventions and integration                                 | skills/typescript/SKILL.md              |
| css                     | Modern, maintainable, and accessible CSS                               | skills/css/SKILL.md                     |
| ag-grid                 | AG Grid integration and usage                                          | skills/ag-grid/SKILL.md                 |
| agent-creation          | Step-by-step guide for creating standards-compliant agents             | skills/agent-creation/SKILL.md          |
| critical-partner        | Rigorous review and improvement of code, skills, and agent definitions | skills/critical-partner/SKILL.md        |
| eslint                  | ESLint configuration and linting best practices                        | skills/eslint/SKILL.md                  |
| expo                    | Expo framework usage for React Native                                  | skills/expo/SKILL.md                    |
| formik                  | Formik forms and validation                                            | skills/formik/SKILL.md                  |
| html                    | HTML-specific conventions and best practices                           | skills/html/SKILL.md                    |
| mui-x-charts            | MUI X Charts integration and usage                                     | skills/mui-x-charts/SKILL.md            |
| prettier                | Prettier formatting conventions                                        | skills/prettier/SKILL.md                |
| process-documentation   | Comprehensive documentation of processes and changes                   | skills/process-documentation/SKILL.md   |
| prompt-creation         | Step-by-step guide for creating context prompts for AI assistants      | skills/prompt-creation/SKILL.md         |
| react-native            | React Native conventions and best practices                            | skills/react-native/SKILL.md            |
| redux-toolkit           | Redux Toolkit usage and conventions                                    | skills/redux-toolkit/SKILL.md           |
| rtk-query               | RTK Query usage and conventions                                        | skills/rtk-query/SKILL.md               |
| skill-creation          | Step-by-step guide for creating standards-compliant skills             | skills/skill-creation/SKILL.md          |
| skill-sync              | Synchronization guide for multi-model directory maintenance            | skills/skill-sync/SKILL.md              |
| tailwindcss             | TailwindCSS usage and conventions                                      | skills/tailwindcss/SKILL.md             |
| technical-communication | Technical communication best practices                                 | skills/technical-communication/SKILL.md |
| translation             | Translation and localization best practices                            | skills/translation/SKILL.md             |
| vite                    | Vite build tool usage and conventions                                  | skills/vite/SKILL.md                    |
| webpack                 | Webpack build tool usage and conventions                               | skills/webpack/SKILL.md                 |
| yup                     | Yup validation usage and conventions                                   | skills/yup/SKILL.md                     |
| zod                     | Zod validation usage and conventions                                   | skills/zod/SKILL.md                     |

## How It Works

### Auto-Invoke System

The framework includes an Auto-Invoke table in [AGENTS.md](AGENTS.md) that maps common development tasks to the appropriate skills. When an AI assistant detects you're performing a task (e.g., "Create a React component"), it automatically invokes the corresponding skill (e.g., `react`).

Example mappings:

- Creating React components → `react` skill
- Writing TypeScript types → `typescript` skill
- After modifying skills → `skill-sync` skill
- Code quality review → `critical-partner` skill

This eliminates the need to manually specify which skill to use for each task.

### Template-Based Creation

Creating new skills, agents, or prompts is simplified with templates:

```bash
# Copy template
cp skills/skill-creation/assets/SKILL-TEMPLATE.md skills/new-skill/SKILL.md

# Fill in placeholders
# - {skill-name}
# - {description}
# - {Trigger: ...}
# - etc.
```

Templates include:

- **SKILL-TEMPLATE.md**: Complete skill structure with all required sections
- **AGENT-TEMPLATE.md**: Complete agent definition structure
- **PROMPT-TEMPLATE.md**: Context prompt structure
- **frontmatter-schema.json**: JSON Schema for frontmatter validation

### Validation

Each creation skill includes JSON Schema validation:

```bash
# Validate skill frontmatter
cat skills/my-skill/SKILL.md | yq eval '.frontmatter' - | \
  yq eval-all '.' skills/skill-creation/assets/frontmatter-schema.json -
```

### Synchronization

After modifying skills, sync changes to all installed model directories:

```bash
make sync
```

This copies the updated skills/ directory to:

- `.github/skills/` (GitHub Copilot)
- `.claude/skills/` (Claude)
- `.codex/skills/` (Codex)
- `.gemini/skills/` (Gemini)

Includes assets/ and references/ subdirectories automatically.

## Usage Examples

### Creating a New Skill

1. Use the skill-creation skill (auto-invoked when you ask to create a skill)
2. Copy the template:
   ```bash
   mkdir skills/my-new-skill
   cp skills/skill-creation/assets/SKILL-TEMPLATE.md skills/my-new-skill/SKILL.md
   ```
3. Fill in all placeholders (`{skill-name}`, `{description}`, `{Trigger}`, etc.)
4. Validate frontmatter against schema
5. Add to AGENTS.md Available Skills and Auto-Invoke tables
6. Sync to all models: `make sync`

### Creating a New Agent

1. Use the agent-creation skill (auto-invoked when you ask to create an agent)
2. Copy the template:
   ```bash
   mkdir agents/my-project
   cp skills/agent-creation/assets/AGENT-TEMPLATE.md agents/my-project/AGENTS.md
   ```
3. Gather required context (purpose, skills, workflows, etc.)
4. Fill in template placeholders
5. Validate frontmatter against schema

### Applying Skills

Skills are automatically invoked based on your task. You can also manually invoke:

```
# In your AI assistant conversation
"Use the react skill to create a component"
"Apply typescript skill to add types"
"Use critical-partner to review this code"
```

## Installation

### Quick Start

To start the interactive setup, simply run:

```bash
make
```

This launches the guided setup script (`scripts/setup.sh`) with step-by-step instructions and colored output.

### Installation Options

- **Local installation**: Prepares all folders and files required for supported models to understand agent and skill usage in the current workspace. Select "Local" when prompted, then choose the model(s) to install (GitHub Copilot, Claude, Codex, Gemini).

- **External installation**: Allows you to select an agent from `agents/`, specify the destination path for the external project, and choose the model(s) to install. The script automatically copies:
  - Selected agent (AGENTS.md)
  - All required skills with recursive dependency resolution
  - Meta-skills for self-management
  - Model-specific configuration files
  - assets/ and references/ subdirectories

Follow the interactive prompts to complete your installation.

### Uninstalling

Run the interactive uninstall wizard:

```bash
make uninstall
```

The wizard will guide you through:

1. **Local or External**: Choose to uninstall from current workspace or external project
2. **Path** (if external): Specify the project directory
3. **Mode** (if external): Choose soft (model configs only) or hard (includes AGENTS.md and skills/)

Local uninstall always removes only model configurations, preserving AGENTS.md, skills/, agents/, and prompts/.

### Available Make Commands

| Command                | Description                                                                   |
| ---------------------- | ----------------------------------------------------------------------------- |
| `make` or `make setup` | Run interactive setup wizard                                                  |
| `make uninstall`       | Run interactive uninstall wizard (local or external)                          |
| `make clean`           | Remove all model-specific directories (.github/, .claude/, .codex/, .gemini/) |
| `make sync`            | Sync skills/ changes to all installed model directories                       |
| `make help`            | Show all available commands                                                   |

### Syncing Changes

After modifying skills in this repository, run:

```bash
make sync
```

This updates all installed model directories (.github/, .claude/, .codex/, .gemini/) with the latest skills. For external projects, copy `scripts/templates/uninstall.sh` to the project root and customize as needed.

## References

- [AGENTS.md](AGENTS.md): Central documentation for agent and skill management.
- [Agent Skills Home](https://agentskills.io/)

## Contributing

- Follow the conventions in [skills/conventions/SKILL.md](skills/conventions/SKILL.md).
- Use [skills/skill-creation/SKILL.md](skills/skill-creation/SKILL.md) for new skills.
- Reference [AGENTS.md](AGENTS.md) and [agent-creation](skills/agent-creation/SKILL.md) for new agents.

## Notes

- Each skill must have a unique responsibility and delegate general conventions and accessibility to the appropriate skills.
- The installation scripts ensure all dependencies are copied and configured for both local and external setups.
- **Meta-skills** (skill-creation, agent-creation, prompt-creation, process-documentation, critical-partner, conventions, a11y, skill-sync) are automatically included in all installations to enable self-management and consistency.
- All technical and management agents must include `critical-partner` and `process-documentation` skills.
- Context prompts use descriptive names without prefixes (e.g., `english-practice.md`, `sbd.md`).
- Token efficiency is enforced: no empty arrays/objects, YAML list syntax only, optional input/output fields.

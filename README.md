# ai-agents-skills

**A modular AI agent and skill distribution framework**, optimized for managing and distributing reusable skills across AI coding assistants.

---

## 🎯 Purpose

This repository serves as:

1. **Skill Repository**: 49+ curated skills for frameworks, testing, standards, and best practices
2. **Distribution System**: CLI tool for installing skills to AI assistants (Copilot, Claude, Gemini, Codex, Cursor)
3. **Agent Framework**: Compose custom agents by combining skills for specific workflows

---

## 🚀 Quick Start

### Local Installation (Managing This Repo)

```bash
# Install skills to AI assistants interactively
make install

# Non-interactive installation
node dist/index.js local --models copilot,claude

# Dry run (preview changes)
node dist/index.js local --dry-run
```

### Remote Installation (Future - Phase 2)

```bash
# Install from any project
npx ai-agents-skills add joabgonzalez/ai-agents-skills --agent backend-dev

# Install specific skills
npx ai-agents-skills add joabgonzalez/ai-agents-skills --skill react --skill typescript
```

---

## 📦 What's Inside

### 49 Skills Across Categories

**Frontend**: react, next, astro, vue • **Backend**: nodejs, express, nest, hono
**Testing**: jest, playwright, react-testing-library • **Standards**: typescript, eslint, prettier, a11y
**UI Libraries**: mui, tailwindcss, ag-grid • **State**: redux-toolkit
**Meta**: skill-creation, agent-creation, critical-partner, conventions

[See full skill list →](AGENTS.md#available-skills)

### 5 AI Models Supported

- **GitHub Copilot** (`.github/`)
- **Claude** (`.claude/`)
- **Gemini** (`.gemini/`)
- **Codex (Open AI)** (`.codex/`)
- **Cursor** (`.cursor/`)

---

## 🏗️ Architecture

```
jg-ai-agents/
├── skills/              # 49 skills (source of truth)
│   ├── react/
│   ├── typescript/
│   └── ...
├── agents/              # Agent definitions
│   └── main/
│       └── AGENTS.md    # Skills orchestration
├── templates/           # Model instruction templates
├── src/                 # TypeScript CLI
│   ├── commands/        # install, local, validate, uninstall
│   ├── core/            # installer, dependency resolver
│   └── utils/
└── .github/             # Generated - symlinks to skills/
└── .claude/             # Generated - symlinks to skills/
```

**Key Design**:

- **Symlinks** for local installs → always up-to-date
- **Dependency resolution** → auto-install required skills
- **Multi-model sync** → install to 5 assistants at once
- **Token-optimized templates** → 73% smaller than verbose alternatives

---

## 📖 How It Works

### 1. Skills are Markdown Files

Each skill is a `SKILL.md` with:

- **Frontmatter** (name, version, dependencies)
- **When to Use** (triggers)
- **Critical Patterns** (core guidelines)
- **Decision Tree** (quick decision-making)
- **Edge Cases** (gotchas)

Complex skills (40+ patterns) include a `references/` directory.

### 2. Agents Combine Skills

`AGENTS.md` defines which skills an agent can use:

```yaml
---
name: backend-dev
skills:
  - nodejs
  - typescript
  - express
  - jest
---
```

### 3. CLI Installs to AI Assistants

```bash
make install
# → Reads AGENTS.md
# → Resolves dependencies
# → Creates symlinks to .github/, .claude/, etc.
# → Generates model-specific instructions
```

---

## 🛠️ Commands

| Command                   | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `make install`            | Interactive install (auto-detects installed models) |
| `make validate`           | Validate all skills                                 |
| `make validate-installed` | Validate installed skills                           |
| `make uninstall`          | Remove all skills                                   |
| `make clean`              | Remove model directories                            |

### CLI Options

```bash
# Local mode
node dist/index.js local --models copilot,claude,cursor
node dist/index.js local --skills react,typescript  # specific skills
node dist/index.js local --no-meta                   # skip meta-skills
node dist/index.js local --dry-run                   # preview only

# Validation
node dist/index.js validate --all
node dist/index.js validate --installed
node dist/index.js validate --skill react

# Uninstall
node dist/index.js uninstall --all --confirm
node dist/index.js uninstall --skills react,typescript
```

---

## ✨ Features

### ✅ Intelligent Skip Logic

- **Auto-detection**: Detects installed models
- **Smart skip**: Skips re-installing existing symlinks (always up-to-date)
- **Clear messaging**: Shows what's installed vs new

### ✅ Token-Optimized Instructions

- **73% smaller** than verbose alternatives (~85 tokens vs ~320)
- **Dynamic skill count** (updates automatically)
- **Grouped categorization** instead of full list

### ✅ Dependency Resolution

- **Auto-install dependencies** (e.g., `react` requires `javascript`, `typescript`)
- **Cycle detection** (prevents circular dependencies)
- **Topological sorting** (correct installation order)

### ✅ Multi-Model Support

- Install to **5 AI assistants** simultaneously
- **Model-specific templates** (optimized for each assistant)
- **Symlinks** keep everything in sync

---

## 📚 Documentation

### Current

- [AGENTS.md](AGENTS.md) - Skill catalog and agent configuration
- [Skills Directory](skills/) - 49 individual skill files

### Future (Phase 3)

- **Astro documentation site** at `docs/`
- Searchable skill catalog
- Interactive agent builder
- Skill dependency visualization

---

## 🎨 Inspiration

This framework is inspired by **[Vercel Skills](https://github.com/vercel-labs/ai-sdk-rag-starter)** but customized for:

- Multi-model support (5 AI assistants)
- Local symlink architecture (always up-to-date)
- Dependency resolution (auto-install requirements)
- Token-optimized templates (economical)
- Agent composition (combine skills for workflows)

---

## 🚧 Roadmap

### ✅ Phase 1: Local Mode (Completed)

- ✅ TypeScript/Node.js CLI
- ✅ 5 model support
- ✅ Auto-detection of installed models
- ✅ Intelligent skip logic
- ✅ Token-optimized templates
- ✅ Dependency resolution

### 🚀 Phase 2: NPX Distribution (Next)

- Remote repository fetching
- Project auto-detection
- Interactive skill browser
- `npx ai-agents-skills add <repo>` command

### 🎯 Phase 3: Documentation Site (Future)

- Astro-powered docs
- Skill search and filtering
- Dependency graph visualization
- Interactive agent builder

---

## 📄 License

MIT

---

## 🤝 Contributing

See [AGENTS.md](AGENTS.md) for:

- How to create new skills
- How to create new agents
- Standards and conventions
- Validation requirements

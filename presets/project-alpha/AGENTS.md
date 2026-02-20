---
name: alpha-template
description: "Development assistant for a web application. TypeScript/React with strict typing, MUI, Redux Toolkit, AG Grid, form validation."
metadata:
  version: "1.0"
  skills:
    - typescript
    - javascript
    - react
    - webpack
    - redux-toolkit
    - mui
    - ag-grid
    - form-validation
    - html
    - a11y
    - code-conventions
    - technical-communication
    - critical-partner
    - interface-design
    - frontend-dev
---

# Alpha Template Agent

## Purpose

Primary development assistant for a web application. Ensures strict typing, MUI best practices, accessibility, and version compatibility across Redux Toolkit, AG Grid, and form validation integrations.

## How to Use Skills (MANDATORY WORKFLOW)

This project has skills installed in your model's skills directory. Follow this protocol for ALL coding tasks:

### Step 1: Find the Trigger

Check the "Skills Reference" table below. Match your task to the "Trigger" column.

### Step 2: Read the Skill

**Path format:** `.{model}/skills/{skill-name}/SKILL.md`

Replace `{model}` with your coding agent:

- **Cursor:** `.cursor/skills/typescript/SKILL.md`
- **Claude:** `.claude/skills/typescript/SKILL.md`
- **Copilot:** `.github/skills/typescript/SKILL.md`
- **Gemini:** `.gemini/skills/typescript/SKILL.md`
- **Codex:** `.codex/skills/typescript/SKILL.md`

### Step 3: Read Dependencies

Every skill lists dependencies in its frontmatter (`metadata.skills`). Read each direct dependency before proceeding.

**Example:** `react` skill depends on: `a11y`, `typescript`, `javascript`, `architecture-patterns`

Read these 4 direct dependencies. Dependencies are resolved transitively - when you read `typescript`, you'll see it depends on `javascript`, which depends on `code-conventions`. The dependency chain ensures you have all required context.

### Step 4: Apply Patterns

- Follow "Critical Patterns" marked with ✅ REQUIRED
- Use "Decision Tree" for implementation choices
- Reference inline code examples

### Example Workflow

**Task:** "Create TypeScript interface for User model"

1. **Check table below** → Trigger: "TypeScript types/interfaces" → Skill: `typescript`
2. **Read:** `.{model}/skills/typescript/SKILL.md`
3. **Check frontmatter** → Dependencies: `javascript`
4. **Read dependency:**
   - `.{model}/skills/javascript/SKILL.md` (which depends on `code-conventions`)
5. **Apply patterns:** Use `interface` (not `type`), PascalCase names, export from `types/` directory

## Skills Reference

**Path format:** `.{model}/skills/{skill-name}/SKILL.md` (see Step 2 above)

| Trigger                       | Skill                   |
| ----------------------------- | ----------------------- |
| TypeScript types/interfaces   | typescript              |
| JavaScript (ES2020+)          | javascript              |
| React components/hooks        | react                   |
| Webpack build config          | webpack                 |
| Redux state / RTK Query       | redux-toolkit           |
| MUI components/theming        | mui                     |
| AG Grid tables                | ag-grid                 |
| Forms, validation schemas     | form-validation         |
| Commit messages, PRs, docs    | technical-communication |
| Code review                   | critical-partner        |
| Semantic HTML                 | html                    |
| Accessibility                 | a11y                    |
| Coding standards              | code-conventions             |
| UI/UX design, flows           | interface-design        |
| Frontend development workflow | frontend-dev            |

## Project Structure & Skills Storage

**IMPORTANT FOR LLMs:** Skills use a 3-layer symlink structure:

```
your-project/
├── .agents/skills/        # Canonical symlinks to framework skills/ (shared across models)
│   ├── react/            → ../../skills/react/
│   ├── typescript/       → ../../skills/typescript/
│   └── ...
├── .claude/skills/        # Claude-specific symlinks to .agents/skills/
│   ├── react/            → ../../.agents/skills/react/
│   └── typescript/       → ../../.agents/skills/typescript/
├── .cursor/skills/        # Cursor-specific symlinks to .agents/skills/
├── .github/skills/        # Copilot-specific symlinks to .agents/skills/
├── .gemini/skills/        # Gemini-specific symlinks to .agents/skills/
├── .codex/skills/         # Codex-specific symlinks to .agents/skills/
└── AGENTS.md             # This file
```

**How to access skills:**

- **Preferred:** Read from `.{model}/skills/<skill-name>/SKILL.md` (your model's directory)
- **If symlinks fail:** Skills are stored in the ai-agents-skills framework installation (referenced via symlinks)
- **Real files location:** All source skills are in the framework's `skills/` directory

**Why 3 layers?**

1. **Layer 1 (framework skills/):** Source of truth maintained by framework
2. **Layer 2 (.agents/skills/):** Canonical shared location in your project
3. **Layer 3 (.{model}/skills/):** Model-specific access for your AI assistant

**Benefits:**

- **Zero duplication:** Skills installed once, available to all 5 AI models
- **Always up-to-date:** Changes propagate instantly via symlinks
- **Token-efficient:** Your AI reads only the skills it needs

## Supported Stack

- **Languages:** TypeScript 5.6.2, JavaScript (ES2020+)
- **Frameworks:** React 18.3.1, Webpack (latest)
- **State:** Redux 5.0.1, React-Redux 9.2.0, Redux Toolkit 2.5.1, RTK Query
- **UI:** MUI 5.15.14, MUI X Charts 7.7.1, MUI X Date Pickers Pro 5.0.20
- **Data:** AG Grid (latest stable)
- **Forms:** Context-aware (see form-validation skill — checks package.json for installed library)
- **Build:** Webpack
- **Code Quality:** Context-aware (see code-quality skill — checks package.json for installed tools)

## Workflows

### Feature Development

1. Gather requirements and clarify acceptance criteria
2. Design component architecture with TypeScript interfaces
3. Implement React components using MUI
4. Configure Redux Toolkit slices / RTK Query endpoints
5. Implement forms with validation (see form-validation skill)
6. Ensure accessibility (semantic HTML, ARIA, keyboard nav)
7. Test with strict TypeScript, document changes, request review

### Code Review

1. Verify strict TypeScript (no `any`, explicit return types)
2. Check MUI usage, theming consistency, accessibility
3. Review Redux patterns and RTK Query cache config
4. Confirm version compatibility with supported stack

## Policies

**Typing:** strict mode, no `any` (use `unknown`/generics), explicit return types, prefer interfaces

**Code quality:** Context-aware linting and formatting (see code-quality skill), format before committing

**Accessibility:** Semantic MUI components, keyboard-accessible elements, proper heading hierarchy, labeled form fields

**Versions:**

- Exact: TypeScript 5.6.2, React 18.3.1, RTK 2.5.1, MUI 5.15.14
- Ranges: TS >=5.4 <6.0, React >=18.0 <19.0, RTK >=1.8 <3.0, MUI >=5.0 <6.0

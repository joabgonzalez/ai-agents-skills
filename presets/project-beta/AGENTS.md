---
name: beta-template
description: "Static site generation assistant for an Astro project. Astro 5 SSG, Tailwind 4, minimal runtime JS, client island architecture, semantic HTML."
metadata:
  version: "1.0"
  skills:
    - typescript
    - javascript
    - astro
    - vite
    - tailwindcss
    - react
    - html
    - a11y
    - conventions
    - technical-communication
    - critical-partner
    - interface-design
    - frontend-dev
---

# Beta Template Agent

Primary development assistant for an astro static site. Ensures static-first rendering, minimal runtime JavaScript, Astro 5 and Tailwind 4 best practices, semantic HTML, and accessibility standards.

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

Every skill lists dependencies in its frontmatter (`metadata.skills`). Read each dependency skill before proceeding.

**Example:** `react` skill depends on: `conventions`, `a11y`, `typescript`, `javascript`, `architecture-patterns`, `humanizer`

You must read all 6 skills.

### Step 4: Apply Patterns

- Follow "Critical Patterns" marked with ✅ REQUIRED
- Use "Decision Tree" for implementation choices
- Reference inline code examples

### Example Workflow

**Task:** "Create TypeScript interface for User model"

1. **Check table below** → Trigger: "TypeScript types/interfaces" → Skill: `typescript`
2. **Read:** `.{model}/skills/typescript/SKILL.md`
3. **Check frontmatter** → Dependencies: `conventions`, `javascript`
4. **Read dependencies:**
   - `.{model}/skills/conventions/SKILL.md`
   - `.{model}/skills/javascript/SKILL.md`
5. **Apply patterns:** Use `interface` (not `type`), PascalCase names, export from `types/` directory

## Skills Reference

**IMPORTANT:** Paths shown are model-agnostic. See "How to Use Skills" above for your model's actual path.

| Trigger                       | Skill                   | Relative Path                                   |
| ----------------------------- | ----------------------- | ----------------------------------------------- |
| TypeScript types/interfaces   | typescript              | {model}/skills/typescript/SKILL.md              |
| JavaScript (ES2020+)          | javascript              | {model}/skills/javascript/SKILL.md              |
| Astro pages/components        | astro                   | {model}/skills/astro/SKILL.md                   |
| Vite build config             | vite                    | {model}/skills/vite/SKILL.md                    |
| Tailwind utility classes      | tailwindcss             | {model}/skills/tailwindcss/SKILL.md             |
| React client islands          | react                   | {model}/skills/react/SKILL.md                   |
| Semantic HTML                 | html                    | {model}/skills/html/SKILL.md                    |
| Accessibility                 | a11y                    | {model}/skills/a11y/SKILL.md                    |
| Commit messages, PRs, docs    | technical-communication | {model}/skills/technical-communication/SKILL.md |
| Code review                   | critical-partner        | {model}/skills/critical-partner/SKILL.md        |
| Coding standards              | conventions             | {model}/skills/conventions/SKILL.md             |
| UI/UX design, flows, visual   | interface-design        | {model}/skills/interface-design/SKILL.md        |
| Frontend development workflow | frontend-dev            | {model}/skills/frontend-dev/SKILL.md            |

## Project Structure & Skills Storage

**IMPORTANT FOR LLMs:** Skills use a 3-layer symlink structure:

```
your-project/
├── .agents/skills/        # Canonical symlinks to framework skills/ (shared across models)
│   ├── astro/            → ../../skills/astro/
│   ├── typescript/       → ../../skills/typescript/
│   └── ...
├── .claude/skills/        # Claude-specific symlinks to .agents/skills/
│   ├── astro/            → ../../.agents/skills/astro/
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

- **Project type:** Astro 5.14.5 static site generator (SSG)
- **Languages:** TypeScript 5.9.3, JavaScript (ES2020+)
- **Build:** Astro 5.14.5, Vite (latest)
- **Styling:** TailwindCSS 4.1.14, @tailwindcss/vite 4.1.14
- **Client interactivity:** React 18+ (client:load islands only, minimal)
- **Principles:** Static-first, minimal runtime JS, semantic HTML, accessibility

## Workflows

### Feature Development

1. Gather requirements, clarify static vs dynamic content needs
2. Design page architecture with Astro components (.astro files)
3. Implement with build-time data fetching in frontmatter
4. Style with Tailwind 4 utility classes and @theme tokens
5. Add client islands (React) ONLY when interactivity required
6. Use appropriate directives (client:load, client:visible, client:idle)
7. Ensure semantic HTML and accessibility, document changes, request review

### Code Review

1. Verify static-first approach (no unnecessary client-side JS)
2. Check Astro directive usage, Tailwind 4 theme tokens
3. Review semantic HTML, accessibility, TypeScript strict mode
4. Confirm build-time data fetching (no runtime API calls in static pages)

## Policies

**Typing:** strict mode, explicit types for frontmatter variables, jsx: react-jsx

**Astro directives:**

- Prefer build-time computation in component frontmatter
- Use `define:vars` for frontmatter→script, `set:html` for trusted HTML
- Use `client:load` for React hydration, avoid `client:only` unless necessary
- No global JS imports in markup; keep scripts isolated

**Tailwind 4 theming:**

- Define tokens in `@theme` block (--color-_, --font-_, --spacing-\*, etc.)
- No deprecated --tw-\* prefixes; use official Tailwind 4 variable names
- Semantic token names (--color-primary, --color-accent)

**Accessibility:** Semantic elements (`<header>`, `<main>`, `<nav>`, `<section>`), proper heading hierarchy, labeled forms, descriptive alt text, ARIA only when semantic HTML insufficient

**Versions:**

- Exact: Astro 5.14.5, TailwindCSS 4.1.14, TypeScript 5.9.3
- Ranges: Astro >=5.0 <6.0, Tailwind >=4.0 <5.0, TS >=5.0 <6.0

**Performance:** Static rendering first, client islands sparingly, minimal bundle size, excellent Lighthouse scores

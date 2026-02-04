# Skill Dependencies Matrix

## Purpose

This reference provides a comprehensive matrix of skill dependencies by category. Use this to ensure new skills have correct and coherent dependencies in their frontmatter.

**CRITICAL**: When creating a new skill, follow the pattern for its category exactly. This ensures consistency across all skills in the framework.

---

## Quick Decision Rules

**ALWAYS include:**

- `conventions` (all skills except base skills like a11y, humanizer)
- `typescript` (if TypeScript is primary language)

**Include when applicable:**

- `a11y` (any UI generation: HTML, React, CSS, etc.)
- `humanizer` (user-facing UI/content: frontend, forms, mobile)
- `architecture-patterns` (complex logic: frameworks, state management)
- `javascript` (if ES2020+ patterns needed alongside TypeScript)

**Framework dependencies:**

- React-based skills → include `react`
- Node.js-based skills → include `nodejs`
- Mobile skills → include `react-native` or base mobile framework

**NEVER include:**

- `humanizer` for backend, testing, build tools, validation schemas
- `a11y` for backend or non-UI skills
- `architecture-patterns` for simple utility libraries

---

## Dependencies by Category

### Frontend Frameworks

**React, Vue, Angular, Svelte**

```yaml
skills:
  - conventions
  - a11y
  - typescript
  - javascript
  - architecture-patterns
  - humanizer
```

**Examples**: react, vue, angular, svelte

**Rationale**:

- `conventions`: General coding standards
- `a11y`: UI components must be accessible
- `typescript` + `javascript`: Modern JS/TS patterns
- `architecture-patterns`: Component architecture (SRP, composition)
- `humanizer`: User-facing components need empathetic UX

---

### Frontend Frameworks (SSG/SSR)

**Astro, Next.js, Nuxt, SvelteKit, Remix**

```yaml
skills:
  - conventions
  - a11y
  - react # or base framework (vue, svelte)
  - typescript
  - architecture-patterns
  - humanizer
```

**Examples**: astro, next, nuxt, sveltekit

**Rationale**:

- Inherits from base framework (react, vue, etc.)
- Adds framework-specific patterns (routing, SSG/SSR)
- `humanizer`: Generates user-facing pages/content

---

### Mobile Frameworks

**React Native, Flutter, Ionic, NativeScript**

```yaml
skills:
  - conventions
  - a11y
  - react # or base framework
  - typescript
  - architecture-patterns
  - humanizer
```

**Examples**: react-native, flutter, ionic

**Rationale**:

- Mobile UI is user-facing (needs humanizer)
- `a11y`: Mobile accessibility (screen readers, gestures)
- `architecture-patterns`: App architecture patterns

---

### Mobile Development Tools

**Expo, React Native CLI, Capacitor**

```yaml
skills:
  - conventions
  - react-native # or base mobile framework
  - typescript
  - a11y
```

**Examples**: expo, capacitor

**Rationale**:

- Tools that wrap mobile frameworks
- Inherit base framework dependencies
- NO `humanizer` (tooling, not direct UI generation)

---

### UI Component Libraries

**MUI, Ant Design, Chakra UI, Shadcn, Bootstrap**

```yaml
skills:
  - conventions
  - a11y
  - react # or base framework
  - typescript
  - humanizer
```

**Examples**: mui, antd, chakra-ui

**Rationale**:

- Generate user-facing components (need humanizer)
- `a11y`: Component libraries must be accessible
- Based on framework (react, vue, etc.)

---

### Data Visualization

**Chart libraries: MUI X Charts, Recharts, D3, Chart.js**

```yaml
skills:
  - mui # or base library/framework
  - react
  - typescript
  - humanizer
```

**Examples**: mui-x-charts, recharts

**Rationale**:

- Data viz is user-facing (tooltips, labels, legends)
- `humanizer`: Clear data communication
- Based on UI library (mui) or framework (react)

---

### Styling Frameworks/Tools

**Tailwind CSS, Bootstrap, Styled Components, Emotion**

```yaml
skills:
  - conventions
  - a11y
  - css
  - humanizer
```

**Examples**: tailwindcss, bootstrap, styled-components

**Rationale**:

- Styling is user-facing (visual feedback, states)
- `a11y`: Color contrast, focus states
- `humanizer`: Visual communication patterns

---

### HTML/CSS Base

**HTML, CSS**

```yaml
skills:
  - conventions
  - a11y
  - humanizer
```

**Examples**: html, css

**Rationale**:

- Fundamental web technologies
- Direct user-facing content
- `a11y`: Semantic structure, accessibility
- `humanizer`: Content clarity, UX patterns

---

### Form Libraries

**Formik, React Hook Form, VeeValidate**

```yaml
skills:
  - conventions
  - a11y
  - react # or base framework
  - yup # or validation library (zod)
  - humanizer
```

**Examples**: formik, react-hook-form

**Rationale**:

- Forms are user-facing (error messages, feedback)
- `humanizer`: Clear validation messages, empathetic errors
- `a11y`: Form accessibility (labels, errors, ARIA)
- Validation library: yup or zod

---

### State Management

**Redux Toolkit, Zustand, MobX, Pinia, Jotai**

```yaml
skills:
  - conventions
  - react # or base framework
  - typescript
  - architecture-patterns
# NO humanizer (internal logic, not direct UI)
```

**Examples**: redux-toolkit, zustand, mobx

**Rationale**:

- Internal state logic (not user-facing)
- `architecture-patterns`: State patterns (SRP, selectors)
- NO `humanizer`: State management is internal

---

### Data Tables

**AG Grid, TanStack Table, DataGrid**

```yaml
skills:
  - conventions
  - react # or base framework
  - typescript
  - a11y
# NO humanizer (data display, not content generation)
```

**Examples**: ag-grid, tanstack-table

**Rationale**:

- Data display (not content generation)
- `a11y`: Keyboard navigation, screen readers
- NO `humanizer`: Technical data display

---

### Backend Frameworks

**Express, NestJS, Fastify, Hono, Koa**

```yaml
skills:
  - conventions
  - nodejs # or bun
  - typescript
  - architecture-patterns
# NO humanizer (server-side, not user-facing)
```

**Examples**: express, nest, fastify, hono

**Rationale**:

- Server-side logic (not direct user-facing)
- `architecture-patterns`: API design, DDD, Clean Architecture
- NO `humanizer`: Backend logic is internal
- NO `a11y`: No UI generation

---

### Backend Runtimes

**Node.js, Bun, Deno**

```yaml
skills:
  - conventions
  - typescript
  - architecture-patterns
```

**Examples**: nodejs, bun, deno

**Rationale**:

- Runtime environments (not frameworks)
- `architecture-patterns`: Server architecture patterns
- NO `humanizer`: Runtime is internal

---

### Validation Libraries

**Zod, Yup, Joi, Ajv**

```yaml
skills:
  - conventions
  - typescript
# NO humanizer (schema-only, no UI)
# NO a11y (no UI generation)
```

**Examples**: zod, yup, joi

**Rationale**:

- Schema definition only (internal logic)
- NO `humanizer`: Validation schemas are internal
- NO `a11y`: No UI generation

---

### Testing Frameworks

**Jest, Vitest, Mocha, AVA**

```yaml
skills:
  - conventions
  - typescript
  - javascript
# NO humanizer (developer-facing tools)
```

**Examples**: jest, vitest, mocha

**Rationale**:

- Developer-facing testing tools
- NO `humanizer`: Tests are for developers, not users

---

### Testing Libraries

**React Testing Library, Testing Library, Enzyme**

```yaml
skills:
  - conventions
  - react # or base framework
  - jest # or base testing framework
```

**Examples**: react-testing-library, vue-testing-library

**Rationale**:

- Wraps base framework + testing framework
- Inherits from both (react + jest)
- NO `humanizer`: Developer-facing

---

### E2E Testing

**Playwright, Cypress, Puppeteer, Selenium**

```yaml
skills:
  - conventions
  - typescript
  - javascript
# NO humanizer (developer-facing automation)
```

**Examples**: playwright, cypress

**Rationale**:

- Browser automation (developer-facing)
- NO `humanizer`: E2E tests are for developers

---

### Testing Orchestrators

**unit-testing, e2e-testing, integration-testing**

```yaml
skills:
  - conventions
  - jest # or playwright for E2E
  - typescript
  - frontend-dev # if frontend testing
  - backend-dev # if backend or full-stack
  - humanizer # for clear test descriptions
```

**Examples**: unit-testing, e2e-testing

**Rationale**:

- Meta-skills for testing patterns
- `humanizer`: Clear, descriptive test names (user-story format)
- Include workflow skills (frontend-dev, backend-dev)

---

### Build Tools

**Vite, Webpack, Rollup, esbuild, Parcel, Turbopack**

```yaml
skills:
  - conventions
# NO humanizer (developer-facing configuration)
# NO typescript/javascript (build config, not code patterns)
```

**Examples**: vite, webpack, rollup

**Rationale**:

- Build configuration (developer-facing)
- NO `humanizer`: Build tools are internal
- NO language skills unless build config uses them

---

### Linters/Formatters

**ESLint, Prettier, Stylelint, Biome**

```yaml
# ESLint
skills:
  - conventions
  - typescript
  - javascript

# Prettier
skills:
  - conventions
# NO humanizer (code quality tools, developer-facing)
```

**Examples**: eslint, prettier

**Rationale**:

- Code quality tools (developer-facing)
- ESLint needs language skills (typescript, javascript)
- Prettier only needs conventions (formatter)

---

### Workflow Skills

**frontend-dev, backend-dev, fullstack-dev**

```yaml
# Frontend Workflow
skills:
  - conventions
  - typescript
  - react  # primary framework for project
  - architecture-patterns
  - a11y
  - humanizer

# Backend Workflow
skills:
  - conventions
  - typescript
  - nodejs  # primary runtime for project
  - architecture-patterns
  - humanizer  # for API error messages, logs
```

**Examples**: frontend-dev, backend-dev

**Rationale**:

- Workflow skills need base stack (react, nodejs)
- Frontend: includes a11y + humanizer (UI-focused)
- Backend: includes humanizer for API responses/errors

---

### Design Skills

**frontend-design, ux-patterns, design-systems**

```yaml
skills:
  - conventions
  - a11y
  - humanizer
```

**Examples**: frontend-design, ux-patterns

**Rationale**:

- Design is user-facing (needs humanizer)
- `a11y`: Accessibility in design
- NO framework skills (design is tool-agnostic)

---

### Meta Skills (Framework)

**skill-creation, agent-creation, reference-creation, prompt-creation**

```yaml
skills:
  - critical-partner # review and validation
  - process-documentation # document changes
  - english-writing # all content in English
  # + specific framework skills as needed
```

**Examples**: skill-creation, agent-creation

**Rationale**:

- Framework management skills
- Always include critical-partner, process-documentation
- `english-writing`: Enforce English in generated content

---

## Auto-Maintenance Protocol

**CRITICAL INSTRUCTION**: When creating a new skill, you MUST update this reference:

### Step 1: Create the Skill

Follow [SKILL.md](../SKILL.md) to create your skill.

### Step 2: Update This Matrix

After creating a new skill, update the appropriate category in this file:

1. **Find or create category**: Locate the category that matches your skill type (e.g., "Frontend Frameworks", "Testing Libraries")
2. **Update examples**: Add your skill name to the "Examples" list
3. **Verify dependencies**: Ensure the YAML block matches your skill's actual frontmatter
4. **Add rationale** (if new category): Explain why these dependencies are required

### Step 3: Validation

Verify your updates:

```bash
# Check that your skill follows the matrix
grep -A 10 "^name: your-skill" skills/your-skill/SKILL.md

# Compare with matrix category
# Ensure dependencies match exactly
```

### New Category Protocol

If your skill doesn't fit any existing category:

1. **Create new category section** with:
   - Category name (e.g., "### New Category")
   - Skill type description
   - YAML dependency block
   - Examples list
   - Rationale paragraph

2. **Update Quick Decision Rules** if needed
3. **Document in SKILL.md** Decision Tree
4. **Request critical-partner review**

---

## Validation Checklist

Before finalizing a new skill, verify against this matrix:

- [ ] Skill category identified correctly
- [ ] Dependencies match category pattern exactly
- [ ] Frontend skill: includes conventions, a11y, typescript, humanizer
- [ ] Backend skill: includes conventions, nodejs, typescript, architecture-patterns (NO humanizer)
- [ ] Testing skill: includes conventions, typescript/javascript (NO humanizer)
- [ ] Build tool: includes conventions only
- [ ] UI library: includes conventions, a11y, react, typescript, humanizer
- [ ] All referenced skills exist in skills/ directory
- [ ] This matrix updated with new skill example
- [ ] SKILL.md references this matrix (MUST read)

---

## Examples by Pattern

### Pattern: Frontend Framework Skill

```yaml
---
name: react
skills:
  - conventions
  - a11y
  - typescript
  - javascript
  - architecture-patterns
  - humanizer
---
```

### Pattern: Backend Framework Skill

```yaml
---
name: express
skills:
  - conventions
  - nodejs
  - typescript
  - architecture-patterns
---
```

### Pattern: UI Library Skill

```yaml
---
name: mui
skills:
  - conventions
  - a11y
  - react
  - typescript
  - humanizer
---
```

### Pattern: Testing Library Skill

```yaml
---
name: jest
skills:
  - conventions
  - typescript
  - javascript
---
```

---

## Common Mistakes

❌ **WRONG**: Adding humanizer to backend frameworks

```yaml
name: express
skills:
  - conventions
  - nodejs
  - humanizer # ❌ NO! Backend is not user-facing
```

❌ **WRONG**: Missing a11y in frontend skills

```yaml
name: react
skills:
  - conventions
  - typescript
  # ❌ Missing a11y! All UI generation needs accessibility
```

❌ **WRONG**: Missing architecture-patterns in frameworks

```yaml
name: next
skills:
  - conventions
  - react
  - typescript
  # ❌ Missing architecture-patterns! Frameworks need patterns
```

✅ **CORRECT**: Complete frontend skill

```yaml
name: react
skills:
  - conventions
  - a11y
  - typescript
  - javascript
  - architecture-patterns
  - humanizer
```

---

## References

- [Skill Creation Guide](../SKILL.md)
- [Agent Creation](../../agent-creation/SKILL.md)
- [Conventions](../../conventions/SKILL.md)
- [A11y](../../a11y/SKILL.md)
- [Humanizer](../../humanizer/SKILL.md)
- [Architecture Patterns](../../architecture-patterns/SKILL.md)

# Skill Dependencies Matrix

Dependency rules based on skill **type classification**. Every skill must have a `type` field that determines which dependencies it can have.

**CRITICAL**: When creating a new skill, first determine its type, then follow the dependency rules for that type exactly.

---

## Type System Overview

Every skill must be classified into one of these 7 types:

| Type | Purpose | Can Depend On | Examples |
|------|---------|---------------|----------|
| **behavioral** | Process/methodology, no tech specifics | behavioral only | critical-partner, brainstorming, systematic-debugging |
| **universal** | Applies to any project, tech-agnostic | behavioral only | frontend-dev, backend-dev, fullstack-dev |
| **language** | Language-specific patterns | language, behavioral | javascript, typescript, python, go, rust |
| **framework** | Framework patterns and conventions | framework, language, domain, behavioral | react, vue, express, nest, next |
| **library** | Library-specific patterns | library, framework, language, domain, behavioral | mui, redux-toolkit, formik, zod |
| **tooling** | Dev tools wrapping other tech | tooling, framework, language, domain, behavioral | vite, webpack, eslint, prettier, expo |
| **domain** | Domain-specific (not tech-tied) | domain, behavioral | a11y, css, html, composition-patterns |

---

## Type Dependency Rules

### Behavioral
**Process/methodology skills - completely self-sufficient**

```yaml
type: behavioral
skills:
  # Can ONLY depend on other behavioral skills
  # Prefer NO dependencies (self-sufficient)
```

**Can depend on:**
- `behavioral` only (other process/methodology skills)

**Examples:**
- `critical-partner` → NO dependencies (completely self-sufficient)
- `brainstorming` → NO dependencies
- `systematic-debugging` → NO dependencies
- `english-writing` → NO dependencies
- `skill-creation` → `[reference-creation, skill-sync]` (both behavioral)

**Rationale:**
Behavioral skills teach process and methodology that applies to ANY code in ANY language. They must be completely technology-agnostic.

---

### Universal
**Applies to any project - orchestrates workflow without tech specifics**

```yaml
type: universal
skills:
  # Can ONLY depend on behavioral skills
  # NO language, framework, or domain dependencies
```

**Can depend on:**
- `behavioral` only

**Examples:**
- `frontend-dev` → `[architecture-patterns]`
- `backend-dev` → `[architecture-patterns]`
- `fullstack-dev` → `[architecture-patterns]`

**Rationale:**
Universal skills provide high-level workflow guidance that works with ANY technology stack. They orchestrate technical skills through documentation links but don't depend on them.

**Common Mistake:**
❌ `frontend-dev` depends on `typescript` - WRONG! Universal skills must be language-agnostic.
✅ `frontend-dev` references typescript in Resources section - CORRECT!

---

### Language
**Language-specific patterns - prefer self-sufficient**

```yaml
type: language
skills:
  # Prefer NO dependencies (self-sufficient)
  # Can depend on related languages or behavioral
```

**Can depend on:**
- `language` (related language, e.g., TypeScript → JavaScript semantics)
- `behavioral` (general methodology)

**Examples:**
- `javascript` → NO dependencies (self-sufficient)
- `typescript` → NO dependencies (superset of JS, teaches its own patterns)
- `python` → NO dependencies
- `go` → NO dependencies
- `rust` → NO dependencies

**Rationale:**
Language skills should be self-contained. They teach the language itself, not how it's used in frameworks.

**Common Mistake:**
❌ `typescript` depends on `javascript` - WRONG! TypeScript is a superset, teaches its own JS patterns.
✅ `typescript` is self-sufficient - CORRECT!

---

### Framework
**Framework patterns - can depend on language/domain/behavioral**

```yaml
type: framework
skills:
  # Can depend on base language + domain + behavioral
```

**Can depend on:**
- `framework` (base framework, e.g., Next → React)
- `language` (e.g., React → JavaScript, TypeScript)
- `domain` (e.g., React → a11y for UI, css for styling)
- `behavioral` (e.g., architecture-patterns)

**Examples:**
- `react` → `[javascript, a11y]`
- `vue` → `[javascript, a11y]`
- `next` → `[react]` (inherits react's deps transitively)
- `express` → `[nodejs]`
- `nest` → `[nodejs, typescript, architecture-patterns]`

**Rationale:**
Frameworks build on languages and apply to specific domains. Frontend frameworks need a11y (UI domain), backend frameworks don't.

**Common Patterns:**
- Frontend frameworks (React, Vue, Angular) → `[javascript, a11y]`
- SSR frameworks (Next, Nuxt, SvelteKit) → `[base-framework]` (e.g., `[react]`)
- Backend frameworks (Express, Nest, Fastify) → `[nodejs]` or `[nodejs, typescript]`

---

### Library
**Library-specific patterns - can depend on framework/language/domain/behavioral**

```yaml
type: library
skills:
  # Can depend on framework + language + domain + behavioral
```

**Can depend on:**
- `library` (related library)
- `framework` (e.g., MUI → React)
- `language` (e.g., Zod → TypeScript)
- `domain` (e.g., MUI → a11y)
- `behavioral` (e.g., architecture-patterns)

**Examples:**
- `mui` → `[react]` (a11y comes from react transitively)
- `redux-toolkit` → `[react, architecture-patterns]`
- `formik` → `[react]`
- `zod` → NO dependencies (validation library, self-sufficient)
- `yup` → NO dependencies

**Rationale:**
Libraries extend frameworks or languages. They inherit dependencies from their base framework.

**Common Patterns:**
- React component libraries (MUI, Chakra, Ant Design) → `[react]`
- State management (Redux, Zustand, Jotai) → `[react, architecture-patterns]`
- Validation libraries (Zod, Yup, Joi) → NO dependencies (self-sufficient)
- Form libraries (Formik, React Hook Form) → `[react]`

---

### Tooling
**Dev tools - can depend on what they wrap**

```yaml
type: tooling
skills:
  # Can depend on tooling + framework + language + domain + behavioral
```

**Can depend on:**
- `tooling` (base tool)
- `framework` (e.g., Expo → React Native)
- `language` (e.g., ESLint → TypeScript, JavaScript)
- `domain` (if relevant)
- `behavioral`

**Examples:**
- `vite` → NO dependencies (build tool, self-sufficient)
- `webpack` → NO dependencies
- `eslint` → `[javascript, typescript]`
- `prettier` → NO dependencies (formatter, self-sufficient)
- `expo` → `[react-native]`
- `jest` → `[javascript, typescript]`
- `playwright` → `[javascript, typescript]`

**Rationale:**
Tooling wraps or enhances other technologies. Build tools (Vite, Webpack) are self-sufficient. Linters (ESLint) need language skills. Framework tools (Expo) depend on their base framework.

**Common Patterns:**
- Build tools (Vite, Webpack, Rollup) → NO dependencies
- Linters (ESLint, Biome) → `[javascript, typescript]`
- Formatters (Prettier) → NO dependencies
- Testing frameworks (Jest, Vitest, Mocha) → `[javascript, typescript]`
- Framework tooling (Expo, Create React App) → `[base-framework]`

---

### Domain
**Domain-specific knowledge - prefer self-sufficient or domain/behavioral**

```yaml
type: domain
skills:
  # Prefer NO dependencies (self-sufficient)
  # Can depend on related domain or behavioral
```

**Can depend on:**
- `domain` (related domain, e.g., CSS → HTML semantics)
- `behavioral` (general methodology)

**Examples:**
- `a11y` → NO dependencies (self-sufficient accessibility knowledge)
- `css` → `[a11y]` (for color contrast, focus states)
- `html` → `[a11y]` (semantic structure)
- `composition-patterns` → NO dependencies (self-sufficient patterns)

**Rationale:**
Domain skills represent knowledge areas that apply across technologies. They should be self-contained unless they have inherent relationships (e.g., CSS needs a11y for color contrast).

**Common Patterns:**
- `a11y` → Always self-sufficient (no dependencies)
- `css`, `html` → Can depend on `a11y` (accessibility is inherent to UI)
- Design/architecture patterns → Usually self-sufficient

---

## Type Determination Guide

**How to determine the correct type for a new skill:**

### 1. Is it a process/methodology?
```
Does it teach HOW to do something (not WHAT technology)?
  → YES: type: behavioral
  → NO: Continue to #2

Examples:
  - critical-partner (code review process)
  - brainstorming (planning methodology)
  - systematic-debugging (debugging approach)
```

### 2. Is it tech-agnostic workflow guidance?
```
Does it orchestrate multiple technologies without depending on any?
  → YES: type: universal
  → NO: Continue to #3

Examples:
  - frontend-dev (frontend workflow, any framework)
  - backend-dev (backend workflow, any language)
```

### 3. Is it a programming language?
```
Is it JavaScript, TypeScript, Python, Go, Rust, etc.?
  → YES: type: language
  → NO: Continue to #4

Examples:
  - javascript, typescript, python, go, rust
```

### 4. Is it a framework?
```
Does it provide structure for building apps (React, Express, Next)?
  → YES: type: framework
  → NO: Continue to #5

Examples:
  - react, vue, angular (frontend frameworks)
  - express, nest, fastify (backend frameworks)
  - next, nuxt, remix (SSR frameworks)
```

### 5. Is it a library?
```
Does it extend a framework or language (MUI, Redux, Zod)?
  → YES: type: library
  → NO: Continue to #6

Examples:
  - mui, chakra-ui (component libraries)
  - redux-toolkit, zustand (state management)
  - zod, yup (validation)
```

### 6. Is it a development tool?
```
Is it for building, testing, or linting (Vite, Jest, ESLint)?
  → YES: type: tooling
  → NO: Continue to #7

Examples:
  - vite, webpack (build tools)
  - jest, playwright (testing)
  - eslint, prettier (code quality)
```

### 7. Is it domain-specific knowledge?
```
Does it represent a knowledge area (a11y, CSS, design patterns)?
  → YES: type: domain
  → NO: Re-evaluate - might be behavioral or universal

Examples:
  - a11y (accessibility domain)
  - css, html (web platform domains)
  - composition-patterns (design domain)
```

---

## Dependency Resolution Examples

### Example 1: React Component Library (MUI)

```yaml
name: mui
type: library
skills:
  - react
```

**Reasoning:**
1. **Type**: library (extends React framework)
2. **Dependencies**: `react` (base framework)
3. **Transitive**: Gets `javascript`, `a11y` from react automatically
4. **Result**: Clean, no redundancy

---

### Example 2: SSR Framework (Next.js)

```yaml
name: next
type: framework
skills:
  - react
```

**Reasoning:**
1. **Type**: framework (SSR framework built on React)
2. **Dependencies**: `react` (base framework)
3. **Transitive**: Gets `javascript`, `a11y` from react automatically
4. **Result**: Minimal dependencies, inherits from base

---

### Example 3: Validation Library (Zod)

```yaml
name: zod
type: library
skills: []
```

**Reasoning:**
1. **Type**: library (validation library)
2. **Dependencies**: NONE (self-sufficient, not tied to framework)
3. **Rationale**: Works in any environment (React, Node, Deno)
4. **Result**: Completely self-contained

---

### Example 4: Backend Framework (NestJS)

```yaml
name: nest
type: framework
skills:
  - nodejs
  - typescript
  - architecture-patterns
```

**Reasoning:**
1. **Type**: framework (backend framework)
2. **Dependencies**:
   - `nodejs` (runtime)
   - `typescript` (language, NestJS is TS-first)
   - `architecture-patterns` (DI, modules, clean architecture)
3. **NO a11y**: Backend framework, no UI
4. **Result**: Backend-appropriate dependencies

---

### Example 5: Behavioral Skill (Critical Partner)

```yaml
name: critical-partner
type: behavioral
skills: []
```

**Reasoning:**
1. **Type**: behavioral (code review methodology)
2. **Dependencies**: NONE (applies to ANY code)
3. **Rationale**: Reviews backend, frontend, TypeScript, Python - ALL code
4. **Result**: Completely universal, self-sufficient

---

## Transitive Dependency Rules

**CRITICAL**: Dependencies come **transitively**. Do NOT duplicate them!

### Transitive Chain Example

```
ag-grid
  └─ react
      ├─ javascript
      └─ a11y
```

**ag-grid SHOULD have:**
```yaml
skills:
  - react
```

**ag-grid should NOT have:**
```yaml
skills:
  - react
  - a11y        # ❌ WRONG: comes from react
  - javascript  # ❌ WRONG: comes from react
```

### Verification Rule

Before adding a dependency, ask:
1. Does any of my current dependencies already provide this?
2. If YES → Remove it (redundant)
3. If NO → Keep it

---

## Common Mistakes

### ❌ WRONG: Behavioral skill with tech dependencies

```yaml
name: critical-partner
type: behavioral
skills:
  - typescript  # ❌ WRONG: behavioral must be tech-agnostic
  - a11y        # ❌ WRONG: reviews ANY code, not just UI
```

✅ **CORRECT:**
```yaml
name: critical-partner
type: behavioral
skills: []  # Self-sufficient
```

---

### ❌ WRONG: Universal skill with language dependencies

```yaml
name: frontend-dev
type: universal
skills:
  - typescript        # ❌ WRONG: universal must be language-agnostic
  - architecture-patterns
  - a11y              # ❌ WRONG: universal can't depend on domain
```

✅ **CORRECT:**
```yaml
name: frontend-dev
type: universal
skills:
  - architecture-patterns  # Behavioral skill, allowed
```

---

### ❌ WRONG: Transitive redundancy

```yaml
name: next
type: framework
skills:
  - react
  - javascript  # ❌ WRONG: comes from react
  - a11y        # ❌ WRONG: comes from react
```

✅ **CORRECT:**
```yaml
name: next
type: framework
skills:
  - react  # Gets javascript + a11y transitively
```

---

### ❌ WRONG: Language depending on language

```yaml
name: typescript
type: language
skills:
  - javascript  # ❌ WRONG: TypeScript is superset, self-contained
```

✅ **CORRECT:**
```yaml
name: typescript
type: language
skills: []  # Self-sufficient, teaches its own JS patterns
```

---

## Validation Checklist

Before finalizing a skill's dependencies:

- [ ] `type` field present and correct (behavioral/universal/language/framework/library/tooling/domain)
- [ ] Dependencies follow type rules (verify with table above)
- [ ] No transitive redundancies (check dependency chains)
- [ ] Behavioral skills: ONLY depend on other behavioral (or nothing)
- [ ] Universal skills: ONLY depend on behavioral (or nothing)
- [ ] Language skills: Self-sufficient (or depend on related language/behavioral)
- [ ] Framework skills: Depend on base framework/language/domain/behavioral
- [ ] Library skills: Depend on framework/language/domain/behavioral
- [ ] Tooling skills: Depend on what they wrap
- [ ] Domain skills: Self-sufficient (or depend on related domain/behavioral)
- [ ] All referenced skills exist in skills/ directory
- [ ] No a11y in backend skills
- [ ] a11y present in all frontend/UI skills (unless inherited transitively)

---

## References

- [Skill Creation Guide](../SKILL.md) - Main skill creation workflow
- [Frontmatter Reference](frontmatter.md) - Complete frontmatter documentation
- [Type Determination](../SKILL.md#decision-tree) - How to determine skill type
- [Validation Protocol](validation.md) - Verification steps

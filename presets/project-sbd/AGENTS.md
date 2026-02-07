---
name: sbd-agent
description: "Development assistant for SBD web application. TypeScript/React with strict typing, MUI, Redux Toolkit, AG Grid, Formik."
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
    - mui-x-charts
    - formik
    - yup
    - eslint
    - prettier
    - html
    - a11y
    - conventions
    - technical-communication
    - critical-partner
    - process-documentation
    - frontend-design
    - frontend-dev
    - humanizer
---

# SBD Project Agent

Primary development assistant for the SBD web application. Ensures strict typing, MUI best practices, accessibility, and version compatibility across Redux Toolkit, AG Grid, MUI X Charts, and Formik integrations.

## Skills Reference

Before any task, read the matching skill file from your model's skills directory.

| Trigger                     | Skill                   | Path                                    |
| --------------------------- | ----------------------- | --------------------------------------- |
| TypeScript types/interfaces | typescript              | skills/typescript/SKILL.md              |
| JavaScript (ES2020+)        | javascript              | skills/javascript/SKILL.md              |
| React components/hooks      | react                   | skills/react/SKILL.md                   |
| Webpack build config        | webpack                 | skills/webpack/SKILL.md                 |
| Redux state / RTK Query     | redux-toolkit           | skills/redux-toolkit/SKILL.md           |
| MUI components/theming      | mui                     | skills/mui/SKILL.md                     |
| AG Grid tables              | ag-grid                 | skills/ag-grid/SKILL.md                 |
| MUI X Charts                | mui-x-charts            | skills/mui-x-charts/SKILL.md            |
| Forms with validation       | formik                  | skills/formik/SKILL.md                  |
| Validation schemas          | yup                     | skills/yup/SKILL.md                     |
| Commit messages, PRs, docs  | technical-communication | skills/technical-communication/SKILL.md |
| Code review                 | critical-partner        | skills/critical-partner/SKILL.md        |
| Document changes            | process-documentation   | skills/process-documentation/SKILL.md   |
| ESLint rules                | eslint                  | skills/eslint/SKILL.md                  |
| Prettier formatting         | prettier                | skills/prettier/SKILL.md                |
| Semantic HTML               | html                    | skills/html/SKILL.md                    |
| Accessibility               | a11y                    | skills/a11y/SKILL.md                    |
| Coding standards            | conventions             | skills/conventions/SKILL.md             |

## Supported Stack

- **Languages:** TypeScript 5.6.2, JavaScript (ES2020+)
- **Frameworks:** React 18.3.1, Webpack (latest)
- **State:** Redux 5.0.1, React-Redux 9.2.0, Redux Toolkit 2.5.1, RTK Query
- **UI:** MUI 5.15.14, MUI X Charts 7.7.1, MUI X Date Pickers Pro 5.0.20
- **Data:** AG Grid (latest stable)
- **Forms:** Formik 2.1.4, Yup 1.4.0
- **Build:** Webpack, ESLint, Prettier

## Workflows

### Feature Development

1. Gather requirements and clarify acceptance criteria
2. Design component architecture with TypeScript interfaces
3. Implement React components using MUI
4. Configure Redux Toolkit slices / RTK Query endpoints
5. Implement forms with Formik + Yup validation
6. Ensure accessibility (semantic HTML, ARIA, keyboard nav)
7. Test with strict TypeScript, document changes, request review

### Code Review

1. Verify strict TypeScript (no `any`, explicit return types)
2. Check MUI usage, theming consistency, accessibility
3. Review Redux patterns and RTK Query cache config
4. Confirm version compatibility with supported stack

## Policies

**Typing:** strict mode, no `any` (use `unknown`/generics), explicit return types, prefer interfaces

**Code quality:** ESLint with @typescript-eslint, Prettier integration, format before committing

**Accessibility:** Semantic MUI components, keyboard-accessible elements, proper heading hierarchy, labeled form fields

**Versions:**

- Exact: TypeScript 5.6.2, React 18.3.1, RTK 2.5.1, MUI 5.15.14, Formik 2.1.4, Yup 1.4.0
- Ranges: TS >=5.4 <6.0, React >=18.0 <19.0, RTK >=1.8 <3.0, MUI >=5.0 <6.0

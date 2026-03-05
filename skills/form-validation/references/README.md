# Form Validation References

> Deep-dive guides for specific validation libraries

## Quick Navigation

| Reference | Purpose | Read When |
| ---------------------------- | --------- | ------------- |
| [zod.md](zod.md) | TypeScript-first schema validation with automatic type inference | Using Zod in your project |
| [yup.md](yup.md) | Schema validation with intuitive API | Using Yup in your project |
| [react-hook-form.md](react-hook-form.md) | Performant React form management with minimal re-renders | Building forms in React (modern approach) |
| [formik.md](formik.md) | React form management with Yup integration | Using Formik (legacy projects) |

---

## Reading Strategy

### For Schema Validation Only (No Forms)

- **Zod project:** Read [zod.md](zod.md) only
- **Yup project:** Read [yup.md](yup.md) only
- **New project:** Read [zod.md](zod.md) (modern default)

### For React Forms

- **React Hook Form project:** MUST read [react-hook-form.md](react-hook-form.md) + schema library (zod.md or yup.md)
- **Formik project:** MUST read [formik.md](formik.md) + [yup.md](yup.md)
- **New React project:** Read [react-hook-form.md](react-hook-form.md) + [zod.md](zod.md) (modern default)

### For Node.js/Backend Validation

- **API validation:** Read [zod.md](zod.md) or [yup.md](yup.md) depending on project

---

## Library Comparison

| Feature | Zod | Yup | React Hook Form | Formik |
|---------|-----|-----|----------------|--------|
| **Type** | Schema validation | Schema validation | Form management | Form management |
| **TypeScript** | First-class, automatic | Good, manual types | Excellent | Good |
| **Performance** | Fast | Fast | Excellent (minimal re-renders) | Moderate (re-renders on each change) |
| **Bundle Size** | 13KB | 15KB | 9KB | 15KB |
| **Learning Curve** | Low | Low | Low | Medium |
| **React Integration** | Via resolver | Via validator | Native | Native |
| **Status** | Active (2021+) | Active (2016+) | Active (2019+) | Maintenance mode |
| **Best For** | TypeScript projects | Legacy projects | Modern React forms | Existing Formik codebases |

---

## Decision Guide

**Choose Zod when:**

- TypeScript project
- Need automatic type inference
- API validation or data parsing
- Modern stack

**Choose Yup when:**

- Legacy project already uses it
- Formik integration (built-in support)
- JavaScript-first project

**Choose React Hook Form when:**

- Building new React forms
- Performance is critical
- Want minimal re-renders
- Modern React (hooks-based)

**Choose Formik when:**

- Existing Formik codebase
- Migration risk is high
- Team familiar with Formik patterns

---

## Context-Aware Usage

**CRITICAL:** Always check project context before recommending:

1. Read `AGENTS.md` - lists installed skills
2. Check `package.json` - shows installed libraries
3. Use what exists - don't force new libraries
4. Only suggest alternatives if asked or if major issues exist

**Example:**

```json
// package.json shows:
"yup": "^1.3.0",
"formik": "^2.4.0"

// → Use Yup + Formik patterns, DON'T suggest Zod/RHF
```

---

## File Descriptions

### [zod.md](zod.md)

**TypeScript-first schema validation with Zod**

- Schema definition for primitives, objects, and arrays
- Automatic TypeScript type inference with z.infer
- Data parsing and transformation
- Error formatting and custom error messages
- Integration with React Hook Form via @hookform/resolvers

### [yup.md](yup.md)

**Schema validation with Yup**

- Schema builder API for objects and primitives
- Async validation support
- Conditional validation with .when()
- Integration with Formik via validationSchema

### [react-hook-form.md](react-hook-form.md)

**Performant React form management**

- register, handleSubmit, formState API
- Controlled vs uncontrolled field strategies
- Schema resolver integration (Zod, Yup)
- Field arrays and dynamic forms
- Performance optimization (minimal re-renders)

### [formik.md](formik.md)

**Formik React form management (legacy projects)**

- Formik setup with useFormik or Formik component
- Field-level and form-level validation
- Yup schema integration via validationSchema
- touched, errors, and isSubmitting state management

---

## Cross-Reference Map

- [zod.md](zod.md) → Extends SKILL.md Zod patterns; pairs with react-hook-form.md for modern React forms or used standalone for API validation
- [yup.md](yup.md) → Extends SKILL.md Yup patterns; pairs with formik.md for legacy projects
- [react-hook-form.md](react-hook-form.md) → Extends SKILL.md React Hook Form patterns; pairs with zod.md or yup.md for schema validation
- [formik.md](formik.md) → Extends SKILL.md Formik patterns; pairs with yup.md for legacy form management
- Related skills: [react](../../react/SKILL.md), [typescript](../../typescript/SKILL.md), [mui](../../mui/SKILL.md)

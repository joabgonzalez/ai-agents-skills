---
name: form-validation
description: "Form and schema validation across libraries. Trigger: When validating forms, API input, schemas, or runtime data."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Form Validation

Form/schema validation across Zod, Yup, React Hook Form, Formik. Context-aware.

## When to Use

- Validating user input (forms, API requests)
- Runtime schema validation
- Parsing external data with type safety
- Ensuring data conforms to types
- Managing form state with validation

Don't use when:

- Compile-time typing (typescript skill)
- Simple validation (<3 fields)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Check Context First

**ALWAYS check what the project uses before recommending a library:**

```typescript
// Step 1: Check AGENTS.md for installed skills
// Step 2: Check package.json for installed libraries
// Step 3: Use existing library, DON'T force new ones

// ✅ CORRECT: Context-aware
// If project has Zod → use Zod patterns
// If project has Yup → use Yup patterns
// If project has React Hook Form → use RHF patterns
// If project has Formik → use Formik patterns

// ❌ WRONG: Force new lib
// "Add Zod" when project uses Yup
// "Use RHF" when project uses Formik
```

### ✅ REQUIRED: Infer Types from Schemas

```typescript
// ✅ CORRECT: Schema as single source of truth
// Zod
const schema = z.object({ name: z.string() });
type User = z.infer<typeof schema>;

// Yup
const schema = yup.object({ name: yup.string().required() });
type User = yup.InferType<typeof schema>;

// ❌ WRONG: Separate interface (drifts)
interface User { name: string }
const schema = z.object({ name: z.string() });
```

### ✅ REQUIRED: Safe Error Handling

```typescript
// ✅ CORRECT: Non-throwing validation
// Zod
const result = schema.safeParse(data);
if (result.success) {
  use(result.data);
} else {
  handle(result.error);
}

// Yup
try {
  const valid = await schema.validate(data);
} catch (error) {
  if (error instanceof yup.ValidationError) {
    handle(error);
  }
}

// ❌ WRONG: Unhandled throws
const data = schema.parse(input); // May throw
```

### ✅ REQUIRED: Chain Validations

```typescript
// ✅ CORRECT: Multiple constraints
const email = z.string().email().min(5).max(100);
const email = yup.string().email().required().max(100);

// ❌ WRONG: Single validation
const email = z.string(); // Too permissive
```

---

## Decision Tree

```
Project has validation library?
→ Yes: Check AGENTS.md or package.json
  → Zod installed? → See references/zod.md
  → Yup installed? → See references/yup.md
  → React Hook Form? → See references/react-hook-form.md
  → Formik? → See references/formik.md
→ No: Recommend modern default (React Hook Form + Zod for React, Zod for Node.js)

Schema validation only (no forms)?
→ Use Zod or Yup (see references for library-specific patterns)

Form management needed (React)?
→ React Hook Form (modern, performant) or Formik (legacy support)
→ See references/react-hook-form.md or references/formik.md

Async validation required?
→ All libraries support it:
  - Zod: .parseAsync() or .refine() with async
  - Yup: .validate() is async
  - React Hook Form: resolver or custom async rules
  - Formik: validate prop with async function

Complex nested structures?
→ Zod: z.object() nesting
→ Yup: yup.object() nesting
→ React Hook Form: dot notation (user.address.street)
→ Formik: <FieldArray> or dot notation
```

---

## Example

**Context-aware validation setup:**

```typescript
// Check AGENTS.md first:
// "Skills: react, typescript, form-validation"
//
// Check package.json:
// "zod": "^3.22.0",
// "react-hook-form": "^7.48.0"
//
// → Use React Hook Form + Zod

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email').min(1, 'Required'),
  age: z.number().int().min(18, 'Must be 18+'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Edge Cases

**Multiple libs:** Use appropriate for context (Zod for API, Yup for legacy Formik).

**No library:** Recommend RHF + Zod (React) or Zod (Node.js).

**Migration:** One form/endpoint at a time. Don't mix within same form.

**TS strict:** All libs need `strict: true` in tsconfig.

---

## Resources

| Reference | When to Read |
|-----------|-------------|
| [references/zod.md](references/zod.md) | Using Zod for schema validation |
| [references/yup.md](references/yup.md) | Using Yup for validation |
| [references/react-hook-form.md](references/react-hook-form.md) | Using React Hook Form for forms |
| [references/formik.md](references/formik.md) | Using Formik for React forms |

**See [references/README.md](references/README.md) for complete navigation.**

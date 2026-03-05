---
name: yup
description: "Schema validation for JavaScript objects"
---

# Yup Validation

Schema-based validation for JavaScript and TypeScript with async support and built-in Formik integration. Best for legacy projects or when Formik is in use.

**Dependencies:**

```json
{
  "yup": ">=1.0.0 <2.0.0"
}
```

---

## Core Patterns

### ✅ REQUIRED: Use InferType for Type Extraction

```typescript
// ✅ CORRECT: Schema as source of truth
import * as yup from 'yup';

const userSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  age: yup.number().positive().integer(),
});

type User = yup.InferType<typeof userSchema>;
// Inferred: { name: string; email: string; age?: number }

// ❌ WRONG: Manual interface (can drift)
interface User {
  name: string;
  email: string;
  age: number;
}
```

### ✅ REQUIRED: Handle Validation Errors

```typescript
// ✅ CORRECT: Proper error handling
try {
  const validated = await userSchema.validate(data);
  console.log(validated);
} catch (error) {
  if (error instanceof yup.ValidationError) {
    console.error(error.message);
    console.error(error.path); // Field that failed
    console.error(error.errors); // Array of error messages
  }
}

// Get all errors (not just first)
try {
  await schema.validate(data, { abortEarly: false });
} catch (error) {
  if (error instanceof yup.ValidationError) {
    error.inner.forEach((err) => {
      console.log(err.path, err.message);
    });
  }
}
```

### ✅ REQUIRED: Chain Validations

```typescript
// ✅ CORRECT: Multiple constraints
const email = yup
  .string()
  .email('Invalid email format')
  .required('Email is required')
  .max(100, 'Email too long');

const password = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Must contain uppercase letter')
  .matches(/[0-9]/, 'Must contain number');

// ❌ WRONG: Single validation
const email = yup.string(); // Too permissive
```

---

## Common Validations

### String Validations

```typescript
yup.string(); // Any string
yup.string().min(3); // Min length
yup.string().max(20); // Max length
yup.string().length(10); // Exact length
yup.string().email(); // Valid email
yup.string().url(); // Valid URL
yup.string().matches(/^\d{3}-\d{3}-\d{4}$/); // Regex pattern
yup.string().trim(); // Trim whitespace
yup.string().lowercase(); // Transform to lowercase
yup.string().uppercase(); // Transform to uppercase
yup.string().required(); // Not empty/null/undefined
```

### Number Validations

```typescript
yup.number(); // Any number
yup.number().integer(); // Integer only
yup.number().positive(); // > 0
yup.number().negative(); // < 0
yup.number().min(18); // Minimum value
yup.number().max(65); // Maximum value
yup.number().lessThan(100); // < value
yup.number().moreThan(0); // > value
yup.number().required(); // Not null/undefined
```

### Optional and Nullable

```typescript
yup.string().notRequired(); // undefined allowed
yup.string().nullable(); // null allowed
yup.string().optional(); // Alias for .notRequired()
yup.string().default('N/A'); // Default value
yup.string().defined(); // Not undefined (null allowed)
```

### Arrays and Objects

```typescript
// Array validation
const tagsSchema = yup.array()
  .of(yup.string())
  .min(1, 'At least one tag required')
  .max(5, 'Maximum 5 tags');

// Nested object
const addressSchema = yup.object({
  street: yup.string().required(),
  city: yup.string().required(),
  zipCode: yup.string().matches(/^\d{5}$/),
});

const userSchema = yup.object({
  name: yup.string().required(),
  address: addressSchema,
});
```

---

## Advanced Patterns

### Conditional Validation (when)

```typescript
// Dependent field validation
const schema = yup.object({
  isCompany: yup.boolean(),
  companyName: yup.string().when('isCompany', {
    is: true,
    then: (schema) => schema.required('Company name required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// Multiple conditions
const schema = yup.object({
  age: yup.number(),
  driversLicense: yup.string().when('age', {
    is: (age: number) => age >= 16,
    then: (schema) => schema.required(),
  }),
});
```

### Custom Test Methods

```typescript
// Single custom validation
const usernameSchema = yup
  .string()
  .test('unique-username', 'Username already taken', async (value) => {
    if (!value) return true; // Skip if empty (let required() handle)
    const available = await checkUsernameAvailable(value);
    return available;
  });

// Multiple tests
const passwordSchema = yup
  .string()
  .test('has-uppercase', 'Must contain uppercase', (val) => /[A-Z]/.test(val))
  .test('has-number', 'Must contain number', (val) => /[0-9]/.test(val));
```

### Transform Values

```typescript
// Transform during validation
const trimmedString = yup
  .string()
  .transform((value) => (value ? value.trim() : value));

const numberFromString = yup
  .string()
  .transform((value) => (value ? Number.parseInt(value, 10) : value));

// Transform object
const schema = yup.object({
  name: yup.string().trim().lowercase(),
  tags: yup.array().transform((val) => val || []), // Default to empty array
});
```

### Schema Composition

```typescript
// Base schema
const basePersonSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
});

// Extend with concat
const employeeSchema = basePersonSchema.concat(
  yup.object({
    employeeId: yup.string().required(),
    department: yup.string().required(),
  })
);

// Reusable schemas
const emailField = yup.string().email().required();
const passwordField = yup.string().min(8).required();

const loginSchema = yup.object({
  email: emailField,
  password: passwordField,
});
```

---

## Error Handling

### Validation Options

```typescript
// Get all errors (not just first)
try {
  await schema.validate(data, { abortEarly: false });
} catch (error) {
  // error.inner contains all validation errors
}

// Strip unknown keys (default behavior)
await schema.validate(data, { stripUnknown: true });

// Strict mode (error on unknown keys)
await schema.validate(data, { strict: true });

// Context for conditional validation
await schema.validate(data, { context: { userId: 123 } });
```

### Custom Error Messages

```typescript
const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),

  age: yup
    .number()
    .required('Age is required')
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Please enter a valid age'),
});
```

---

## Integration Examples

### Formik + Yup (Native Integration)

```typescript
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(8, 'Too short').required('Required'),
});

function LoginForm() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => console.log(values)}
    >
      {({ errors, touched }) => (
        <Form>
          <Field name="email" type="email" />
          {errors.email && touched.email && <div>{errors.email}</div>}

          <Field name="password" type="password" />
          {errors.password && touched.password && <div>{errors.password}</div>}

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
```

### React Hook Form + Yup

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

type FormData = yup.InferType<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Express API Validation

```typescript
import * as yup from 'yup';
import { Request, Response, NextFunction } from 'express';

const createUserSchema = yup.object({
  body: yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    age: yup.number().positive().integer(),
  }),
});

async function validateRequest(schema: yup.Schema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({ body: req.body }, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  };
}

app.post('/users', validateRequest(createUserSchema), (req, res) => {
  const user = req.body; // Validated
  res.json({ success: true });
});
```

---

## Edge Cases

**Circular references:** Use `yup.lazy()` for recursive schemas.

```typescript
interface Category {
  name: string;
  subcategories: Category[];
}

const categorySchema: yup.Schema<Category> = yup.object({
  name: yup.string().required(),
  subcategories: yup.lazy(() => yup.array(categorySchema)),
});
```

**Nullable vs notRequired:** `.nullable()` allows `null`, `.notRequired()` allows `undefined`.

```typescript
yup.string().nullable(); // string | null
yup.string().notRequired(); // string | undefined
yup.string().nullable().notRequired(); // string | null | undefined
```

**Strict mode:** By default, Yup removes unknown keys. Use `.strict()` to throw error.

```typescript
const strict = schema.strict(); // Throws on unknown keys
```

**Synchronous validation:** Use `.validateSync()` — async tests not allowed.

```typescript
try {
  const valid = schema.validateSync(data);
} catch (error) {
  // Handle error
}
```

---

## Migration from Zod

| Zod | Yup |
|-----|-----|
| `z.string()` | `yup.string()` |
| `z.number()` | `yup.number()` |
| `z.object({ ... })` | `yup.object({ ... })` |
| `z.array(schema)` | `yup.array().of(schema)` |
| `.optional()` | `.notRequired()` or `.optional()` |
| `.nullable()` | `.nullable()` |
| `.default(val)` | `.default(val)` |
| `z.infer<typeof schema>` | `yup.InferType<typeof schema>` |
| `.parse()` | `.validateSync()` |
| `.safeParse()` | `try/catch with .validate()` |
| `.refine()` | `.test()` |
| `.transform()` | `.transform()` |

---

## Related Topics

- See [formik.md](formik.md) for Formik integration patterns
- See [react-hook-form.md](react-hook-form.md) for React Hook Form integration
- See [zod.md](zod.md) for Zod comparison

---

## References

- [Yup Documentation](https://github.com/jquense/yup)
- [Yup API Reference](https://github.com/jquense/yup#api)

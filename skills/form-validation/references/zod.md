# Zod Validation

Runtime validation with compile-time type safety through automatic type inference. Best for TypeScript projects needing both validation and types from a single source.

**Dependencies:**

```json
{
  "zod": ">=3.0.0 <4.0.0"
}
```

---

## Core Patterns

### ✅ REQUIRED: Use z.infer for Type Extraction

```typescript
// ✅ CORRECT: Schema as source of truth
import { z } from 'zod';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive(),
});

type User = z.infer<typeof userSchema>;
// Auto-inferred: { name: string; email: string; age: number }

// ❌ WRONG: Manual type (can drift from schema)
interface User {
  name: string;
  email: string;
  age: number;
}
const userSchema = z.object({ /* ... */ });
```

### ✅ REQUIRED: Use safeParse for Error Handling

```typescript
// ✅ CORRECT: Non-throwing validation
const result = userSchema.safeParse(data);

if (result.success) {
  const validated: User = result.data;
  // Process validated data
} else {
  console.error(result.error.format());
  // { name: { _errors: ['Required'] }, email: { _errors: ['Invalid'] } }
}

// ❌ WRONG: parse() throws exception
try {
  const data = userSchema.parse(input); // Throws ValidationError
} catch (error) {
  // Requires try/catch everywhere
}
```

### ✅ REQUIRED: Chain Validations

```typescript
// ✅ CORRECT: Multiple constraints
const email = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(100, 'Email too long')
  .toLowerCase(); // Transform to lowercase

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain number');

// ❌ WRONG: Single validation
const email = z.string(); // Too permissive
```

### Custom Refinements

```typescript
// Custom validation logic
const passwordSchema = z
  .string()
  .refine((val) => val.length >= 8, {
    message: 'Password must be at least 8 characters',
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain uppercase letter',
  });

// Multi-field refinement
const signupSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Error location
  });
```

---

## Common Validations

### String Validations

```typescript
z.string(); // Any string
z.string().min(3); // Min length
z.string().max(20); // Max length
z.string().length(10); // Exact length
z.string().email(); // Valid email
z.string().url(); // Valid URL
z.string().uuid(); // UUID format
z.string().regex(/^\d{3}-\d{3}-\d{4}$/); // Phone pattern
z.string().startsWith('https://'); // Prefix check
z.string().endsWith('.com'); // Suffix check
z.string().trim(); // Trim whitespace
z.string().toLowerCase(); // Transform to lowercase
z.string().nonempty(); // Alias for .min(1)
```

### Number Validations

```typescript
z.number(); // Any number
z.number().int(); // Integer only
z.number().positive(); // > 0
z.number().nonnegative(); // >= 0
z.number().negative(); // < 0
z.number().min(18); // Minimum value
z.number().max(65); // Maximum value
z.number().multipleOf(5); // Divisible by 5
z.coerce.number(); // Parse string to number ("42" → 42)
```

### Optional and Nullable

```typescript
z.string().optional(); // string | undefined
z.string().nullable(); // string | null
z.string().nullish(); // string | null | undefined
z.string().default('N/A'); // Provides default if undefined
```

### Arrays and Objects

```typescript
// Array of items
const tagsSchema = z.array(z.string())
  .min(1, 'At least one tag required')
  .max(5, 'Maximum 5 tags')
  .nonempty(); // Alias for .min(1)

// Nested object
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
});

const userSchema = z.object({
  name: z.string(),
  address: addressSchema, // Nested
});
```

### Union and Enum

```typescript
// Union types
const idSchema = z.union([z.string(), z.number()]);
// string | number

// Enum (literal values)
const statusSchema = z.enum(['pending', 'active', 'archived']);
// 'pending' | 'active' | 'archived'

// Discriminated union (better performance)
const eventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('click'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('keypress'), key: z.string() }),
]);
```

---

## Advanced Patterns

### Transforms

```typescript
// Transform during validation
const dateSchema = z.string().transform((str) => new Date(str));
// Input: "2024-01-01" → Output: Date object

const trimmedString = z.string().transform((s) => s.trim().toLowerCase());

// Chaining transform with validation
const ageSchema = z
  .string()
  .transform((val) => Number.parseInt(val, 10))
  .pipe(z.number().int().min(0).max(120));
```

### Async Validation

```typescript
const usernameSchema = z.string().refine(
  async (username) => {
    const available = await checkUsernameAvailable(username);
    return available;
  },
  { message: 'Username already taken' }
);

// Use parseAsync
const result = await usernameSchema.safeParseAsync('john_doe');
```

### Recursive Schemas (Circular References)

```typescript
interface Category {
  name: string;
  subcategories: Category[];
}

const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(categorySchema),
  })
);
```

### Partial and Pick

```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});

// All fields optional
const partialUser = userSchema.partial();
// { name?: string; email?: string; age?: number }

// Select specific fields
const userCredentials = userSchema.pick({ email: true, password: true });
// { email: string; password: string }

// Omit specific fields
const publicUser = userSchema.omit({ password: true });
```

---

## Error Handling

### Format Errors

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  // Formatted nested errors
  const formatted = result.error.format();
  // { email: { _errors: ['Invalid email'] }, age: { _errors: ['Too young'] } }

  // Flattened errors
  const flattened = result.error.flatten();
  // { formErrors: [], fieldErrors: { email: ['Invalid email'], age: ['Too young'] } }

  // Array of issues
  const issues = result.error.issues;
  // [{ code: 'invalid_string', path: ['email'], message: '...' }]
}
```

### Custom Error Messages

```typescript
const schema = z.object({
  email: z.string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email format' }),

  age: z.number({ invalid_type_error: 'Age must be a number' })
    .min(18, { message: 'Must be 18 or older' }),
});
```

---

## Integration Examples

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
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
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().positive(),
  }),
});

function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body });

    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    next();
  };
}

app.post('/users', validateRequest(createUserSchema), (req, res) => {
  // req.body is validated and type-safe here
  const user = req.body;
});
```

---

## Edge Cases

**Coercion from strings:** Use `z.coerce.number()` for form inputs that arrive as strings but need numbers.

```typescript
const schema = z.object({
  age: z.coerce.number().int().min(18),
});
// "25" → 25 (number)
```

**Unknown keys:** By default, Zod strips unknown keys. Use `.passthrough()` to keep them or `.strict()` to throw error.

```typescript
const strict = schema.strict(); // Throws on unknown keys
const passthrough = schema.passthrough(); // Keeps unknown keys
```

**Discriminated unions:** Use `.discriminatedUnion()` for better performance with large unions.

```typescript
z.discriminatedUnion('type', [
  z.object({ type: z.literal('success'), data: z.any() }),
  z.object({ type: z.literal('error'), message: z.string() }),
]);
```

---

## Related Topics

- See [react-hook-form.md](react-hook-form.md) for React form integration
- See [yup.md](yup.md) for Yup comparison and migration
- See main [form-validation/SKILL.md](../SKILL.md) for decision tree

---

## References

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)

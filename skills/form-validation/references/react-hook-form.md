# React Hook Form

Performant form state management with uncontrolled components and minimal re-renders. Best for modern React applications prioritizing performance.

**Dependencies:**

```json
{
  "react-hook-form": "^7.0.0",
  "react": ">=16.8.0"
}
```

**Optional resolvers:**

```json
{
  "@hookform/resolvers": "^3.0.0",  // For Zod/Yup integration
  "zod": "^3.0.0",                  // Recommended
  "yup": "^1.0.0"                   // Alternative
}
```

---

## Core Patterns

### ✅ REQUIRED: Use register for Inputs

```typescript
// ✅ CORRECT: Uncontrolled inputs with register
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('email')} />
      <input {...register('password')} />
      <button type="submit">Submit</button>
    </form>
  );
}

// ❌ WRONG: Controlled inputs (unnecessary re-renders)
function MyForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
    </form>
  );
}
```

### ✅ REQUIRED: Use Resolver for Validation

```typescript
// ✅ CORRECT: Schema validation with resolver
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email').min(1, 'Required'),
  password: z.string().min(8, 'Too short'),
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

      <button type="submit">Submit</button>
    </form>
  );
}

// ❌ WRONG: Manual validation (verbose, error-prone)
const { register, handleSubmit } = useForm({
  validate: (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Required';
    return errors;
  },
});
```

### ✅ REQUIRED: Access Form State via formState

```typescript
// ✅ CORRECT: Destructure formState properties
const { formState: { errors, isSubmitting, isDirty, isValid } } = useForm();

return (
  <form>
    {errors.email && <span>{errors.email.message}</span>}
    <button type="submit" disabled={isSubmitting || !isValid}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  </form>
);

// ❌ WRONG: Accessing formState directly re-renders on every change
const { formState } = useForm();
console.log(formState.errors); // Triggers re-render
```

---

## Common Patterns

### Type-Safe Forms

```typescript
import { useForm, SubmitHandler } from 'react-hook-form';

interface FormData {
  email: string;
  age: number;
  acceptTerms: boolean;
}

function MyForm() {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data.email); // Type-safe: string
    console.log(data.age); // Type-safe: number
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <input type="number" {...register('age', { valueAsNumber: true })} />
      <input type="checkbox" {...register('acceptTerms')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Default Values

```typescript
// Provide defaults on initialization
const { register } = useForm({
  defaultValues: {
    email: 'user@example.com',
    age: 25,
    acceptTerms: false,
  },
});

// Async default values
const { register } = useForm({
  defaultValues: async () => {
    const response = await fetch('/api/user');
    return response.json();
  },
});
```

### Validation Rules

```typescript
// Built-in validation
<input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email',
    },
    minLength: {
      value: 5,
      message: 'Too short',
    },
    maxLength: {
      value: 100,
      message: 'Too long',
    },
  })}
/>

// Custom validation
<input
  {...register('username', {
    validate: async (value) => {
      const available = await checkUsername(value);
      return available || 'Username taken';
    },
  })}
/>

// Multiple validation functions
<input
  {...register('password', {
    validate: {
      hasUppercase: (v) => /[A-Z]/.test(v) || 'Need uppercase',
      hasNumber: (v) => /[0-9]/.test(v) || 'Need number',
      minLength: (v) => v.length >= 8 || 'Too short',
    },
  })}
/>
```

### Nested Fields

```typescript
// Dot notation for nested objects
const { register } = useForm({
  defaultValues: {
    user: {
      firstName: '',
      lastName: '',
      address: {
        street: '',
        city: '',
      },
    },
  },
});

<input {...register('user.firstName')} />
<input {...register('user.address.street')} />
```

### Dynamic Fields (Arrays)

```typescript
import { useFieldArray } from 'react-hook-form';

function DynamicForm() {
  const { register, control } = useForm({
    defaultValues: {
      users: [{ name: '', email: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'users',
  });

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`users.${index}.name`)} />
          <input {...register(`users.${index}.email`)} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={() => append({ name: '', email: '' })}>
        Add User
      </button>
    </form>
  );
}
```

---

## Advanced Patterns

### Watched Values

```typescript
// Watch specific field
const email = watch('email');
console.log(email); // Current value

// Watch all fields
const values = watch();
console.log(values); // { email: '...', password: '...' }

// Watch with callback
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log(`${name} changed:`, value);
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

### Controlled Components

```typescript
// For libraries that require controlled inputs (MUI, etc.)
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

function MyForm() {
  const { control } = useForm();

  return (
    <form>
      <Controller
        name="email"
        control={control}
        rules={{ required: 'Required' }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Email"
            error={!!error}
            helperText={error?.message}
          />
        )}
      />
    </form>
  );
}
```

### Async Submission

```typescript
const onSubmit: SubmitHandler<FormData> = async (data) => {
  try {
    await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    toast.success('Success!');
  } catch (error) {
    toast.error('Failed to submit');
  }
};

// Form shows loading state
const { formState: { isSubmitting } } = useForm();

<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
```

### Reset Form

```typescript
const { reset, handleSubmit } = useForm();

// Reset to default values
<button type="button" onClick={() => reset()}>Reset</button>

// Reset with new values
<button type="button" onClick={() => reset({ email: 'new@example.com' })}>
  Reset with data
</button>

// Reset after successful submit
const onSubmit = async (data) => {
  await submitForm(data);
  reset();
};
```

### Set Values Programmatically

```typescript
const { setValue, getValues } = useForm();

// Set single value
setValue('email', 'user@example.com');

// Set with validation
setValue('email', 'user@example.com', {
  shouldValidate: true,
  shouldDirty: true,
  shouldTouch: true,
});

// Get current values
const currentEmail = getValues('email');
const allValues = getValues();
```

---

## Integration Examples

### With Zod (Recommended)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email').min(1, 'Required'),
  age: z.number().int().min(18, 'Must be 18+'),
  terms: z.boolean().refine(val => val === true, 'Must accept terms'),
});

type FormData = z.infer<typeof schema>;

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <input type="checkbox" {...register('terms')} />
      {errors.terms && <span>{errors.terms.message}</span>}

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### With Yup

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

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### With MUI (Material-UI)

```typescript
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().min(1),
  name: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

function MuiForm() {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Email"
            fullWidth
            error={!!error}
            helperText={error?.message}
          />
        )}
      />

      <Controller
        name="name"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Name"
            fullWidth
            error={!!error}
            helperText={error?.message}
          />
        )}
      />

      <Button type="submit" variant="contained">
        Submit
      </Button>
    </form>
  );
}
```

---

## Performance

### Minimize Re-Renders

```typescript
// ✅ CORRECT: Isolate error access
const { formState: { errors } } = useForm();
// Only re-renders when errors change

// ❌ WRONG: Access formState directly
const { formState } = useForm();
console.log(formState.errors); // Re-renders on every change
```

### Validation Timing (mode)

```typescript
// Validate on submit (default, best performance)
const { register } = useForm({ mode: 'onSubmit' });

// Validate on blur (good UX)
const { register } = useForm({ mode: 'onBlur' });

// Validate on change (immediate feedback, more re-renders)
const { register } = useForm({ mode: 'onChange' });

// Validate on touch then change
const { register } = useForm({ mode: 'onTouched' });
```

---

## Edge Cases

**File uploads:** Use `register` with `onChange` handler.

```typescript
<input
  type="file"
  {...register('avatar')}
  onChange={(e) => {
    const file = e.target.files?.[0];
    setValue('avatar', file);
  }}
/>
```

**Checkboxes and radio groups:** Use proper types.

```typescript
// Single checkbox
<input type="checkbox" {...register('terms')} />

// Checkbox group
<input type="checkbox" value="red" {...register('colors')} />
<input type="checkbox" value="blue" {...register('colors')} />
// Result: { colors: ['red', 'blue'] }

// Radio group
<input type="radio" value="male" {...register('gender')} />
<input type="radio" value="female" {...register('gender')} />
// Result: { gender: 'male' }
```

**Number inputs:** Use `valueAsNumber` to parse as number.

```typescript
<input type="number" {...register('age', { valueAsNumber: true })} />
// Result: { age: 25 } (number, not string)
```

**Date inputs:** Use `valueAsDate` to parse as Date object.

```typescript
<input type="date" {...register('birthday', { valueAsDate: true })} />
// Result: { birthday: Date object }
```

---

## Migration from Formik

| Formik | React Hook Form |
|--------|----------------|
| `<Formik>` wrapper | `useForm()` hook |
| `<Field>` | `{...register()}` spread |
| `<ErrorMessage>` | `{errors.field?.message}` |
| `values` | `getValues()` or `watch()` |
| `setFieldValue` | `setValue()` |
| `resetForm()` | `reset()` |
| `isSubmitting` | `formState.isSubmitting` |
| `touched` | `formState.touchedFields` |
| `validationSchema` | `resolver` option |

---

## Related Topics

- See [zod.md](zod.md) for Zod validation patterns
- See [yup.md](yup.md) for Yup validation patterns
- See [formik.md](formik.md) for Formik comparison
- See main [form-validation/SKILL.md](../SKILL.md) for decision tree

---

## References

- [React Hook Form Documentation](https://react-hook-form.com/)
- [React Hook Form API](https://react-hook-form.com/api)
- [Resolvers](https://github.com/react-hook-form/resolvers)

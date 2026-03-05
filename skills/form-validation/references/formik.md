# Formik

React form state management with built-in Yup validation support. Best for legacy projects or teams familiar with Formik patterns.

**Dependencies:**

```json
{
  "formik": ">=2.0.0 <3.0.0",
  "react": ">=16.8.0",
  "yup": ">=1.0.0 <2.0.0"  // Recommended for validation
}
```

**Status:** Maintenance mode (prefer React Hook Form for new projects)

---

## Core Patterns

### ✅ REQUIRED: Use Yup for Validation

```typescript
// ✅ CORRECT: Schema-based validation
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Too short').required('Required'),
});

function MyForm() {
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

// ❌ WRONG: Manual validation (verbose, error-prone)
<Formik
  validate={(values) => {
    const errors = {};
    if (!values.email) errors.email = 'Required';
    if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid';
    return errors;
  }}
/>
```

### ✅ REQUIRED: Show Errors Only After Touch

```typescript
// ✅ CORRECT: Check both errors and touched
{errors.email && touched.email && <div>{errors.email}</div>}

// ❌ WRONG: Show errors immediately (poor UX)
{errors.email && <div>{errors.email}</div>}
```

### ✅ REQUIRED: Associate Labels with Inputs

```typescript
// ✅ CORRECT: Accessibility with htmlFor
<label htmlFor="email">Email</label>
<Field id="email" name="email" type="email" />

// ❌ WRONG: No label association (inaccessible)
<div>Email</div>
<Field name="email" type="email" />
```

---

## Common Patterns

### Type-Safe Forms

```typescript
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

const validationSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
  remember: Yup.boolean(),
});

function LoginForm() {
  const initialValues: FormValues = {
    email: '',
    password: '',
    remember: false,
  };

  const handleSubmit = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    console.log(values);
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="email" type="email" />
          <Field name="password" type="password" />
          <Field name="remember" type="checkbox" />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

### Initial Values

```typescript
// Static initial values
<Formik
  initialValues={{
    email: 'user@example.com',
    age: 25,
  }}
  onSubmit={handleSubmit}
>
  {/* form */}
</Formik>

// Dynamic initial values (from API)
function EditUserForm({ userId }: { userId: string }) {
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setInitialValues(data));
  }, [userId]);

  if (!initialValues) return <div>Loading...</div>;

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize // Re-initialize when initialValues change
      onSubmit={handleSubmit}
    >
      {/* form */}
    </Formik>
  );
}
```

### Nested Fields

```typescript
// Nested object structure
<Formik
  initialValues={{
    user: {
      firstName: '',
      lastName: '',
      address: {
        street: '',
        city: '',
      },
    },
  }}
  onSubmit={handleSubmit}
>
  {() => (
    <Form>
      <Field name="user.firstName" />
      <Field name="user.lastName" />
      <Field name="user.address.street" />
      <Field name="user.address.city" />
    </Form>
  )}
</Formik>
```

### Dynamic Fields (Arrays)

```typescript
import { Formik, Form, Field, FieldArray } from 'formik';

function DynamicForm() {
  return (
    <Formik
      initialValues={{
        friends: [''],
      }}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form>
          <FieldArray name="friends">
            {({ push, remove }) => (
              <div>
                {values.friends.map((friend, index) => (
                  <div key={index}>
                    <Field name={`friends.${index}`} />
                    <button type="button" onClick={() => remove(index)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => push('')}>
                  Add Friend
                </button>
              </div>
            )}
          </FieldArray>
        </Form>
      )}
    </Formik>
  );
}
```

---

## Advanced Patterns

### Custom Field Components

```typescript
import { Field, FieldProps } from 'formik';

// Custom input component
function CustomInput({ field, form, ...props }: FieldProps & { label: string }) {
  const hasError = form.touched[field.name] && form.errors[field.name];

  return (
    <div>
      <label htmlFor={field.name}>{props.label}</label>
      <input {...field} {...props} />
      {hasError && <div className="error">{form.errors[field.name]}</div>}
    </div>
  );
}

// Usage
<Field name="email" component={CustomInput} label="Email" type="email" />
```

### Async Validation

```typescript
// Async field validation
const validationSchema = Yup.object({
  username: Yup.string()
    .required()
    .test('unique-username', 'Username taken', async (value) => {
      if (!value) return true;
      const available = await checkUsernameAvailability(value);
      return available;
    }),
});

// Async submit validation
<Formik
  initialValues={initialValues}
  validate={async (values) => {
    const errors = {};
    const usernameAvailable = await checkUsername(values.username);
    if (!usernameAvailable) {
      errors.username = 'Username taken';
    }
    return errors;
  }}
  onSubmit={handleSubmit}
>
  {/* form */}
</Formik>
```

### Form-Level Actions

```typescript
function MyForm() {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, isSubmitting, setFieldValue, resetForm }) => (
        <Form>
          <Field name="email" />

          {/* Set value programmatically */}
          <button
            type="button"
            onClick={() => setFieldValue('email', 'new@example.com')}
          >
            Prefill Email
          </button>

          {/* Reset form */}
          <button type="button" onClick={() => resetForm()}>
            Reset
          </button>

          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>

          {/* Debug */}
          <pre>{JSON.stringify({ values, errors, touched }, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  );
}
```

### Conditional Fields

```typescript
const validationSchema = Yup.object({
  accountType: Yup.string().required(),
  companyName: Yup.string().when('accountType', {
    is: 'business',
    then: (schema) => schema.required('Company name required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

function ConditionalForm() {
  return (
    <Formik
      initialValues={{ accountType: 'personal', companyName: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form>
          <Field as="select" name="accountType">
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </Field>

          {values.accountType === 'business' && (
            <Field name="companyName" placeholder="Company Name" />
          )}

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
```

---

## Integration Examples

### With Material-UI

```typescript
import { Formik, Form, Field } from 'formik';
import { TextField } from '@mui/material';
import * as Yup from 'yup';

function MuiFormikForm() {
  return (
    <Formik
      initialValues={{ email: '', name: '' }}
      validationSchema={Yup.object({
        email: Yup.string().email().required(),
        name: Yup.string().required(),
      })}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, handleChange, values }) => (
        <Form>
          <TextField
            name="email"
            label="Email"
            value={values.email}
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            fullWidth
          />

          <TextField
            name="name"
            label="Name"
            value={values.name}
            onChange={handleChange}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
            fullWidth
          />

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
```

### With File Upload

```typescript
function FileUploadForm() {
  return (
    <Formik
      initialValues={{ file: null }}
      validationSchema={Yup.object({
        file: Yup.mixed()
          .required('File is required')
          .test('fileSize', 'File too large', (value) => {
            return value && value.size <= 5000000; // 5MB
          })
          .test('fileType', 'Unsupported format', (value) => {
            return value && ['image/jpeg', 'image/png'].includes(value.type);
          }),
      })}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, errors, touched }) => (
        <Form>
          <input
            type="file"
            name="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setFieldValue('file', file);
            }}
          />
          {errors.file && touched.file && <div>{errors.file}</div>}

          <button type="submit">Upload</button>
        </Form>
      )}
    </Formik>
  );
}
```

### With Multi-Step Form

```typescript
function MultiStepForm() {
  const [step, setStep] = useState(1);

  const step1Schema = Yup.object({
    email: Yup.string().email().required(),
  });

  const step2Schema = Yup.object({
    password: Yup.string().min(8).required(),
  });

  return (
    <Formik
      initialValues={{ email: '', password: '', name: '' }}
      validationSchema={step === 1 ? step1Schema : step2Schema}
      onSubmit={(values) => {
        if (step < 2) {
          setStep(step + 1);
        } else {
          console.log('Final submit:', values);
        }
      }}
    >
      {({ isValid }) => (
        <Form>
          {step === 1 && (
            <div>
              <Field name="email" type="email" placeholder="Email" />
            </div>
          )}

          {step === 2 && (
            <div>
              <Field name="password" type="password" placeholder="Password" />
              <Field name="name" placeholder="Name" />
            </div>
          )}

          <div>
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button type="submit" disabled={!isValid}>
              {step < 2 ? 'Next' : 'Submit'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
```

---

## Performance

**Re-render behavior:** Formik re-renders the entire form on every field change. For large forms (50+ fields), consider React Hook Form.

**FastField:** Use `<FastField>` for independent fields that don't depend on other values.

```typescript
import { FastField } from 'formik';

// Only re-renders when its own value/error/touched changes
<FastField name="independentField" />
```

---

## Edge Cases

**Reset form after submit:**

```typescript
const handleSubmit = async (values, { resetForm, setSubmitting }) => {
  await submitForm(values);
  resetForm();
  setSubmitting(false);
};
```

**Server-side validation errors:**

```typescript
const handleSubmit = async (values, { setErrors, setSubmitting }) => {
  try {
    await submitForm(values);
  } catch (error) {
    setErrors({
      email: 'Email already exists',
      password: 'Password too weak',
    });
  } finally {
    setSubmitting(false);
  }
};
```

**Validate on mount:**

```typescript
<Formik
  initialValues={initialValues}
  validationSchema={validationSchema}
  validateOnMount
  onSubmit={handleSubmit}
>
  {/* form */}
</Formik>
```

---

## Migration to React Hook Form

| Formik | React Hook Form |
|--------|----------------|
| `<Formik>` wrapper | `useForm()` hook |
| `<Field name="email" />` | `<input {...register('email')} />` |
| `<ErrorMessage name="email" />` | `{errors.email?.message}` |
| `values.email` | `watch('email')` or `getValues('email')` |
| `setFieldValue('email', val)` | `setValue('email', val)` |
| `resetForm()` | `reset()` |
| `isSubmitting` | `formState.isSubmitting` |
| `touched.email` | `formState.touchedFields.email` |
| `validationSchema` (Yup) | `resolver: yupResolver(schema)` |

**Migration strategy:**

1. Migrate one form at a time
2. Start with simple forms
3. Use same validation schema (Yup) with `yupResolver`
4. Test thoroughly before migrating complex forms

---

## Related Topics

- See [yup.md](yup.md) for Yup validation patterns (Formik's default)
- See [react-hook-form.md](react-hook-form.md) for modern alternative
- See main [form-validation/SKILL.md](../SKILL.md) for decision tree

---

## References

- [Formik Documentation](https://formik.org/docs/overview)
- [Formik API Reference](https://formik.org/docs/api/formik)
- [Formik + Yup](https://formik.org/docs/guides/validation#validationschema)

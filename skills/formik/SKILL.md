---
name: formik
description: Skill for building and managing forms in React applications using Formik, with best practices for validation, accessibility, and integration. General conventions and accessibility delegated to conventions and a11y skills.
skills:
  - conventions
  - a11y
  - react
  - yup
dependencies:
  formik: ">=2.0.0 <3.0.0"
  yup: ">=1.0.0 <2.0.0"
  react: ">=17.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# Formik Skill

## Overview

This skill provides guidance for building forms with Formik in React applications, including validation with Yup, accessibility patterns, and integration with UI libraries.

## Objective

Enable developers to create robust, accessible forms using Formik with proper validation, error handling, and user feedback.

## Conventions

Refer to conventions for:

- Code organization
- Error handling

Refer to a11y for:

- Form labels
- Error announcements
- Keyboard navigation

### Formik Specific

- Use Yup for validation schemas
- Implement proper error messages
- Handle submission states (loading, success, error)
- Use Field components for better performance
- Associate labels with inputs properly

## Example

```typescript
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Too short').required('Required')
});

<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={validationSchema}
  onSubmit={(values) => console.log(values)}
>
  {({ errors, touched }) => (
    <Form>
      <Field name="email" type="email" />
      {errors.email && touched.email && <div>{errors.email}</div>}
      <button type="submit">Submit</button>
    </Form>
  )}
</Formik>
```

## Edge Cases

- Handle async validation
- Manage complex nested forms
- Reset forms after submission
- Handle file uploads

## References

- https://formik.org/docs/overview
- https://github.com/jquense/yup

# Server Actions

> Type-safe server actions for form handling

## When to Read This

- Building forms with server-side validation
- Handling form submissions
- Progressive enhancement

---

## Define Actions

```typescript
// src/actions/index.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
  newsletter: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
    }),
    handler: async ({ email }) => {
      await subscribeToNewsletter(email);
      return { success: true };
    },
  }),

  login: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    handler: async ({ email, password }, context) => {
      const user = await authenticateUser(email, password);
      if (!user) throw new Error("Invalid credentials");

      // Set cookie
      context.cookies.set("auth_token", generateToken(user), {
        httpOnly: true,
        secure: true,
      });

      return { user };
    },
  }),
};
```

---

## Use in Forms

```astro
---
import { actions } from 'astro:actions';
---

<form method="POST" action={actions.newsletter}>
  <input type="email" name="email" required />
  <button type="submit">Subscribe</button>
</form>
```

---

## With Client-Side Enhancement

```astro
<form method="POST" action={actions.login}>
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  <button type="submit">Login</button>
</form>

<script>
  import { actions } from 'astro:actions';

  const form = document.querySelector('form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { data, error } = await actions.login(formData);

    if (error) {
      alert(error.message);
    } else {
      window.location.href = '/dashboard';
    }
  });
</script>
```

---

## References

- [Astro Actions](https://docs.astro.build/en/guides/actions/)

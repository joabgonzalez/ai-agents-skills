---
name: react-testing-library
description: "User-centric React component testing. Trigger: When testing React components with RTL."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - react
    - jest
  dependencies:
    "@testing-library/react": ">=14.0.0 <15.0.0"
---

# React Testing Library Skill

Tests components the way users interact with them -- querying by accessible roles and text, not implementation details.

## When to Use

- Testing React components from the user's perspective
- Simulating user interactions (clicks, typing, forms)
- Writing tests that survive internal refactors

Don't use for:
- Pure function or service logic (use jest skill)
- E2E multi-page flows (use Playwright or Cypress)

## Critical Patterns

### render + screen Queries

```typescript
// CORRECT: use screen for all queries
render(<LoginForm />);
const button = screen.getByRole('button', { name: /submit/i });
// WRONG: destructuring queries from render
const { getByRole } = render(<LoginForm />);
```

### userEvent over fireEvent

```typescript
import userEvent from '@testing-library/user-event';
// CORRECT: realistic user simulation
const user = userEvent.setup();
await user.type(screen.getByRole('textbox', { name: /email/i }), 'ada@test.com');
// WRONG: skips intermediate events
fireEvent.change(input, { target: { value: 'ada@test.com' } });
```

### Query Priority

Prefer: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.

```typescript
// CORRECT: role query with accessible name
screen.getByRole('heading', { name: /welcome/i });
// WRONG: test-id as first resort
screen.getByTestId('welcome-heading');
```

### Async with findBy and waitFor

```typescript
// CORRECT: findByRole waits for element to appear
await screen.findByRole('alert', { name: /success/i });
// WRONG: getByRole throws immediately if not in DOM
screen.getByRole('alert', { name: /success/i });
```

### Avoid Implementation Details

```typescript
// CORRECT: assert on visible output
await user.click(screen.getByRole('button', { name: /add to cart/i }));
expect(screen.getByText(/1 item in cart/i)).toBeInTheDocument();
// WRONG: reaching into component internals
expect(wrapper.state('cartCount')).toBe(1);
```

## Decision Tree

- Element present now? -> `getByRole` / `getByText`
- Appears after async? -> `findByRole` / `findByText`
- Should NOT exist? -> `queryByRole` (returns null)
- User input? -> `userEvent.setup()` then `user.type()`, `user.click()`
- No accessible query? -> Add `aria-label`; `getByTestId` last resort
- Custom hook? -> `renderHook(() => useMyHook())`
- Side effects? -> `waitFor(() => expect(...))`

## Example

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  it('should submit and show success', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ContactForm onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Ada');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'ada@test.com');
    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@test.com' });
    expect(await screen.findByRole('alert')).toHaveTextContent(/thank you/i);
  });
});
```

## Edge Cases

- **Portals/modals** -- Use `screen` queries since portals render outside the parent DOM node
- **Async state** -- Wrap assertions in `waitFor` when state updates after await or setTimeout
- **Act warnings** -- Ensure async operations complete; `findBy*` handles this automatically
- **Providers** -- Create a `renderWithProviders` wrapper for context (theme, router, store)
- **Cleanup** -- RTL calls `cleanup` automatically with Jest; do not call manually

## Checklist

- [ ] Queries follow priority: role > label > text > testId
- [ ] `userEvent.setup()` used instead of `fireEvent`
- [ ] Async elements use `findBy*` or `waitFor`, never manual delays
- [ ] No test inspects internal state, props, or instances
- [ ] `renderWithProviders` wraps components needing context
- [ ] Every interactive element has an accessible name

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro)
- [Query Priority Guide](https://testing-library.com/docs/queries/about#priority)

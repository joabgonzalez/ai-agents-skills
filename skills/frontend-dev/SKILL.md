---
name: frontend-dev
description: "Frontend workflow with componentization and state management. Trigger: When building, refactoring, or scaling frontend apps."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - react
    - architecture-patterns
    - a11y
    - humanizer
---

# Frontend Development Skill

## Overview

This skill provides universal patterns for front-end development workflow, focusing on componentization, state management, testing, and deployment. It is technology-agnostic and emphasizes maintainability, scalability, and quality.

## When to Use

- Building, refactoring, or scaling front-end applications
- Managing state, side effects, or data flow
- Preparing for deployment or CI/CD
- Reviewing or improving code quality and structure

## Critical Patterns

### ✅ REQUIRED: Componentization with Single Responsibility

Build small, reusable components that do one thing well.

```tsx
// ❌ WRONG: Monolithic component with mixed concerns
const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Data fetching
    fetch('/api/users').then((res) => res.json()).then(setUsers);
  }, []);

  return (
    <div>
      {loading && <Spinner />}
      {users.map((user) => (
        <div key={user.id}>
          <img src={user.avatar} />
          <h2>{user.name}</h2>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

// ✅ CORRECT: Decomposed into focused components
const UserDashboard = () => {
  const { users, loading } = useUsers(); // Custom hook for data

  return (
    <div>
      {loading && <LoadingSpinner />}
      <UserList users={users} />
    </div>
  );
};

const UserList = ({ users }: { users: User[] }) => (
  <div>
    {users.map((user) => (
      <UserCard key={user.id} user={user} />
    ))}
  </div>
);

const UserCard = ({ user }: { user: User }) => {
  const { deleteUser } = useUserActions();

  return (
    <Card>
      <Avatar src={user.avatar} alt={user.name} />
      <Heading>{user.name}</Heading>
      <Button onClick={() => deleteUser(user.id)}>Delete</Button>
    </Card>
  );
};
```

### ✅ REQUIRED: State Management with Colocated State

Keep state as local as possible. Lift to global only when necessary.

```tsx
// ❌ WRONG: All state in global store
// Redux store
const initialState = {
  modalOpen: false, // ← Should be local!
  users: [],
  theme: 'light',
};

// ✅ CORRECT: Local state for component-specific concerns
const UserModal = () => {
  const [isOpen, setIsOpen] = useState(false); // Local state

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </>
  );
};

// Global state only for shared data
const useTheme = () => {
  const theme = useSelector((state) => state.theme); // Global state
  return theme;
};
```

### ✅ REQUIRED: Testing with User-Centric Approach

Test behavior, not implementation. Simulate real user interactions.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

// ✅ CORRECT: Test from user perspective
test('adds item to cart when Add button clicked', async () => {
  render(<ProductPage productId="123" />);

  // Wait for product to load
  const productName = await screen.findByRole('heading', { name: /laptop/i });
  expect(productName).toBeInTheDocument();

  // User clicks "Add to Cart"
  const addButton = screen.getByRole('button', { name: /add to cart/i });
  fireEvent.click(addButton);

  // Verify success message
  expect(await screen.findByText(/added to cart/i)).toBeInTheDocument();
});
```

### ✅ REQUIRED: Environment-Based Configuration

Use environment variables for configuration. Never hardcode.

```typescript
// ✅ CORRECT: Environment-based config
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  environment: import.meta.env.MODE, // 'development' | 'production'
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
};

// Usage
fetch(`${config.apiUrl}/users`);
```

## Decision Tree

- New feature? → Create isolated, testable component
- State needed? → Use local or global store
- Deployment? → Automate with CI/CD
- Bug found? → Add/expand test coverage

## Edge Cases

- **State sync bugs**: Race conditions occur when async operations complete out of order. Use cleanup functions in useEffect. Consider using state management libraries (Redux, Zustand) for complex async flows.

- **Build pipeline failures**: Environment variables not set cause production builds to fail. Validate required env vars at build time. Use .env.example to document required variables.

- **Cross-browser or device-specific issues**: Test on multiple browsers (Chrome, Firefox, Safari) and devices (mobile, tablet, desktop). Use feature detection instead of browser detection. Polyfill missing APIs.

- **Memory leaks**: Event listeners, subscriptions, and timers not cleaned up cause memory leaks. Always return cleanup function from useEffect. Unsubscribe from observables.

- **Bundle size bloat**: Importing entire libraries increases bundle size. Use tree-shaking compatible libraries. Import only what you need (import { Button } from 'library' not import * as Library).

## Checklist

- [ ] Components follow single responsibility principle
- [ ] State colocated (local when possible, global only when shared)
- [ ] Prop drilling avoided (context, stores, or composition)
- [ ] User-centric tests written (unit + integration)
- [ ] Accessibility requirements met (a11y skill)
- [ ] Environment variables for all configuration
- [ ] Loading and error states handled
- [ ] Form inputs validated (client-side + server-side)
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size analyzed and optimized
- [ ] TypeScript strict mode enabled
- [ ] CI/CD pipeline configured (lint, test, build, deploy)
- [ ] Responsive design tested on mobile and desktop
- [ ] Browser compatibility verified (Chrome, Firefox, Safari)

## Practical Examples

### Example: Complete Feature with Best Practices

```tsx
// UserProfile.tsx - Complete feature with best practices
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { LoadingSpinner, ErrorMessage } from '@/components';

// 1. Type-safe validation
const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
});

type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;

// 2. Data fetching with loading/error states
const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((res) => res.json()),
  });
};

// 3. Mutation with optimistic updates
const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
  });
};

// 4. Component with single responsibility
export const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user, isLoading, error } = useUserProfile(userId);
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false); // Local state

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <div>User not found</div>;

  const handleSubmit = async (data: UpdateProfileData) => {
    try {
      await updateProfile.mutateAsync(data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div>
      {isEditing ? (
        <ProfileForm user={user} onSubmit={handleSubmit} />
      ) : (
        <ProfileView user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};
```

## Resources

- [conventions](../conventions/SKILL.md) - Code organization and naming
- [architecture-patterns](../architecture-patterns/SKILL.md) - Design patterns (Composition, HOC, Render Props)
- [react](../react/SKILL.md) - React patterns and hooks
- [typescript](../typescript/SKILL.md) - Type-safe frontend development
- [a11y](../a11y/SKILL.md) - Accessibility requirements
- [interface-design](../interface-design/SKILL.md) - UI/UX design patterns
- [tailwindcss](../tailwindcss/SKILL.md) - Utility-first CSS
- [form-validation](../form-validation/SKILL.md) - Form validation patterns
- [react-testing-library](../react-testing-library/SKILL.md) - User-centric testing
- https://reactpatterns.com/ - React design patterns
- https://web.dev/patterns/ - Web platform patterns

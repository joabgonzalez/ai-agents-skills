---
name: react
description: React component patterns, hooks, and best practices for modern React development.
skills:
  - conventions
  - a11y
  - typescript
  - javascript
dependencies:
  react: ">=17.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# React Skill

## Overview

Modern React patterns using hooks, functional components, and best practices for building maintainable UIs.

## Objective

Guide developers in building React applications with proper component architecture, state management, and performance optimization.

## Conventions

Refer to conventions for:

- Code organization
- Naming patterns

Refer to a11y for:

- Semantic HTML in JSX
- Keyboard navigation
- ARIA attributes

### React Specific

- Use functional components with hooks
- Implement proper component composition
- Memoize expensive computations with useMemo
- Use useCallback for event handlers in optimized components
- Handle side effects with useEffect
- Provide keys for lists

## Example

```typescript
import { useState, useEffect, useMemo } from 'react';

interface TodoProps {
  items: string[];
}

const TodoList: React.FC<TodoProps> = ({ items }) => {
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() =>
    items.filter(item => item.toLowerCase().includes(filter.toLowerCase())),
    [items, filter]
  );

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ul>
        {filteredItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
```

## References

- https://react.dev/
- https://react.dev/reference/react

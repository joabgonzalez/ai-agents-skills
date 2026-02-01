---
name: translation
description: Internationalization and localization practices for multilingual applications.
skills:
  - conventions
  - a11y
allowed-tools:
  - documentation-reader
  - web-search
---

# Translation Skill

## Overview

Best practices for implementing internationalization (i18n) and localization (l10n) in web and mobile applications.

## Objective

Enable developers to build multilingual applications with proper translation management, locale handling, and cultural considerations.

## Conventions

Refer to conventions for:

- Code organization

Refer to a11y for:

- Language attributes
- Screen reader support

### Translation Specific

- Use i18n libraries (react-i18next, i18next)
- Organize translation keys hierarchically
- Handle pluralization and gender
- Format dates, numbers, and currencies per locale
- Implement language switching
- Use translation keys instead of hardcoded strings

## Example

```typescript
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

// Translation file (en.json)
{
  "welcome": "Welcome, {{name}}!",
  "items": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}

// Component
const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('welcome', { name: 'John' })}</h1>
      <p>{t('items', { count: 5 })}</p>
    </div>
  );
};
```

## References

- https://www.i18next.com/
- https://react.i18next.com/

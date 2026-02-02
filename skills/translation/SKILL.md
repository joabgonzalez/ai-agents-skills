---
name: translation
description: Internationalization and localization practices for multilingual applications. i18n setup, translation keys, pluralization, language detection. Trigger: When implementing internationalization, adding translations, or configuring i18n in applications.
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

---

## When to Use

Use this skill when:

- Building multilingual applications
- Implementing language switching
- Handling date, number, currency formatting per locale
- Managing translation files and keys
- Supporting RTL (right-to-left) languages

Don't use this skill for:

- Single-language applications
- Machine translation APIs (different concern)

---

## Critical Patterns

### ✅ REQUIRED: Use Translation Keys, Not Hardcoded Text

```typescript
// ✅ CORRECT: Translation keys
<h1>{t('welcome.title')}</h1>

// ❌ WRONG: Hardcoded text
<h1>Welcome</h1>
```

### ✅ REQUIRED: Handle Pluralization

```json
// ✅ CORRECT: Plural forms
{
  "items": {
    "zero": "No items",
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}

// ❌ WRONG: No plural handling
{
  "items": "{{count}} items"
}
```

### ✅ REQUIRED: Organize Keys Hierarchically

```json
// ✅ CORRECT: Nested structure
{
  "auth": {
    "login": {
      "title": "Sign In",
      "button": "Login"
    }
  }
}

// ❌ WRONG: Flat structure
{
  "authLoginTitle": "Sign In",
  "authLoginButton": "Login"
}
```

---

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

---

## Decision Tree

**React app?** → Use `react-i18next` with hooks.

**Need pluralization?** → Use plural forms in translation files: `{"key": {"one": "", "other": ""}}`.

**Date/number formatting?** → Use `Intl.DateTimeFormat` and `Intl.NumberFormat`.

**Language detection?** → Use browser language, user preference, or IP-based detection.

**RTL language?** → Set `dir="rtl"` attribute, use logical CSS properties.

**Missing translation?** → Configure fallback language, log missing keys.

**Dynamic content?** → Use interpolation: `t('key', { variable: value })`.

---

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

---

## Edge Cases

**Lazy loading translations:** Load translation files on-demand for large apps.

**Context-specific translations:** Use namespaces or context parameter for same key in different contexts.

**Gender/formality:** Some languages need gender or formality variants. Use context or separate keys.

**RTL layouts:** Test thoroughly with RTL languages, use logical properties (`margin-inline-start` instead of `margin-left`).

**Currency formatting:** Always specify currency code, don't assume user's locale currency.

---

## References

- https://www.i18next.com/
- https://react.i18next.com/

---
name: mui
description: Material UI component library best practices for React applications.
skills:
  - conventions
  - a11y
  - react
  - typescript
dependencies:
  "@mui/material": ">=5.0.0 <6.0.0"
  react: ">=17.0.0 <19.0.0"
allowed-tools:
  - documentation-reader
  - web-search
---

# MUI (Material UI) Skill

## Overview

Best practices for using Material UI components in React applications with proper theming, customization, and accessibility.

## Objective

Enable developers to build consistent, accessible UIs using MUI components with proper theme configuration and customization patterns.

## Conventions

Refer to conventions for:

- Code organization

Refer to a11y for:

- Keyboard navigation
- ARIA attributes

Refer to react for:

- Component patterns
- Hooks usage

### MUI Specific

- Use MUI components over custom HTML when available
- Implement theme provider for consistent styling
- Use sx prop for one-off styling
- Leverage styled API for reusable styled components
- Follow MUI's accessibility guidelines

## Example

```typescript
import { Button, Box, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

<ThemeProvider theme={theme}>
  <Box sx={{ p: 2 }}>
    <Button variant="contained" color="primary">
      Click Me
    </Button>
  </Box>
</ThemeProvider>
```

## References

- https://mui.com/material-ui/getting-started/
- https://mui.com/material-ui/customization/theming/

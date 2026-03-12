---
name: mui
description: "Material UI components with theming and sx prop. Trigger: When using MUI components, implementing theming, or creating custom components."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: library
  skills:
    - react
  dependencies:
    "@mui/material": ">=5.0.0 <6.0.0"
    "@mui/x-charts": ">=6.0.0 <8.0.0"  # Optional - only for data visualization
    react: ">=17.0.0 <19.0.0"
---

# MUI (Material UI)

Material UI for React with theming, sx prop, and accessibility patterns for v5+.

## When to Use

- MUI components (Button, Box, Grid, etc.)
- MUI theming and customization
- Accessible Material Design UIs
- MUI X components (DataGrid, Charts)

Don't use for:

- Non-MUI React (use react skill)
- Vanilla CSS (use css skill)

---
| Component library patterns            | ✅ Yes        | ✅ Yes           | components.md (required)            |
| Theme customization / dark mode       | ✅ Yes        | ✅ Yes           | theming.md (required)               |
| Advanced styling (sx, styled API)     | ✅ Yes        | ✅ Yes           | customization.md (required)         |
| Tables, DataGrid, Lists               | ✅ Yes        | ✅ Yes           | data-display.md (required)          |
| Form validation, Select, Autocomplete | ✅ Yes        | ✅ Yes           | forms.md (required)                 |
| Multiple advanced features            | ✅ Yes        | ✅ Yes           | All relevant references             |

### Available References

All reference files located in `skills/mui/references/`:

- **README.md**: Overview of all MUI references and navigation guide
- **components.md**: Button, TextField, Typography, layouts, navigation (required for component patterns)
- **theming.md**: createTheme, palette, dark mode, component overrides (required for theme customization)
- **customization.md**: sx prop, styled API, custom variants, performance (required for advanced styling)
- **data-display.md**: Table, DataGrid, List, Card patterns (required for data display)
- **forms.md**: TextField validation, Select, Autocomplete, Formik integration (required for forms)

### Conditional Language

- **"MUST read"** → **Obligatory** - Read immediately before proceeding
- **"CHECK"** or "Consider" → **Suggested** - Read if you need deeper understanding
- **"OPTIONAL"** → **Ignorable** - Read only for learning or edge cases

### Example: Theme Task

```
1. User: "Dark mode with custom palette"
2. Read: SKILL.md
3. Decision Tree: "Dark mode? → theming.md"
4. Read: theming.md
5. Execute: createTheme + ThemeProvider
```

---

Use when:

- Building with MUI components
- MUI theming and design systems
- sx prop or styled API customization
- Consistent spacing/typography/colors
- MUI + React integration

Don't use for:

- Tailwind CSS (use tailwindcss skill)
- Plain CSS/HTML (use css/html skills)
- Custom libraries (use react skill)

---

## Critical Patterns

### ✅ REQUIRED: Use ThemeProvider

```typescript
// ✅ CORRECT: Wrap app with ThemeProvider
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({ /* config */ });

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>

// ❌ WRONG: Using MUI without theme (inconsistent styling)
<App /> // No ThemeProvider
```

### ✅ REQUIRED: Use sx Prop for One-Off Styles

```typescript
// ✅ CORRECT: sx prop with theme values
<Box sx={{ p: 2, bgcolor: 'primary.main' }}>

// ❌ WRONG: Inline styles (loses theme consistency)
<Box style={{ padding: '16px', backgroundColor: '#1976d2' }}>
```

### ✅ REQUIRED: Use MUI Components Over Custom HTML

```typescript
// ✅ CORRECT: MUI components with built-in accessibility
<Button variant="contained" onClick={handleClick}>Submit</Button>

// ❌ WRONG: Custom HTML without accessibility
<div className="button" onClick={handleClick}>Submit</div>
```

---

## Conventions

### MUI Specific

- Use MUI components over custom HTML when available
- Implement theme provider for consistent styling
- Use sx prop for one-off styling
- Leverage styled API for reusable styled components
- Follow MUI's accessibility guidelines

---

## Decision Tree

```
One-off styling?
  → sx prop with theme values: sx={{ p: 2, bgcolor: 'primary.main' }}

Reusable styled component?
  → styled() API — see customization.md for styled API patterns

Global theme change?
  → Configure in createTheme(), apply via ThemeProvider — see theming.md for theme setup

Need custom variant?
  → Extend theme with component variants in theme configuration — see customization.md for variant patterns

Responsive styling?
  → Theme breakpoints: sx={{ p: { xs: 1, md: 2 } }} or theme.breakpoints.up('md')

Dark mode?
  → Create separate light/dark themes, toggle via ThemeProvider — see theming.md for dark mode implementation

Custom component?
  → Extend MUI component with styled API or composition pattern — see components.md for component patterns

Building forms?
  → TextField, Select, Autocomplete with validation — see forms.md for form patterns

Displaying tables/lists?
  → Table, DataGrid, List components — see data-display.md for data display patterns
```

---

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

---

## Edge Cases

**Theme nesting:** Nested ThemeProviders merge; use for component overrides.

**SSR styling:** Use ServerStyleSheets to prevent FOUC.

**Custom breakpoints:** `createTheme({ breakpoints: { values: { mobile: 0, tablet: 640 } } })`.

**sx performance:** Frequent re-renders → use `styled()` over sx.

**Icon sizing:** Use `fontSize` prop for consistency.

---

## Resources

- [components.md](references/components.md) — Button, TextField, Typography, layout components
- [theming.md](references/theming.md) — createTheme, ThemeProvider, dark mode
- [customization.md](references/customization.md) — sx prop, styled API, variants
- [data-display.md](references/data-display.md) — Table, DataGrid, List patterns
- [forms.md](references/forms.md) — TextField validation, Select, Autocomplete
- [mui-x-charts.md](references/mui-x-charts.md) — Charts: LineChart, BarChart, PieChart (use only when viz required)
- https://mui.com/material-ui/getting-started/
- https://mui.com/material-ui/customization/theming/

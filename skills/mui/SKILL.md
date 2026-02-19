---
name: mui
description: "Material UI components with theming and sx prop. Trigger: When using MUI components, implementing theming, or creating custom components."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: library
  skills:
    - react
  dependencies:
    "@mui/material": ">=5.0.0 <6.0.0"
    "@mui/x-charts": ">=6.0.0 <8.0.0"  # Optional - only for data visualization
    react: ">=17.0.0 <19.0.0"
---

# MUI (Material UI) Skill

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

**One-off styling?** → Use `sx` prop with theme values: `sx={{ p: 2, bgcolor: 'primary.main' }}`.

**Reusable styled component?** → Use `styled()` API to create custom components. **[CRITICAL] See** `references/customization.md` for styled API patterns.

**Global theme change?** → Configure in `createTheme()`, apply via `ThemeProvider`. **[CRITICAL] See** `references/theming.md` for theme setup.

**Need custom variant?** → Extend theme with component variants in theme configuration. **[CRITICAL] See** `references/customization.md` for variant patterns.

**Responsive styling?** → Use theme breakpoints: `sx={{ p: { xs: 1, md: 2 } }}` or `theme.breakpoints.up('md')`.

**Dark mode?** → Create separate light/dark themes, toggle via ThemeProvider. **[CRITICAL] See** `references/theming.md` for dark mode implementation.

**Custom component?** → Extend MUI component with styled API or composition pattern. **[CRITICAL] See** `references/components.md` for component patterns.

**Building forms?** → Use TextField, Select, Autocomplete with validation. **[CRITICAL] See** `references/forms.md` for form patterns.

**Displaying tables/lists?** → Use Table, DataGrid, List components. **[CRITICAL] See** `references/data-display.md` for data display patterns.

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

## MUI X Charts (Context-Aware)

> Use **ONLY when context requires charts**

### Check Context First

Verify charts needed:

```typescript
// 1. Check AGENTS.md for viz requirements
// 2. Check package.json for @mui/x-charts
// 3. Check task for "chart"/"graph"/"viz"

// ✅ CORRECT
// "Display revenue chart" → Use Charts
// "Dashboard with KPIs" + has @mui/x-charts → Use Charts

// ❌ WRONG
// "Settings page" → NO charts
// "User profile" → NO charts
```

**Dependencies** (only if charts needed):
```json
{
  "@mui/x-charts": ">=6.0.0 <8.0.0"
}
```

### When to Use

Use when:
- Task mentions "chart"/"graph"/"viz"/"plot"
- AGENTS.md lists viz requirement
- package.json has @mui/x-charts
- Dashboards with visual metrics

Don't use for:
- Forms/settings/profiles/auth
- Simple data (use Table)
- No viz requirement

### Critical Chart Patterns

#### ✅ REQUIRED: Provide Axis Labels and Legends

```typescript
// ✅ CORRECT: Accessible chart
import { LineChart } from '@mui/x-charts/LineChart';

<LineChart
  xAxis={[{ label: 'Month', data: months }]}
  yAxis={[{ label: 'Revenue ($)' }]}
  series={[{ data: revenue, label: 'Q1 2024' }]}
/>

// ❌ WRONG: No labels (inaccessible)
<LineChart
  xAxis={[{ data: months }]}
  series={[{ data: revenue }]}
/>
```

#### ✅ REQUIRED: Responsive Sizing

```typescript
// ✅ CORRECT: Container-based sizing
<Box sx={{ width: '100%', height: 400 }}>
  <LineChart /* ... */ />
</Box>

// ❌ WRONG: Fixed sizes (not responsive)
<LineChart width={800} height={400} />
```

### Chart Types Decision Tree

**Time series data?** → Use `LineChart`

**Categorical comparison?** → Use `BarChart`

**Part-to-whole relationship?** → Use `PieChart`

**Correlation between variables?** → Use `ScatterChart`

**Multiple metrics?** → Use multiple series in same chart

### Example

```typescript
import { LineChart } from '@mui/x-charts/LineChart';

function RevenueChart() {
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <LineChart
        xAxis={[{ data: [1, 2, 3, 4, 5], label: 'Month' }]}
        yAxis={[{ label: 'Revenue ($)' }]}
        series={[
          { data: [2000, 5000, 3000, 7000, 4000], label: 'Q1 2024' }
        ]}
      />
    </Box>
  );
}
```

### Edge Cases

**Empty data:** Show placeholder, not empty chart

**Large datasets:** Aggregate/sample for performance

**Accessibility:** Provide table for screen readers

---

## References

- https://mui.com/material-ui/getting-started/
- https://mui.com/material-ui/customization/theming/

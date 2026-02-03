# MUI Theming Guide

> createTheme, ThemeProvider, palette, typography, and dark mode

## When to Read This

- Setting up MUI theme for new project
- Customizing colors, typography, spacing
- Implementing dark mode
- Creating consistent design system

---

## Theme Setup

### ✅ Basic Theme

```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

---

## Palette

### ✅ Custom Colors

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
      light: '#8e99f3',
      dark: '#0041ad',
      contrastText: '#fff',
    },
    brand: {
      main: '#ff5722',
      light: '#ff8a50',
      dark: '#c41c00',
      contrastText: '#fff',
    },
  },
});

// TypeScript: Extend palette
declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

// Usage:
<Button color="brand">Custom Color</Button>
```

---

## Typography

```typescript
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    button: {
      textTransform: "none", // Remove uppercase
    },
  },
});
```

---

## Spacing & Breakpoints

```typescript
const theme = createTheme({
  spacing: 8, // Base unit (default)
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Usage:
<Box sx={{ p: 2 }}> {/* 2 * 8 = 16px */}
```

---

## Dark Mode

```typescript
const lightTheme = createTheme({ palette: { mode: 'light' } });
const darkTheme = createTheme({ palette: { mode: 'dark' } });

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      <App />
    </ThemeProvider>
  );
}
```

---

## Component Overrides

```typescript
const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

---

## References

- [MUI Theming](https://mui.com/material-ui/customization/theming/)

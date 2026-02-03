# MUI Customization Guide

> sx prop, styled API, variants, and performance

## When to Read This

- Customizing component styles
- Creating reusable styled components
- Adding custom variants
- Optimizing styling performance

---

## sx Prop

### ✅ Basic Styling

```typescript
<Box
  sx={{
    p: 2,
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: 2,
  }}
>
  Content
</Box>
```

### ✅ Responsive

```typescript
<Box
  sx={{
    p: { xs: 1, sm: 2, md: 3 },
    width: { xs: '100%', md: '50%' },
  }}
/>
```

### ✅ Pseudo-classes

```typescript
<Button
  sx={{
    '&:hover': {
      bgcolor: 'primary.dark',
    },
    '&:disabled': {
      opacity: 0.5,
    },
  }}
>
  Hover Me
</Button>
```

---

## styled API

### ✅ Reusable Styled Component

```typescript
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  padding: theme.spacing(1, 3),
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// Usage:
<StyledButton variant="contained">Custom Button</StyledButton>
```

### ✅ With Props

```typescript
const StyledBox = styled(Box)<{ highlight?: boolean }>(
  ({ theme, highlight }) => ({
    padding: theme.spacing(2),
    backgroundColor: highlight ? theme.palette.primary.light : 'transparent',
  })
);

// Usage:
<StyledBox highlight>Highlighted</StyledBox>
```

---

## Custom Variants

```typescript
const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'dashed' },
          style: {
            border: '1px dashed grey',
          },
        },
      ],
    },
  },
});

// TypeScript:
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
}

// Usage:
<Button variant="dashed">Dashed Button</Button>
```

---

## Performance

```typescript
// ❌ WRONG: sx prop in frequently re-rendered component
const List = ({ items }) => items.map(item =>
  <Box sx={{ p: 2 }} key={item.id}>{item.name}</Box>
);

// ✅ CORRECT: Use styled for performance
const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const List = ({ items }) => items.map(item =>
  <StyledBox key={item.id}>{item.name}</StyledBox>
);
```

---

## References

- [MUI Customization](https://mui.com/material-ui/customization/how-to-customize/)

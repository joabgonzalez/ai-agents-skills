# MUI (Material-UI) References

> Detailed guides for components, theming, customization, data display, and forms

## Overview

This directory contains detailed guides for Material-UI component usage and customization. Main [SKILL.md](../SKILL.md) provides critical patterns and decision tree. These references offer deep-dives into component patterns, theme configuration, styling strategies, data display, and form handling.

---

## Quick Navigation

### 🎨 Core Concepts

| Reference File                       | Topics Covered                                               | When to Read                                                |
| ------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------- |
| [components.md](components.md)       | Button, TextField, Typography, layout components             | Using MUI components with proper variants and props         |
| [theming.md](theming.md)             | createTheme, ThemeProvider, palette, typography, breakpoints | Setting up design system and theme customization            |
| [customization.md](customization.md) | sx prop, styled API, component variants, overrides           | Customizing component styles and creating reusable patterns |
| [data-display.md](data-display.md)   | Table, DataGrid, List, Card patterns                         | Displaying collections, tables, and structured data         |
| [forms.md](forms.md)                 | Form handling, validation, TextField patterns, Autocomplete  | Building forms with MUI components and validation           |

---

## Reading Strategy

### For New Projects (Setup)

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [theming.md](theming.md) for ThemeProvider and design system setup
3. **MUST read**: [components.md](components.md) for basic component usage
4. CHECK: [customization.md](customization.md) for styling patterns

### For Existing Projects (Adding Features)

1. **Adding forms?** → Read [forms.md](forms.md)
2. **Displaying data tables?** → Read [data-display.md](data-display.md)
3. **Customizing components?** → Read [customization.md](customization.md)
4. **Changing theme?** → Read [theming.md](theming.md)

### For Advanced Customization

1. **Custom variants?** → Read [customization.md](customization.md) for component overrides
2. **Dark mode?** → Read [theming.md](theming.md) for theme toggling
3. **Responsive layout?** → Read [components.md](components.md) for Grid and Container

---

## File Descriptions

### [components.md](components.md)

**Core MUI component usage patterns**

- Button variants and states
- TextField types and validation
- Typography hierarchy
- Layout components (Box, Container, Grid, Stack)
- Navigation (AppBar, Drawer, Tabs)
- Feedback (Alert, Snackbar, Dialog)

### [theming.md](theming.md)

**Theme configuration and customization**

- createTheme and ThemeProvider setup
- Palette (primary, secondary, error, custom colors)
- Typography (font families, sizes, weights)
- Spacing and breakpoints
- Dark mode implementation
- Component default props

### [customization.md](customization.md)

**Styling and component customization**

- sx prop patterns
- styled API for reusable components
- Component variants (theme.components)
- Global overrides
- Responsive styling
- Performance considerations

### [data-display.md](data-display.md)

**Displaying collections and structured data**

- Table with sorting and pagination
- DataGrid (MUI X) patterns
- List and ListItem patterns
- Card layouts
- Accordion and expansion panels
- Chip arrays

### [forms.md](forms.md)

**Form handling with MUI components**

- TextField validation patterns
- Select and Autocomplete
- Checkbox, Radio, Switch
- Form layout with Grid
- Integration with Formik/React Hook Form
- Error handling and feedback

---

## Common Patterns Summary

- **Simple component**: Use MUI component with default variant
- **Theme customization**: Configure in createTheme(), apply via ThemeProvider
- **One-off styling**: Use sx prop with theme values
- **Reusable styled component**: Use styled() API
- **Forms**: Combine TextField, validation, and layout components
- **Data tables**: Use Table or DataGrid (MUI X) with proper accessibility

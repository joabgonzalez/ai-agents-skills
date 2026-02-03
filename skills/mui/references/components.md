# MUI Components Guide

> Core Material-UI component patterns and usage

## When to Read This

- Using MUI components for the first time
- Understanding component variants and props
- Implementing layouts with Box, Container, Grid
- Building navigation with AppBar, Drawer, Tabs
- Showing feedback with Dialog, Snackbar, Alert

---

## Buttons

### ✅ Button Variants

```typescript
// ✅ Primary action
<Button variant="contained" color="primary">Submit</Button>

// ✅ Secondary action
<Button variant="outlined">Cancel</Button>

// ✅ Tertiary action
<Button variant="text">Learn More</Button>

// ✅ With icon
<Button variant="contained" startIcon={<SaveIcon />}>
  Save
</Button>

// ✅ Loading state
<LoadingButton loading variant="contained">
  Loading
</LoadingButton>
```

### ✅ IconButton

```typescript
<IconButton aria-label="delete" onClick={handleDelete}>
  <DeleteIcon />
</IconButton>

// With tooltip
<Tooltip title="Delete">
  <IconButton aria-label="delete">
    <DeleteIcon />
  </IconButton>
</Tooltip>
```

---

## Text Fields

### ✅ TextField Variants

```typescript
// ✅ Standard (default)
<TextField label="Name" />

// ✅ Filled
<TextField label="Email" variant="filled" />

// ✅ Outlined
<TextField label="Password" variant="outlined" type="password" />

// ✅ With validation
<TextField
  label="Email"
  error={!!errors.email}
  helperText={errors.email}
  required
/>

// ✅ Multiline
<TextField label="Description" multiline rows={4} />
```

---

## Typography

### ✅ Typography Variants

```typescript
<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="caption">Caption text</Typography>

// ✅ With custom styling
<Typography
  variant="h5"
  sx={{ fontWeight: 'bold', color: 'primary.main' }}
>
  Styled Heading
</Typography>
```

---

## Layout

### ✅ Box Component

```typescript
// ✅ Simple container
<Box sx={{ p: 2, bgcolor: 'background.paper' }}>
  Content
</Box>

// ✅ Flexbox layout
<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
  <Item />
  <Item />
</Box>

// ✅ Grid layout
<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
  <Item />
  <Item />
  <Item />
</Box>
```

### ✅ Container

```typescript
// ✅ Centered content with max width
<Container maxWidth="lg">
  <Box sx={{ py: 4 }}>Content</Box>
</Container>

// ✅ Responsive max width
<Container maxWidth="sm"> {/* xs, sm, md, lg, xl */}
  Narrow content
</Container>
```

### ✅ Grid System

```typescript
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <Card>Left</Card>
  </Grid>
  <Grid item xs={12} md={6}>
    <Card>Right</Card>
  </Grid>
</Grid>

// ✅ Responsive grid
<Grid container spacing={{ xs: 1, md: 2 }}>
  <Grid item xs={6} sm={4} md={3}>
    <Item />
  </Grid>
</Grid>
```

### ✅ Stack

```typescript
// ✅ Vertical stack
<Stack spacing={2}>
  <Item />
  <Item />
</Stack>

// ✅ Horizontal stack
<Stack direction="row" spacing={2}>
  <Button>Cancel</Button>
  <Button>Submit</Button>
</Stack>

// ✅ Divider between items
<Stack spacing={2} divider={<Divider />}>
  <Item />
  <Item />
</Stack>
```

---

## Navigation

### ✅ AppBar

```typescript
<AppBar position="static">
  <Toolbar>
    <IconButton edge="start" color="inherit" aria-label="menu">
      <MenuIcon />
    </IconButton>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>
      App Title
    </Typography>
    <Button color="inherit">Login</Button>
  </Toolbar>
</AppBar>
```

### ✅ Drawer

```typescript
const [open, setOpen] = useState(false);

<Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
  <Box sx={{ width: 250 }} role="presentation">
    <List>
      <ListItem button onClick={handleNavigation}>
        <ListItemText primary="Home" />
      </ListItem>
    </List>
  </Box>
</Drawer>
```

### ✅ Tabs

```typescript
const [value, setValue] = useState(0);

<Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
  <Tab label="Tab 1" />
  <Tab label="Tab 2" />
  <Tab label="Tab 3" />
</Tabs>

{value === 0 && <TabPanel>Content 1</TabPanel>}
{value === 1 && <TabPanel>Content 2</TabPanel>}
```

---

## Feedback

### ✅ Dialog

```typescript
const [open, setOpen] = useState(false);

<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogTitle>Confirm Action</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to proceed?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={handleConfirm} variant="contained">
      Confirm
    </Button>
  </DialogActions>
</Dialog>
```

### ✅ Snackbar

```typescript
const [open, setOpen] = useState(false);

<Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={() => setOpen(false)}
  message="Action completed"
/>

// ✅ With Alert
<Snackbar open={open} onClose={() => setOpen(false)}>
  <Alert severity="success" onClose={() => setOpen(false)}>
    Success message!
  </Alert>
</Snackbar>
```

### ✅ Alert

```typescript
<Alert severity="error">Error message</Alert>
<Alert severity="warning">Warning message</Alert>
<Alert severity="info">Info message</Alert>
<Alert severity="success">Success message</Alert>

// ✅ With action
<Alert
  severity="warning"
  action={
    <Button color="inherit" size="small">
      UNDO
    </Button>
  }
>
  Action completed
</Alert>
```

---

## Best Practices

1. **Use semantic components** - Button for actions, Link for navigation
2. **Consistent spacing** - Use theme spacing (sx={{ p: 2 }})
3. **Responsive layouts** - Use Grid with xs/sm/md/lg/xl breakpoints
4. **Accessibility** - Provide aria-label for IconButtons, use proper roles
5. **Typography hierarchy** - Use h1-h6 variants appropriately
6. **Loading states** - Use LoadingButton or Skeleton for async operations

---

## References

- [MUI Components](https://mui.com/material-ui/all-components/)

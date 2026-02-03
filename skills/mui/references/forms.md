# MUI Forms Guide

> Form handling, validation, TextField, Select, Autocomplete patterns

## When to Read This

- Building forms with MUI components
- Implementing validation
- Using Select, Autocomplete, Checkbox
- Integrating with Formik or React Hook Form

---

## TextField Validation

### ✅ Basic Validation

```typescript
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const handleChange = (e) => {
  const value = e.target.value;
  setEmail(value);

  if (!value.includes('@')) {
    setError('Invalid email');
  } else {
    setError('');
  }
};

<TextField
  label="Email"
  value={email}
  onChange={handleChange}
  error={!!error}
  helperText={error}
  required
  fullWidth
/>
```

---

## Select

### ✅ Simple Select

```typescript
<FormControl fullWidth>
  <InputLabel>Age</InputLabel>
  <Select value={age} label="Age" onChange={(e) => setAge(e.target.value)}>
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
</FormControl>
```

---

## Autocomplete

### ✅ Basic Autocomplete

```typescript
<Autocomplete
  options={options}
  renderInput={(params) => <TextField {...params} label="Movie" />}
  onChange={(event, value) => setSelected(value)}
/>
```

---

## Checkboxes & Radio

### ✅ Checkbox

```typescript
<FormControlLabel
  control={
    <Checkbox
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  }
  label="Accept terms"
/>
```

### ✅ Radio Group

```typescript
<FormControl>
  <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
    <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
    <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
  </RadioGroup>
</FormControl>
```

---

## Form Layout

```typescript
<Box component="form" onSubmit={handleSubmit}>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <TextField label="First Name" fullWidth required />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField label="Last Name" fullWidth required />
    </Grid>
    <Grid item xs={12}>
      <Button type="submit" variant="contained" fullWidth>
        Submit
      </Button>
    </Grid>
  </Grid>
</Box>
```

---

## With Formik

```typescript
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';

<Formik initialValues={{ email: '' }} onSubmit={handleSubmit}>
  <Form>
    <Field component={TextField} name="email" label="Email" fullWidth />
    <Button type="submit" variant="contained">
      Submit
    </Button>
  </Form>
</Formik>
```

---

## References

- [MUI Forms](https://mui.com/material-ui/react-text-field/)

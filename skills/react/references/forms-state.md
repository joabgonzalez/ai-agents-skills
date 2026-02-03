# Form State Management

> Controlled vs uncontrolled components, validation, multi-step forms, and file uploads

## When to Read This

- Building forms with React
- Choosing between controlled and uncontrolled inputs
- Implementing form validation
- Handling file uploads
- Creating multi-step wizards

---

## Controlled vs Uncontrolled

### Decision Matrix

| Feature               | Controlled      | Uncontrolled | Recommendation               |
| --------------------- | --------------- | ------------ | ---------------------------- |
| **State location**    | React state     | DOM          | Controlled for most cases    |
| **Value access**      | Immediate       | Via ref      | Controlled for validation    |
| **Validation**        | Real-time       | On submit    | Controlled for UX            |
| **Conditional logic** | Easy            | Difficult    | Controlled                   |
| **Performance**       | Slight overhead | Faster       | Uncontrolled for large forms |
| **Integration**       | Simple          | Complex      | Controlled                   |

### ✅ Controlled Components

**Definition:** React state is the "single source of truth"

```typescript
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**Pros:**

- Immediate access to value
- Easy validation
- Conditional logic (enable/disable, show/hide)
- Easy to reset or transform input

**Cons:**

- Slightly more code
- Re-renders on every keystroke

### ✅ Uncontrolled Components

**Definition:** DOM is the source of truth, access via ref

```typescript
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log(inputRef.current?.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="Initial" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Pros:**

- Less code
- Better performance (no re-renders)
- Good for large forms with minimal interaction

**Cons:**

- Can't access value without ref
- Harder to validate in real-time
- More complex with conditional logic

---

## Basic Form Patterns

### ✅ Simple Controlled Form

```typescript
interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Partial<FormData> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    submitLogin(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

### ✅ Form with useReducer

```typescript
interface State {
  values: FormData;
  errors: Partial<FormData>;
  touched: Partial<Record<keyof FormData, boolean>>;
  isSubmitting: boolean;
}

type Action =
  | { type: 'CHANGE'; field: keyof FormData; value: string }
  | { type: 'BLUR'; field: keyof FormData }
  | { type: 'SET_ERRORS'; errors: Partial<FormData> }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR' }
  | { type: 'RESET' };

function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case 'BLUR':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const initialState: State = {
  values: { email: '', password: '' },
  errors: {},
  touched: {},
  isSubmitting: false,
};

function LoginForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'CHANGE',
      field: e.target.name as keyof FormData,
      value: e.target.value,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    dispatch({ type: 'BLUR', field: e.target.name as keyof FormData });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });

    try {
      await submitLogin(state.values);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={state.isSubmitting}>
        {state.isSubmitting ? 'Submitting...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Validation Patterns

### ✅ Validation on Blur

```typescript
function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
    return '';
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Only validate if already touched
    if (touched) {
      setError(validateEmail(value));
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched && error && <span className="error">{error}</span>}
    </div>
  );
}
```

### ✅ Async Validation

```typescript
function UsernameInput() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();
    setChecking(true);

    const checkUsername = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Debounce
        const available = await api.checkUsername(username, {
          signal: controller.signal,
        });

        if (!available) {
          setError('Username is already taken');
        } else {
          setError('');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to check username');
        }
      } finally {
        setChecking(false);
      }
    };

    checkUsername();

    return () => controller.abort();
  }, [username]);

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {checking && <span>Checking...</span>}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### ✅ Cross-Field Validation

```typescript
function PasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [password, confirmPassword]);

  return (
    <form>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>
    </form>
  );
}
```

---

## File Uploads

### ✅ Single File Upload

```typescript
function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.uploadFile(formData);
      alert('Upload successful');
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {preview && <img src={preview} alt="Preview" width={200} />}
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

### ✅ Multiple File Upload with Progress

```typescript
function MultiFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await api.uploadFile(formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          },
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}`);
      }
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            {file.name} - {uploadProgress[file.name] || 0}%
          </li>
        ))}
      </ul>
      <button onClick={handleUpload}>Upload All</button>
    </div>
  );
}
```

---

## Multi-Step Forms

### ✅ Wizard Pattern

```typescript
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
    // Step 2
    address: '',
    city: '',
    // Step 3
    cardNumber: '',
    expiry: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    await api.submitForm(formData);
  };

  return (
    <div>
      <div className="progress">
        Step {step} of 3
      </div>

      {step === 1 && (
        <div>
          <h2>Personal Information</h2>
          <input
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Name"
          />
          <input
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Email"
          />
          <button onClick={nextStep}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Address</h2>
          <input
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Address"
          />
          <input
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="City"
          />
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Payment</h2>
          <input
            value={formData.cardNumber}
            onChange={(e) => updateField('cardNumber', e.target.value)}
            placeholder="Card Number"
          />
          <input
            value={formData.expiry}
            onChange={(e) => updateField('expiry', e.target.value)}
            placeholder="Expiry"
          />
          <button onClick={prevStep}>Back</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}
```

---

## Dynamic Fields

### ✅ Add/Remove Fields

```typescript
interface Item {
  id: string;
  name: string;
  quantity: number;
}

function DynamicForm() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: '', quantity: 1 },
  ]);

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', quantity: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <form>
      {items.map((item, index) => (
        <div key={item.id}>
          <input
            value={item.name}
            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
            placeholder="Item name"
          />
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
            placeholder="Quantity"
          />
          {items.length > 1 && (
            <button type="button" onClick={() => removeItem(item.id)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem}>
        Add Item
      </button>
    </form>
  );
}
```

---

## References

- [Forms in React](https://react.dev/reference/react-dom/components#form-components)
- [Controlled vs Uncontrolled](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- [React Hook Form](https://react-hook-form.com/) (recommended library)
- [Formik](https://formik.org/) (alternative library)

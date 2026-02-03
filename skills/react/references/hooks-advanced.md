# Advanced Hook Patterns

> Deep dive into useState vs useReducer, custom hooks, and hook composition

## When to Read This

- Deciding between useState and useReducer for complex state
- Creating reusable custom hooks
- Managing hook dependencies and closures
- Working with refs for mutable values
- Need stable references across renders

---

## useState vs useReducer

### Decision Matrix

| Scenario                                | Use                    | Reason                  |
| --------------------------------------- | ---------------------- | ----------------------- |
| Single primitive value                  | `useState`             | Simple, direct          |
| 2-3 related values that update together | `useState` with object | Easier to read          |
| 4+ related values with complex updates  | `useReducer`           | Centralized logic       |
| State depends on previous state         | `useReducer`           | Prevents stale closures |
| Multiple state update functions         | `useReducer`           | Predictable transitions |
| Need to test state logic separately     | `useReducer`           | Testable reducer        |

### useState Patterns

#### ✅ Simple State

```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
const [isOpen, setIsOpen] = useState(false);
```

#### ✅ Functional Updates (Prevent Stale Closures)

```typescript
// ❌ WRONG: Stale closure in setTimeout
const [count, setCount] = useState(0);
setTimeout(() => {
  setCount(count + 1); // Uses stale count
}, 1000);

// ✅ CORRECT: Functional update
setTimeout(() => {
  setCount((prev) => prev + 1); // Always current
}, 1000);
```

#### ✅ Lazy Initialization

```typescript
// ❌ WRONG: Expensive computation on every render
const [data, setData] = useState(expensiveComputation());

// ✅ CORRECT: Lazy initializer (runs once)
const [data, setData] = useState(() => expensiveComputation());
```

#### ✅ Object State with Spreading

```typescript
const [form, setForm] = useState({ name: "", email: "" });

// Update single field
setForm((prev) => ({ ...prev, name: "John" }));

// Update multiple fields
setForm((prev) => ({ ...prev, name: "John", email: "john@example.com" }));
```

### useReducer Patterns

#### ✅ Complex State Logic

```typescript
interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: User }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "LOGOUT" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { user: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, {
  user: null,
  loading: false,
  error: null,
});

// Usage
dispatch({ type: "FETCH_START" });
dispatch({ type: "FETCH_SUCCESS", payload: userData });
```

#### ✅ Reducer with Immer (Immutable Updates)

```typescript
import { useReducer } from "react";
import { produce } from "immer";

const reducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case "ADD_TODO":
      draft.todos.push(action.payload);
      break;
    case "TOGGLE_TODO":
      const todo = draft.todos.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
      break;
  }
});
```

---

## Custom Hooks

### ✅ Extract Reusable Logic

```typescript
// ✅ Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage("theme", "dark");
```

### ✅ Custom Hook with Cleanup

```typescript
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Update ref when callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Usage
useInterval(() => {
  console.log("Tick");
}, 1000);
```

### ✅ Custom Hook with Multiple Values

```typescript
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Usage
const modal = useToggle();
modal.setTrue(); // Open
modal.toggle(); // Close
```

### ✅ Custom Hook Composition

```typescript
function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>("user", null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (credentials: Credentials) => {
      setLoading(true);
      try {
        const user = await api.login(credentials);
        setUser(user);
      } finally {
        setLoading(false);
      }
    },
    [setUser],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  return { user, loading, login, logout };
}
```

---

## useRef Patterns

### ✅ DOM References

```typescript
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focus = () => {
    inputRef.current?.focus();
  };

  return <input ref={inputRef} />;
}
```

### ✅ Mutable Values (No Re-render)

```typescript
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<number>();

  const start = () => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div>
      {count}
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### ✅ Previous Value Tracking

```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);
// prevCount is always the previous value
```

---

## useImperativeHandle

### ✅ Exposing Custom Ref API

```typescript
import { forwardRef, useImperativeHandle, useRef } from 'react';

interface InputHandle {
  focus: () => void;
  clear: () => void;
}

const CustomInput = forwardRef<InputHandle, { placeholder?: string }>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
  }));

  return <input ref={inputRef} {...props} />;
});

// Usage
function Parent() {
  const inputRef = useRef<InputHandle>(null);

  return (
    <div>
      <CustomInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
      <button onClick={() => inputRef.current?.clear()}>Clear</button>
    </div>
  );
}
```

---

## Hook Dependencies & Closures

### ⚠️ Stale Closures Problem

```typescript
// ❌ WRONG: Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // Always logs 0 (stale)
      setCount(count + 1); // Always adds to 0
    }, 1000);
    return () => clearInterval(id);
  }, []); // Missing count dependency

  return <div>{count}</div>;
}

// ✅ CORRECT: Functional update
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1); // Always current
  }, 1000);
  return () => clearInterval(id);
}, []); // No dependencies needed
```

### ✅ Exhaustive Dependencies

```typescript
// ✅ CORRECT: All dependencies listed
function SearchResults({ query, filters }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults(query, filters).then(setResults);
  }, [query, filters]); // Both dependencies

  return <div>{/* ... */}</div>;
}
```

### ✅ Stable References with useCallback

```typescript
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ WRONG: New function on every render
  const handleClick = () => {
    setCount(count + 1);
  };

  // ✅ CORRECT: Stable function reference
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // No dependencies with functional update

  return <MemoizedChild onClick={handleClick} />;
}
```

---

## Advanced Patterns

### ✅ State Machine with useReducer

```typescript
type State = "idle" | "loading" | "success" | "error";

type Action =
  | { type: "FETCH" }
  | { type: "SUCCESS" }
  | { type: "ERROR" }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (state) {
    case "idle":
      return action.type === "FETCH" ? "loading" : state;
    case "loading":
      return action.type === "SUCCESS"
        ? "success"
        : action.type === "ERROR"
          ? "error"
          : state;
    case "success":
    case "error":
      return action.type === "RESET" ? "idle" : state;
    default:
      return state;
  }
}
```

### ✅ Optimistic Updates

```typescript
function useMutation<T>(mutationFn: (data: T) => Promise<void>) {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (data: T) => {
      setOptimisticData(data); // Show immediately
      setError(null);

      try {
        await mutationFn(data);
      } catch (err) {
        setError(err as Error);
        setOptimisticData(null); // Rollback on error
      }
    },
    [mutationFn],
  );

  return { optimisticData, error, mutate };
}
```

---

## References

- [React Hooks API Reference](https://react.dev/reference/react)
- [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)

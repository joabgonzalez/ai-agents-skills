# useEffect Patterns

> Complete guide to side effects, cleanup, dependencies, and async operations

## When to Read This

- Implementing data fetching or subscriptions
- Managing timers, intervals, or event listeners
- Handling race conditions in async effects
- Understanding cleanup functions
- Debugging stale closure issues

---

## Effect Dependency Patterns

### ✅ Mount-Only Effect (Empty Dependencies)

```typescript
// Run once on mount, cleanup on unmount
useEffect(() => {
  console.log("Component mounted");

  return () => {
    console.log("Component unmounted");
  };
}, []); // Empty array = mount only
```

**Use cases:**

- Setting up global event listeners
- Initializing third-party libraries
- WebSocket connections
- Subscriptions that don't depend on props/state

### ✅ Reactive Effect (With Dependencies)

```typescript
useEffect(() => {
  console.log(`Count changed to ${count}`);
}, [count]); // Runs when count changes

useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]); // Runs when either changes
```

**Rules:**

- Include ALL values from component scope used inside effect
- ESLint rule `exhaustive-deps` helps catch missing dependencies
- If linter suggests adding dependency, add it (don't disable)

### ✅ Conditional Execution Inside Effect

```typescript
// ❌ WRONG: Conditional effect call
if (shouldFetch) {
  useEffect(() => fetchData(), []);
}

// ✅ CORRECT: Condition inside effect
useEffect(() => {
  if (shouldFetch) {
    fetchData();
  }
}, [shouldFetch]);
```

### ⚠️ Avoiding Dependency Hell

```typescript
// ❌ PROBLEM: Object dependency causes re-run on every render
const options = { method: "GET", headers: {} };
useEffect(() => {
  fetchData(options); // Re-runs every render (new object)
}, [options]);

// ✅ SOLUTION 1: Destructure primitive values
useEffect(() => {
  fetchData({ method: "GET", headers: {} });
}, []); // If options are static

// ✅ SOLUTION 2: useMemo for object identity
const options = useMemo(() => ({ method: "GET", headers: {} }), []);
useEffect(() => {
  fetchData(options);
}, [options]);

// ✅ SOLUTION 3: Separate primitive dependencies
useEffect(() => {
  const options = { method, headers };
  fetchData(options);
}, [method, headers]); // Track primitives
```

---

## Cleanup Patterns

### ✅ Cleanup for Subscriptions

```typescript
useEffect(() => {
  const subscription = dataSource.subscribe((data) => {
    setData(data);
  });

  // Cleanup: unsubscribe when component unmounts or effect re-runs
  return () => {
    subscription.unsubscribe();
  };
}, [dataSource]);
```

### ✅ Cleanup for Timers

```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    console.log("Delayed action");
  }, 1000);

  return () => clearTimeout(timeout);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### ✅ Cleanup for Event Listeners

```typescript
useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  window.addEventListener("resize", handleResize);

  // Cleanup: remove listener
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

### ✅ Cleanup for DOM Mutations

```typescript
useEffect(() => {
  document.body.classList.add("modal-open");

  return () => {
    document.body.classList.remove("modal-open");
  };
}, []);
```

---

## Async Patterns

### ✅ Async Data Fetching

```typescript
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    setLoading(true);
    try {
      const result = await api.getData(userId);
      if (!cancelled) {
        setData(result);
      }
    } catch (error) {
      if (!cancelled) {
        setError(error);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  fetchData();

  return () => {
    cancelled = true; // Prevent state updates after unmount
  };
}, [userId]);
```

### ✅ AbortController for Fetch Requests

```typescript
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        setError(error);
      }
    }
  }

  fetchData();

  return () => {
    controller.abort(); // Cancel ongoing request
  };
}, [userId]);
```

### ❌ NEVER: Async Effect Function Directly

```typescript
// ❌ WRONG: async effect function
useEffect(async () => {
  const data = await fetchData();
  setData(data);
}, []);

// ✅ CORRECT: async function inside effect
useEffect(() => {
  async function fetch() {
    const data = await fetchData();
    setData(data);
  }
  fetch();
}, []);
```

---

## Race Condition Handling

### ⚠️ The Problem

```typescript
// ❌ PROBLEM: Race condition
useEffect(() => {
  fetchUser(userId).then((user) => {
    setUser(user); // May set stale data if userId changed
  });
}, [userId]);

// Scenario: userId changes from 1 → 2 → 3
// Requests: R1, R2, R3
// Responses arrive: R3, R1, R2 (out of order)
// Result: Shows user 2 instead of user 3
```

### ✅ Solution 1: Cancellation Flag

```typescript
useEffect(() => {
  let cancelled = false;

  fetchUser(userId).then((user) => {
    if (!cancelled) {
      setUser(user); // Only update if not cancelled
    }
  });

  return () => {
    cancelled = true;
  };
}, [userId]);
```

### ✅ Solution 2: AbortController

```typescript
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((user) => setUser(user))
    .catch((err) => {
      if (err.name !== "AbortError") {
        setError(err);
      }
    });

  return () => controller.abort();
}, [userId]);
```

### ✅ Solution 3: Latest Request Tracking

```typescript
useEffect(() => {
  let latestRequest = userId;

  fetchUser(userId).then((user) => {
    if (latestRequest === userId) {
      setUser(user);
    }
  });

  return () => {
    latestRequest = null;
  };
}, [userId]);
```

---

## Debouncing & Throttling

### ✅ Debounced Effect

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Search with debounce
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchAPI(debouncedSearch).then(setResults);
    }
  }, [debouncedSearch]);

  return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />;
}
```

### ✅ Throttled Effect

```typescript
function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current),
    );

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
}
```

---

## Complex Effect Patterns

### ✅ Multiple Independent Effects

```typescript
// ✅ CORRECT: Separate effects for separate concerns
function UserProfile({ userId }) {
  // Effect 1: Fetch user data
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  // Effect 2: Track analytics
  useEffect(() => {
    analytics.track("profile_view", { userId });
  }, [userId]);

  // Effect 3: Update document title
  useEffect(() => {
    document.title = `Profile: ${user?.name}`;
  }, [user?.name]);
}

// ❌ WRONG: One effect for everything (harder to maintain)
useEffect(() => {
  fetchUser(userId).then(setUser);
  analytics.track("profile_view", { userId });
  document.title = `Profile: ${user?.name}`;
}, [userId, user?.name]); // Complex dependencies
```

### ✅ Effect with Multiple Cleanup Actions

```typescript
useEffect(() => {
  const ws = new WebSocket(url);
  const interval = setInterval(() => ping(), 30000);

  window.addEventListener("online", reconnect);

  return () => {
    ws.close();
    clearInterval(interval);
    window.removeEventListener("online", reconnect);
  };
}, [url]);
```

### ✅ Conditional Effect Execution

```typescript
// Skip effect if condition not met
useEffect(() => {
  if (!isAuthenticated) return;
  if (!userId) return;

  const subscription = subscribeToUser(userId);
  return () => subscription.unsubscribe();
}, [isAuthenticated, userId]);
```

---

## Stale Closure Solutions

### ⚠️ Problem: Stale Closure

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // Always logs 0 (stale)
    }, 1000);
    return () => clearInterval(id);
  }, []); // count not in dependencies

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### ✅ Solution 1: Functional Update

```typescript
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => {
      console.log(c); // Always current
      return c + 1;
    });
  }, 1000);
  return () => clearInterval(id);
}, []); // No dependencies needed
```

### ✅ Solution 2: Ref for Latest Value

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count; // Keep ref updated
  }, [count]);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current); // Always current
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### ✅ Solution 3: Include Dependency

```typescript
useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // Current value
  }, 1000);
  return () => clearInterval(id);
}, [count]); // Re-creates interval when count changes
```

---

## Effect Execution Order

### Component Lifecycle

```typescript
function Component() {
  console.log('1. Render');

  useEffect(() => {
    console.log('3. Effect (after DOM update)');

    return () => {
      console.log('4. Cleanup (before next effect or unmount)');
    };
  });

  console.log('2. Render complete');

  return <div>Component</div>;
}

// Output on mount:
// 1. Render
// 2. Render complete
// 3. Effect (after DOM update)

// Output on unmount:
// 4. Cleanup (before next effect or unmount)
```

### useLayoutEffect vs useEffect

```typescript
// useLayoutEffect: Runs synchronously after DOM mutations, before paint
useLayoutEffect(() => {
  // Measure DOM, synchronous updates
  const height = elementRef.current.offsetHeight;
  setHeight(height);
}, []);

// useEffect: Runs asynchronously after paint
useEffect(() => {
  // Data fetching, subscriptions, async operations
  fetchData().then(setData);
}, []);
```

**Use `useLayoutEffect` when:**

- Measuring DOM elements
- Synchronous DOM mutations to prevent flicker
- Animations that need to be in sync with render

**Use `useEffect` for:**

- Data fetching
- Subscriptions
- Event listeners
- Most side effects

---

## References

- [useEffect API Reference](https://react.dev/reference/react/useEffect)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

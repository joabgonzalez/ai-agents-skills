# React Performance Optimization

> useMemo, useCallback, React.memo, code splitting, and profiling strategies

## When to Read This

- Components re-rendering unnecessarily
- Expensive computations causing lag
- Large lists with performance issues
- Optimizing production bundle size
- Profiling with React DevTools

---

## Profiling First

### ⚠️ CRITICAL: Profile Before Optimizing

```typescript
// ❌ WRONG: Premature optimization
const expensiveValue = useMemo(() => x + y, [x, y]); // Not expensive!

// ✅ CORRECT: Profile first, optimize when needed
// 1. Open React DevTools Profiler
// 2. Record interaction
// 3. Identify actual bottlenecks
// 4. Apply specific optimization
```

**Rules:**

- Don't optimize without measuring
- Profile in production mode (`npm run build`)
- Focus on actual user interactions
- Optimize hot paths, not every component

---

## useMemo

### ✅ When to Use

Memoize expensive computations that run on every render:

```typescript
function DataGrid({ items, filter }) {
  // ✅ CORRECT: Expensive filtering memoized
  const filteredItems = useMemo(() => {
    console.log('Filtering...'); // Only logs when items/filter change
    return items
      .filter(item => item.name.includes(filter))
      .sort((a, b) => a.date - b.date);
  }, [items, filter]);

  return <div>{filteredItems.map(item => <Item key={item.id} {...item} />)}</div>;
}
```

### ❌ When NOT to Use

```typescript
// ❌ WRONG: Cheap computation (overhead > benefit)
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName],
);

// ✅ CORRECT: Direct computation
const fullName = `${firstName} ${lastName}`;
```

```typescript
// ❌ WRONG: Every value memoized (no benefit)
const count = useMemo(() => items.length, [items]); // items.length is cheap!

// ✅ CORRECT: Direct access
const count = items.length;
```

### ✅ Complex Calculations

```typescript
function Chart({ data }) {
  // ✅ Memoize: Complex statistical computation
  const statistics = useMemo(() => {
    return {
      mean: calculateMean(data),
      median: calculateMedian(data),
      stdDev: calculateStandardDeviation(data),
      percentiles: calculatePercentiles(data),
    };
  }, [data]);

  return <ChartComponent stats={statistics} />;
}
```

### ✅ Object/Array Identity

```typescript
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ WRONG: New array on every render
  const items = [1, 2, 3].map(n => ({ id: n, value: n * count }));

  // ✅ CORRECT: Stable identity when dependencies don't change
  const items = useMemo(() => {
    return [1, 2, 3].map(n => ({ id: n, value: n * count }));
  }, [count]);

  return <MemoizedChild items={items} />;
}
```

---

## useCallback

### ✅ When to Use

Memoize callback functions passed to memoized children:

```typescript
const MemoizedChild = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // ❌ WRONG: New function on every render
  const handleClick = () => {
    setCount(count + 1);
  };
  // MemoizedChild re-renders every time Parent renders

  // ✅ CORRECT: Stable function reference
  const handleClick = useCallback(() => {
    setCount(c => c + 1); // Functional update, no dependency
  }, []);
  // MemoizedChild only renders when needed

  return (
    <div>
      <button onClick={() => setOther(other + 1)}>Other: {other}</button>
      <MemoizedChild onClick={handleClick} />
    </div>
  );
}
```

### ❌ When NOT to Use

```typescript
// ❌ WRONG: Callback not passed to memoized component
function Component() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // No benefit if not passed to memo() child

  return <button onClick={handleClick}>Click</button>;
}

// ✅ CORRECT: Just use regular function
function Component() {
  const handleClick = () => console.log('Clicked');
  return <button onClick={handleClick}>Click</button>;
}
```

### ✅ With External Dependencies

```typescript
function Search({ initialQuery }) {
  const [results, setResults] = useState([]);

  // ✅ CORRECT: Memoized with dependencies
  const handleSearch = useCallback(async (query: string) => {
    const data = await searchAPI(query);
    setResults(data);
  }, []); // No external dependencies

  // ❌ PROBLEM: Uses external value
  const handleSearchWithFilter = useCallback(async (query: string) => {
    const data = await searchAPI(query, initialQuery); // Uses initialQuery
    setResults(data);
  }, []); // Missing initialQuery dependency!

  // ✅ CORRECT: Include dependency
  const handleSearchWithFilter = useCallback(async (query: string) => {
    const data = await searchAPI(query, initialQuery);
    setResults(data);
  }, [initialQuery]);

  return <SearchInput onSearch={handleSearch} />;
}
```

---

## React.memo

### ✅ Memoize Components

```typescript
// ❌ WRONG: Re-renders when parent re-renders (even if props same)
function ExpensiveChild({ data }) {
  console.log('Expensive render');
  return <ComplexVisualization data={data} />;
}

// ✅ CORRECT: Only re-renders when props change
const ExpensiveChild = React.memo(({ data }) => {
  console.log('Expensive render');
  return <ComplexVisualization data={data} />;
});
```

### ✅ Custom Comparison

```typescript
interface Props {
  user: User;
  metadata: Metadata;
}

// ✅ Custom comparison (only re-render when user.id changes)
const UserCard = React.memo(
  ({ user, metadata }: Props) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### ⚠️ Gotchas: Object/Function Props

```typescript
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ PROBLEM: New object on every render
  const config = { theme: 'dark', size: 'large' };

  // ❌ PROBLEM: New function on every render
  const handleClick = () => console.log('Click');

  // MemoizedChild ALWAYS re-renders (new props)
  return <MemoizedChild config={config} onClick={handleClick} />;
}

// ✅ SOLUTION: useMemo + useCallback
function Parent() {
  const [count, setCount] = useState(0);

  const config = useMemo(() => ({ theme: 'dark', size: 'large' }), []);
  const handleClick = useCallback(() => console.log('Click'), []);

  // MemoizedChild only re-renders when props actually change
  return <MemoizedChild config={config} onClick={handleClick} />;
}
```

---

## List Rendering Optimization

### ✅ Virtualization for Long Lists

```typescript
import { FixedSizeList } from 'react-window';

// ❌ WRONG: Render all 10,000 items
function LongList({ items }) {
  return (
    <div>
      {items.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}

// ✅ CORRECT: Virtualized (only render visible items)
function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <Item {...items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### ✅ Stable Keys

```typescript
// ❌ WRONG: Index as key (bugs on reorder/delete)
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ CORRECT: Unique stable ID
{items.map(item => <Item key={item.id} {...item} />)}
```

### ✅ Memoize List Items

```typescript
// ❌ WRONG: All items re-render when one changes
function TodoList({ todos, onToggle }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  );
}

// ✅ CORRECT: Each item only re-renders when its data changes
const TodoItem = React.memo(({ todo, onToggle }) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      {todo.text}
    </li>
  );
});

function TodoList({ todos, onToggle }) {
  const handleToggle = useCallback((id) => onToggle(id), [onToggle]);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
      ))}
    </ul>
  );
}
```

---

## Code Splitting

### ✅ Lazy Loading Components

```typescript
import { lazy, Suspense } from 'react';

// ❌ WRONG: Bundle all routes together
import Dashboard from './Dashboard';
import Settings from './Settings';
import Profile from './Profile';

// ✅ CORRECT: Code split by route
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));
const Profile = lazy(() => import('./Profile'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
```

### ✅ Named Exports with Lazy

```typescript
// Component.tsx
export function MyComponent() {
  return <div>Component</div>;
}

// App.tsx
const MyComponent = lazy(() =>
  import('./Component').then(module => ({ default: module.MyComponent }))
);
```

### ✅ Preloading

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Preload on hover
function App() {
  const handleMouseEnter = () => {
    import('./HeavyComponent'); // Start loading
  };

  return (
    <div>
      <button onMouseEnter={handleMouseEnter}>
        Show Heavy Component
      </button>
      <Suspense fallback={<div>Loading...</div>}>
        {showHeavy && <HeavyComponent />}
      </Suspense>
    </div>
  );
}
```

---

## State Optimization

### ✅ State Colocation

```typescript
// ❌ WRONG: State at top level (re-renders entire tree)
function App() {
  const [formData, setFormData] = useState({});
  return (
    <div>
      <Header />
      <Sidebar />
      <Form data={formData} onChange={setFormData} /> {/* Only Form needs this */}
      <Footer />
    </div>
  );
}

// ✅ CORRECT: State close to where it's used
function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <FormContainer /> {/* State inside here */}
      <Footer />
    </div>
  );
}

function FormContainer() {
  const [formData, setFormData] = useState({});
  return <Form data={formData} onChange={setFormData} />;
}
```

### ✅ Split State

```typescript
// ❌ WRONG: One big state object (all updates trigger full re-render)
const [state, setState] = useState({
  user: null,
  theme: "dark",
  sidebarOpen: false,
  notifications: [],
});

// ✅ CORRECT: Separate state by update frequency
const [user, setUser] = useState(null);
const [theme, setTheme] = useState("dark");
const [sidebarOpen, setSidebarOpen] = useState(false);
const [notifications, setNotifications] = useState([]);
```

---

## Bundle Size Optimization

### ✅ Import Only What You Need

```typescript
// ❌ WRONG: Import entire library
import _ from "lodash"; // 70KB+
const result = _.debounce(fn, 500);

// ✅ CORRECT: Import specific function
import debounce from "lodash/debounce"; // 3KB
const result = debounce(fn, 500);
```

### ✅ Analyze Bundle

```bash
# Generate bundle analysis
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json

# Or with Vite
npm run build
npx vite-bundle-visualizer
```

---

## Profiling with React DevTools

### ✅ Recording Profile

1. Open React DevTools → Profiler tab
2. Click record button
3. Perform the action you want to profile
4. Stop recording
5. Analyze flame graph and ranked chart

### ✅ Interpreting Results

**Flame Graph:**

- Width = time spent rendering
- Color = component type (yellow = slow)
- Height = component depth

**Ranked Chart:**

- Shows components ordered by render time
- Focus on top 5-10 slowest components

**Commit Timeline:**

- Each bar = one render commit
- Height = total render time
- Click to see which components rendered

---

## Common Performance Patterns

### ✅ Debounced Search

```typescript
function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch) {
      searchAPI(debouncedSearch).then(setResults);
    }
  }, [debouncedSearch]);

  return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />;
}
```

### ✅ Windowed Rendering

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div key={virtualItem.index} style={{ transform: `translateY(${virtualItem.start}px)` }}>
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## References

- [Optimizing Performance](https://react.dev/learn/render-and-commit)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)
- [React.memo](https://react.dev/reference/react/memo)

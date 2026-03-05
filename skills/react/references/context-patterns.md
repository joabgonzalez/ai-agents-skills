# Context Patterns & Component Composition

> Context API, compound components, render props, and state sharing strategies

## Core Patterns

- When to Read This
- Context API
- Context Performance Optimization
- Compound Components

---

## When to Read This

- Sharing state across components
- Avoiding prop drilling
- Building component APIs
- Creating flexible component compositions
- Performance issues with context

---

## Context API

### ✅ Basic Context Setup

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Content />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Current: {theme}</button>;
}
```

### ✅ Context with Reducer

```typescript
import { createContext, useContext, useReducer, ReactNode } from 'react';

interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' };

const initialState: State = {
  user: null,
  loading: false,
  error: null,
};

function authReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, loading: false, error: null };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function LoginForm() {
  const { state, dispatch } = useAuth();

  const handleLogin = async (credentials: Credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await api.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
    }
  };

  return <form onSubmit={handleLogin}>...</form>;
}
```

---

## Context Performance Optimization

### ⚠️ Problem: Unnecessary Re-renders

```typescript
// ❌ PROBLEM: All consumers re-render when any value changes
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({});

  const value = { user, setUser, theme, setTheme, settings, setSettings };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Component using only theme re-renders when user changes!
function ThemeButton() {
  const { theme, setTheme } = useApp();
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}
```

### ✅ Solution 1: Split Contexts

```typescript
// Separate contexts for independent data
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </UserProvider>
  );
}

// ThemeButton only re-renders when theme changes
function ThemeButton() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}
```

### ✅ Solution 2: Memoize Context Value

```typescript
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // ❌ WRONG: New object on every render
  const value = { user, setUser, theme, setTheme };

  // ✅ CORRECT: Memoized value
  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

### ✅ Solution 3: Selector Pattern

```typescript
const StateContext = createContext<State | undefined>(undefined);
const DispatchContext = createContext<Dispatch | undefined>(undefined);

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Only re-renders when selected value changes
function useSelector<T>(selector: (state: State) => T): T {
  const state = useContext(StateContext);
  if (!state) throw new Error('Must be used within provider');
  return selector(state);
}

// Only re-renders when theme changes
function ThemeButton() {
  const theme = useSelector(state => state.theme);
  const dispatch = useContext(DispatchContext);

  return <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>{theme}</button>;
}
```

---

## Compound Components

### ✅ Pattern: Implicit State Sharing

```typescript
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

export function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!;
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
      className={isActive ? 'active' : ''}
    >
      {children}
    </button>
  );
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useContext(TabsContext)!;
  if (activeTab !== id) return null;

  return <div role="tabpanel">{children}</div>;
}

// Clean API without prop drilling
function App() {
  return (
    <Tabs defaultTab="profile">
      <TabList>
        <Tab id="profile">Profile</Tab>
        <Tab id="settings">Settings</Tab>
        <Tab id="billing">Billing</Tab>
      </TabList>

      <TabPanel id="profile">
        <ProfileContent />
      </TabPanel>
      <TabPanel id="settings">
        <SettingsContent />
      </TabPanel>
      <TabPanel id="billing">
        <BillingContent />
      </TabPanel>
    </Tabs>
  );
}
```

### ✅ Pattern: Flexible Composition

```typescript
interface DropdownContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function Dropdown({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close }}>
      <div className="dropdown">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({ children }: { children: ReactNode }) {
  const { toggle } = useContext(DropdownContext)!;
  return <button onClick={toggle}>{children}</button>;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const { isOpen, close } = useContext(DropdownContext)!;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [close]);

  if (!isOpen) return null;

  return <div className="dropdown-menu">{children}</div>;
}

export function DropdownItem({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  const { close } = useContext(DropdownContext)!;

  const handleClick = () => {
    onClick();
    close();
  };

  return <button className="dropdown-item" onClick={handleClick}>{children}</button>;
}

function UserMenu() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onClick={() => navigate('/profile')}>Profile</DropdownItem>
        <DropdownItem onClick={() => navigate('/settings')}>Settings</DropdownItem>
        <DropdownItem onClick={logout}>Logout</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
```

---

## Render Props Pattern

### ✅ Flexibility with Render Props

```typescript
interface MousePosition {
  x: number;
  y: number;
}

function MouseTracker({ render }: { render: (pos: MousePosition) => ReactNode }) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{render(position)}</>;
}

function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>
          Mouse position: {x}, {y}
        </div>
      )}
    />
  );
}
```

### ✅ Children as Function

```typescript
function DataFetcher<T>({ url, children }: { url: string; children: (data: T | null, loading: boolean, error: Error | null) => ReactNode }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

function UserProfile() {
  return (
    <DataFetcher<User> url="/api/user">
      {(user, loading, error) => {
        if (loading) return <Spinner />;
        if (error) return <Error message={error.message} />;
        if (!user) return null;
        return <div>{user.name}</div>;
      }}
    </DataFetcher>
  );
}
```

---

## Hooks vs Render Props vs HOC

### Decision Matrix

| Pattern          | Use Case                              | Pros                          | Cons                          |
| ---------------- | ------------------------------------- | ----------------------------- | ----------------------------- |
| **Hooks**        | Most cases                            | Clean, composable, no nesting | Requires React 16.8+          |
| **Render Props** | Flexible rendering, multiple children | Type-safe, explicit           | Nesting, verbose              |
| **HOC**          | Legacy, decorators                    | Reusable, middleware          | Props collision, hard to type |

### ✅ Modern Approach: Hooks

```typescript
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

function App() {
  const { x, y } = useMousePosition();
  return <div>Mouse: {x}, {y}</div>;
}
```

---

## Provider Composition

### ✅ Multiple Providers

```typescript
// ❌ PROBLEM: Provider hell
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <RouterProvider>
            <QueryProvider>
              <AppContent />
            </QueryProvider>
          </RouterProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ✅ SOLUTION: Compose providers
function composeProviders(...providers: React.FC<{ children: ReactNode }>[]) {
  return providers.reduce(
    (Composed, Provider) =>
      ({ children }) => (
        <Composed>
          <Provider>{children}</Provider>
        </Composed>
      ),
    ({ children }) => <>{children}</>
  );
}

const AppProviders = composeProviders(
  AuthProvider,
  ThemeProvider,
  NotificationProvider,
  RouterProvider,
  QueryProvider
);

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
```

---

## Error Boundaries

Error boundaries catch JavaScript errors in their child component tree.

### Class-Based Error Boundary

```typescript
// ErrorBoundary.tsx — class component (hooks don't support error boundaries yet)
interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error boundary caught:', error, info.componentStack);
    // Report to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Usage Patterns

```typescript
// ✅ CORRECT: Granular error boundaries
function App() {
  return (
    <ErrorBoundary fallback={<AppCrashScreen />}>
      <Header />
      <ErrorBoundary fallback={<WidgetError />}>
        <Dashboard />
      </ErrorBoundary>
      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

// ✅ CORRECT: Error boundary with reset capability
function ResettableErrorBoundary({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(0);
  return (
    <ErrorBoundary key={key} fallback={
      <div>
        <p>Something went wrong.</p>
        <button onClick={() => setKey(k => k + 1)}>Try Again</button>
      </div>
    }>
      {children}
    </ErrorBoundary>
  );
}

// ❌ WRONG: Single error boundary wrapping entire app
<ErrorBoundary>
  <App /> {/* One error crashes everything */}
</ErrorBoundary>
```

**Note**: Error boundaries do NOT catch: event handlers (use try/catch), async code (use .catch()), SSR errors, or errors in the boundary itself.

---

## References

- [Context API](https://react.dev/reference/react/useContext)
- [Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Render Props](https://react.dev/reference/react/Component#render-props)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---
name: composition-patterns
description: "Component composition patterns for React, Astro, and React Native. Trigger: When building reusable component APIs, layout systems, or shared UI patterns."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - typescript
    - react
---

# Composition Patterns

Component composition patterns for building flexible, reusable UI across React, Astro, and React Native. Focus on API design over implementation details.

## When to Use

- Building reusable component libraries or design systems
- Creating layout components (cards, modals, tabs, accordions)
- Components need flexible content slots
- Reducing prop drilling through composition

Don't use for:
- Simple one-off components
- Components with fixed, non-customizable content
- Server-only components without interactivity

---

## Critical Patterns

### ✅ REQUIRED: Children Pattern (Composition Over Configuration)

```typescript
// ✅ CORRECT: Flexible via children
function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border p-4 shadow-sm">{children}</div>;
}

// Consumer controls content
<Card>
  <h2>Title</h2>
  <p>Any content here</p>
  <Button>Action</Button>
</Card>

// ❌ WRONG: Configuration via props (rigid)
function Card({ title, description, buttonText }: CardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2>{title}</h2>
      <p>{description}</p>
      <button>{buttonText}</button>
    </div>
  );
}
```

**Rule**: If content varies between uses, accept `children` instead of individual props.

### ✅ REQUIRED: Slots Pattern (Named Children)

```typescript
// ✅ CORRECT: Multiple content slots via props
interface PageLayoutProps {
  header: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

function PageLayout({ header, sidebar, children, footer }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header>{header}</header>
      <div className="flex flex-1">
        {sidebar && <aside className="w-64">{sidebar}</aside>}
        <main className="flex-1">{children}</main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

// Usage — consumer decides what goes in each slot
<PageLayout
  header={<NavBar />}
  sidebar={<SideMenu items={menuItems} />}
  footer={<Footer />}
>
  <DashboardContent />
</PageLayout>
```

### ✅ REQUIRED: Compound Components

Share implicit state across related components.

```typescript
// ✅ CORRECT: Compound component pattern
const TabsContext = createContext<{ active: string; setActive: (id: string) => void } | null>(null);

function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

function TabTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { active, setActive } = useContext(TabsContext)!;
  return (
    <button role="tab" aria-selected={active === value} onClick={() => setActive(value)}>
      {children}
    </button>
  );
}

function TabContent({ value, children }: { value: string; children: ReactNode }) {
  const { active } = useContext(TabsContext)!;
  if (active !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

// Attach sub-components
Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;

// Usage — clean, declarative API
<Tabs defaultValue="tab1">
  <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>
  <Tabs.Trigger value="tab2">Details</Tabs.Trigger>
  <Tabs.Content value="tab1"><Overview /></Tabs.Content>
  <Tabs.Content value="tab2"><Details /></Tabs.Content>
</Tabs>
```

### ✅ REQUIRED: Headless Components

Provide behavior without styling — consumer controls UI.

```typescript
// ✅ CORRECT: Headless toggle hook
function useToggle(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  return {
    isOpen,
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    getToggleProps: () => ({
      onClick: () => setIsOpen(prev => !prev),
      'aria-expanded': isOpen,
    }),
    getContentProps: () => ({
      hidden: !isOpen,
      role: 'region',
    }),
  };
}

// Consumer applies own styling
function FAQ({ question, answer }: { question: string; answer: string }) {
  const { getToggleProps, getContentProps } = useToggle();
  return (
    <div className="border-b">
      <button {...getToggleProps()} className="w-full text-left py-3 font-semibold">
        {question}
      </button>
      <div {...getContentProps()} className="pb-3 text-gray-600">
        {answer}
      </div>
    </div>
  );
}
```

### ✅ REQUIRED: Polymorphic Components

Render as different HTML elements via `as` prop.

```typescript
type PolymorphicProps<E extends ElementType> = {
  as?: E;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'children'>;

function Box<E extends ElementType = 'div'>({ as, children, ...props }: PolymorphicProps<E>) {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
}

// Usage — same component, different elements
<Box>Default div</Box>
<Box as="section" className="mt-4">Section element</Box>
<Box as="article">Article element</Box>
<Box as="a" href="/home">Link element</Box>
```

### ❌ NEVER: Prop-Heavy Configuration Components

```typescript
// ❌ WRONG: 10+ props for content configuration
function Modal({
  title, subtitle, icon, body, footer,
  primaryAction, primaryLabel, secondaryAction, secondaryLabel,
  showCloseButton, closeOnOverlay,
}: ModalProps) { /* ... */ }

// ✅ CORRECT: Composition-based
function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="modal">{children}</div>;
}

Modal.Header = ({ children }: { children: ReactNode }) => <div className="modal-header">{children}</div>;
Modal.Body = ({ children }: { children: ReactNode }) => <div className="modal-body">{children}</div>;
Modal.Footer = ({ children }: { children: ReactNode }) => <div className="modal-footer">{children}</div>;

// Consumer composes freely
<Modal onClose={close}>
  <Modal.Header><h2>Confirm Delete</h2></Modal.Header>
  <Modal.Body><p>Are you sure?</p></Modal.Body>
  <Modal.Footer>
    <Button onClick={close}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  </Modal.Footer>
</Modal>
```

---

## Decision Tree

```
Building a component API?
  Fixed content, no customization needed?
    → Simple component (no composition needed)
  Content varies between uses?
    → Children pattern
  Multiple distinct content areas?
    → Slots pattern (named ReactNode props)
  Related components share implicit state?
    → Compound components (Context + sub-components)
  Behavior without styling?
    → Headless component (hook or render props)
  Same component renders as different HTML elements?
    → Polymorphic component (as prop)
  Need all of the above?
    → Combine patterns (compound + headless + polymorphic)
```

---

## Astro Composition

```astro
---
// Astro uses slots for composition (similar to Vue/Svelte)
interface Props { variant?: 'default' | 'compact'; }
const { variant = 'default' } = Astro.props;
---

<div class:list={['card', variant]}>
  <div class="card-header">
    <slot name="header" />
  </div>
  <div class="card-body">
    <slot />  <!-- Default slot -->
  </div>
  <div class="card-footer">
    <slot name="footer" />
  </div>
</div>

<!-- Usage -->
<Card>
  <h2 slot="header">Title</h2>
  <p>Default content</p>
  <Button slot="footer">Action</Button>
</Card>
```

---

## React Native Composition

```typescript
// Same patterns apply — use children and slots
function ScreenLayout({ header, children, footer }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {header && <View style={styles.header}>{header}</View>}
      <ScrollView style={styles.content}>{children}</ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

// Usage
<ScreenLayout
  header={<ScreenTitle title="Profile" />}
  footer={<TabBar />}
>
  <ProfileContent user={user} />
</ScreenLayout>
```

---

## Edge Cases

**When to use render props over children**: When consumer needs access to internal state (e.g., `isOpen`, `selectedIndex`).

**Compound components without Context**: For 2-3 sub-components, `React.Children.map` can work. For 4+ or deeply nested, use Context.

**TypeScript generics with composition**: Use generic components for type-safe data rendering (e.g., `<List<User> items={users} renderItem={...} />`).

---

## Checklist

- [ ] Components accept `children` for variable content
- [ ] Layout components use named slots (ReactNode props) for multiple content areas
- [ ] Related components use compound pattern with shared Context
- [ ] Reusable behavior uses headless pattern (hooks)
- [ ] Components avoid 5+ content-configuration props (use composition instead)
- [ ] Polymorphic components support `as` prop with proper TypeScript types

---

## Resources

- [react](../react/SKILL.md) — React-specific patterns
- [react/context-patterns.md](../react/references/context-patterns.md) — Context API, compound components deep dive
- [conventions](../conventions/SKILL.md) — Naming and organization
- Related: [astro](../astro/SKILL.md), [react-native](../react-native/SKILL.md)

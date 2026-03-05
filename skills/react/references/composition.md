# React Composition Patterns

> React-specific implementation of Composition Over Configuration patterns.

---

## Core Patterns

- Children Pattern (Composition Over Configuration)
- Slots Pattern (Named Children)
- Compound Components
- Headless Components

---

## Children Pattern (Composition Over Configuration)

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

---

## Slots Pattern (Named Children)

Multiple content areas via named `ReactNode` props.

```typescript
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

// Consumer decides slot content
<PageLayout
  header={<NavBar />}
  sidebar={<SideMenu items={menuItems} />}
  footer={<Footer />}
>
  <DashboardContent />
</PageLayout>
```

---

## Compound Components

Share implicit state across related components via Context.

```typescript
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

// Usage
<Tabs defaultValue="tab1">
  <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>
  <Tabs.Trigger value="tab2">Details</Tabs.Trigger>
  <Tabs.Content value="tab1"><Overview /></Tabs.Content>
  <Tabs.Content value="tab2"><Details /></Tabs.Content>
</Tabs>
```

**When to use Context vs `React.Children.map`**: Use Context for 4+ sub-components or deeply nested trees. Use `React.Children.map` for 2-3 immediate children only.

---

## Headless Components

Behavior without styling — consumer controls all UI.

```typescript
function useToggle(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  return {
    isOpen,
    toggle: () => setIsOpen(prev => !prev),
    open:   () => setIsOpen(true),
    close:  () => setIsOpen(false),
    getToggleProps: () => ({
      onClick: () => setIsOpen(prev => !prev),
      'aria-expanded': isOpen,
    }),
    getContentProps: () => ({ hidden: !isOpen, role: 'region' }),
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

---

## Polymorphic Components

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

// Same component, different elements
<Box>Default div</Box>
<Box as="section" className="mt-4">Section element</Box>
<Box as="a" href="/home">Link element</Box>
```

---

## Prop-Heavy Anti-Pattern

```typescript
// ❌ WRONG: 10+ props for content configuration
function Modal({
  title, subtitle, icon, body, footer,
  primaryAction, primaryLabel, secondaryAction, secondaryLabel,
}: ModalProps) { /* ... */ }

// ✅ CORRECT: Composition-based with sub-components
function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="modal">{children}</div>;
}
Modal.Header = ({ children }: { children: ReactNode }) => <div className="modal-header">{children}</div>;
Modal.Body   = ({ children }: { children: ReactNode }) => <div className="modal-body">{children}</div>;
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

## React Native

Same patterns apply — use `children` and named props for slots.

```typescript
function ScreenLayout({ header, children, footer }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {header && <View style={styles.header}>{header}</View>}
      <ScrollView style={styles.content}>{children}</ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

<ScreenLayout header={<ScreenTitle title="Profile" />} footer={<TabBar />}>
  <ProfileContent user={user} />
</ScreenLayout>
```

---

## TypeScript Tips

**Type-safe generic data rendering:**

```typescript
// Render props with generics
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={keyExtractor(item)}>{renderItem(item, i)}</li>)}</ul>;
}

// Usage
<List<User> items={users} keyExtractor={u => u.id} renderItem={u => <UserCard user={u} />} />
```

---

## Cross-References

- **Main concept**: [composition-pattern/SKILL.md](../../composition-pattern/SKILL.md)
- **Context deep dive**: [context-patterns.md](context-patterns.md) — compound components, state sharing
- **React skill**: [react/SKILL.md](../SKILL.md)

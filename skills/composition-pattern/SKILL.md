---
name: composition-pattern
description: "Composition Over Configuration for flexible component design. Trigger: When building reusable UI components with flexible, consumer-controlled APIs."
license: "Apache 2.0"
metadata:
  version: "2.0"
  type: domain
---

# Composition Pattern

Build flexible, reusable UI by accepting dynamic content instead of configuration props. Components define structure; consumers provide content.

## When to Use

- Building reusable component libraries or design systems
- Layout components (cards, modals, tabs, accordions) with variable content
- Components that need flexible content slots
- Reducing prop drilling through composition

Don't use for:

- Simple one-off components with fixed content
- Components with no content variation between uses

---

## Critical Patterns

### ✅ REQUIRED: Children/Slots Over Configuration Props

Accept content dynamically — don't enumerate content via props.

```
// ❌ WRONG: Configuration props (rigid, hard to extend)
<Card title="Hello" description="..." buttonText="Click" />

// ✅ CORRECT: Children/slots (flexible, consumer controls content)
<Card>
  <h2>Hello</h2>
  <p>Any content here</p>
  <Button>Click</Button>
</Card>
```

**Rule**: If content varies between uses, accept children/slots instead of individual props.

**Framework implementations**:

- React: `children` prop + named `ReactNode` props for slots
- Vue/Svelte/Astro/Web Components: `<slot>` elements with `name` attribute
- Angular: `<ng-content select="[slot-name]">`

### ✅ REQUIRED: Named Slots for Multiple Content Areas

When a component has distinct content regions, use named slots.

```
// Layout with header, body, footer regions

// React
<PageLayout header={<NavBar />} footer={<Footer />}>
  <MainContent />
</PageLayout>

// Astro/Vue/Svelte
<PageLayout>
  <NavBar slot="header" />
  <MainContent />           <!-- default slot -->
  <Footer slot="footer" />
</PageLayout>
```

### ✅ REQUIRED: Compound Components (Shared State)

Related components that share implicit state — attach sub-components to parent.

```
// Parent manages state; children consume it via context/provide

<Tabs defaultValue="tab1">
  <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>
  <Tabs.Content value="tab1">...</Tabs.Content>
</Tabs>
```

Internal state flows through Context (React) or provide/inject (Vue) — consumers never manage it explicitly.

### ✅ REQUIRED: Headless Components

Separate behavior from styling. Export logic; consumer provides all UI.

```typescript
// Hook exports behavior only
const { isOpen, toggle, getToggleProps, getContentProps } = useToggle();

// Consumer applies own styling
<button {...getToggleProps()} className="my-button">Toggle</button>
<div {...getContentProps()} className="my-panel">Content</div>
```

### ✅ REQUIRED: Polymorphic Components (as/tag Prop)

Let consumers control the rendered HTML element or component type.

```
// Consumer decides the element — same styles, different semantic output
<Text as="h1">Title</Text>      → renders <h1>
<Text as="p">Paragraph</Text>   → renders <p>
<Text as="label">Label</Text>   → renders <label>

// Button that can render as an anchor
<Button as="a" href="/page">Go</Button>  → renders <a href="/page">
<Button>Submit</Button>                   → renders <button>
```

Use when the component's visual style is fixed but the HTML element varies by context (semantic correctness, accessibility, SEO). Never hard-code the element when it varies across use sites.

### ❌ NEVER: Prop Explosion

```
// ❌ WRONG: 8+ props enumerating content
<Modal title="..." subtitle="..." icon="..." body="..."
       primaryLabel="..." secondaryLabel="..." showClose />

// ✅ CORRECT: Sub-components compose freely
<Modal>
  <Modal.Header>...</Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```

---

## Decision Tree

```
Building a component API?
  Fixed content, no customization needed?
    → Simple component (no composition needed)
  Content varies between uses?
    → Children/default slot pattern
  Multiple distinct content areas?
    → Named slots pattern
  Related components share implicit state?
    → Compound components (Context / provide-inject)
  Reusable behavior without fixed styling?
    → Headless component (hook or render props)
  Same component renders as different HTML elements?
    → Polymorphic component (as/tag prop)
```

---

## Example

Building a composable `Card` component with named slots for header, body, and footer.

```typescript
// Card component defines structure; consumers control all content
interface CardProps {
  header?: React.ReactNode;   // named slot
  footer?: React.ReactNode;   // named slot
  children: React.ReactNode;  // default slot (body)
  className?: string;
}

function Card({ header, footer, children, className }: CardProps) {
  return (
    <div className={`card ${className ?? ""}`}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Consumer composes freely — no configuration props needed
<Card
  header={<h2>Order Summary</h2>}
  footer={<Button onClick={checkout}>Checkout</Button>}
>
  <OrderItemList items={cart.items} />
  <PriceSummary total={cart.total} />
</Card>

// Same Card, completely different content — no prop changes to Card itself
<Card header={<UserAvatar user={user} />}>
  <ProfileDetails user={user} />
</Card>
```

Patterns applied: children as default slot, named ReactNode props for distinct regions, optional slots (`header && ...`), consumer controls all content.

---

## Edge Cases

**Render props vs children**: Use render props when consumer needs access to internal state (e.g., `renderItem={(item) => <Item data={item} />}`).

**Compound without Context**: For 2-3 immediate children, `React.Children.map` works. For 4+ or deeply nested, use Context.

**Type-safe generics**: Parameterize render callbacks with generics (`List<T>`) to preserve type safety on the content consumer provides.

---

## Resources

- [react/references/composition.md](../react/references/composition.md) — React implementation: children, compound, headless, polymorphic
- [astro/references/composition.md](../astro/references/composition.md) — Astro implementation: named slots, fallback content, conditional slots
- [react/references/context-patterns.md](../react/references/context-patterns.md) — Context API + compound components deep dive

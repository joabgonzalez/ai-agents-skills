# Astro Composition Patterns

## Core Patterns

- Default and Named Slots: Use `<slot />` for default content and `<slot name="x" />` for multiple named content regions
- Slot Fallbacks: Provide default content inside `<slot>` elements when no content is passed
- Conditional Slots: Use `Astro.slots.has('name')` to conditionally render slot wrapper elements
- Layout Composition: Build page layouts with named slots for head, header, sidebar, and footer regions

> Slot-based composition in Astro components.

---

## Default and Named Slots

Astro uses `<slot>` elements instead of React's `children` prop.

```astro
---
// Card.astro
interface Props {
  variant?: 'default' | 'compact';
}
const { variant = 'default' } = Astro.props;
---

<div class:list={['card', variant]}>
  <div class="card-header">
    <slot name="header" />
  </div>
  <div class="card-body">
    <slot />  <!-- Default slot: unnamed content -->
  </div>
  <div class="card-footer">
    <slot name="footer" />
  </div>
</div>
```

```astro
<!-- Usage -->
<Card>
  <h2 slot="header">Title</h2>
  <p>Default slot content</p>
  <Button slot="footer">Action</Button>
</Card>
```

---

## Slot Fallback Content

Provide default content when slot is empty.

```astro
---
// Panel.astro
---

<div class="panel">
  <header class="panel-header">
    <slot name="header">
      <h2>Default Title</h2>  <!-- Fallback content -->
    </slot>
  </header>
  <div class="panel-body">
    <slot>
      <p>No content provided.</p>  <!-- Fallback content -->
    </slot>
  </div>
</div>
```

---

## Layout Components with Slots

Page layouts using named slots for regions.

```astro
---
// BaseLayout.astro
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<html lang="en">
  <head>
    <title>{title}</title>
    <slot name="head" />  <!-- Extra head content -->
  </head>
  <body>
    <header>
      <slot name="header">
        <nav>Default Navigation</nav>
      </slot>
    </header>

    <aside>
      <slot name="sidebar" />  <!-- Optional sidebar -->
    </aside>

    <main>
      <slot />  <!-- Main page content -->
    </main>

    <footer>
      <slot name="footer">
        <p>Default footer</p>
      </slot>
    </footer>
  </body>
</html>
```

```astro
---
// index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Home">
  <link slot="head" rel="stylesheet" href="/special.css" />
  <CustomNav slot="header" />
  <SideMenu slot="sidebar" />
  <HomeContent />
  <!-- No footer slot = uses default -->
</BaseLayout>
```

---

## Conditional Slots

Check if a slot has content using `Astro.slots.has()`.

```astro
---
// Card.astro
const hasFooter = Astro.slots.has('footer');
---

<div class="card">
  <div class="card-body">
    <slot />
  </div>

  {hasFooter && (
    <div class="card-footer">
      <slot name="footer" />
    </div>
  )}
</div>
```

---

## Slot with Dynamic Content

Pass data to slots using `Astro.slots.render()` (advanced).

```astro
---
// DataList.astro
interface Props {
  items: string[];
}
const { items } = Astro.props;
---

<ul>
  {items.map(item => (
    <li>
      <slot name="item" />  <!-- Each item slot -->
      {item}
    </li>
  ))}
</ul>
```

---

## Composition vs Props — Decision Guide

```
Content varies between uses?
  → Use <slot /> (default slot)

Multiple distinct content areas?
  → Use named slots: <slot name="header" />, <slot name="footer" />

Slot may be empty?
  → Add fallback content: <slot>Default text</slot>

Need to conditionally render slot wrapper?
  → Use Astro.slots.has('slotName') before rendering wrapper
```

---

## Cross-References

- **Main concept**: [composition-pattern/SKILL.md](../../composition-pattern/SKILL.md)
- **Astro skill**: [astro/SKILL.md](../SKILL.md)
- **React equivalent**: [react/references/composition.md](../../react/references/composition.md)

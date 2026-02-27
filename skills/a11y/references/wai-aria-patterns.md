# WAI-ARIA Widget Patterns

> Reference for complex interactive components. Source: [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

Use this file when building custom interactive components that semantic HTML alone cannot express. Each pattern includes the minimum ARIA required, keyboard contract, and a code example.

---

## Core Patterns

Widget patterns from WAI-ARIA APG for building fully accessible custom components.

---

### Navigation Landmark

**WCAG:** SC 1.3.1, SC 2.4.1

```html
<nav aria-label="Primary navigation">
  <ul>
    <li><a href="/home" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- Second nav on page needs a distinct label -->
<nav aria-label="Footer navigation">
  <ul>
    <li><a href="/privacy">Privacy</a></li>
  </ul>
</nav>
```

Rules: multiple `<nav>` elements must have distinct `aria-label`. `aria-current="page"` on active link.

---

### Disclosure (Accordion / Expandable)

**WCAG:** SC 4.1.2

```tsx
const [open, setOpen] = useState(false);

<button
  aria-expanded={open}
  aria-controls="section-panel"
  onClick={() => setOpen(!open)}
>
  Shipping details  {/* accessible name stays constant */}
</button>
<div id="section-panel" hidden={!open}>
  Panel content
</div>
```

Keyboard: `Enter` / `Space` toggles. No arrow key navigation required for basic disclosure.

Multi-panel accordion: each button controls its own panel independently unless single-expand is required by design.

---

### Dialog (Modal)

**WCAG:** SC 1.3.1, SC 2.1.2, SC 4.1.2

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"  // optional
>
  <h2 id="dialog-title">Confirm deletion</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
  <button>Confirm</button>
  <button>Cancel</button>
</div>
```

Focus management:

- Move focus to first focusable element (or the dialog itself) on open
- Trap focus inside: Tab cycles through focusable elements, Shift+Tab reverses
- Restore focus to the trigger element on close
- Escape dismisses

---

### Tabs

**WCAG:** SC 4.1.2

```html
<div role="tablist" aria-label="Settings sections">
  <button role="tab" aria-selected="true"  aria-controls="panel-general" id="tab-general">General</button>
  <button role="tab" aria-selected="false" aria-controls="panel-security" id="tab-security" tabindex="-1">Security</button>
</div>
<div role="tabpanel" id="panel-general" aria-labelledby="tab-general">...</div>
<div role="tabpanel" id="panel-security" aria-labelledby="tab-security" hidden>...</div>
```

Keyboard contract:

- `Tab` moves focus into the tab list (to the selected tab), then out to the panel
- `ArrowRight` / `ArrowLeft` move between tabs (roving tabindex: selected tab is `tabindex="0"`, others are `tabindex="-1"`)
- `Home` / `End` jump to first / last tab
- Activation: automatic (tab changes on arrow key) or manual (Enter/Space required)

---

### Combobox (Autocomplete / Search)

**WCAG:** SC 4.1.2

```html
<label for="country-input">Country</label>
<input
  id="country-input"
  role="combobox"
  aria-expanded="true"
  aria-autocomplete="list"
  aria-controls="country-listbox"
  aria-activedescendant="option-fr"
/>
<ul role="listbox" id="country-listbox">
  <li role="option" id="option-fr" aria-selected="true">France</li>
  <li role="option" id="option-de" aria-selected="false">Germany</li>
</ul>
```

Keyboard: `ArrowDown`/`ArrowUp` navigate options, `Enter` selects, `Escape` closes and returns focus to input.

---

### Listbox

**WCAG:** SC 4.1.2

```html
<ul role="listbox" aria-label="Preferred language" aria-multiselectable="false">
  <li role="option" aria-selected="true"  id="opt-en">English</li>
  <li role="option" aria-selected="false" id="opt-es">Spanish</li>
  <li role="option" aria-selected="false" id="opt-fr">French</li>
</ul>
```

Keyboard: `ArrowUp`/`ArrowDown` move focus, `Space` selects, `Home`/`End` jump to first/last option.

Roving tabindex or `aria-activedescendant` pattern for focus management.

---

### Menu / Menubar

**WCAG:** SC 4.1.2

```html
<ul role="menubar">
  <li role="none">
    <button role="menuitem" aria-haspopup="true" aria-expanded="false">File</button>
    <ul role="menu">
      <li role="none"><button role="menuitem">New</button></li>
      <li role="none"><button role="menuitem">Open</button></li>
    </ul>
  </li>
</ul>
```

Keyboard — menubar: `ArrowRight`/`ArrowLeft` move between top items, `ArrowDown` opens submenu.
Keyboard — menu: `ArrowDown`/`ArrowUp` navigate items, `Escape` closes and returns focus to trigger, `Enter`/`Space` activates.

Note: `role="menu"` is for application menus (like a toolbar). Navigation links belong in `<nav>`, not `role="menu"`.

---

### Live Regions

**WCAG:** SC 4.1.3

```html
<!-- Status messages (non-urgent) — polite waits for user idle -->
<div role="status" aria-live="polite" aria-atomic="true">
  Form saved successfully.
</div>

<!-- Alerts (urgent) — assertive interrupts immediately -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  Session expires in 2 minutes.
</div>

<!-- Loading state -->
<div aria-live="polite" aria-busy="true">
  Loading results...
</div>
```

Rules:

- `aria-atomic="true"` announces the entire region on change (not just the diff)
- Inject elements into already-rendered live regions — don't dynamically add the live region itself
- Throttle rapid updates to avoid overwhelming screen readers

---

### Breadcrumb

**WCAG:** SC 2.4.8

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/home">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/shoes" aria-current="page">Shoes</a></li>
  </ol>
</nav>
```

Use `<ol>` (ordered list — position matters). `aria-current="page"` on the current page item.

---

### Tooltip

**WCAG:** SC 1.3.1, SC 1.4.13

```html
<button aria-describedby="tooltip-save">
  💾
  <span class="sr-only">Save</span>
</button>
<div role="tooltip" id="tooltip-save">Save document (Ctrl+S)</div>
```

Rules:

- Tooltip must be dismissable with `Escape` without moving focus (WCAG 2.2)
- Tooltip must remain visible when hovered (WCAG 2.2 SC 1.4.13)
- Use `aria-describedby` (supplementary info), not `aria-labelledby` (replaces the name)
- Do not put interactive content inside a tooltip

---

### Alert Dialog (Confirmation)

**WCAG:** SC 1.3.1, SC 2.1.2, SC 4.1.2

Different from Dialog: the entire dialog IS the alert. Use for destructive or irreversible actions (delete, discard changes).

```tsx
<div
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="alert-title"
  aria-describedby="alert-desc"
>
  <h2 id="alert-title">Delete account?</h2>
  <p id="alert-desc">This action is permanent and cannot be undone.</p>
  <button>Delete</button>
  <button autoFocus>Cancel</button>  {/* default focus on safe action */}
</div>
```

Rules: `role="alertdialog"` (not `role="dialog"`). Default focus goes to the **safe/cancel action**, not the destructive one. Same focus trap and Escape rules as Dialog.

---

### Toggle Button

**WCAG:** SC 4.1.2

```html
<!-- Single toggle: aria-pressed -->
<button aria-pressed="false" onclick="this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') === 'true' ? 'false' : 'true')">
  Bold
</button>

<!-- Toggle group (radio-like): aria-checked on role="radio" -->
<div role="group" aria-label="Text alignment">
  <button role="radio" aria-checked="true">Left</button>
  <button role="radio" aria-checked="false">Center</button>
  <button role="radio" aria-checked="false">Right</button>
</div>
```

Rules: `aria-pressed` has three states: `"true"`, `"false"`, `"mixed"` (partial). The button label must NOT change with state — only `aria-pressed` changes. For mutually exclusive options, prefer `role="radio"` within a `role="group"`.

---

### Progressbar / Spinner

**WCAG:** SC 1.3.1, SC 4.1.3

```html
<!-- Determinate: known percentage -->
<div
  role="progressbar"
  aria-valuenow="65"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Upload progress"
>
  65%
</div>

<!-- Indeterminate: duration unknown — omit aria-valuenow -->
<div role="progressbar" aria-label="Loading results" aria-valuetext="Loading..."></div>

<!-- Spinner (CSS-only): must have accessible label -->
<div role="status" aria-label="Loading">
  <span class="sr-only">Loading...</span>
  <!-- spinner SVG with aria-hidden="true" -->
</div>
```

Rules: omit `aria-valuenow` for indeterminate progress. Use `role="status"` (not `progressbar`) for generic loading spinners without a measurable value. Inject into a live region or use `role="status"` so screen readers announce completion.

---

### Carousel / Slideshow

**WCAG:** SC 1.3.1, SC 2.1.1, SC 2.2.2

```html
<section aria-roledescription="carousel" aria-label="Featured products">
  <!-- Rotation control — must stop auto-rotation -->
  <button aria-label="Stop automatic slide show">Pause</button>

  <div aria-live="off">  <!-- "off" when auto-rotating, "polite" when manual -->
    <article aria-roledescription="slide" aria-label="1 of 3">
      Slide content
    </article>
  </div>

  <button aria-label="Previous slide">‹</button>
  <button aria-label="Next slide">›</button>
</section>
```

Rules:

- Auto-rotation must have a pause/stop control (SC 2.2.2)
- `aria-live="polite"` when user-controlled, `aria-live="off"` during auto-rotation
- Each slide needs a meaningful label

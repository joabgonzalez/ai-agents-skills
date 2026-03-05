# Design System Patterns with Tailwind

> Building consistent, maintainable design systems using token hierarchies, semantic naming, and type-safe variants.

## Core Patterns

- Token Hierarchy
- Semantic Naming Convention
- CVA (Class Variance Authority)
- Dark Mode Patterns

---

## Token Hierarchy

Organize design tokens in three layers for clarity and maintainability.

### Layer 1: Brand Tokens (Primitives)

Raw values in OKLCH color space for perceptual uniformity.

```css
@theme {
  /* Brand colors (OKLCH for better perception) */
  --color-brand-blue: oklch(45% 0.2 260);
  --color-brand-purple: oklch(50% 0.25 300);
  --color-brand-green: oklch(60% 0.15 140);
  --color-brand-red: oklch(60% 0.15 25);
  --color-brand-yellow: oklch(75% 0.12 85);

  /* Neutral scale */
  --color-neutral-950: oklch(15% 0 0);
  --color-neutral-900: oklch(20% 0 0);
  --color-neutral-800: oklch(30% 0 0);
  /* ... */
  --color-neutral-100: oklch(95% 0 0);
  --color-neutral-50: oklch(98% 0 0);
}
```

**Why OKLCH?**

- **Perceptual uniformity:** Equal lightness steps appear equal to human eye
- **Better gradients:** No muddy midtones (unlike HSL)
- **Chroma control:** Separate control over saturation vs brightness
- **Wide gamut:** Supports P3 color space (modern displays)

### Layer 2: Semantic Tokens

Purpose-driven names that reference brand tokens.

```css
@theme {
  /* Semantic colors (purpose, not appearance) */
  --color-primary: var(--color-brand-blue);
  --color-secondary: var(--color-brand-purple);
  --color-accent: var(--color-brand-green);
  --color-destructive: var(--color-brand-red);
  --color-warning: var(--color-brand-yellow);
  --color-success: var(--color-brand-green);

  /* Text colors */
  --color-foreground: var(--color-neutral-950);
  --color-muted-foreground: var(--color-neutral-600);

  /* Background colors */
  --color-background: var(--color-neutral-50);
  --color-surface: var(--color-neutral-100);
  --color-surface-elevated: var(--color-neutral-50);

  /* Border colors */
  --color-border: var(--color-neutral-300);
  --color-border-strong: var(--color-neutral-400);

  /* Interactive states */
  --color-ring: var(--color-primary);
  --color-input: var(--color-neutral-300);
}
```

**Semantic naming benefits:**

- Rebrand without find-replace (change token value, not usage)
- Self-documenting code (`bg-primary` > `bg-blue-500`)
- Easier dark mode (swap semantic token values)

### Layer 3: Component Tokens

Specific implementations for components.

```css
/* Component-level utilities */
.btn-primary {
  @apply bg-primary text-white hover:bg-primary/90;
}

.card-default {
  @apply bg-surface border border-border rounded-lg shadow-sm;
}

.input-default {
  @apply border-input bg-background focus:ring-2 focus:ring-ring;
}
```

---

## Semantic Naming Convention

Replace Tailwind's numbered scale with semantic names.

### Color Classes

```html
<!-- ✅ CORRECT: Semantic names -->
<button class="bg-primary text-primary-foreground">Primary</button>
<button class="bg-destructive text-destructive-foreground">Delete</button>
<div class="bg-surface text-foreground border border-border">Card</div>
<input class="border-input bg-background focus:ring-ring" />

<!-- ❌ WRONG: Number-based (couples to appearance) -->
<button class="bg-blue-500 text-white">Primary</button>
<button class="bg-red-600 text-white">Delete</button>
<div class="bg-gray-100 text-gray-900 border border-gray-300">Card</div>
```

### Complete Semantic Palette

| Token | Purpose | Example Usage |
|-------|---------|---------------|
| `primary` | Brand color, main actions | Primary buttons, links |
| `secondary` | Secondary brand color | Secondary buttons |
| `accent` | Highlight, emphasis | Badges, highlights |
| `destructive` | Dangerous actions | Delete buttons, error states |
| `warning` | Caution, alerts | Warning banners |
| `success` | Positive feedback | Success messages |
| `muted` | Less prominent content | Helper text, placeholders |
| `foreground` | Main text color | Body text, headings |
| `muted-foreground` | Secondary text | Captions, labels |
| `background` | Page background | Body background |
| `surface` | Card/panel background | Cards, modals, dropdowns |
| `surface-elevated` | Elevated surfaces | Tooltips, popovers |
| `border` | Default borders | Input borders, dividers |
| `border-strong` | Emphasized borders | Active states, focus |
| `ring` | Focus ring color | Focus outlines |
| `input` | Input border/background | Form inputs |

---

## CVA (Class Variance Authority)

Type-safe component variants with Tailwind classes.

### Basic Setup

```bash
npm install class-variance-authority clsx
```

### Simple Button Example

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; // clsx helper

const buttonVariants = cva(
  // Base classes (always applied)
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Component
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

// Usage
<Button>Default</Button>
<Button variant="destructive" size="lg">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
```

### Compound Variants

Apply classes based on multiple variant combinations.

```tsx
const alertVariants = cva(
  "rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive",
      },
      hasIcon: {
        true: "flex items-start gap-3",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "destructive",
        hasIcon: true,
        class: "border-destructive text-destructive-foreground",
      },
    ],
    defaultVariants: {
      variant: "default",
      hasIcon: false,
    },
  }
);
```

### Boolean Variants

```tsx
const cardVariants = cva(
  "rounded-lg border bg-surface p-6",
  {
    variants: {
      hoverable: {
        true: "transition-shadow hover:shadow-lg cursor-pointer",
        false: "",
      },
      bordered: {
        true: "border-2 border-primary",
        false: "border border-border",
      },
    },
  }
);

// Usage
<Card hoverable bordered>Interactive Card</Card>
```

---

## Dark Mode Patterns

Use `@custom-variant` for native dark mode support (Tailwind v4).

### Setup

```css
/* ✅ Tailwind v4: @custom-variant */
@custom-variant dark (&:where(.dark, .dark *));

.card {
  @apply bg-white dark:bg-gray-900;
  @apply text-black dark:text-white;
  @apply border-gray-200 dark:border-gray-800;
}

/* ❌ Tailwind v3: Config-based (deprecated in v4) */
// tailwind.config.js
module.exports = {
  darkMode: "class", // Don't use in v4
};
```

### Semantic Token Pairing

Define light/dark pairs in theme.

```css
@theme {
  /* Light mode (default) */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(15% 0 0);
  --color-surface: oklch(98% 0 0);
  --color-border: oklch(85% 0 0);
}

.dark {
  /* Dark mode overrides */
  --color-background: oklch(15% 0 0);
  --color-foreground: oklch(95% 0 0);
  --color-surface: oklch(20% 0 0);
  --color-border: oklch(30% 0 0);
}

/* Usage: Automatically adapts */
.card {
  background: var(--color-surface);
  color: var(--color-foreground);
  border-color: var(--color-border);
}
```

### Dark Mode Toggle

```tsx
const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-md bg-surface hover:bg-surface-elevated"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};
```

---

## Color Mixing (Semantic Alpha Variants)

Create alpha variants using `color-mix()`.

```css
@theme {
  /* Base color */
  --color-primary: oklch(45% 0.2 260);

  /* Alpha variants */
  --color-primary-alpha-10: color-mix(in oklch, var(--color-primary), transparent 90%);
  --color-primary-alpha-20: color-mix(in oklch, var(--color-primary), transparent 80%);
  --color-primary-alpha-30: color-mix(in oklch, var(--color-primary), transparent 70%);
  --color-primary-alpha-50: color-mix(in oklch, var(--color-primary), transparent 50%);
}

/* Usage */
.hover-overlay {
  background: var(--color-primary-alpha-10);
}

.backdrop {
  background: var(--color-primary-alpha-50);
}
```

**Benefits over Tailwind opacity:**

- Semantic naming (alpha-10 vs /10)
- Works with CSS variables
- Better dark mode support (mixes with theme background)

---

## Animation Management

Place `@keyframes` inside `@theme` blocks for tree-shakeable animations.

```css
@theme {
  /* Define animation variable */
  --animate-fade-in: fade-in 0.3s ease-in;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-spin: spin 1s linear infinite;

  /* @keyframes inside @theme (only outputs when used) */
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

/* Usage */
.modal {
  animation: var(--animate-fade-in);
}

.notification {
  animation: var(--animate-slide-up);
}

.loader {
  animation: var(--animate-spin);
}
```

**Advantages:**

- Tree-shaking: Unused `@keyframes` removed from build
- Scoped: No global namespace pollution
- Semantic: `animate-fade-in` > `animate-[fadeIn]`

---

## Component Examples

### Button with Full Variants

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Card with Variants

```tsx
const cardVariants = cva(
  "rounded-lg border bg-surface text-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-border-strong shadow-md",
        outlined: "border-2 border-primary",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);
```

### Alert with Icon Support

```tsx
const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive bg-destructive/10",
        warning: "border-warning/50 text-warning bg-warning/10",
        success: "border-success/50 text-success bg-success/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = ({ variant, icon, children }) => (
  <div className={alertVariants({ variant })}>
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </div>
);
```

---

## Best Practices

### 1. Token First, Utilities Second

```css
/* ✅ CORRECT: Define tokens, use utilities */
@theme {
  --color-primary: oklch(45% 0.2 260);
}

<button class="bg-primary">Click</button>

/* ❌ WRONG: Arbitrary values everywhere */
<button class="bg-[oklch(45%_0.2_260)]">Click</button>
```

### 2. Semantic Over Appearance

```css
/* ✅ Semantic: Describes purpose */
<div class="bg-surface border-border">Card</div>

/* ❌ Appearance: Couples to color */
<div class="bg-gray-100 border-gray-300">Card</div>
```

### 3. CVA for Components, Utilities for One-Offs

```tsx
/* ✅ Component: Use CVA */
const Button = ({ variant, size }) => (
  <button className={buttonVariants({ variant, size })} />
);

/* ✅ One-off: Use utilities directly */
<div className="flex items-center gap-2 p-4 rounded-lg bg-surface" />

/* ❌ WRONG: CVA for single-use layout */
const flexContainerVariants = cva("flex items-center gap-2"); // Overkill
```

### 4. Avoid Utility Sprawl

```tsx
/* ❌ WRONG: 20+ utility classes */
<button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
  Click
</button>

/* ✅ CORRECT: Extract to CVA */
<Button variant="default" size="default">Click</Button>
```

---

## Related Topics

- See [tailwind-v4.md](tailwind-v4.md) for v4-specific syntax and migration guide
- See [interface-design/visual-design.md](../../interface-design/references/visual-design.md) for typography/spacing/color foundations
- See [composition-pattern](../../composition-pattern/SKILL.md) for polymorphic component patterns
- See main [SKILL.md](../SKILL.md) for Tailwind utilities and configuration

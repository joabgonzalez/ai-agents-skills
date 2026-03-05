# Visual Design Foundations

> Systematic design constraints for visual consistency through typography, spacing, color, and iconography.

## Core Patterns

- Typography Scale
- Spacing System (8-Point Grid)
- Color System
- Iconography

---

## Typography Scale

### Modular Ratio-Based Sizing

Use a modular scale for consistent, harmonious type sizing.

```css
/* Base: 16px, Ratio: 1.25 (Major Third) */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Typographic Levels by Role

Each level has a distinct character beyond just size:

| Level | Weight | Tracking | Notes |
|-------|--------|----------|-------|
| **Display / Hero** | Bold (700–900) | Tight (−0.02em to −0.04em) | Short, punchy; tight tracking creates tension |
| **Headings** | Semibold (600) | Slightly tight (−0.01em) | Structural landmarks |
| **Body** | Regular (400) | Normal (0) | Comfortable reading weight |
| **Labels / UI** | Medium (500) | Slightly wide (+0.01em) | Small sizes need tracking to breathe |
| **Data / Numeric** | Monospace, tabular | Normal | Use `font-variant-numeric: tabular-nums` — numbers must align in columns |

```css
/* ✅ Data display: columns align, numbers don't shift */
.metric-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}

/* ✅ Display headline: tight tracking for impact */
.hero-title {
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
```

### Line-Height Rules

| Content Type | Line Height | Reasoning |
|--------------|-------------|-----------|
| Headings | 1.1 - 1.3 | Tighter spacing for visual impact |
| Body text | 1.5 - 1.7 | Comfortable reading, reduced eye strain |
| UI labels | 1.2 - 1.4 | Compact, fits in components |
| Code blocks | 1.5 | Aligns with monospace characters |

```css
/* ✅ CORRECT: Differentiated line-heights */
h1, h2, h3 { line-height: 1.2; }
p, li { line-height: 1.6; }
button, label { line-height: 1.3; }
code, pre { line-height: 1.5; font-family: monospace; }

/* ❌ WRONG: Same line-height for all */
* { line-height: 1.5; } /* Headings too loose, buttons too tall */
```

### Font Pairing Examples

> **⚠ Start here, then replace.** Generic defaults (Inter, Roboto, Space Grotesk, system-ui) are starting
> points for understanding structure — not final choices. The Aesthetic Direction requires committing to
> distinctive, characterful faces. See SKILL.md → "Commit to a Bold Aesthetic Direction".

| Heading Font | Body Font | Style |
|--------------|-----------|-------|
| Playfair Display | Source Sans Pro | Editorial, elegant |
| Syne | DM Sans | Geometric, contemporary |
| Fraunces | Libre Baskerville | Literary, warm |
| Cabinet Grotesk | Instrument Sans | Refined, versatile |

**Pairing rules:**

- Contrast serif with sans-serif, OR
- Use single font family with weight/size variation
- Limit to 2 font families maximum
- Ask: "Would swapping for Inter change the feel?" — if not, the font isn't doing its job

### Fluid Typography

Scale typography smoothly across screen sizes using `clamp()`.

```css
/* ✅ CORRECT: Fluid scaling */
h1 {
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 3rem);
  /* min: 1.5rem (24px), preferred: grows with viewport, max: 3rem (48px) */
}

p {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  /* min: 1rem (16px), preferred: grows slowly, max: 1.125rem (18px) */
}

/* ❌ WRONG: Fixed jumps at breakpoints */
h1 { font-size: 1.5rem; }
@media (min-width: 768px) { h1 { font-size: 2rem; } }
@media (min-width: 1024px) { h1 { font-size: 3rem; } }
```

**clamp() formula:**

```
clamp(MIN, PREFERRED, MAX)
PREFERRED = BASE + MULTIPLIER * vw

Example: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)
- At 320px width: 0.9rem + 0.5 * 3.2 = 1.06rem (clamped to min 1rem)
- At 1024px width: 0.9rem + 0.5 * 10.24 = 1.412rem (clamped to max 1.125rem)
```

### Font Loading Strategy

Prevent layout shift during font loading.

```css
/* ✅ CORRECT: font-display: swap */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately, swap when custom font loads */
  font-weight: 400;
}

/* ❌ WRONG: font-display: block (FOIT - Flash of Invisible Text) */
@font-face {
  font-display: block; /* Text invisible until font loads */
}
```

**font-display options:**

- `swap`: Show fallback immediately (best for web apps)
- `optional`: Use custom font only if cached (best for performance)
- `fallback`: Brief block period, then swap (compromise)

---

## Spacing System (8-Point Grid)

### Base Scale

```css
/* ✅ Base 8-point scale */
--space-1: 4px;   /* 0.25rem */
--space-2: 8px;   /* 0.5rem */
--space-3: 12px;  /* 0.75rem */
--space-4: 16px;  /* 1rem */
--space-5: 20px;  /* 1.25rem */
--space-6: 24px;  /* 1.5rem */
--space-8: 32px;  /* 2rem */
--space-10: 40px; /* 2.5rem */
--space-12: 48px; /* 3rem */
--space-16: 64px; /* 4rem */
```

**Why 8-point grid?**

- Divisible by 2 (scales well)
- Matches common screen densities (1x, 2x, 3x)
- Industry standard (iOS, Android, web)

### Component Spacing Guidelines

| Component | Padding | Gap/Margin | Reasoning |
|-----------|---------|------------|-----------|
| Cards | 16-24px | 16px | Comfortable content breathing room |
| Buttons | 12px vertical, 24px horizontal | 8px | Touch-friendly, visually balanced |
| Sections | 32-64px | 32-64px | Clear visual separation |
| List items | 8-12px | 4-8px | Compact but readable |
| Form fields | 12-16px | 16px | Easy to tap, clear grouping |

```css
/* ✅ CORRECT: Consistent spacing */
.card {
  padding: 1.5rem; /* 24px */
  margin-bottom: 1rem; /* 16px gap between cards */
}

.section {
  padding: 3rem 0; /* 48px vertical section spacing */
}

/* ❌ WRONG: Random values */
.card { padding: 17px; margin-bottom: 13px; } /* No system */
```

### Visual Rhythm (Sibling Margins)

Use margin-top for vertical flow to prevent collapsing margins.

```css
/* ✅ CORRECT: Margin-top for flow */
.content > * + * {
  margin-top: 1rem; /* All siblings get top margin */
}

.content > h2 + * {
  margin-top: 0.5rem; /* Reduce space after headings */
}

/* ❌ WRONG: Margin-bottom (causes collapsing) */
.content > * {
  margin-bottom: 1rem; /* Last element has unnecessary bottom margin */
}
```

---

## Color System

### Semantic Naming

Name colors by purpose, not appearance.

```css
/* ✅ CORRECT: Semantic names */
:root {
  --color-brand: #4f46e5;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  --color-neutral-900: #111827;
  --color-neutral-100: #f3f4f6;
}

/* ❌ WRONG: Appearance-based names */
:root {
  --color-blue: #4f46e5;
  --color-green: #10b981;
  --color-yellow: #f59e0b;
  --color-red: #ef4444;
}
```

**Why semantic?** If you rebrand from blue to purple, `--color-brand` updates once; `--color-blue` requires find-replace across codebase.

### Token Naming as Design Decision

Token names are part of the design system — they should evoke the product's world, not describe a generic structure.

```css
/* ✅ Domain-evocative names (finance product) */
:root {
  --color-surface-vault: #0f1117;     /* Primary background */
  --color-surface-ledger: #1a1d27;   /* Elevated surfaces */
  --color-accent-gold: #d4a847;      /* Brand accent */
  --color-text-primary: #f0eff4;
  --color-text-muted: #6b7280;
}

/* ❌ Generic token names */
:root {
  --color-gray-900: #0f1117;
  --color-gray-800: #1a1d27;
  --color-yellow-500: #d4a847;
}
```

**Rule:** If your token names could belong to any project, they're not doing their job. Names like `--surface-coal`, `--accent-ember`, `--text-fog` carry the product's voice into the codebase.

### Contrast Ratios (WCAG Compliance)

| Use Case | Ratio | Level | Example |
|----------|-------|-------|---------|
| Body text (<18px) | 4.5:1 | AA | #222 on #fff |
| Large text (≥18px) | 3:1 | AA | #555 on #fff |
| UI components (borders, icons) | 3:1 | AA | #767676 on #fff |
| Enhanced accessibility | 7:1 | AAA | #000 on #fff |

**Testing tools:**

- Chrome DevTools: Inspect element → Color picker shows ratio
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Figma: A11y plugins (Contrast, Stark)

### Luminance Calculation (Programmatic Contrast)

```javascript
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Example: Check contrast
const textColor = [34, 34, 34];    // #222
const bgColor = [255, 255, 255];   // #fff
const ratio = getContrastRatio(textColor, bgColor); // 16.1:1 (passes AAA)
```

### Dark Mode with CSS Custom Properties

```css
/* ✅ CORRECT: Paired light/dark */
:root {
  --color-text: #222;
  --color-bg: #fff;
  --color-surface: #f9fafb;
}

.dark {
  --color-text: #f5f5f5;
  --color-bg: #121212;
  --color-surface: #1e1e1e;
}

/* Usage */
body {
  color: var(--color-text);
  background: var(--color-bg);
}

/* ❌ WRONG: Separate light/dark declarations */
body { color: #222; background: #fff; }
.dark body { color: #f5f5f5; background: #121212; } /* Must override everything */
```

**Dark mode design principles:**

- **Shadows → borders**: In dark mode, box-shadows lose definition against dark surfaces — lean on subtle borders for elevation instead
- **Desaturate semantic colors**: Vibrant success/warning/error colors strain eyes on dark backgrounds — reduce saturation by 15–25%
- **Inverted lightness hierarchy**: Higher elevation = slightly lighter surface (dark mode reversal of light mode logic); avoid pure black (#000) and pure white (#fff)
- Plan from the start (retrofitting is painful)
- Test contrast in both modes — WCAG ratios apply equally

---

## Border Radius System

### Radius Scale + Semantic Meaning

Sharpness communicates personality. Commit to one character and apply it consistently.

```
Sharp (0–2px) → technical, precise, professional tools (IDEs, dashboards, CLIs)
Moderate (4–6px) → balanced, neutral (most SaaS apps)
Rounded (8–12px) → approachable, friendly (consumer apps, onboarding)
Pill (999px) → soft, playful (badges, tags, mobile-first)
```

```css
/* ✅ CORRECT: Consistent scale with committed character */
:root {
  --radius-sm: 4px;   /* inputs, buttons */
  --radius-md: 8px;   /* cards, dropdowns */
  --radius-lg: 12px;  /* modals, panels */
}

/* ❌ WRONG: Mixing characters */
.button { border-radius: 2px; }   /* Sharp = technical */
.card   { border-radius: 16px; } /* Round = friendly */
.modal  { border-radius: 4px; }  /* Back to sharp */
```

**Rule:** Large radius on small elements (e.g., `border-radius: 16px` on a `24px` button) creates a pill that signals a different product personality than intended.

---

## Iconography

**Principle:** Icons clarify, they don't decorate. Every icon must answer "what action or concept does this communicate?" If removed, the user should notice. Choose one icon family and use it exclusively — mixing Heroicons with Lucide with FontAwesome creates visual noise and inconsistent optical weight.

Give standalone icons (without adjacent labels) a subtle background container so they have enough target area and visual context.

### Sizing System

```css
/* ✅ Icon sizing scale */
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

**Usage guidelines:**

- `xs` (12px): Inline with small text, badges
- `sm` (16px): Inline with body text, table cells
- `md` (20px): Buttons, form inputs
- `lg` (24px): Navigation, feature icons
- `xl` (32px): Headers, empty states

### Optical Alignment

Visual center ≠ mathematical center. Adjust for perceived balance.

```svg
<!-- ✅ CORRECT: Optically centered -->
<svg viewBox="0 0 24 24">
  <!-- Triangle shifted slightly right for visual balance -->
  <path d="M8 5l10 7-10 7V5z" />
</svg>

<!-- ❌ WRONG: Mathematically centered (looks off) -->
<svg viewBox="0 0 24 24">
  <path d="M7 5l10 7-10 7V5z" />
</svg>
```

### Reusable Component Pattern

```tsx
// Type-safe icon component
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  name: string;
  size?: IconSize;
  className?: string;
}

const iconSizes: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const Icon = ({ name, size = 'md', className }: IconProps) => {
  const px = iconSizes[size];
  return (
    <svg width={px} height={px} className={className}>
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
};

// Usage
<Icon name="user" size="lg" />
<Icon name="search" size="sm" />
```

---

## Layout Foundations

### Grid Systems

```css
/* ✅ 12-column grid (desktop) */
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.col-6 {
  grid-column: span 6; /* Half width */
}

/* 4-column grid (mobile) */
@media (max-width: 640px) {
  .container {
    grid-template-columns: repeat(4, 1fr);
  }

  .col-6 {
    grid-column: span 4; /* Full width on mobile */
  }
}
```

### Baseline Grid Alignment

Align text to a baseline grid for vertical rhythm.

```css
/* ✅ 8px baseline grid */
body {
  line-height: 1.5; /* 16px * 1.5 = 24px (3 * 8px) */
}

h1 {
  font-size: 2rem; /* 32px */
  line-height: 1.25; /* 32px * 1.25 = 40px (5 * 8px) */
  margin-bottom: 1rem; /* 16px (2 * 8px) */
}
```

### Grouping by Proximity

Related elements should be visually grouped.

```css
/* ✅ CORRECT: Grouped form fields */
.form-group {
  margin-bottom: 1.5rem; /* 24px gap between groups */
}

.form-group label {
  margin-bottom: 0.25rem; /* 4px - tight coupling */
}

.form-group input {
  margin-bottom: 0.5rem; /* 8px - related but distinct */
}

/* ❌ WRONG: Equal spacing (no grouping) */
.form * {
  margin-bottom: 1rem; /* Everything equidistant */
}
```

### White Space as Active Design Element

White space (negative space) is not "empty" — it's a design tool.

**Functions:**

1. **Separation:** Distinguishes groups
2. **Emphasis:** Draws attention to isolated elements
3. **Breathing room:** Prevents visual clutter

```css
/* ✅ Generous white space for emphasis */
.hero {
  padding: 6rem 1rem; /* 96px vertical - creates focus */
}

.cta {
  margin: 4rem auto; /* 64px - isolates call-to-action */
}

/* ❌ Cramped layout */
.hero { padding: 1rem; } /* No breathing room */
```

---

## Related Topics

- See [responsive-design.md](responsive-design.md) for breakpoints, fluid layouts, and mobile-first patterns
- See [interaction-design.md](interaction-design.md) for visual feedback, motion, and transitions
- See main [SKILL.md](../SKILL.md) for integration into UX design process
- See [tailwindcss](../../tailwindcss/SKILL.md) for implementation with utility classes

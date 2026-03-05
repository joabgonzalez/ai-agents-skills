# Interaction Design Patterns

> "Motion should communicate, not decorate."

Interaction design covers the temporal and kinetic dimensions of UI: motion timing, micro-interactions, feedback patterns, and gesture-based interactions.

## Core Patterns

- Motion Timing Guidelines
- Core Interaction Categories
- Performance
- Micro-Interaction Examples

---

## Motion Timing Guidelines

| Duration | Use Case | Example | Reasoning |
|----------|----------|---------|-----------|
| **100-150ms** | Hover/click feedback | Button hover, ripple start | Immediate response, feels instant |
| **200-300ms** | Toggles, dropdowns | Switch animation, menu open | Quick but visible transition |
| **300-500ms** | Modals, page changes | Dialog fade-in, route transition | Perceivable without feeling slow |
| **500ms+** | Choreographed sequences | Multi-step onboarding, complex reveals | Communicates hierarchy/order |

**Golden rule:** Faster for small UI elements (buttons, toggles), slower for large layout changes (modals, pages).

```css
/* ✅ CORRECT: Timing matches element size */
.button {
  transition: background 150ms ease-out; /* Small element */
}

.modal {
  transition: opacity 300ms ease-in-out; /* Large element */
}

/* ❌ WRONG: Same timing for all */
* {
  transition: all 300ms; /* Button feels sluggish, modal rushes */
}
```

---

## Core Interaction Categories

### 1. Loading States

Maintain layout awareness during data fetching to prevent layout shift.

#### Skeleton Screens

```tsx
// ✅ CORRECT: Skeleton matches final layout
const UserCardSkeleton = () => (
  <div className="space-y-4">
    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" /> {/* Name */}
    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" /> {/* Email */}
    <div className="h-16 bg-gray-200 rounded animate-pulse" />    {/* Bio */}
  </div>
);

// ❌ WRONG: Generic spinner (no layout context)
const Loading = () => (
  <div className="flex justify-center">
    <Spinner /> {/* User doesn't know what's loading or how much */}
  </div>
);
```

**Skeleton principles:**

- Match final content structure (heading positions, image sizes)
- Use subtle animation (pulse, shimmer)
- Show immediately (0ms delay)
- Gracefully transition to real content

#### Progress Indicators

```tsx
// ✅ Determinate: Known duration
<ProgressBar value={uploadProgress} max={100} /> {/* 73% */}

// ✅ Indeterminate: Unknown duration
<Spinner /> {/* API call with unknown response time */}

// ✅ Linear: Top-of-page progress
<LinearProgress className="fixed top-0 left-0 right-0" />
```

**When to use:**

- **Skeleton:** Page/component loading (known structure)
- **Determinate:** File uploads, multi-step forms (known progress)
- **Indeterminate:** API calls, background tasks (unknown duration)
- **Linear:** Page transitions, long operations (minimal UI intrusion)

---

### 2. State Transitions

Smooth changes between states using spring physics.

#### Spring Physics (React Spring)

```tsx
import { useSpring, animated } from '@react-spring/web';

const Toggle = ({ isOn }: { isOn: boolean }) => {
  const springs = useSpring({
    opacity: isOn ? 1 : 0.5,
    transform: isOn ? 'scale(1)' : 'scale(0.95)',
    backgroundColor: isOn ? '#10b981' : '#6b7280',
    config: {
      tension: 300,  // Stiffness of spring
      friction: 20,  // Damping (higher = less bounce)
    },
  });

  return <animated.div style={springs}>Content</animated.div>;
};

// ❌ WRONG: Linear easing (feels mechanical)
<div style={{ transition: 'all 300ms linear' }}>Content</div>
```

**Spring config presets:**

- `default`: tension: 170, friction: 26 (gentle)
- `gentle`: tension: 120, friction: 14 (slow, smooth)
- `wobbly`: tension: 180, friction: 12 (bouncy)
- `stiff`: tension: 210, friction: 20 (quick, snappy)
- `slow`: tension: 280, friction: 60 (very slow)

#### Form State Changes

```tsx
// ✅ Input focus (150ms)
<input className="
  border-gray-300 focus:border-blue-500
  transition-colors duration-150
  focus:ring-2 focus:ring-blue-200
" />

// ✅ Validation error (300ms shake + color)
<input className={cn(
  "transition-all duration-300",
  hasError && "border-red-500 animate-shake"
)} />

// ✅ Success checkmark (200ms fade-in)
{isValid && (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
  >
    <CheckIcon className="text-green-500" />
  </motion.div>
)}
```

---

### 3. Feedback Patterns

Confirm user actions through visual/tactile responses.

#### Ripple Effect (Material Design)

```tsx
const RippleButton = ({ children, onClick }: ButtonProps) => {
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <button
      className="relative overflow-hidden"
      onClick={(e) => {
        createRipple(e);
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
};

// CSS
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: ripple-animation 600ms ease-out;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

#### Tactile Feedback

```css
/* ✅ Button press: scale down on mousedown */
.button {
  transition: transform 100ms ease-out;
}

.button:active {
  transform: scale(0.95);
}

/* ✅ Drag start: scale up + shadow */
.draggable {
  transition: transform 150ms, box-shadow 150ms;
}

.draggable.dragging {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* ✅ Drop: scale back + success */
.drop-target.dropped {
  animation: drop-success 200ms ease-out;
}

@keyframes drop-success {
  0% { transform: scale(1.05); }
  50% { transform: scale(0.95); background: #10b981; }
  100% { transform: scale(1); }
}
```

---

### 4. Page Transitions

AnimatePresence-based entry/exit animations.

#### Route Transitions (Framer Motion)

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ❌ WRONG: No exit animation (content pops out)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {children}
</motion.div>
```

**AnimatePresence modes:**

- `wait`: Exit completes before enter starts (no overlap)
- `sync`: Exit and enter run simultaneously
- `popLayout`: Removes exiting element from layout immediately

#### Easing Functions

> **Library note:** Framer Motion was renamed to **Motion** (`motion` package, motion.dev). The API is
> identical — `import { motion } from 'motion/react'` replaces `import { motion } from 'framer-motion'`.

**Easing character by product tone:**

- **Professional / dense tools** (dashboards, admin, IDE): deceleration easing (`easeOut`) — fast entry, smooth stop. Avoid spring or bounce — they feel playful in a context that demands efficiency.
- **Consumer / expressive apps**: spring physics can reinforce brand personality — use deliberately, not by default.

```typescript
// Matched easing for use case
const easings = {
  easeInOut: [0.4, 0, 0.2, 1],     // Most UI transitions (smooth start/end)
  easeOut: [0, 0, 0.2, 1],          // Entrances — preferred for professional interfaces
  easeIn: [0.4, 0, 1, 1],           // Exits (elements leaving)
  linear: [0, 0, 1, 1],             // Progress bars, loaders
  anticipate: [0.68, -0.55, 0.27, 1.55], // Playful bounce — consumer/expressive only
};

// Example usage
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 0.3, ease: easings.easeOut }}
/>
```

---

### 5. Gesture Interactions

Drag, swipe, constraint-based manipulations.

#### Drag with Constraints (Framer Motion)

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 100 }}
  dragElastic={0.2}
  onDragEnd={(e, info) => {
    if (info.offset.x > 100) {
      handleSwipeRight();
    } else if (info.offset.x < -100) {
      handleSwipeLeft();
    }
  }}
>
  Swipe me
</motion.div>
```

**Drag properties:**

- `drag`: Direction (`"x"`, `"y"`, or `true` for both)
- `dragConstraints`: Boundaries (object or ref to parent)
- `dragElastic`: Stretch beyond constraints (0 = rigid, 1 = infinite)
- `dragMomentum`: Continue motion after release (default: true)

#### Swipe to Dismiss

```tsx
const SwipeToDismiss = ({ onDismiss, children }: Props) => (
  <motion.div
    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    onDragEnd={(e, { offset, velocity }) => {
      // Dismiss if dragged >100px OR fast swipe
      if (offset.x > 100 || velocity.x > 500) {
        onDismiss();
      }
    }}
    className="bg-white rounded-lg shadow p-4"
  >
    {children}
  </motion.div>
);
```

#### Gesture Types

| Gesture | Trigger | Use Case | Example |
|---------|---------|----------|---------|
| **Pan** | Drag any direction | Reorder list items, move canvas | Trello cards |
| **Swipe** | Fast drag + velocity | Dismiss notification, next/prev | Tinder cards |
| **Pinch** | Multi-touch zoom | Image zoom, map scale | Google Maps |
| **Long press** | 500ms hold | Context menu, delete mode | iOS home screen |

---

## Performance

### 60fps Animation Checklist

- [ ] **Use `transform` and `opacity` only** (GPU-accelerated)
- [ ] **Avoid `width`, `height`, `top`, `left`** (layout-triggering)
- [ ] **Use `will-change` sparingly** (only during animation, remove after)
- [ ] **Debounce scroll/resize handlers** (throttle to 16ms)
- [ ] **Use `requestAnimationFrame`** for JS animations

```css
/* ✅ CORRECT: GPU-accelerated properties */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
  transition: transform 300ms, opacity 300ms;
}

/* ❌ WRONG: Layout-triggering properties */
.animated {
  width: 200px;      /* Causes reflow */
  left: 100px;       /* Causes reflow */
  margin-left: 50px; /* Causes reflow */
}
```

**Performance impact:**

- `transform`, `opacity`: ~1ms (GPU)
- `width`, `height`: ~10ms (CPU layout)
- `top`, `left`, `margin`: ~10ms (CPU layout)

### will-change Optimization

```css
/* ✅ CORRECT: Enable before animation, remove after */
.modal {
  will-change: transform, opacity; /* Before opening */
}

.modal.open {
  /* Animation happens */
}

.modal.closing {
  will-change: auto; /* Remove after closing */
}

/* ❌ WRONG: Permanent will-change (wastes GPU memory) */
.button {
  will-change: transform; /* Always enabled */
}
```

### Reduce Motion Support

Respect user preference for reduced motion (accessibility).

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**React example:**

```tsx
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
};

// Usage
const prefersReducedMotion = useReducedMotion();

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
/>
```

---

## Micro-Interaction Examples

### Toggle Switch Animation

```tsx
const Toggle = ({ checked, onChange }: ToggleProps) => (
  <button
    onClick={() => onChange(!checked)}
    className="relative w-12 h-6 rounded-full transition-colors duration-200"
    style={{ backgroundColor: checked ? '#10b981' : '#6b7280' }}
  >
    <motion.span
      className="absolute top-1 w-4 h-4 bg-white rounded-full"
      animate={{ left: checked ? '1.5rem' : '0.25rem' }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);
```

### Hover Card Reveal

```tsx
<motion.div
  whileHover={{
    scale: 1.05,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
  }}
  transition={{ duration: 0.2 }}
  className="card"
>
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileHover={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.2 }}
  >
    <p>Hidden content revealed on hover</p>
  </motion.div>
</motion.div>
```

### Loading Button

```tsx
const LoadingButton = ({ isLoading, children, onClick }: Props) => (
  <motion.button
    onClick={onClick}
    disabled={isLoading}
    animate={{
      scale: isLoading ? 0.95 : 1,
      opacity: isLoading ? 0.6 : 1,
    }}
  >
    {isLoading ? (
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        ⟳
      </motion.span>
    ) : (
      children
    )}
  </motion.button>
);
```

---

## Related Topics

- See [visual-design.md](visual-design.md) for color, typography, spacing foundations
- See [responsive-design.md](responsive-design.md) for mobile gesture considerations
- See main [SKILL.md](../SKILL.md) for UX flow integration
- See [react](../../react/SKILL.md) for React-specific animation libraries (Framer Motion, React Spring)

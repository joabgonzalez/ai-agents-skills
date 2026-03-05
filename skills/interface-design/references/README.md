# Interface Design References

## Quick Navigation

| Reference | Lines | Topic |
|-----------|-------|-------|
| [design-thinking.md](design-thinking.md) | ~300 | Design process, wireframing, UI patterns, validation |
| [visual-design.md](visual-design.md) | ~400 | Typography, spacing, color, iconography, layout |
| [interaction-design.md](interaction-design.md) | ~450 | Motion, micro-interactions, feedback, gestures, performance |
| [responsive-design.md](responsive-design.md) | ~420 | Mobile-first, breakpoints, fluid layouts, touch targets |

---

## Reading Strategy

### Planning a New Feature/Page

1. **START:** Main [SKILL.md](../SKILL.md) — User flow → Component hierarchy → State identification
2. **READ:** [design-thinking.md](design-thinking.md) — Wireframing process, UI pattern selection
3. **READ:** [visual-design.md](visual-design.md) — Typography scale, spacing tokens, color system
4. **READ:** [responsive-design.md](responsive-design.md) — Breakpoint strategy, mobile-first patterns
5. **READ:** [interaction-design.md](interaction-design.md) — Motion timing, transitions, feedback
6. **IMPLEMENT:** Use [react](../../react/SKILL.md), [mui](../../mui/SKILL.md), [tailwindcss](../../tailwindcss/SKILL.md)

### Designing for Mobile

1. **READ:** [responsive-design.md](responsive-design.md) — Mobile-first strategy, touch targets, viewport units
2. **READ:** [visual-design.md](visual-design.md) — Spacing system (8-point grid), touch target sizing
3. **READ:** [interaction-design.md](interaction-design.md) — Gesture patterns, tactile feedback, performance

### Adding Animations/Motion

1. **READ:** [interaction-design.md](interaction-design.md) — Timing guidelines, spring physics, performance optimization
2. **CHECK:** [visual-design.md](visual-design.md) — Color transitions, iconography animations
3. **CHECK:** `prefers-reduced-motion` support (accessibility)

### Building a Design System

1. **READ:** [visual-design.md](visual-design.md) — Token hierarchy, typography scale, color semantic naming
2. **READ:** [responsive-design.md](responsive-design.md) — Fluid typography, responsive patterns
3. **READ:** [interaction-design.md](interaction-design.md) — Consistent motion timing across components
4. **ALSO SEE:** [tailwindcss](../../tailwindcss/SKILL.md) for design system implementation with Tailwind

### Evaluating Existing UI

1. **START:** Main [SKILL.md](../SKILL.md) — Walk through user flows, validation checkpoints
2. **CHECK:** [visual-design.md](visual-design.md) — Typography consistency, spacing system, contrast ratios
3. **CHECK:** [responsive-design.md](responsive-design.md) — Mobile experience, touch targets, breakpoints
4. **CHECK:** [interaction-design.md](interaction-design.md) — Animation timing, feedback patterns, performance

---

## File Descriptions

### design-thinking.md (~300 lines)

Complete design thinking process from problem definition to implementation.

**Content:**

- 5-step design process with templates (Understand → Map → Structure → Validate → Implement)
- UI pattern comparisons (navigation, data display, input, feedback)
- ASCII wireframe examples
- Responsive design strategy with breakpoints
- Design validation questions (10 checkpoints)

**When to use:** Planning a new feature, choosing UI patterns, validating designs

---

### visual-design.md (~400 lines)

Systematic design constraints for visual consistency.

**Content:**

- **Typography:** Modular ratio-based scale (0.75rem → 3rem), line-height rules, font pairing, fluid typography with `clamp()`, font loading strategies
- **Spacing:** 8-point grid (4px → 64px), component spacing guidelines, visual rhythm patterns
- **Color:** Semantic naming, WCAG contrast ratios (4.5:1, 3:1, 7:1), luminance calculations, dark mode with CSS custom properties
- **Iconography:** Sizing system (12px → 32px), optical alignment, reusable component pattern
- **Layout:** Grid systems (12-column, 4-column), baseline grid alignment, grouping by proximity, white space as design element

**When to use:** Establishing visual system, ensuring consistency, calculating contrast, planning dark mode

---

### interaction-design.md (~450 lines)

Motion, micro-interactions, and temporal UI design.

**Content:**

- **Motion Timing:** Guidelines for different durations (100ms → 500ms+), easing functions
- **Loading States:** Skeleton screens, progress indicators (determinate/indeterminate)
- **State Transitions:** Spring physics, form state changes
- **Feedback Patterns:** Ripple effects, tactile feedback (scale, shadow)
- **Page Transitions:** AnimatePresence, route transitions, easing
- **Gesture Interactions:** Drag, swipe, pinch, long press patterns
- **Performance:** 60fps checklist, `will-change` optimization, `prefers-reduced-motion` support
- **Examples:** Ripple button, swipe-to-dismiss, toggle animations, loading button

**When to use:** Adding animations, designing interactions, optimizing performance, implementing gestures

---

### responsive-design.md (~420 lines)

Mobile-first responsive design patterns.

**Content:**

- **Mobile-First Strategy:** Progressive enhancement, `min-width` media queries
- **Breakpoints:** Standard sizes (sm: 640px → 2xl: 1536px), content-first approach
- **Container Queries:** Component-level responsiveness (not viewport-based)
- **Fluid Typography:** `clamp()` formula and calculator
- **Flexible Layouts:** `auto-fit`/`auto-fill` grids without breakpoints
- **Dynamic Viewport:** `dvh`, `svh`, `lvh` units for mobile browsers
- **Responsive Images:** `srcset`, `sizes`, `picture` element for art direction
- **Mobile Considerations:** Touch targets (44x44px), safe area insets (iOS notch), horizontal scrolling
- **Testing:** DevTools, real devices, touch testing, orientation, content extremes
- **Layout Patterns:** Stack → Sidebar, column count responsive, hide/show elements

**When to use:** Planning responsive layouts, mobile-first design, touch interactions, image optimization

---

## Cross-Reference Map

**Typography:**

- visual-design.md → Typography scale, line-height, font pairing
- responsive-design.md → Fluid typography with `clamp()`
- tailwindcss → Implementation with utility classes

**Spacing:**

- visual-design.md → 8-point grid, component spacing
- responsive-design.md → Mobile spacing, touch targets

**Motion:**

- interaction-design.md → Timing, spring physics, micro-interactions
- visual-design.md → Color transitions
- responsive-design.md → Mobile gestures

**Color:**

- visual-design.md → Semantic naming, contrast ratios, dark mode
- interaction-design.md → State transition colors
- a11y → Accessible color combinations

**Layout:**

- visual-design.md → Grid foundations, alignment
- responsive-design.md → Mobile-first, breakpoints, flexible grids
- design-thinking.md → Wireframing, component hierarchy

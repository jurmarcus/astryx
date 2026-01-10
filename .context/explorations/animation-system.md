# Animation System

*Exploration, January 2026*

## Context

XDS's core architecture enforces constraints: zero styling, theme-driven tokens, typed APIs. This exploration examines how animation fits into that constraint-based model.

The question isn't "which animation library should we use?" but rather "how does animation integrate with XDS's philosophy of no arbitrary values, theme as source of truth, and AI-friendly by constraint?"

**Assumption:** This document assumes XDS uses StyleX for styling (see `stylex-vs-tailwind.md` for that exploration). Animation implementation aligns with StyleX's compile-time, zero-runtime philosophy.

---

## Core Principle

**Animation is styling's sibling. Same rules apply.**

| XDS Principle | Animation Application |
|---------------|----------------------|
| **Zero-styling**: no inline styles, no style props | **Zero animation code**: no `animate={{}}`, no transition props |
| **Theme as source of truth** | Animation config lives in `theme.motion` |
| **Props define intent, not style** | `open={true}` expresses intent; animation is implementation detail |
| **Typed, constrained APIs** | Animation types are enums (`'fade' \| 'scale'`), not arbitrary values |
| **Swizzle for edge cases** | Swizzle component to override animation behavior |
| **AI-friendly by constraint** | AI writes `<Dialog open>`, knows nothing about animation |

```tsx
// What developers write:
<Dialog open={isOpen}>
  <DialogTitle>Confirm</DialogTitle>
  <DialogContent>Are you sure?</DialogContent>
</Dialog>

// Animation just happens (configured in theme)
```

---

## Why CSS Over an Animation Library

AI can implement animations easily either way, whether it's Motion or StyleX. The question is whether the tradeoffs justify adding a dependency.

| | CSS / StyleX | Motion (motion/react) |
|--|--------------|----------------------|
| **Enter animations** | ✅ `@starting-style` handles it | ✅ `initial → animate` |
| **Exit animations** | ⚠️ Need custom unmount delay | ✅ `AnimatePresence` for free |
| **Gesture animations** | ⚠️ More verbose, manual | ✅ First-class drag/swipe |
| **Spring physics** | ⚠️ Cubic-bezier approx (or DIY, but then why not Motion?) | ✅ Real springs |
| **Bundle size** | ✅ 0KB | ⚠️ ~18KB |
| **Philosophy fit** | ✅ Compile-time, no runtime | ⚠️ Runtime JS |

**The honest assessment:**
- For internal tools and standard UI, CSS handles 90% of animation needs
- Exit animations matter less than enter animations. Instant removal is acceptable
- Fancy gesture animations (drag-to-dismiss, spring physics) require more code with CSS, but AI can still write it

**Decision:** Start with CSS. Avoid the dependency unless we want to go all-in on animations. If exit animations or gestures become critical later, we can adopt Motion for specific components. The public API (`<Dialog open>`) stays the same either way.

---

## Theme API Design

### Full Motion Config

```tsx
createTheme({
  motion: {
    // ─────────────────────────────────────────────
    // GLOBAL CONTROLS
    // ─────────────────────────────────────────────

    enabled: true,              // Kill switch for all animations
    reducedMotion: 'respect',   // 'respect' | 'always-reduce' | 'ignore'

    // ─────────────────────────────────────────────
    // TIMING TOKENS
    // ─────────────────────────────────────────────

    duration: {
      instant: 0,
      fast: 100,
      normal: 200,
      slow: 300,
    },

    // ─────────────────────────────────────────────
    // EASING TOKENS
    // ─────────────────────────────────────────────

    easing: {
      linear: 'linear',
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    // ─────────────────────────────────────────────
    // PER-COMPONENT DEFAULTS
    // ─────────────────────────────────────────────

    components: {
      dialog: { type: 'fade', duration: 'normal', easing: 'easeOut' },
      drawer: { type: 'slide', duration: 'normal', easing: 'easeOut' },
      accordion: { type: 'collapse', duration: 'fast', easing: 'easeOut' },
      popover: { type: 'fade', duration: 'fast', easing: 'default' },
      tooltip: { type: 'fade', duration: 'fast', easing: 'default' },
      bottomSheet: { type: 'slide-up', duration: 'normal', easing: 'spring' },
      toast: { type: 'slide', duration: 'fast', easing: 'easeOut' },
      menu: { type: 'fade', duration: 'fast', easing: 'default' },
      ...
      [typeof Component]: { ... }, // Type-safe config for all components
    },
  }
})
```

### Type Safety

The motion config is fully typed. Each component only accepts animation types that make sense for it:

```tsx
type DurationToken = 'instant' | 'fast' | 'normal' | 'slow';
type EasingToken = 'linear' | 'default' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';

// Each component defines which animation types it supports
type DialogAnimationType = 'fade' | 'scale' | 'none';
type DrawerAnimationType = 'slide' | 'none';
type AccordionAnimationType = 'collapse' | 'none';
// ... etc

// Theme authors get constrained autocomplete
createTheme({
  motion: {
    components: {
      dialog: { type: 'fade' },       // ✅ Valid
      dialog: { type: 'slide' },      // ❌ Type error: dialog doesn't support 'slide'
      drawer: { type: 'slide' },      // ✅ Valid
      accordion: { type: 'collapse' }, // ✅ Valid
    },
  }
})
```

### StyleX Token Definition

The theme's motion config generates StyleX variables that components consume internally:

```tsx
import * as stylex from '@stylexjs/stylex';

// Theme defines motion tokens via defineVars
export const motionTokens = stylex.defineVars({
  // Durations
  durationInstant: '0ms',
  durationFast: '100ms',
  durationNormal: '200ms',
  durationSlow: '300ms',

  // Easings
  easingLinear: 'linear',
  easingDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easingEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easingEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easingSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
});

// Components use tokens in stylex.create()
const dialogStyles = stylex.create({
  overlay: {
    opacity: 1,
    transition: `opacity ${motionTokens.durationNormal} ${motionTokens.easingEaseOut}`,
  },
});
```

### Theme Variants

**Snappy theme** (power users, internal tools):
```tsx
const snappyTheme = createTheme({
  motion: {
    duration: { fast: 50, normal: 100, slow: 150 },
    easing: { default: 'linear' },
  }
})
```

**Smooth theme** (consumer-facing):
```tsx
const smoothTheme = createTheme({
  motion: {
    duration: { fast: 150, normal: 250, slow: 400 },
    easing: { default: 'spring' },
    components: {
      dialog: { type: 'scale', easing: 'spring' },
      bottomSheet: { easing: 'spring' },
    },
  }
})
```

**No animation theme** (accessibility, performance, testing):
```tsx
const noMotionTheme = createTheme({
  motion: { enabled: false }
})
```

---

## Swizzle Integration

Animation customization follows the dual-path swizzle model from `swizzle-layer-ergonomics.md`.

### Path A: Theme Customization

For timing/easing/type changes:

```bash
npx xds customize motion --theme=corporate
```

Generates `themes/corporate/motion.ts`:

```tsx
import { extendTheme } from '@xds/core';

export const corporateMotionTheme = extendTheme({
  motion: {
    duration: { fast: 80, normal: 160, slow: 240 },
    easing: { default: 'easeOut', spring: 'cubic-bezier(...)' },
    components: {
      dialog: { type: 'scale' },
      bottomSheet: { easing: 'spring' },
    },
  }
});
```

**AI vibes:** ✅ Excellent: structured config, no animation code.

### Path B: Component Swizzle

For completely custom animation behavior:

```bash
npx xds swizzle Dialog
```

Full component source with animation implementation. Yours to modify.

**AI vibes:** ⚠️ Medium: code, but documented customization points.

---

## Component Animation Patterns

Components fall into a few animation patterns. Here's how each works with the system.

### Pattern 1: Overlay Components (Dialog, Drawer, BottomSheet, AlertDialog)

**What animates:** Backdrop fades in, content slides/scales in.

**How it works:** Component reads `open` prop, applies styles based on `data-state="open|closed"`. StyleX styles use `@starting-style` for enter animation.

```tsx
// Internal implementation (user never sees this)
const styles = stylex.create({
  overlay: {
    opacity: {
      default: 1,
      '@starting-style': 0,
    },
    transition: `opacity ${motionTokens.durationNormal} ${motionTokens.easingEaseOut}`,
  },
  content: {
    transform: {
      default: 'translateY(0)',
      '@starting-style': 'translateY(100%)',
    },
    transition: `transform ${motionTokens.durationNormal} ${motionTokens.easingEaseOut}`,
  },
});
```

**Theme config:** `motion.components.dialog`, `motion.components.drawer`, etc.

### Pattern 2: Collapse Components (Accordion, Collapsible)

**What animates:** Height from 0 to auto.

**How it works:** CSS grid trick: `grid-template-rows: 0fr` to `1fr`. No JS measurement needed. See [Appendix: CSS Grid Height Trick](#appendix-css-grid-height-trick) for implementation.

**Theme config:** `motion.components.accordion`, `motion.components.collapsible`

### Pattern 3: Popup Components (Popover, Tooltip, Menu)

**What animates:** Fade in (optionally scale from anchor point).

**How it works:** Similar to overlays but positioned relative to trigger. Fast timing.

```tsx
const styles = stylex.create({
  popup: {
    opacity: {
      default: 1,
      '@starting-style': 0,
    },
    transition: `opacity ${motionTokens.durationFast} ${motionTokens.easingDefault}`,
  },
});
```

**Theme config:** `motion.components.popover`, `motion.components.tooltip`, `motion.components.menu`

### Pattern 4: Notification Components (Toast)

**What animates:** Slide in from edge of screen.

**How it works:** Positioned fixed, slides from off-screen. May need exit animation for dismiss.

```tsx
const styles = stylex.create({
  toast: {
    transform: {
      default: 'translateX(0)',
      '@starting-style': 'translateX(100%)',
    },
    transition: `transform ${motionTokens.durationFast} ${motionTokens.easingEaseOut}`,
  },
});
```

**Theme config:** `motion.components.toast`

### Pattern 5: Tab Content (Tabs)

**What animates:** Content panel crossfade (optional).

**How it works:** If enabled, outgoing panel fades out while incoming fades in. Often skipped. Instant switch is fine.

**Theme config:** `motion.components.tabs` (default: `{ type: 'none' }`)

---

## Design Decisions

### Reduced Motion

Handled by default. XDS respects `prefers-reduced-motion` automatically. Duration becomes `0ms` when the OS preference is set. Developers write no motion-awareness code.

Themes can optionally override via `motion.reducedMotion`:
- `'respect'` (default): honor OS preference
- `'always-reduce'`: force reduced motion
- `'ignore'`: ignore OS preference (accessibility concern)

### Animation Primitives

Not exported. Animation is internal implementation detail. Swizzle is the escape hatch for custom behavior.

---

## Next Steps

1. **Prototype a few components with StyleX animations** to validate this approach works well in practice
2. Test `@starting-style` behavior across browsers (Chrome, Safari, Firefox fallback)
3. Ensure the developer experience is not too cumbersome for building animated components
4. Evaluate if exit animations are truly skippable or if we need the `useAnimatedUnmount` hook

---

## Open Questions

- Should exit animations be skipped entirely (instant removal), or should we implement a small `useAnimatedUnmount` hook to delay unmount?
- Are we definitely using StyleX? (See `stylex-vs-tailwind.md`, this doc assumes yes)

---

# Appendix: Alternatives Considered

*This section documents approaches that were evaluated but not selected.*

---

## Alternative: Motion Library (motion/react)

We chose CSS/StyleX over Motion. Here's the detailed comparison:

| Aspect | CSS / StyleX | Motion |
|--------|--------------|--------|
| **Bundle size** | ~0KB | ~18KB |
| **Enter animations** | ✅ `@starting-style` | ✅ `initial → animate` |
| **Exit animations** | ⚠️ Hacky or skip | ✅ `AnimatePresence` |
| **Spring physics** | ⚠️ Cubic-bezier approx (or build our own, but then why not just use Motion?) | ✅ Real springs |
| **Philosophy fit** | ✅ Compile-time | ⚠️ Runtime |

**Browser support note:** `@starting-style` works in Chrome 117+, Safari 17.4+. Firefox falls back to no enter animation (content just appears, not broken, just not animated).

**StyleX animation example:**
```tsx
import * as stylex from '@stylexjs/stylex';
import { motionTokens } from '@xds/theme';

const styles = stylex.create({
  dialog: {
    opacity: 1,
    transform: 'scale(1)',
    transition: `opacity ${motionTokens.durationNormal} ${motionTokens.easingEaseOut}, transform ${motionTokens.durationNormal} ${motionTokens.easingEaseOut}`,
  },
});
```

---

## Alternative A: Expose Animation Primitives

Ship `<Fade>`, `<Slide>`, `<Collapse>` as public components.

```tsx
import { Fade } from '@xds/motion'

<Fade in={isOpen}>
  <Dialog>...</Dialog>
</Fade>
```

### Why Not Selected

| Issue | Impact |
|-------|--------|
| **Wrapper div problem** | Primitives wrap children in a `<div>`, breaks flexbox/grid, CSS selectors, accessibility |
| **Cognitive load** | Devs must know which primitive goes with which component |
| **Inconsistency** | Team A uses `<Fade>`, Team B uses `<Scale>`, leads to disjointed UX |
| **AI complexity** | AI must generate animation code, more failure modes |
| **Contradicts philosophy** | XDS promises no styling decisions; exposing animation primitives is a styling decision |

### Workarounds Considered

- `asChild` pattern (Radix-style) to merge into child element
- `useAnimation` hook for devs who want no wrapper
- Render props pattern

All add complexity. If animation is internal, none of this is needed.

---

## Alternative B: Animation Props on Components

Add `transition` prop to each component:

```tsx
<Dialog open={isOpen} transition="fade" duration="normal">
  ...
</Dialog>
```

### Why Not Selected

- Animation decisions scattered across component usage
- Different devs choose different animations, leads to inconsistent UX
- Every component needs animation props
- Still requires animation knowledge from developers

---

## Libraries Evaluated

| Library | Size | Exit Animations | Layout Animations | Notes |
|---------|------|-----------------|-------------------|-------|
| **CSS-only** | 0KB | ❌ | ❌ | Limited capability |
| **Headless UI Transition** | ~3KB | ✅ | ❌ | Class-string API, Tailwind-flavored |
| **@formkit/auto-animate** | ~2KB | ✅ | ✅ | Magic "just works", less control |
| **Motion (motion/react)** | ~18KB | ✅ | ✅ | Full capability, best DX |
| **React Transition Group** | ~7KB | ✅ | ❌ | Dated API, class-based |
| **View Transitions API** | 0KB | ✅ | ✅ | Browser-native, Chrome/Safari only |

**Why not Headless UI Transition?** Class-string API (`enter="transition duration-200"`) exposes styles, contradicting XDS philosophy.

**Why not View Transitions API?** Good for page-level transitions, not component-level. Firefox still behind flag.

---

## What Other Design Systems Do

| Design System | Animation Approach | Dependency |
|--------------|-------------------|------------|
| **Radix UI** | CSS-only, `data-state` attributes for enter (no exit) | None |
| **shadcn/ui** | Tailwind animations, optional Framer | CSS or Framer |
| **Chakra UI** | Built on Framer Motion | Framer (~30KB) |
| **Material UI** | Internal Transition components | Internal ~5KB |
| **Ant Design** | rc-motion (internal lib) | Internal ~8KB |
| **Headless UI** | `<Transition>` component, CSS + JS lifecycle | ~3KB |
| **Mantine** | CSS transitions, optional Framer | CSS or Framer |

**Pattern:** Most serious design systems either ship CSS-only (limited) or build/use a thin transition layer (3-8KB) for exit animations.

---

## Appendix: CSS Grid Height Trick

Animating `height: auto` is historically difficult. The CSS grid trick makes it work without JS measurement:

```tsx
const styles = stylex.create({
  wrapper: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transition: `grid-template-rows ${motionTokens.durationFast} ${motionTokens.easingDefault}`,
  },
  wrapperOpen: {
    gridTemplateRows: '1fr',
  },
  content: {
    overflow: 'hidden',
  },
});
```

Works in all modern browsers. See [CSS-Tricks: CSS Grid Can Do Auto Height Transitions](https://css-tricks.com/css-grid-can-do-auto-height-transitions/).

---

## Related

- `zero-styling-architecture.md`: Core philosophy this extends
- `swizzle-layer-ergonomics.md`: Customization paths referenced for theme/swizzle integration
- `stylex-vs-tailwind.md`: Styling approach decision (this doc assumes StyleX)
- `ai-design-system-gaps.md`: Why constraints matter for AI code generation

---

## Sources

- [CSS @starting-style - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)
- [Motion Library (motion/react)](https://motion.dev)
- [Animating height: auto - CSS Grid Trick](https://css-tricks.com/css-grid-can-do-auto-height-transitions/)
- [prefers-reduced-motion - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

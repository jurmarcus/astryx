---
'@astryxdesign/core': patch
---

[feat] Button: add isInterruptible and delay the spinner for action-driven loading
@cixzhang

New `isInterruptible` prop on `Button`. When set, the loading state still
renders the spinner and `aria-busy`, but the button is not disabled — so
clicks keep landing and can interrupt an in-flight action. Defaults to
`false`, so existing `isLoading` behavior (spinner + disabled) is unchanged.
This is what lets `ToggleButton` show a pending spinner while remaining
interruptible.

Action-driven loading (`clickAction`'s own transition, or an interruptible
caller) now delays the spinner reveal with a CSS `animation-delay`, so a fast
action that settles within the delay never flashes a spinner. The delay is
purely visual — `aria-busy` and the disabled state are unaffected — and is
removed under `prefers-reduced-motion`. Explicit `isLoading` stays immediate.

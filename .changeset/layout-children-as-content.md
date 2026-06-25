---
'@astryxdesign/core': patch
---

[fix] `<Layout>…</Layout>` no longer renders a blank page. `Layout` is
slot-driven (`content`/`header`/`start`/`end`/`footer`), and the natural nested
form `<Layout><LayoutContent /></Layout>` previously type-checked and built
green while dropping its children at runtime — an empty shell. Children now
render as a shorthand for the `content` slot (`<Layout>{main}</Layout>` is
equivalent to `<Layout content={main} />`), matching how `Card` and `Section`
accept content; an explicit `content` prop still wins when both are provided.
@josephfarina

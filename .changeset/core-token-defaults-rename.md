---
'@astryxdesign/core': patch
---

[breaking] Rename `xdsTokenDefaults` export to `tokenDefaults`
@ejhammond

The token-defaults constant is renamed from `xdsTokenDefaults` to
`tokenDefaults` (exported from `@astryxdesign/core/theme`). Update imports
accordingly. Part of removing xds naming from the public API.

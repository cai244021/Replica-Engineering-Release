---
description: Vue 3 Composition API TypeScript best practices
---

# Vue Best Practices

Use this workflow for Vue 3, `.vue` files, Composition API, `<script setup lang="ts">`, Vue Router, Pinia, or Vite with Vue work.

1. Before coding, read and follow:

   `d:\AI\TWX_PSE\TW_EngineeringRelease\.trae\skills\vue-best-practices\SKILL.md`

2. If the skill references additional files under `references/`, read the relevant files before implementation.

3. Prefer Vue 3 Composition API with `<script setup lang="ts">` unless the project explicitly requires Options API.

4. For non-trivial UI work, define component boundaries first:
   - Keep route/root views thin.
   - Move feature UI into focused components.
   - Move reusable or side-effect-heavy logic into composables.
   - Keep props/emits contracts explicit and typed.

5. Before finishing, verify:
   - Reactivity is minimal and predictable.
   - Derived state uses `computed` where appropriate.
   - Template logic is declarative and safe.
   - Components remain focused.
   - Optional Vue features are only used when required.

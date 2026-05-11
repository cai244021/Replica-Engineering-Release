---
description: Vue 3 Options API data methods this context and TypeScript best practices
---

# Vue Options API Best Practices

Use this workflow only when the task explicitly involves Vue Options API, including `data()`, `methods`, `computed`, lifecycle hooks, and `this` context.

1. Before coding, read and follow:

   `d:\AI\TWX_PSE\TW_EngineeringRelease\.trae\skills\vue-options-api-best-practices\SKILL.md`

2. If the skill points to files under `reference/`, read the relevant reference before implementation.

3. Do not convert Options API components to Composition API unless the user explicitly asks for that migration.

4. Pay special attention to:
   - Correct `this` binding.
   - Avoiding arrow functions in Options API methods when `this` is needed.
   - Typing component state and methods safely.
   - Keeping lifecycle side effects cleaned up.

5. Before finishing, verify existing Options API behavior is preserved.

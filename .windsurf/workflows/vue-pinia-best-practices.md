---
description: Pinia store setup reactivity and state management best practices
---

# Vue Pinia Best Practices

Use this workflow for Pinia tasks, store design, shared state, store setup, persisted state, and store reactivity issues.

1. Before coding, read and follow:

   `d:\AI\TWX_PSE\TW_EngineeringRelease\.trae\skills\vue-pinia-best-practices\SKILL.md`

2. If the skill points to files under `reference/`, read the relevant reference before implementation.

3. Pay special attention to:
   - `getActivePinia was called` startup issues.
   - Setup stores returning all state needed by DevTools/SSR.
   - Preserving reactivity when destructuring stores.
   - Using `storeToRefs` where appropriate.
   - Keeping ephemeral filters in URL state when sharing/refresh behavior requires it.

4. Before finishing, verify state updates remain reactive in the consuming components.

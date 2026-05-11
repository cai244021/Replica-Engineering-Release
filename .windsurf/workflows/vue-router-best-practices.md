---
description: Vue Router 4 navigation guards route params and lifecycle best practices
---

# Vue Router Best Practices

Use this workflow for Vue Router 4 tasks, including route configuration, navigation guards, route params, redirects, and route-component lifecycle behavior.

1. Before coding, read and follow:

   `d:\AI\TWX_PSE\TW_EngineeringRelease\.trae\skills\vue-router-best-practices\SKILL.md`

2. If the skill points to files under `reference/`, read the relevant reference before implementation.

3. Pay special attention to:
   - Same-route navigation with changed params.
   - Avoiding infinite redirect loops.
   - Awaiting async guard logic.
   - Avoiding deprecated `next()` patterns unless the project already requires them.
   - Cleaning up side effects when route components unmount.

4. Before finishing, verify the router behavior against the target navigation scenario.

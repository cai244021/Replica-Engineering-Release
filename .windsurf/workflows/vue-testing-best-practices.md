---
description: Vue component and E2E testing with Vitest Vue Test Utils and Playwright
---

# Vue Testing Best Practices

Use this workflow for Vue component tests, composable tests, Pinia/router tests, async test behavior, or E2E tests.

1. Before coding tests, read and follow:

   `d:\AI\TWX_PSE\TW_EngineeringRelease\.trae\skills\vue-testing-best-practices\SKILL.md`

2. If the skill points to files under `reference/`, read the relevant reference before implementation.

3. Match the project's existing test stack and conventions before adding new dependencies.

4. Pay special attention to:
   - Vitest and Vue Test Utils patterns.
   - Awaiting Vue DOM updates and async effects.
   - Using `flushPromises` where appropriate.
   - Testing observable behavior rather than implementation details.
   - E2E tests only when the requirement needs browser-level validation.

5. Before finishing, explain how to run the relevant tests from the project root.

---
description: Create reusable Vue composables with MaybeRef and MaybeRefOrGetter inputs
---

# Create Adaptable Composable

Use this workflow when creating reusable Vue composables, especially composables that should accept refs, getters, or plain values.

1. Before coding, read and follow:

   `d:\AI\TWX_PSE\TW_EngineeringRelease\.trae\skills\create-adaptable-composable\SKILL.md`

2. If the skill points to additional reference files, read the relevant reference before implementation.

3. Design the composable API first:
   - Accept `MaybeRef` or `MaybeRefOrGetter` where flexible input improves usability.
   - Use `toValue`/Vue utilities consistently with the project's Vue version.
   - Keep return values small, typed, and predictable.
   - Avoid hidden side effects unless the composable's purpose is explicitly side-effect management.

4. Before finishing, verify the composable works with plain values, refs, and getters when those input forms are supported.

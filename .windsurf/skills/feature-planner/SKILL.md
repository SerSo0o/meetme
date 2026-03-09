---
name: feature-planner
description: Use when planning or breaking down a new Meet Me feature, implementation phase, or larger refactor. Produces a small-step plan with screens, schema impact, risks, acceptance criteria, and recommended build order.
---

# Feature Planner

Use this skill whenever a request involves:
- a new feature
- a new phase
- a refactor that changes product behavior
- schema or navigation changes
- a cross-cutting change touching UI + backend + product logic

## Output format

When invoked, produce:

1. Feature summary
2. Why it matters
3. Affected screens
4. Affected data model
5. Backend / Supabase impact
6. Realtime impact
7. Privacy / safety concerns
8. Small implementation steps
9. Acceptance criteria
10. Manual test checklist

## Meet Me-specific checks

Always check:
- does this touch discovery?
- does this touch status visibility?
- does this touch location privacy?
- does this touch likes / matches / chat gating?
- does this require schema changes?
- does this require new empty states or moderation behavior?

## Planning rules

- prefer the smallest working increment
- keep each phase runnable
- do not suggest building everything at once
- call out assumptions briefly
- if location is involved, prioritize privacy over convenience
- if chat is involved, confirm it is still locked behind mutual match unless explicitly changed

## Deliverable style

Be concise but concrete.
Prefer checklists and acceptance criteria over vague advice.
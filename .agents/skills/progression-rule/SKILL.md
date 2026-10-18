---
name: progression-rule
description: Implement or modify a training progression rule. Use for anything touching packages/training-core/src/progression.
---
# Progression Rule Skill

Signature: `(ctx: ProgressionContext) => Target`

Invariants, all test-enforced:
- Missed reps never advance load.
- 3 consecutive stalls trigger a deload at the rule's reset percentage.
- Every Target carries a human-readable `reason` string. No silent numbers.
- Weight snaps to the exercise's own increment, not the unit default.
- Bonus sets beyond the planned count are excluded from progression input.
- Bodyweight without added load progresses in reps, then sets, then advice.
- Pure function: no I/O, no Date.now(), no randomness.

Write the test table FIRST: 8+ cases covering clean, missed, stalled,
deloaded, first-session, bodyweight, assisted and timed variants.

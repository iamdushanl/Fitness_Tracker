---
name: ship-epic
description: Full build-review-verify loop for one epic from docs/BUILD_SPEC.md
---
# Ship an Epic

Input: epic id (e.g. F05)

1. Read `docs/BUILD_SPEC.md` §6, the named epic, plus §3, §4 and AGENTS.md.
2. Create branch `feat/<epic-id>-<slug>`.
3. Emit an Implementation Plan artifact. STOP. Await approval.
4. On approval, execute tasks one at a time, reporting after each.
5. Run the epic's Definition of Done commands. Fix failures. Re-run.
6. If the epic has UI, drive it in the browser at 320px and 1280px and
   attach the recording.
7. Write `docs/adr/<next-number>-<slug>.md`.
8. Append a CHANGELOG.md entry.
9. Open a PR whose body lists each acceptance criterion with evidence.
10. STOP. Report the PR link and hand off to the reviewer workflow.

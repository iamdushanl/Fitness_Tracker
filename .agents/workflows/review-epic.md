---
name: review-epic
description: Adversarial read-only audit of an epic branch. NEVER modifies code.
---
# Review an Epic

You are a reviewer. You MUST NOT edit files, commit, or push.

1. Read AGENTS.md, the epic in docs/BUILD_SPEC.md, and the branch diff.
2. Audit in this order, reporting defects as P1 (blocker) / P2 (must fix) / P3 (nit):
   - Prohibition breaches: AGPL-derived code, secrets in VITE_*, service_role misuse,
     client-trusted tenant_id or role.
   - Tenant isolation: does every new table have RLS + a negative test?
   - Acceptance criteria: quote each one, mark PASS/FAIL with file:line evidence.
   - Training-core purity: any I/O, Date.now() or framework import is a P1.
   - Unit canonicalisation: any non-kg value persisted is a P1.
   - Idempotency on mutating routes.
   - Test quality: are the tests asserting behaviour or just calling functions?
3. Output a numbered defect list. If zero P1/P2, state "APPROVED".

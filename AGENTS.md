# FitTrack / GymOS — Agent Operating Rules

## Project
Multi-tenant fitness platform. Two editions, one codebase:
Personal (B2C, free) and GymOS Pro (B2B SaaS, per-gym subscription).
Authoritative backlog: docs/BUILD_SPEC.md

## Absolute prohibitions
1. NEVER clone, download, copy, or paste code from github.com/DuarteSantos8/openGym
   or any AGPL-licensed project. It is AGPL-3.0; copying it would force us to
   open-source this commercial product. Implement features from docs/BUILD_SPEC.md only.
2. NEVER put a secret in a VITE_* variable. VITE_* is public and shipped to browsers.
3. NEVER commit .env, credentials, service-role keys, or API keys.
4. NEVER bypass RLS by defaulting to the Supabase service_role key. It is permitted
   only in apps/api for explicitly authoritative cross-record computation.
5. NEVER trust client-supplied tenant_id or role. Both come from signed JWT claims.

## Architecture rules
- Monorepo: apps/web, apps/console, apps/api, packages/training-core,
  packages/shared-types, packages/ui.
- ALL training maths lives in packages/training-core as pure functions:
  no I/O, no framework imports, no Date.now() (inject a clock).
- The API recomputes every training target on write. The client's number is
  a hint, never the source of truth.
- Weights are stored in KILOGRAMS canonically. Convert at render only.
- Every tenant-owned table has tenant_id uuid and an RLS policy. No exceptions.
- Every mutating endpoint accepts an Idempotency-Key header.

## Code standards
- TypeScript strict. No `any` without an inline justification comment.
- Zod validation at every API boundary, inbound and outbound.
- Errors: 400 for malformed client input, 413 for oversized, never 500 with a stack trace.
- Tests colocated: foo.ts → foo.test.ts. Vitest.
- Conventional commits: feat(scope): / fix(scope): / chore(scope):

## Working method
- Produce an Implementation Plan artifact BEFORE writing code. Wait for approval.
- One epic per branch: feat/F0X-short-name.
- Stop after each task in the task list and report before continuing.
- When done, write docs/adr/NNNN-title.md: context, decision, consequences.
- If you are unsure about a product decision, ASK. Do not invent requirements.

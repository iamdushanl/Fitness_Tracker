---
name: offline-sync
description: Implement offline-capable writes with an IndexedDB outbox. Use for any feature that logs data during a workout.
---
# Offline Sync Skill

- Client generates a UUID per operation; send it as `Idempotency-Key`.
- Queue to IndexedDB first, then attempt the network. Never block the UI on a fetch.
- Server: unique constraint on (user_id, client_id). On replay return 409 with
  the existing resource; the client treats 409 as success and drops the op.
- Flush on: `online` event, app focus, and a 30s interval while online.
- Show pending-sync count in the UI. Never silently lose a queued op.

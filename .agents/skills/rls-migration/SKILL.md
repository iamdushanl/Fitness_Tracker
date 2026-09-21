---
name: rls-migration
description: Write Supabase migrations with multi-tenant Row Level Security. Use whenever adding or altering a database table.
---
# RLS Migration Skill

Every new tenant-owned table MUST ship with, in one migration file:
1. `tenant_id uuid not null references tenants(id) on delete cascade`
2. `alter table X enable row level security;`
3. A member policy: `user_id = auth.uid() and tenant_id is not distinct from current_tenant_id()`
4. A staff read policy gated on `current_role_in_tenant() in ('owner','manager','trainer')`
5. A negative test in `apps/api/tests/rls/` proving tenant B sees 0 rows

Never use `using (true)`. Never grant to the `anon` role.
Index `(tenant_id, <most-queried-column>)` on every tenant table.

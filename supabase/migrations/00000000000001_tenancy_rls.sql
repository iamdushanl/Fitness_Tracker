-- ==========================================================================
-- 00000000000001_tenancy_rls.sql
-- F00: Row Level Security policies for tenants and memberships tables
-- ==========================================================================
-- Follows the rls-migration skill rules:
--   ✅ tenant_id column present
--   ✅ RLS enabled
--   ✅ Member policy with auth.uid() + current_tenant_id()
--   ✅ Staff read policy gated on current_role_in_tenant()
--   ❌ Never uses USING (true)
--   ❌ Never grants to anon role
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. Enable RLS on both tables
-- --------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- 2. Tenants policies
--    Users can only see tenants they are a member of.
--    Only owners can update their tenant's settings.
-- --------------------------------------------------------------------------

-- Any authenticated user can read tenants they belong to
CREATE POLICY tenants_member_read ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = tenants.id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- Only owners can update their tenant's configuration
CREATE POLICY tenants_owner_update ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = tenants.id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = tenants.id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
        AND m.status = 'active'
    )
  );

-- Tenant creation is done server-side (service_role) only — no INSERT policy for authenticated.
-- Tenant deletion is done server-side (service_role) only — no DELETE policy for authenticated.

-- --------------------------------------------------------------------------
-- 3. Memberships policies
--    Members can read their own membership row.
--    Staff (owner/manager/trainer) can read all memberships in their tenant.
--    Only owners and managers can insert/update/delete memberships.
-- --------------------------------------------------------------------------

-- Members can read their own membership
CREATE POLICY memberships_own_read ON public.memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Staff can read all memberships within their tenant
CREATE POLICY memberships_staff_read ON public.memberships
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_role_in_tenant() IN ('owner', 'manager', 'trainer')
  );

-- Only owners and managers can add members to their tenant
CREATE POLICY memberships_management_insert ON public.memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_role_in_tenant() IN ('owner', 'manager')
  );

-- Only owners and managers can update memberships in their tenant
CREATE POLICY memberships_management_update ON public.memberships
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_role_in_tenant() IN ('owner', 'manager')
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_role_in_tenant() IN ('owner', 'manager')
  );

-- Only owners can delete memberships (remove members)
CREATE POLICY memberships_owner_delete ON public.memberships
  FOR DELETE
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_role_in_tenant() = 'owner'
  );

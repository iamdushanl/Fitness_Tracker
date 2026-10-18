-- ==========================================================================
-- 00000000000002_auth_hook.sql
-- F00: Supabase Auth Hook — injects tenant_id and role into JWT claims
-- ==========================================================================
-- IMPORTANT: After applying this migration, you MUST enable the hook in:
--   Supabase Dashboard → Authentication → Hooks
--   → "Customize Access Token (JWT) Hook"
--   → Select "PostgreSQL Function"
--   → Schema: public, Function: custom_access_token_hook
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. Auth hook function
--    Called by Supabase Auth on every token issue/refresh.
--    Injects the user's active membership (tenant_id + role) into app_metadata.
--
--    Behaviour:
--    - If the user has an active membership, inject that tenant_id + role.
--    - If the user has a preferred_tenant_id in their raw_app_meta_data
--      (set by switch-tenant), use that membership if it exists and is active.
--    - If no membership exists, inject null tenant_id + 'member' role
--      (Personal edition user).
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims          jsonb;
  user_id_val     uuid;
  preferred_tid   uuid;
  membership_rec  record;
BEGIN
  claims := event -> 'claims';
  user_id_val := (event ->> 'user_id')::uuid;

  -- Check if the user has a preferred tenant (set by switch-tenant endpoint)
  preferred_tid := (
    SELECT (raw_app_meta_data ->> 'preferred_tenant_id')::uuid
    FROM auth.users
    WHERE id = user_id_val
  );

  -- Try to find an active membership, preferring the user's chosen tenant
  IF preferred_tid IS NOT NULL THEN
    SELECT m.tenant_id, m.role
    INTO membership_rec
    FROM public.memberships m
    WHERE m.user_id = user_id_val
      AND m.tenant_id = preferred_tid
      AND m.status = 'active'
    LIMIT 1;
  END IF;

  -- If no preferred tenant or preferred membership not found, pick the first active one
  IF membership_rec IS NULL THEN
    SELECT m.tenant_id, m.role
    INTO membership_rec
    FROM public.memberships m
    WHERE m.user_id = user_id_val
      AND m.status = 'active'
    ORDER BY m.joined_at ASC
    LIMIT 1;
  END IF;

  -- Inject claims
  IF membership_rec IS NOT NULL THEN
    claims := jsonb_set(
      claims,
      '{app_metadata, tenant_id}',
      to_jsonb(membership_rec.tenant_id::text)
    );
    claims := jsonb_set(
      claims,
      '{app_metadata, role}',
      to_jsonb(membership_rec.role::text)
    );
  ELSE
    -- Personal edition: no tenant membership
    claims := jsonb_set(claims, '{app_metadata, tenant_id}', 'null'::jsonb);
    claims := jsonb_set(claims, '{app_metadata, role}', '"member"'::jsonb);
  END IF;

  -- Return modified event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

COMMENT ON FUNCTION public.custom_access_token_hook(jsonb)
  IS 'Supabase Auth Hook: injects tenant_id and role from the memberships table into JWT app_metadata claims.';

-- --------------------------------------------------------------------------
-- 2. Permissions
--    The auth hook must be callable by supabase_auth_admin.
--    It must NOT be callable by authenticated or anon roles.
-- --------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- --------------------------------------------------------------------------
-- 3. Grant auth.users read to the hook
--    The SECURITY DEFINER function runs as the owner, so it needs
--    the ability to read auth.users for the preferred_tenant_id check.
-- --------------------------------------------------------------------------
GRANT SELECT ON TABLE auth.users TO supabase_auth_admin;

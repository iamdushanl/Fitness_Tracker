-- ==========================================================================
-- 00000000000000_tenancy.sql
-- F00: Multi-tenancy foundation — tenants, memberships, JWT claim helpers
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. Custom enum for application roles
-- --------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'manager', 'trainer', 'member');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- --------------------------------------------------------------------------
-- 2. Tenants table — one row per gym (or null for Personal edition)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text        UNIQUE NOT NULL,
  name          text        NOT NULL,
  country       char(2)     NOT NULL DEFAULT 'LK',
  timezone      text        NOT NULL DEFAULT 'Asia/Colombo',
  unit_system   text        NOT NULL DEFAULT 'kg'
                CHECK (unit_system IN ('kg', 'lb')),
  branding      jsonb       NOT NULL DEFAULT '{}',
  plan_tier     text        NOT NULL DEFAULT 'trial',
  status        text        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tenants IS 'Each gym/organisation is a tenant. Personal-edition users have tenant_id = NULL on their data rows.';
COMMENT ON COLUMN public.tenants.slug IS 'URL-safe identifier, e.g. app.gymos.lk/g/ironhouse';
COMMENT ON COLUMN public.tenants.branding IS '{"logo_url": "...", "primary": "#hex", "accent": "#hex"}';

-- --------------------------------------------------------------------------
-- 3. Memberships table — maps users to tenants with a role
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          public.app_role NOT NULL DEFAULT 'member',
  status        text        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'banned')),
  joined_at     date        NOT NULL DEFAULT current_date,
  expires_at    date,
  UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_tenant_role_status
  ON public.memberships (tenant_id, role, status);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id
  ON public.memberships (user_id);

COMMENT ON TABLE public.memberships IS 'Junction table: one user can belong to multiple tenants with different roles.';

-- --------------------------------------------------------------------------
-- 4. JWT claim helper functions
--    These read from the Supabase-injected request.jwt.claims setting,
--    which is populated by PostgREST from the Authorization header.
-- --------------------------------------------------------------------------

-- Returns the tenant_id from the current JWT, or NULL for Personal edition.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(
    current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'tenant_id',
    ''
  )::uuid
$$;

COMMENT ON FUNCTION public.current_tenant_id() IS 'Extracts tenant_id from the JWT app_metadata claim. Returns NULL for Personal-edition users.';

-- Returns the role from the current JWT, defaulting to ''member''.
CREATE OR REPLACE FUNCTION public.current_role_in_tenant()
RETURNS public.app_role
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'role',
    'member'
  )::public.app_role
$$;

COMMENT ON FUNCTION public.current_role_in_tenant() IS 'Extracts role from the JWT app_metadata claim. Defaults to member.';

-- --------------------------------------------------------------------------
-- 5. Grants for PostgREST data API
-- --------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON public.tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;

const { supabaseAdmin } = require('../supabaseClient');

/**
 * resolveTenant — validates the tenant extracted from JWT claims.
 *
 * Reads req.tenantId (set by requireAuth from the signed JWT).
 * NEVER trusts client-supplied headers for tenant_id or role.
 *
 * For Personal edition (tenantId === null), skips tenant validation.
 * For gym tenants, verifies the tenant exists and is active.
 */
async function resolveTenant(req, res, next) {
  // Personal edition: no tenant to resolve
  if (!req.tenantId) {
    req.tenant = null;
    return next();
  }

  try {
    // Validate that the tenant exists and is active
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('id, slug, name, status, plan_tier, unit_system, timezone, branding')
      .eq('id', req.tenantId)
      .single();

    if (error || !tenant) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Tenant not found or access denied.',
      });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Tenant account is suspended.',
      });
    }

    req.tenant = tenant;
    next();
  } catch (err) {
    console.error('resolveTenant error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to resolve tenant.',
    });
  }
}

/**
 * requireRole — factory that returns middleware checking the JWT role.
 *
 * Role comes from the signed JWT (req.userRole, set by requireAuth).
 * Client-supplied role values in headers or body are NEVER trusted.
 *
 * @param {...string} roles - Allowed roles (e.g. 'owner', 'manager')
 * @returns {Function} Express middleware
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of: ${roles.join(', ')}. Your role: ${req.userRole}.`,
      });
    }
    next();
  };
}

/**
 * requireTenant — rejects requests from Personal-edition users
 * when the route requires a tenant context (e.g. /v1/gym/*).
 */
function requireTenant(req, res, next) {
  if (!req.tenantId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This endpoint requires a gym tenant context. Switch to a gym first.',
    });
  }
  next();
}

module.exports = { resolveTenant, requireRole, requireTenant };

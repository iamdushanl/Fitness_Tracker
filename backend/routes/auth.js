const express = require('express');
const { supabaseAdmin } = require('../supabaseClient');
const { requireAuth } = require('../middleware/auth');
const { auditWrite } = require('../middleware/audit');

const router = express.Router();

/**
 * POST /v1/auth/switch-tenant
 *
 * Allows a user who belongs to multiple gyms to switch their active tenant.
 * Updates the user's preferred_tenant_id in app_metadata, which the
 * auth hook reads on the next token refresh to inject the new tenant_id + role.
 *
 * Request body: { "tenant_id": "uuid" }
 *
 * Security:
 * - tenant_id is validated against the user's active memberships
 * - Role comes from the membership record, never from the client
 * - The response instructs the client to refresh the session
 */
router.post(
  '/switch-tenant',
  requireAuth,
  auditWrite('switch_tenant'),
  async (req, res) => {
    try {
      const { tenant_id } = req.body;

      if (!tenant_id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'tenant_id is required.',
        });
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(tenant_id)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'tenant_id must be a valid UUID.',
        });
      }

      // Verify the user has an active membership in the target tenant
      const { data: membership, error: membershipError } = await supabaseAdmin
        .from('memberships')
        .select('id, tenant_id, role, status')
        .eq('user_id', req.user.id)
        .eq('tenant_id', tenant_id)
        .eq('status', 'active')
        .single();

      if (membershipError || !membership) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have an active membership in this gym.',
        });
      }

      // Verify the target tenant is active
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .select('id, status')
        .eq('id', tenant_id)
        .eq('status', 'active')
        .single();

      if (tenantError || !tenant) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Target gym is not active.',
        });
      }

      // Update the user's preferred_tenant_id in raw_app_meta_data.
      // The auth hook reads this on the next token refresh to inject the correct claims.
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        req.user.id,
        {
          app_metadata: {
            ...req.user.app_metadata,
            preferred_tenant_id: tenant_id,
          },
        }
      );

      if (updateError) {
        console.error('Failed to update preferred tenant:', updateError);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to switch tenant.',
        });
      }

      return res.json({
        message: 'Tenant switched successfully. Refresh your session to get updated claims.',
        tenant_id: membership.tenant_id,
        role: membership.role,
        action_required: 'refresh_session',
      });
    } catch (err) {
      console.error('Switch tenant error:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to switch tenant.',
      });
    }
  }
);

/**
 * GET /v1/auth/tenants
 *
 * Returns all tenants the authenticated user belongs to.
 * Useful for building a tenant-switcher UI.
 */
router.get(
  '/tenants',
  requireAuth,
  async (req, res) => {
    try {
      const { data: memberships, error } = await supabaseAdmin
        .from('memberships')
        .select(`
          id,
          role,
          status,
          joined_at,
          tenant:tenants (
            id,
            slug,
            name,
            status,
            branding
          )
        `)
        .eq('user_id', req.user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching user tenants:', error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to fetch your gym memberships.',
        });
      }

      return res.json({
        current_tenant_id: req.tenantId,
        memberships: memberships || [],
      });
    } catch (err) {
      console.error('List tenants error:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch your gym memberships.',
      });
    }
  }
);

module.exports = router;

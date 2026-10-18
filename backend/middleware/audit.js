const { supabaseAdmin } = require('../supabaseClient');

/**
 * auditWrite — middleware factory that logs mutating operations to the audit_log table.
 *
 * Captures: tenant_id, actor_id (from JWT), action name, target resource,
 * and client IP address. Logging is asynchronous — it never blocks the response.
 *
 * @param {string} action - Human-readable action name (e.g. 'switch_tenant', 'create_workout')
 * @returns {Function} Express middleware
 */
function auditWrite(action) {
  return (req, res, next) => {
    // Store the original res.json so we can intercept after the handler
    const originalJson = res.json.bind(res);

    res.json = function auditedJson(body) {
      // Log the audit entry asynchronously (do not block response)
      const entry = {
        tenant_id: req.tenantId || null,
        actor_id: req.user?.id || null,
        action,
        target: `${req.method} ${req.originalUrl}`,
        metadata: {
          status_code: res.statusCode,
          // Only include safe metadata — never log request bodies that may contain secrets
          params: req.params || {},
        },
        ip: req.ip || req.headers['x-forwarded-for'] || null,
      };

      logAuditEntry(entry).catch((err) => {
        console.error('Audit log write failed:', err.message);
      });

      return originalJson(body);
    };

    next();
  };
}

/**
 * Writes an audit entry to the audit_log table.
 * Uses the service_role client — this is one of the explicitly permitted
 * uses of service_role per AGENTS.md (cross-record computation).
 *
 * @param {object} entry - The audit log entry
 */
async function logAuditEntry(entry) {
  if (!supabaseAdmin) {
    console.warn('Audit log skipped: Supabase admin client not configured.');
    return;
  }

  const { error } = await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: entry.tenant_id,
      actor_id: entry.actor_id,
      action: entry.action,
      target: entry.target,
      metadata: entry.metadata,
      ip: entry.ip,
    });

  if (error) {
    // Log but do not throw — audit failures must not break the application
    console.error('Audit log insert error:', error.message);
  }
}

module.exports = { auditWrite };

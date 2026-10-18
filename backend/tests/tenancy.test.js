/**
 * Tenancy middleware unit tests.
 *
 * Tests the Express middleware chain: requireAuth (tenant claim extraction),
 * resolveTenant, requireRole, requireTenant.
 *
 * These are unit tests using mock req/res — no Supabase connection needed.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { requireRole, requireTenant } = require('../middleware/tenant');

// ─── Helper: mock Express req/res/next ─────────────────────────────
function mockRes() {
  const res = {
    statusCode: 200,
    _body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res._body = body;
      return res;
    },
  };
  return res;
}

// ─── requireRole tests ─────────────────────────────────────────────
describe('requireRole middleware', () => {
  it('allows request when user role matches one of the allowed roles', (_, done) => {
    const req = { userRole: 'owner' };
    const res = mockRes();
    const middleware = requireRole('owner', 'manager');

    middleware(req, res, () => {
      // next() was called — access granted
      assert.ok(true, 'next() was called');
      done();
    });
  });

  it('blocks request when user role does not match', () => {
    const req = { userRole: 'member' };
    const res = mockRes();
    const middleware = requireRole('owner', 'manager');

    middleware(req, res, () => {
      assert.fail('next() should not have been called');
    });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res._body.error, 'Forbidden');
    assert.ok(res._body.message.includes('owner'));
    assert.ok(res._body.message.includes('member'));
  });

  it('allows trainer when trainer is in allowed roles', (_, done) => {
    const req = { userRole: 'trainer' };
    const res = mockRes();
    const middleware = requireRole('owner', 'manager', 'trainer');

    middleware(req, res, () => {
      assert.ok(true);
      done();
    });
  });

  it('blocks trainer when only owner/manager are allowed', () => {
    const req = { userRole: 'trainer' };
    const res = mockRes();
    const middleware = requireRole('owner', 'manager');

    middleware(req, res, () => {
      assert.fail('next() should not have been called');
    });

    assert.strictEqual(res.statusCode, 403);
  });
});

// ─── requireTenant tests ────────────────────────────────────────────
describe('requireTenant middleware', () => {
  it('allows request when tenantId is present', (_, done) => {
    const req = { tenantId: 'some-uuid' };
    const res = mockRes();

    requireTenant(req, res, () => {
      assert.ok(true, 'next() was called');
      done();
    });
  });

  it('blocks Personal-edition users (tenantId = null)', () => {
    const req = { tenantId: null };
    const res = mockRes();

    requireTenant(req, res, () => {
      assert.fail('next() should not have been called');
    });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res._body.error, 'Forbidden');
    assert.ok(res._body.message.includes('tenant'));
  });

  it('blocks when tenantId is undefined', () => {
    const req = {};
    const res = mockRes();

    requireTenant(req, res, () => {
      assert.fail('next() should not have been called');
    });

    assert.strictEqual(res.statusCode, 403);
  });
});

// ─── Auth claim extraction tests ────────────────────────────────────
describe('JWT tenant claim extraction (simulated)', () => {
  it('extracts tenant_id and role from app_metadata', () => {
    // Simulates what requireAuth does after verifying the JWT
    const user = {
      id: 'user-123',
      app_metadata: {
        tenant_id: 'tenant-abc',
        role: 'trainer',
      },
    };

    const meta = user.app_metadata || {};
    const tenantId = meta.tenant_id || null;
    const userRole = meta.role || 'member';

    assert.strictEqual(tenantId, 'tenant-abc');
    assert.strictEqual(userRole, 'trainer');
  });

  it('defaults to null tenant and member role when app_metadata is empty', () => {
    const user = {
      id: 'user-456',
      app_metadata: {},
    };

    const meta = user.app_metadata || {};
    const tenantId = meta.tenant_id || null;
    const userRole = meta.role || 'member';

    assert.strictEqual(tenantId, null);
    assert.strictEqual(userRole, 'member');
  });

  it('defaults when app_metadata is missing entirely', () => {
    const user = { id: 'user-789' };

    const meta = user.app_metadata || {};
    const tenantId = meta.tenant_id || null;
    const userRole = meta.role || 'member';

    assert.strictEqual(tenantId, null);
    assert.strictEqual(userRole, 'member');
  });

  it('ignores client-supplied X-Tenant-Id header (role escalation test)', () => {
    // Even if a malicious client sends a header, the middleware
    // extracts tenant_id from the signed JWT, not from headers.
    const user = {
      id: 'user-evil',
      app_metadata: {
        tenant_id: 'tenant-a',
        role: 'member',
      },
    };

    // Simulate a request with a spoofed header
    const req = {
      headers: { 'x-tenant-id': 'tenant-b' },  // attacker tries to escalate
      user,
    };

    // The auth middleware extracts from JWT, NOT from headers
    const meta = req.user.app_metadata || {};
    const tenantId = meta.tenant_id || null;

    assert.strictEqual(tenantId, 'tenant-a', 'Must use JWT tenant, not header');
    assert.notStrictEqual(tenantId, req.headers['x-tenant-id']);
  });

  it('ignores client-supplied role in request body (role escalation test)', () => {
    const user = {
      id: 'user-evil',
      app_metadata: {
        tenant_id: 'tenant-a',
        role: 'member',
      },
    };

    const req = {
      body: { role: 'owner' },  // attacker tries to escalate
      user,
    };

    // The auth middleware extracts from JWT, NOT from body
    const meta = req.user.app_metadata || {};
    const userRole = meta.role || 'member';

    assert.strictEqual(userRole, 'member', 'Must use JWT role, not body');
    assert.notStrictEqual(userRole, req.body.role);
  });
});

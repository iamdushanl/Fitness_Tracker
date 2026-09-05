const { supabaseAdmin } = require('../supabaseClient');

/**
 * Authentication middleware that verifies the Supabase access token (JWT)
 * sent in the Authorization header: "Bearer <token>"
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header. Expected: Bearer <supabase_token>',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'Supabase admin client is not configured. Please set SUPABASE_SERVICE_ROLE_KEY in backend/.env.',
      });
    }

    // Verify token authoritatively with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid or expired token.',
      });
    }

    // Attach verified user to request object
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to authenticate user.',
    });
  }
}

module.exports = { requireAuth };

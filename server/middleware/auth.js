const db = require('../db/database');
const { verifyToken } = require('../utils/security');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization token provided.',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.',
    });
  }

  const user = db.findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Account no longer exists.',
    });
  }

  req.user = decoded;
  req.dbUser = user;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const roles = req.dbUser.roles || [req.dbUser.role];
    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires ${role} permissions.`,
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  requireSeller: requireRole('seller'),
  requireCustomer: requireRole('customer'),
};

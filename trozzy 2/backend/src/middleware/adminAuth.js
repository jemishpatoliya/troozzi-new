const jwt = require('jsonwebtoken');
const { AdminModel } = require('../models/admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    if (decoded.type !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    if (!admin.active) {
      return res.status(401).json({ success: false, error: 'Admin account is deactivated' });
    }

    req.admin = admin;
    req.adminId = admin._id;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, error: 'Admin authentication required' });
  }
  next();
};

module.exports = { authenticateAdmin, requireAdmin };

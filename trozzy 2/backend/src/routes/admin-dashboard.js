const express = require('express');
const jwt = require('jsonwebtoken');
const { AdminModel } = require('../models/admin');
const { UserModel } = require('../models/user');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    
    if (!req.adminId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const admin = await AdminModel.findById(req.adminId);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'today';
    
    // Calculate date range based on period
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    // Get basic stats (mock data for now)
    const stats = {
      totalRevenue: Math.floor(Math.random() * 100000) + 50000,
      totalOrders: Math.floor(Math.random() * 500) + 100,
      totalUsers: await UserModel.countDocuments(),
      totalProducts: 0, // Will be implemented when product model is ready
      period: period,
      startDate: startDate,
      endDate: endDate,
      growth: {
        revenue: Math.floor(Math.random() * 20) - 10,
        orders: Math.floor(Math.random() * 20) - 10,
        users: Math.floor(Math.random() * 20) - 10
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;

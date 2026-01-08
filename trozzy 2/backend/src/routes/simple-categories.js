const express = require('express');
const router = express.Router();

// Import admin categories to get the same data
const adminCategories = require('./admin-categories');

// GET /api/categories - Get all categories (same as admin categories)
router.get('/', async (req, res) => {
    // Forward to admin categories route
    req.url = req.url.replace('/api/categories', '/api/admin/categories');
    return adminCategories(req, res);
});

// GET /api/categories/:id - Get single category (same as admin categories)
router.get('/:id', async (req, res) => {
    // Forward to admin categories route
    req.url = req.url.replace('/api/categories', '/api/admin/categories');
    return adminCategories(req, res);
});

module.exports = router;

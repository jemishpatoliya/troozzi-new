const express = require('express');
const router = express.Router();

// Import admin products to get the same data
const adminProducts = require('./admin-products');

// GET /api/products - Get all products with filtering (same as admin products)
router.get('/', async (req, res) => {
    // Forward to admin products route
    req.url = req.url.replace('/api/products', '/api/admin/products');
    return adminProducts(req, res);
});

// GET /api/products/:id - Get single product (same as admin products)
router.get('/:id', async (req, res) => {
    // Forward to admin products route
    req.url = req.url.replace('/api/products', '/api/admin/products');
    return adminProducts(req, res);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OrderModel } = require('../models/order');
const { PaymentModel } = require('../models/payment');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Admin List Orders
router.get('/', async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50 } = req.query;
        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search && search.trim()) {
            const q = search.trim();
            query.$or = [
                { orderNumber: { $regex: q, $options: 'i' } },
                { 'customer.name': { $regex: q, $options: 'i' } },
                { 'customer.email': { $regex: q, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const orders = await OrderModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await OrderModel.countDocuments(query);

        // Map to format expected by Admin Panel
        const data = orders.map(order => ({
            id: String(order._id),
            orderNumber: order.orderNumber,
            userId: String(order.user),
            userName: order.customer?.name || '',
            userEmail: order.customer?.email || '',
            products: order.items.map(item => ({
                id: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            totalAmount: order.total,
            paymentMethod: order.paymentMethod || 'Online',
            paymentStatus: order.status === 'paid' ? 'completed' : 'pending',
            currentStatus: order.status,
            shippingAddress: {
                name: order.customer?.name || '',
                street: order.address?.line1 || '',
                city: order.address?.city || '',
                state: order.address?.state || '',
                zipCode: order.address?.postalCode || '',
                country: order.address?.country || ''
            },
            trackingNumber: order.trackingNumber,
            courierName: order.courierName,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            statusHistory: [] // Can be enhanced later
        }));

        res.json({
            success: true,
            data,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List orders error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// User My Orders
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const query = { user: new mongoose.Types.ObjectId(userId) };

        const orders = await OrderModel.find(query)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: orders.map(order => ({
                id: String(order._id),
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                items: order.items.reduce((sum, i) => sum + (i.quantity || 0), 0),
                createdAtIso: order.createdAtIso,
                date: order.createdAt,
                paymentMethod: 'Online'
            }))
        });
    } catch (error) {
        console.error('Fetch my orders error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Single Order
router.get('/:id', async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Return detail in a robust way for both User and Admin UI
        res.json({
            success: true,
            data: {
                ...order,
                id: String(order._id),
                totalAmount: order.total, // For admin
                currentStatus: order.status, // For admin
                statusHistory: [
                    { status: order.status, timestamp: order.updatedAt, note: `Status: ${order.status}` }
                ]
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Order Status (Admin)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const updated = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            data: {
                id: String(updated._id),
                status: updated.status
            }
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Tracking info (Admin)
router.put('/:id/tracking', async (req, res) => {
    try {
        const { trackingNumber, courierName } = req.body;
        if (!trackingNumber) {
            return res.status(400).json({ success: false, message: 'Tracking number is required' });
        }

        const updated = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { trackingNumber, courierName },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            data: {
                id: String(updated._id),
                trackingNumber: updated.trackingNumber,
                courierName: updated.courierName
            }
        });
    } catch (error) {
        console.error('Update tracking error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel Order
router.put('/:id/cancel', async (req, res) => {
    try {
        const updated = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            data: {
                id: String(updated._id),
                status: updated.status
            }
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { PaymentModel } = require('../models/payment');
const { OrderModel } = require('../models/order');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        if (!req.userId) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

function makeProviderOrderId(provider) {
    const part = Math.random().toString(16).slice(2, 10);
    return `${provider}_${Date.now()}_${part}`;
}

// Backward-compatible alias used by older clients
router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const { amount, currency = 'INR', provider = 'upi', orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const providerOrderId = makeProviderOrderId(provider);
        const orderObjectId = orderId && mongoose.Types.ObjectId.isValid(orderId) ? new mongoose.Types.ObjectId(orderId) : undefined;

        const payment = await PaymentModel.create({
            order: orderObjectId,
            user: new mongoose.Types.ObjectId(req.userId),
            provider,
            providerOrderId,
            amount,
            currency,
            status: 'pending',
            paymentMethod: provider,
        });

        return res.json({
            paymentId: String(payment._id),
            provider,
            amount,
            currency,
            providerOrderId,
            status: payment.status,
            supportedProviders: ['phonepe', 'paytm', 'upi'],
            nextAction: {
                type: provider === 'upi' ? 'upi_intent' : 'redirect_url',
                url: `https://example.invalid/pay/${providerOrderId}`,
            },
            message: 'Payment initiation is mocked (providers not integrated yet).',
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({
            error: 'Failed to create payment order',
            message: error.message
        });
    }
});

// Payment initiation (PhonePe/Paytm/UPI) - mocked for now
router.post('/initiate', authenticateToken, async (req, res) => {
    try {
        const { amount, currency = 'INR', provider = 'upi', orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const providerOrderId = makeProviderOrderId(provider);
        const orderObjectId = orderId && mongoose.Types.ObjectId.isValid(orderId) ? new mongoose.Types.ObjectId(orderId) : undefined;

        const payment = await PaymentModel.create({
            order: orderObjectId,
            user: new mongoose.Types.ObjectId(req.userId),
            provider,
            providerOrderId,
            amount,
            currency,
            status: 'pending',
            paymentMethod: provider,
        });

        return res.json({
            paymentId: String(payment._id),
            provider,
            amount,
            currency,
            providerOrderId,
            status: payment.status,
            supportedProviders: ['phonepe', 'paytm', 'upi'],
            nextAction: {
                type: provider === 'upi' ? 'upi_intent' : 'redirect_url',
                url: `https://example.invalid/pay/${providerOrderId}`,
            },
            message: 'Payment initiation is mocked (providers not integrated yet).',
        });
    } catch (error) {
        console.error('Initiate payment error:', error);
        return res.status(500).json({
            error: 'Failed to initiate payment',
            message: error.message
        });
    }
});

// Payment verification - mocked for now
router.post('/verify', authenticateToken, async (req, res) => {
    try {
        const { paymentId, status, providerPaymentId, providerSignature, orderData } = req.body;

        if (!paymentId || !status) {
            return res.status(400).json({ error: 'Payment ID and status are required' });
        }

        const payment = await PaymentModel.findOne({ _id: paymentId, user: req.userId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        payment.status = status;
        if (providerPaymentId) payment.providerPaymentId = providerPaymentId;
        if (providerSignature) payment.providerSignature = providerSignature;

        if (status === 'completed') {
            if (!payment.order && orderData) {
                const part = Math.random().toString(16).slice(2, 8).toUpperCase();
                const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${part}`;

                const createdOrder = await OrderModel.create({
                    user: new mongoose.Types.ObjectId(req.userId),
                    orderNumber,
                    status: 'paid',
                    currency: orderData.currency || 'INR',
                    subtotal: orderData.subtotal,
                    shipping: orderData.shipping || 0,
                    tax: orderData.tax || 0,
                    total: orderData.total,
                    items: orderData.items,
                    customer: orderData.customer,
                    address: orderData.address,
                    createdAtIso: new Date().toISOString(),
                });

                payment.order = createdOrder._id;
            }

            if (payment.order) {
                await OrderModel.updateOne({ _id: payment.order }, { $set: { status: 'paid' } });
            }
        }

        await payment.save();

        return res.json({
            paymentId: String(payment._id),
            status: payment.status,
            provider: payment.provider,
            orderId: payment.order ? String(payment.order) : undefined,
            message: 'Payment verification is mocked (providers not integrated yet).',
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        return res.status(500).json({
            error: 'Failed to verify payment',
            message: error.message
        });
    }
});

module.exports = router;

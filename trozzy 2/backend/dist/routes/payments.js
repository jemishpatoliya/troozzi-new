import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Types } from 'mongoose';
import { PaymentModel } from '../models/payment';
import { OrderModel } from '../models/order';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId ?? decoded.id;
        if (!req.userId)
            return res.status(401).json({ error: 'Invalid or expired token' });
        next();
    }
    catch (_error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
const initiateSchema = z.object({
    amount: z.number().finite().positive(),
    currency: z.string().min(1).default('INR'),
    provider: z.enum(['phonepe', 'paytm', 'upi']).default('upi'),
    orderId: z.string().optional(),
});
const verifySchema = z.object({
    paymentId: z.string().min(1),
    status: z.enum(['completed', 'failed']),
    providerPaymentId: z.string().optional(),
    providerSignature: z.string().optional(),
    orderData: z
        .object({
        currency: z.string().min(1).default('INR'),
        subtotal: z.number().finite().nonnegative(),
        shipping: z.number().finite().nonnegative(),
        tax: z.number().finite().nonnegative(),
        total: z.number().finite().nonnegative(),
        items: z
            .array(z.object({
            productId: z.string().min(1),
            name: z.string().min(1),
            price: z.number().finite().nonnegative(),
            quantity: z.number().int().min(1),
            image: z.string().optional(),
        }))
            .min(1),
        customer: z.object({
            name: z.string().min(1),
            email: z.string().email(),
            phone: z.string().optional(),
        }),
        address: z.object({
            line1: z.string().min(1),
            line2: z.string().optional(),
            city: z.string().min(1),
            state: z.string().min(1),
            postalCode: z.string().min(1),
            country: z.string().min(1),
        }),
    })
        .optional(),
    // Keep old Razorpay verify keys optional for backward compatibility
    razorpayOrderId: z.string().optional(),
    razorpayPaymentId: z.string().optional(),
    razorpaySignature: z.string().optional(),
});
function makeProviderOrderId(provider) {
    const part = Math.random().toString(16).slice(2, 10);
    return `${provider}_${Date.now()}_${part}`;
}
// Backward-compatible alias used by older clients
router.post('/create-order', authenticateToken, async (req, res) => {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    }
    const { amount, currency, provider, orderId } = parsed.data;
    const providerOrderId = makeProviderOrderId(provider);
    const orderObjectId = orderId && Types.ObjectId.isValid(orderId) ? new Types.ObjectId(orderId) : undefined;
    const payment = await PaymentModel.create({
        order: orderObjectId,
        user: new Types.ObjectId(req.userId),
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
});
// Payment initiation (PhonePe/Paytm/UPI) - mocked for now
router.post('/initiate', authenticateToken, async (req, res) => {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    }
    const { amount, currency, provider, orderId } = parsed.data;
    const providerOrderId = makeProviderOrderId(provider);
    const orderObjectId = orderId && Types.ObjectId.isValid(orderId) ? new Types.ObjectId(orderId) : undefined;
    const payment = await PaymentModel.create({
        order: orderObjectId,
        user: new Types.ObjectId(req.userId),
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
});
// Payment verification - mocked for now
router.post('/verify', authenticateToken, async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues });
    }
    const { paymentId, status, providerPaymentId, providerSignature, orderData } = parsed.data;
    const payment = await PaymentModel.findOne({ _id: paymentId, user: req.userId });
    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }
    payment.status = status;
    if (providerPaymentId)
        payment.providerPaymentId = providerPaymentId;
    if (providerSignature)
        payment.providerSignature = providerSignature;
    if (status === 'completed') {
        // If caller provided orderData and this payment isn't linked yet, create and link the order.
        if (!payment.order && orderData) {
            const part = Math.random().toString(16).slice(2, 8).toUpperCase();
            const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${part}`;
            const createdOrder = await OrderModel.create({
                user: new Types.ObjectId(req.userId),
                orderNumber,
                status: 'paid',
                currency: orderData.currency,
                subtotal: orderData.subtotal,
                shipping: orderData.shipping,
                tax: orderData.tax,
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
});
// Provider webhook/callback endpoint - to be implemented next
router.post('/webhook/:provider', async (req, res) => {
    const provider = String(req.params.provider || '').toLowerCase();
    return res.status(501).json({
        error: 'Webhooks not implemented yet',
        provider,
    });
});
export default router;

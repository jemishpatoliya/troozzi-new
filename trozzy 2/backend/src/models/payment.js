const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema({
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['razorpay', 'phonepe', 'paytm', 'upi'], default: 'upi', required: true },
    providerOrderId: { type: String, unique: true, sparse: true },
    providerPaymentId: { type: String },
    providerSignature: { type: String },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: { type: String, enum: ['razorpay', 'phonepe', 'paytm', 'upi'], default: 'upi' },
    metadata: { type: Schema.Types.Mixed, required: false },
}, {
    timestamps: true,
});

const PaymentModel = mongoose.model('Payment', PaymentSchema);

module.exports = {
    PaymentModel,
    Payment: PaymentModel
};

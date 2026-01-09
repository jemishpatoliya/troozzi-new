const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
        orderNumber: { type: String, required: true, unique: true },
        status: {
            type: String,
            required: true,
            enum: ["new", "processing", "paid", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
            default: "new",
        },
        trackingNumber: { type: String, required: false },
        courierName: { type: String, required: false },
        currency: { type: String, required: true, default: "USD" },
        subtotal: { type: Number, required: true, default: 0 },
        shipping: { type: Number, required: true, default: 0 },
        tax: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
        items: {
            type: [
                {
                    productId: { type: String, required: true },
                    name: { type: String, required: true },
                    price: { type: Number, required: true },
                    quantity: { type: Number, required: true },
                    image: { type: String, required: false },
                },
            ],
            required: true,
            default: [],
        },
        customer: {
            type: {
                name: { type: String, required: true },
                email: { type: String, required: true },
                phone: { type: String, required: false },
            },
            required: true,
        },
        address: {
            type: {
                line1: { type: String, required: true },
                line2: { type: String, required: false },
                city: { type: String, required: true },
                state: { type: String, required: true },
                postalCode: { type: String, required: true },
                country: { type: String, required: true },
            },
            required: true,
        },
        createdAtIso: { type: String, required: true },
    },
    { timestamps: true },
);

const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);

module.exports = {
    OrderModel,
    Order: OrderModel
};

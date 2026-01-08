import { Schema, model } from 'mongoose';
const CartItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
});
const CartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    totalAmount: { type: Number, default: 0 },
}, {
    timestamps: true,
});
// Calculate total amount before saving
CartSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});
export const CartModel = model('Cart', CartSchema);

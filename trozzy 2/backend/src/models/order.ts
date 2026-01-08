import mongoose, { Schema, Types } from "mongoose";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type OrderStatus = "new" | "processing" | "paid" | "shipped" | "delivered" | "cancelled" | "returned";

export type OrderDoc = {
  user?: Types.ObjectId;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAtIso: string;
};

const OrderSchema = new Schema<OrderDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    orderNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      required: true,
      enum: ["new", "processing", "paid", "shipped", "delivered", "cancelled", "returned"],
      default: "new",
    },
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

export const OrderModel =
  (mongoose.models.Order as mongoose.Model<OrderDoc> | undefined) || mongoose.model<OrderDoc>("Order", OrderSchema);

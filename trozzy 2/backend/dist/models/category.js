import mongoose, { Schema } from "mongoose";
const CategorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    parentId: { type: String, default: null },
    order: { type: Number, required: true, default: 0 },
    active: { type: Boolean, required: true, default: true },
    productCount: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: false, default: "" },
}, { timestamps: true });
export const CategoryModel = mongoose.models.Category ||
    mongoose.model("Category", CategorySchema);

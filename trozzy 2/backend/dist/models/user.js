import { Schema, model } from 'mongoose';
const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    active: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
});
export const UserModel = model('User', UserSchema);

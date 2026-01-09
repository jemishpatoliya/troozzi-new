import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  position: { type: String, required: true },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const BannerModel = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

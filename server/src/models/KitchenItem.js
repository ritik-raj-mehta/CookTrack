import mongoose from 'mongoose';

const KitchenItemSchema = new mongoose.Schema(
  {
    kitchenId: { type: String, required: true },
    productName: { type: String, default: '' },
    category: { type: String },
    quantity: { type: Number },
    unit: { type: String, default: 'pcs' },
    storageLocation: { type: String },
    expiryDate: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

KitchenItemSchema.index({ kitchenId: 1, createdAt: -1 });
KitchenItemSchema.index({ kitchenId: 1, expiryDate: 1 });

export default mongoose.model('KitchenItem', KitchenItemSchema);

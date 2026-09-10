import mongoose from 'mongoose';

const ShoppingItemSchema = new mongoose.Schema(
  {
    kitchenId: { type: String, required: true },
    name: { type: String, default: '' },
    neededQuantity: { type: Number },
    unit: { type: String, default: 'pcs' },
    notes: { type: String },
    isBought: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('ShoppingItem', ShoppingItemSchema);

import mongoose from 'mongoose';

const ItemLogSchema = new mongoose.Schema(
  {
    kitchenId: { type: String, required: true, index: true },
    userId: { type: String, default: null },
    userName: { type: String, default: 'Crew Member' },
    itemId: { type: mongoose.Schema.Types.ObjectId, default: null },
    productName: { type: String, required: true },
    category: { type: String, default: 'Pantry Items' },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'Pieces' },
    action: {
      type: String,
      enum: ['consumed', 'wasted', 'restocked'],
      required: true,
      index: true
    },
    estimatedCost: { type: Number, default: 150 }, // Estimated price per unit in INR (₹)
    notes: { type: String, default: '' },
    loggedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

ItemLogSchema.index({ kitchenId: 1, loggedAt: -1 });
ItemLogSchema.index({ kitchenId: 1, action: 1 });

export default mongoose.model('ItemLog', ItemLogSchema);


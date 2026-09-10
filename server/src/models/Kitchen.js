import mongoose from 'mongoose';

const KitchenSchema = new mongoose.Schema(
  {
    kitchenName: { type: String, required: true },
    kitchenId: { type: String, required: true, unique: true },
    createdBy: { type: String }, // user email or user id
    members: [{ type: String }], // store user ids or emails

    kitchenItemIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'KitchenItem' }
    ],

    kitchenShoppingItemIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingItem' }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Kitchen', KitchenSchema);

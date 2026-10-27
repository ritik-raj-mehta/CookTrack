import mongoose from 'mongoose';
import crypto from 'crypto';

function generateKitchenCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userPassword: { type: String, required: true },
  userEmail: { type: String, required: true, unique: true },
  role: { type: String, default: 'User' },
  kitchenId: { type: String, default: generateKitchenCode },
  kitchenName: { type: String },
  phoneNumber: { type: String }
}, { timestamps: true });

export { generateKitchenCode };
export default mongoose.model('User', UserSchema);
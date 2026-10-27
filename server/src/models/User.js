import mongoose from 'mongoose';
import crypto from 'crypto';

function generateKitchenCode(length) {
  const size = typeof length === 'number' && length > 0 ? length : 6;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = crypto.randomBytes(size);
  for (let i = 0; i < size; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userPassword: { type: String, required: true },
  userEmail: { type: String, required: true, unique: true },
  role: { type: String, default: 'User' },
  kitchenId: { type: String, default: () => generateKitchenCode(6) },
  kitchenName: { type: String },
  phoneNumber: { type: String }
}, { timestamps: true });

export { generateKitchenCode };
export default mongoose.model('User', UserSchema);
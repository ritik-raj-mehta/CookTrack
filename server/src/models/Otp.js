import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    // Store temporary signup payload so user and kitchen are only created after OTP verification
    signupData: {
      userName: { type: String, required: true },
      userPassword: { type: String, required: true }, // hashed password
      userEmail: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      kitchenName: { type: String },
      kitchenId: { type: String }, // Present when joining existing kitchen
      type: {
        type: String,
        enum: ['CREATE_KITCHEN', 'JOIN_KITCHEN'],
        default: 'CREATE_KITCHEN',
      },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to auto-delete expired OTP records
    },
  },
  { timestamps: true }
);

export default mongoose.model('Otp', OtpSchema);

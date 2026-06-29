import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  code: string;
  type: 'email_verification' | 'password_reset' | 'two_factor';
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset', 'two_factor'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OTPSchema.index({ email: 1, type: 1 });
OTPSchema.index({ expiresAt: 1 });
OTPSchema.index({ isUsed: 1 });

const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;

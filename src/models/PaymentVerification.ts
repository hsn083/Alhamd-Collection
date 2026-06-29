import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentVerification extends Document {
  payment: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  screenshot: string;
  transactionId?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentVerificationSchema = new Schema<IPaymentVerification>(
  {
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    screenshot: {
      type: String,
      required: true,
    },
    transactionId: String,
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    reviewedAt: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentVerificationSchema.index({ payment: 1 });
PaymentVerificationSchema.index({ order: 1 });
PaymentVerificationSchema.index({ status: 1 });

const PaymentVerification: Model<IPaymentVerification> = mongoose.models.PaymentVerification || mongoose.model<IPaymentVerification>('PaymentVerification', PaymentVerificationSchema);

export default PaymentVerification;

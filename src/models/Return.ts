import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturnItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  reason: string;
}

export interface IReturn extends Document {
  returnNumber: string;
  order: mongoose.Types.ObjectId;
  orderNumber: string; // Stores displayOrderNumber for reference
  customer: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IReturnItem[];
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  refundMethod: 'original' | 'bank_transfer' | 'store_credit';
  refundAmount: number;
  adminNotes?: string;
  statusHistory: Array<{
    status: string;
    comment?: string;
    updatedAt: Date;
    updatedBy?: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  productImage: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  reason: { type: String, required: true },
});

const ReturnStatusHistorySchema = new Schema({
  status: { type: String, required: true },
  comment: String,
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
});

const ReturnSchema = new Schema<IReturn>(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: {
      type: [ReturnItemSchema],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    refundMethod: {
      type: String,
      enum: ['original', 'bank_transfer', 'store_credit'],
      default: 'original',
    },
    refundAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    adminNotes: String,
    statusHistory: {
      type: [ReturnStatusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReturnSchema.index({ returnNumber: 1 });
ReturnSchema.index({ order: 1 });
ReturnSchema.index({ customer: 1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ createdAt: -1 });

const Return: Model<IReturn> = mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);

export default Return;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStockHistory extends Document {
  product: mongoose.Types.ObjectId;
  type: 'in' | 'out' | 'adjustment' | 'sale' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  reference?: string;
  referenceType?: 'order' | 'manual' | 'return' | 'refund';
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StockHistorySchema = new Schema<IStockHistory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'sale', 'return'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: String,
    reference: String,
    referenceType: {
      type: String,
      enum: ['order', 'manual', 'return', 'refund'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
StockHistorySchema.index({ product: 1 });
StockHistorySchema.index({ type: 1 });
StockHistorySchema.index({ createdAt: -1 });

const StockHistory: Model<IStockHistory> = mongoose.models.StockHistory || mongoose.model<IStockHistory>('StockHistory', StockHistorySchema);

export default StockHistory;

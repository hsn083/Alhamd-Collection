import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  size?: string;
  color?: string;
}

export interface IOrderAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IOrderStatusHistory {
  status: string;
  comment?: string;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: IOrderAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'cod' | 'easypaisa' | 'jazzcash' | 'stripe';
  paymentStatus: 'pending_payment' | 'payment_submitted' | 'under_verification' | 'verified' | 'rejected' | 'refunded' | 'paid' | 'failed';
  paymentId?: string;
  trackingNumber?: string;
  notes?: string;
  statusHistory: IOrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  image: { type: String, required: false, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  discountPrice: Number,
  size: String,
  color: String,
});

const OrderAddressSchema = new Schema<IOrderAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: false, default: '' },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { type: String, required: true },
  comment: String,
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: Schema.Types.Mixed,
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
    shippingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    couponCode: String,
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'easypaisa', 'jazzcash', 'stripe'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending_payment', 'payment_submitted', 'under_verification', 'verified', 'rejected', 'refunded', 'paid', 'failed'],
      default: 'pending_payment',
    },
    paymentId: String,
    trackingNumber: String,
    notes: String,
    statusHistory: {
      type: [OrderStatusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderSchema.index({ customer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

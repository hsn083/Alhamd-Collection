import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShippingZone extends Document {
  name: string;
  countries: string[];
  states?: string[];
  cities?: string[];
  rate: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingZoneSchema = new Schema<IShippingZone>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    countries: [
      {
        type: String,
        required: true,
      },
    ],
    states: [
      {
        type: String,
      },
    ],
    cities: [
      {
        type: String,
      },
    ],
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate cannot be negative'],
    },
    freeShippingThreshold: {
      type: Number,
      min: [0, 'Free shipping threshold cannot be negative'],
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Estimated days is required'],
      min: [1, 'Estimated days must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ShippingZoneSchema.index({ countries: 1 });
ShippingZoneSchema.index({ isActive: 1 });

const ShippingZone: Model<IShippingZone> = mongoose.models.ShippingZone || mongoose.model<IShippingZone>('ShippingZone', ShippingZoneSchema);

export default ShippingZone;

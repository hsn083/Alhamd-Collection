import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.number().positive('Price must be greater than 0'),
  discountPrice: z.number().positive('Discount price must be greater than 0').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  warranty: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  isNew: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  images: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, 'Coupon code must be at least 3 characters').toUpperCase(),
  discountType: z.enum(['percentage', 'fixed'], {
    errorMap: () => ({ message: 'Discount type must be percentage or fixed' }),
  }),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  maxUses: z.number().int().positive('Max uses must be greater than 0').optional(),
  usedCount: z.number().int().nonnegative().optional().default(0),
  expiresAt: z.date().optional(),
  isActive: z.boolean().optional().default(true),
  minOrderValue: z.number().nonnegative().optional(),
});

export type CouponFormData = z.infer<typeof couponSchema>;

export const orderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

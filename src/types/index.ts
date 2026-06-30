// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  category: string;
  brand: string;
  stock: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  images: string[];
  video?: string;
  specifications: Record<string, string>;
  features: string[];
  warranty: string;
  rating: number;
  reviewCount: number;
  reviews: number;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  previousQuantity: number;
  newQuantity: number;
  changeType: 'increase' | 'decrease' | 'adjustment';
  reason: string;
  changedBy: string;
  changedAt: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  threshold: number;
  alertType: 'low_stock' | 'out_of_stock';
  isRead: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  province: string;
  address: string;
  isDefault: boolean;
}

// Extended Order Status Flow
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export type PaymentStatus = 
  | 'pending_payment'
  | 'payment_submitted'
  | 'under_verification'
  | 'verified'
  | 'rejected'
  | 'refunded';

export interface PaymentScreenshot {
  url: string;
  uploadedAt: string;
  fileName: string;
  fileSize: number;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];
  paymentMethod: 'cod' | 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'card' | 'stripe';
  paymentStatus: PaymentStatus;
  paymentScreenshot?: PaymentScreenshot;
  transactionId?: string;
  paymentTime?: string;
  adminNotes?: string;
  trackingId?: string;
  lastUpdated?: string;
  shipping: {
    method: 'standard' | 'express';
    courier: string;
    cost: number;
    trackingNumber?: string;
    estimatedDelivery?: string;
    deliveryNotes?: string;
  };
  address: Address;
  billingAddress?: Address;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  notes?: string;
  verified?: boolean;
  verificationToken?: string | null;
  verificationExpires?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: Date;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
  status: 'active' | 'inactive';
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  video?: string;
  variant?: {
    color?: string;
    size?: string;
    material?: string;
  };
  isVerifiedPurchase: boolean;
  likes: number;
  helpful: number;
  sellerReply?: {
    reply: string;
    date: string;
    sellerName: string;
  };
  reports?: Array<{
    userId: string;
    reason: string;
    date: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  sessionId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  publishedAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
  search?: string;
}

export interface SortOptions {
  field: 'price' | 'rating' | 'createdAt' | 'name';
  order: 'asc' | 'desc';
}

export interface PaymentSession {
  sessionId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'jazzcash' | 'easypaisa';
}

export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'jazzcash' | 'easypaisa';
  paymentGatewayId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentVerification {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface HeroBanner {
  id: string;
  image: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

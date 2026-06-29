import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Rating from '@/models/Rating';
import Product from '@/models/Product';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Rate limiting storage (in-memory for simplicity, use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const SPAM_PROTECTION_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Check rate limit
function checkRateLimit(sessionId: string, ipAddress: string): boolean {
  const now = Date.now();
  const key = `${sessionId}-${ipAddress}`;
  const limit = rateLimitStore.get(key);

  if (!limit) {
    rateLimitStore.set(key, { count: 1, resetTime: now + SPAM_PROTECTION_WINDOW });
    return true;
  }

  if (now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + SPAM_PROTECTION_WINDOW });
    return true;
  }

  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  limit.count++;
  return true;
}

// Check if user can rate (24-hour cooldown per product per session)
async function canRateProduct(productId: string, sessionId: string, userId?: string): Promise<boolean> {
  if (userId) {
    const existingRating = await Rating.findOne({ product: productId, user: userId });
    return !existingRating;
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRating = await Rating.findOne({
    product: productId,
    sessionId,
    createdAt: { $gte: twentyFourHoursAgo }
  });
  return !recentRating;
}

// Update product rating
async function updateProductRating(productId: string): Promise<void> {
  const ratings = await Rating.find({ product: productId });

  if (ratings.length === 0) {
    return;
  }

  const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
  const averageRating = totalRating / ratings.length;

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(averageRating * 10) / 10,
    reviewCount: ratings.length,
  });
}

// POST - Submit a rating
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { productId, rating, sessionId, userId } = body;

    // Validate required fields
    if (!productId || !rating || (!sessionId && !userId)) {
      return NextResponse.json(
        { success: false, error: 'Product ID, rating, and session ID or user ID are required' },
        { status: 400 }
      );
    }

    // Validate rating value (1-5)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    // Check spam protection
    if (sessionId && !checkRateLimit(sessionId, ipAddress)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait before submitting another rating.' },
        { status: 429 }
      );
    }

    // Check if user can rate this product
    const canRate = await canRateProduct(productId, sessionId || '', userId);
    if (!canRate) {
      return NextResponse.json(
        { success: false, error: 'You have already rated this product. Please wait 24 hours before rating again.' },
        { status: 429 }
      );
    }

    // Create new rating
    const newRating = await Rating.create({
      product: productId,
      user: userId,
      rating,
      sessionId,
    });

    // Update product rating
    await updateProductRating(productId);

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating,
    });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

// GET - Get ratings for a product
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const ratings = await Rating.find({ product: productId });

    return NextResponse.json({
      success: true,
      ratings,
      count: ratings.length,
    });
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

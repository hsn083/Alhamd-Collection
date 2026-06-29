import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Add seller reply to a review
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { reviewId, reply, sellerName } = body;

    if (!reviewId || !reply || !sellerName) {
      return NextResponse.json(
        { success: false, error: 'Review ID, reply, and seller name are required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Add seller reply
    review.sellerReply = {
      reply,
      date: new Date().toISOString(),
      sellerName,
    };

    await review.save();

    return NextResponse.json({
      success: true,
      message: 'Seller reply added successfully',
      sellerReply: review.sellerReply,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error adding seller reply:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add seller reply' },
      { status: 500 }
    );
  }
}

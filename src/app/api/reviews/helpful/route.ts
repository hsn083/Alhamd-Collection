import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Mark review as helpful
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { reviewId, sessionId } = body;

    if (!reviewId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Review ID and session ID are required' },
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

    // Initialize helpfulUsers array if it doesn't exist
    if (!review.helpfulUsers) {
      review.helpfulUsers = [];
    }

    // Check if user already marked this review as helpful
    if (review.helpfulUsers.includes(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'You have already marked this review as helpful' },
        { status: 400 }
      );
    }

    // Add user to helpfulUsers and increment counters
    review.helpfulUsers.push(sessionId);
    review.helpful = (review.helpful || 0) + 1;
    review.likes = (review.likes || 0) + 1;
    review.updatedAt = new Date();

    await review.save();

    return NextResponse.json({
      success: true,
      message: 'Review marked as helpful',
      helpfulCount: review.helpful,
      likesCount: review.likes,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}

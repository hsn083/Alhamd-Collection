import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Report a review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { reviewId, sessionId, reason } = body;

    if (!reviewId || !sessionId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Review ID, session ID, and reason are required' },
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

    // Initialize reported flag if it doesn't exist
    if (review.reported === undefined) {
      review.reported = false;
    }

    // Check if user already reported this review
    if (review.reported) {
      return NextResponse.json(
        { success: false, error: 'This review has already been reported' },
        { status: 400 }
      );
    }

    // Mark as reported
    review.reported = true;
    review.reportReason = reason;
    review.updatedAt = new Date();

    await review.save();

    return NextResponse.json({
      success: true,
      message: 'Review reported successfully',
      reported: true,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to report review' },
      { status: 500 }
    );
  }
}

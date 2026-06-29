import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REVIEWS_FILE = join(process.cwd(), 'data', 'reviews.json');

interface Review {
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

// Read reviews
async function readReviews(): Promise<Review[]> {
  try {
    if (!existsSync(REVIEWS_FILE)) {
      return [];
    }
    const data = await readFile(REVIEWS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading reviews:', error);
    return [];
  }
}

// Write reviews
async function writeReviews(reviews: Review[]): Promise<void> {
  try {
    await writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing reviews:', error);
    throw error;
  }
}

// POST - Report a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, sessionId, reason } = body;

    if (!reviewId || !sessionId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Review ID, session ID, and reason are required' },
        { status: 400 }
      );
    }

    const reviews = await readReviews();
    const reviewIndex = reviews.findIndex((r) => r.id === reviewId);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = reviews[reviewIndex];
    
    // Initialize reports array if it doesn't exist
    if (!review.reports) {
      review.reports = [];
    }

    // Check if user already reported this review
    const existingReport = review.reports.find(r => r.userId === sessionId);
    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this review' },
        { status: 400 }
      );
    }

    // Add report
    review.reports.push({
      userId: sessionId,
      reason,
      date: new Date().toISOString(),
    });
    review.updatedAt = new Date().toISOString();

    reviews[reviewIndex] = review;
    await writeReviews(reviews);

    return NextResponse.json({
      success: true,
      message: 'Review reported successfully',
      reports: review.reports,
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

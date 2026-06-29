import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Increment coupon usage count
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { code } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Coupon code is required' 
        },
        { status: 400 }
      );
    }

    // Find coupon by code (case-insensitive)
    const coupon = await Coupon.findOne({ code: new RegExp(`^${code}$`, 'i') });

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: 'Coupon not found'
      }, { status: 404 });
    }

    // Increment usage count
    coupon.usedCount += 1;
    await coupon.save();

    // Transform to match frontend expectations
    const transformedCoupon = {
      ...coupon.toObject(),
      id: coupon._id.toString(),
      expiryDate: coupon.expiryDate ? coupon.expiryDate.toISOString().split('T')[0] : null,
    };

    return NextResponse.json({
      success: true,
      message: 'Coupon usage recorded successfully',
      coupon: transformedCoupon
    });
  } catch (error: any) {
    console.error('Error recording coupon usage:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to record coupon usage' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Validate a coupon
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { code, cartTotal } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Coupon code is required' 
        },
        { status: 400 }
      );
    }

    if (cartTotal === undefined || cartTotal === null) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Cart total is required' 
        },
        { status: 400 }
      );
    }

    // Find coupon by code (case-insensitive)
    const coupon = await Coupon.findOne({ code: new RegExp(`^${code}$`, 'i') });

    // Check if coupon exists
    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon is currently inactive'
      });
    }

    // Check if coupon is expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (coupon.expiryDate) {
      const expiryDate = new Date(coupon.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        return NextResponse.json({
          valid: false,
          message: 'This coupon has expired'
        });
      }
    }

    // Check if usage limit has been reached
    if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon has reached its usage limit'
      });
    }

    // Check minimum purchase requirement
    if (coupon.minPurchase && coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
      return NextResponse.json({
        valid: false,
        message: `Minimum purchase of PKR ${coupon.minPurchase.toLocaleString()} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (cartTotal * coupon.value) / 100;
      // Apply max discount cap if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.value;
      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      discountAmount,
      discountType: coupon.type,
      couponCode: coupon.code,
      message: 'Coupon applied successfully'
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { 
        valid: false, 
        message: error.message || 'Failed to validate coupon' 
      },
      { status: 500 }
    );
  }
}

// GET - Get all coupons (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const query: any = {};
    if (activeOnly) {
      query.isActive = true;
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      coupons,
      count: coupons.length,
    });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// PUT - Update coupon (admin)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, code, type, value, minPurchase, maxDiscount, usageLimit, isActive, expiryDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (code) updateData.code = code.toUpperCase();
    if (type) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minPurchase !== undefined) updateData.minPurchase = minPurchase;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiryDate) updateData.expiryDate = expiryDate;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      coupon: updatedCoupon,
      message: 'Coupon updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon (admin)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

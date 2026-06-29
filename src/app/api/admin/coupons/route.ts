import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all coupons
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    // Transform to match frontend expectations
    const transformedCoupons = coupons.map(coupon => ({
      ...coupon.toObject(),
      id: coupon._id.toString(),
      expiryDate: coupon.expiryDate ? coupon.expiryDate.toISOString().split('T')[0] : null,
    }));

    return NextResponse.json({
      success: true,
      coupons: transformedCoupons,
      count: transformedCoupons.length
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { code, type, value, minPurchase, maxDiscount, usageLimit, expiryDate } = body;

    // Validate required fields
    if (!code || !type || !value || !expiryDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon with this code already exists' },
        { status: 400 }
      );
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minPurchase: Number(minPurchase) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: Number(usageLimit) || 0,
      usedCount: 0,
      expiryDate: new Date(expiryDate),
      isActive: true,
    });

    // Transform to match frontend expectations
    const transformedCoupon = {
      ...newCoupon.toObject(),
      id: newCoupon._id.toString(),
      expiryDate: newCoupon.expiryDate ? newCoupon.expiryDate.toISOString().split('T')[0] : null,
    };

    return NextResponse.json({
      success: true,
      coupon: transformedCoupon,
      message: 'Coupon created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// PUT - Update a coupon
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, code, type, value, minPurchase, maxDiscount, usageLimit, expiryDate, isActive } = body;

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

    // Check if new code conflicts with existing coupon
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(), 
        _id: { $ne: id } 
      });
      if (existingCoupon) {
        return NextResponse.json(
          { success: false, error: 'Coupon with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Update coupon
    const updateData: any = {};
    if (code) updateData.code = code.toUpperCase();
    if (type) updateData.type = type;
    if (value !== undefined) updateData.value = Number(value);
    if (minPurchase !== undefined) updateData.minPurchase = Number(minPurchase);
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? Number(maxDiscount) : undefined;
    if (usageLimit !== undefined) updateData.usageLimit = Number(usageLimit);
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return NextResponse.json(
        { success: false, error: 'Failed to update coupon' },
        { status: 500 }
      );
    }

    // Transform to match frontend expectations
    const transformedCoupon = {
      ...updatedCoupon.toObject(),
      id: updatedCoupon._id.toString(),
      expiryDate: updatedCoupon.expiryDate ? updatedCoupon.expiryDate.toISOString().split('T')[0] : null,
    };

    return NextResponse.json({
      success: true,
      coupon: transformedCoupon,
      message: 'Coupon updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
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

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

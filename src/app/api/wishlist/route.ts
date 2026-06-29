import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Add item to wishlist or remove if already exists
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { productId, sessionId, userId } = body;

    // Validate required fields
    if (!productId || (!sessionId && !userId)) {
      return NextResponse.json(
        { success: false, error: 'Product ID and session ID or user ID are required' },
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

    // Find or create wishlist
    let wishlist;
    if (userId) {
      wishlist = await Wishlist.findOne({ user: userId });
    } else {
      wishlist = await Wishlist.findOne({ sessionId });
    }

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        sessionId: sessionId || generateSessionId(),
        products: [],
      });
    }

    // Check if product already in wishlist
    const productIndex = wishlist.products.findIndex(
      (p: any) => p.toString() === productId
    );

    if (productIndex >= 0) {
      // Remove from wishlist
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();
      
      return NextResponse.json({
        success: true,
        message: 'Removed from wishlist',
        action: 'removed',
      });
    }

    // Add to wishlist
    wishlist.products.push(productId);
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products', 'name slug images price discountPrice stock status');

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist',
      action: 'added',
      wishlist: populatedWishlist,
    });
  } catch (error: any) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}

// GET - Get wishlist for a session/user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId && !userId) {
      return NextResponse.json(
        { success: false, error: 'Session ID or user ID is required' },
        { status: 400 }
      );
    }

    let wishlist;
    if (userId) {
      wishlist = await Wishlist.findOne({ user: userId }).populate('products', 'name slug images price discountPrice stock status');
    } else {
      wishlist = await Wishlist.findOne({ sessionId }).populate('products', 'name slug images price discountPrice stock status');
    }

    if (!wishlist) {
      return NextResponse.json({
        success: true,
        wishlist: null,
        products: [],
        count: 0,
      });
    }

    return NextResponse.json({
      success: true,
      wishlist,
      products: wishlist.products,
      count: wishlist.products.length,
    });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!productId || (!sessionId && !userId)) {
      return NextResponse.json(
        { success: false, error: 'Product ID and session ID or user ID are required' },
        { status: 400 }
      );
    }

    let wishlist;
    if (userId) {
      wishlist = await Wishlist.findOne({ user: userId });
    } else {
      wishlist = await Wishlist.findOne({ sessionId });
    }

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    const productIndex = wishlist.products.findIndex(
      (p: any) => p.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not in wishlist' },
        { status: 404 }
      );
    }

    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

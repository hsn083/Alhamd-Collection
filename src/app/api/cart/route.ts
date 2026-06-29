import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch cart by user or session
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID or Session ID is required' },
        { status: 400 }
      );
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId }).populate('items.product', 'name slug images price discountPrice stock status');
    } else {
      cart = await Cart.findOne({ sessionId }).populate('items.product', 'name slug images price discountPrice stock status');
    }

    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: null,
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      });
    }

    // Recalculate totals
    const subtotal = cart.items.reduce((sum: number, item: any) => {
      const price = item.product?.discountPrice || item.product?.price || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    return NextResponse.json({
      success: true,
      cart,
      items: cart.items,
      subtotal,
      discount: cart.discount,
      total: cart.total,
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart or update cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, sessionId, productId, quantity, size, color } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID or Session ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Product is not available' },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        sessionId: sessionId || generateSessionId(),
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => 
        item.product.toString() === productId && 
        item.size === size && 
        item.color === color
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price;
      cart.items[existingItemIndex].discountPrice = product.discountPrice;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
        price: product.price,
        discountPrice: product.discountPrice,
      });
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum: number, item: any) => {
      const price = item.discountPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
    cart.total = cart.subtotal - cart.discount;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug images price discountPrice stock status');

    return NextResponse.json({
      success: true,
      cart: populatedCart,
      message: 'Item added to cart successfully',
    });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity or remove item
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, sessionId, productId, quantity, size, color, action } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID or Session ID is required' },
        { status: 400 }
      );
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item: any) => 
        item.product.toString() === productId && 
        item.size === size && 
        item.color === color
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (action === 'remove') {
      cart.items.splice(itemIndex, 1);
    } else if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock
        const product = await Product.findById(productId);
        if (product && product.stock < quantity) {
          return NextResponse.json(
            { success: false, error: 'Insufficient stock' },
            { status: 400 }
          );
        }
        cart.items[itemIndex].quantity = quantity;
      }
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum: number, item: any) => {
      const price = item.discountPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
    cart.total = cart.subtotal - cart.discount;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name slug images price discountPrice stock status');

    return NextResponse.json({
      success: true,
      cart: populatedCart,
      message: 'Cart updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID or Session ID is required' },
        { status: 400 }
      );
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.total = 0;
    cart.couponCode = undefined;

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

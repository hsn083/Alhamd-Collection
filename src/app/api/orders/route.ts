import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Product from '@/models/Product';
import Inventory from '@/models/Inventory';
import StockHistory from '@/models/StockHistory';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { sendPaymentStatusEmail, sendOrderStatusEmail } from '@/lib/email-service';
import { normalizePhoneNumber } from '@/lib/utils';
import { generateNextOrderNumber, formatOrderNumber } from '@/lib/order-number';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { order, transaction } = body;

    // Validate required fields
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Missing order data' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!order.paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Please select payment method first' },
        { status: 400 }
      );
    }

    // Validate payment screenshot for Easypaisa and JazzCash
    if ((order.paymentMethod === 'easypaisa' || order.paymentMethod === 'jazzcash') && !order.paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: 'Payment screenshot is required for Easypaisa/JazzCash payments' },
        { status: 400 }
      );
    }

    // Validate payment screenshot for bank_transfer if provided
    if (order.paymentMethod === 'bank_transfer' && !order.paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: 'Payment screenshot is required for bank transfer payments' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
    const shippingCost = order.shippingCost || 0;
    const tax = order.tax || 0;
    const discount = order.discount || 0;
    const total = subtotal + shippingCost + tax - discount;

    // Handle guest orders - create or find customer
    let customerId = order.userId;
    let customerName = order.user?.name || order.address?.fullName;
    let customerEmail = order.user?.email;
    let customerPhone = order.user?.phone || order.address?.phone;
    let customerPhoneNormalized = normalizePhoneNumber(customerPhone);

    // If no userId (guest checkout), create customer record
    if (!customerId && customerEmail) {
      // Check if customer already exists by email
      let existingCustomer = await User.findOne({ email: customerEmail.toLowerCase() });
      
      if (!existingCustomer) {
        // Create new customer for guest order
        const guestPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        existingCustomer = await User.create({
          name: customerName,
          email: customerEmail.toLowerCase(),
          password: guestPassword,
          phone: customerPhone,
          role: 'customer',
          isEmailVerified: true,
          provider: 'local',
          addresses: [{
            street: order.address?.address,
            city: order.address?.city,
            state: order.address?.province,
            zipCode: order.address?.zipCode || '',
            country: order.address?.country || 'Pakistan',
            isDefault: true,
          }],
        });
        console.log('[ORDERS] Created customer for guest order:', existingCustomer._id);
      }
      
      customerId = existingCustomer._id.toString();
      customerName = existingCustomer.name;
      customerEmail = existingCustomer.email;
      customerPhone = existingCustomer.phone;
    }

    // Generate sequential order number
    const orderNumber = await generateNextOrderNumber();
    const displayOrderNumber = formatOrderNumber(orderNumber);

    // Create order
    const newOrder = await Order.create({
      orderNumber,
      displayOrderNumber,
      customer: customerId,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      customerPhoneNormalized: customerPhoneNormalized,
      shippingAddress: {
        street: order.address?.address,
        city: order.address?.city,
        state: order.address?.province,
        zipCode: order.address?.zipCode || '',
        country: order.address?.country || 'Pakistan',
        phone: order.address?.phone,
      },
      items: order.items?.map((item: any) => ({
        product: item.product?.id || item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice,
        size: item.size,
        color: item.color,
      })),
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      total,
      status: 'pending',
      paymentMethod: order.paymentMethod,
      paymentStatus: 'pending_payment',
      notes: order.notes,
      statusHistory: [{
        status: 'pending',
        comment: 'Order placed successfully',
        updatedAt: new Date(),
      }],
    });

    // Update product stock
    for (const item of order.items || []) {
      const productId = item.product?.id || item.productId;
      if (productId) {
        const product = await Product.findById(productId);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await Product.findByIdAndUpdate(productId, { stock: newStock });

          // Update inventory
          let inventory = await Inventory.findOne({ product: productId });
          if (!inventory) {
            inventory = await Inventory.create({
              product: productId,
              quantity: newStock,
              lowStockThreshold: product.lowStockThreshold || 10,
              status: newStock <= (product.lowStockThreshold || 10) ? 'low_stock' : 'in_stock',
              reserved: 0,
              available: newStock,
            });
          } else {
            inventory.quantity = newStock;
            inventory.available = newStock;
            inventory.status = newStock <= inventory.lowStockThreshold ? 'low_stock' : 'in_stock';
            await inventory.save();
          }

          // Create stock history
          await StockHistory.create({
            product: productId,
            type: 'sale',
            quantity: item.quantity,
            previousQuantity: product.stock,
            newQuantity: newStock,
            reason: `Order ${newOrder.displayOrderNumber} - ${item.quantity} items sold`,
            reference: newOrder.displayOrderNumber,
            referenceType: 'order',
          });
        }
      }
    }

    // Create payment record if transaction data provided
    let payment = null;
    if (transaction || order.paymentScreenshot) {
      payment = await Payment.create({
        order: newOrder._id,
        amount: total,
        method: order.paymentMethod,
        status: order.paymentMethod === 'cod' ? 'pending' : 'processing',
        transactionId: transaction?.transactionId || order.transactionId,
        screenshot: order.paymentScreenshot?.url || order.paymentScreenshot || transaction?.screenshot?.url || transaction?.screenshot,
        verificationStatus: order.paymentMethod === 'cod' ? 'pending' : 'pending',
        metadata: transaction,
      });
    }

    // Create admin notification
    try {
      await Notification.create({
        recipientType: 'admin',
        type: 'order',
        title: 'New Order Received',
        message: `Order ${newOrder.displayOrderNumber} has been placed by ${newOrder.customerName}`,
        link: `/admin/orders/${newOrder._id}`,
        data: { orderId: newOrder._id },
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Create customer notification
    if (newOrder.customer) {
      try {
        await Notification.create({
          recipient: newOrder.customer,
          recipientType: 'user',
          type: 'order',
          title: 'Order Placed Successfully',
          message: `Your order ${newOrder.displayOrderNumber} has been placed successfully`,
          link: `/orders/${newOrder._id}`,
          data: { orderId: newOrder._id },
        });
      } catch (notifError) {
        console.error('Failed to create customer notification:', notifError);
      }
    }

    // Send order confirmation email
    if (newOrder.customerEmail && newOrder.customerName) {
      sendOrderStatusEmail(
        newOrder.customerEmail,
        newOrder.displayOrderNumber,
        newOrder.customerName,
        'confirmed'
      ).catch(err => console.error('Failed to send order confirmation email:', err));
    }

    console.log('[ORDERS POST] Order created successfully:', {
      orderId: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
      customerEmail: newOrder.customerEmail,
      total: newOrder.total,
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder._id.toString(),
      order: newOrder,
      payment,
    });
  } catch (error: any) {
    console.error('[ORDERS POST] Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (orderId || orderNumber) {
      // Support both MongoDB _id and orderNumber
      const searchValue = (orderId || orderNumber)?.trim();
      console.log('[ORDERS GET] Looking up order:', searchValue);
      
      let order;
      // Check if it's a MongoDB ObjectId
      if (/^[0-9A-F]{24}$/i.test(searchValue || '')) {
        order = await Order.findById(searchValue).populate('customer', 'name email');
      } else {
        // Try to parse as numeric order number
        const numericOrderNumber = parseInt(searchValue || '', 10);
        if (!isNaN(numericOrderNumber)) {
          order = await Order.findOne({ orderNumber: numericOrderNumber }).populate('customer', 'name email');
        } else {
          // Try searching by displayOrderNumber
          order = await Order.findOne({ displayOrderNumber: searchValue }).populate('customer', 'name email');
        }
      }
      
      if (!order) {
        console.log('[ORDERS GET] Order not found:', searchValue);
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      
      const payment = await Payment.findOne({ order: order._id });
      console.log('[ORDERS GET] Order found successfully:', order.displayOrderNumber);
      return NextResponse.json({ success: true, order, payment });
    }

    const query: any = {};
    if (userId) query.customer = userId;
    if (email) query.customerEmail = email;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return NextResponse.json({ 
      success: true, 
      orders, 
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('[ORDERS GET] Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, paymentStatus, adminNotes } = body;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      updateData.statusHistory = [
        ...order.statusHistory,
        {
          status,
          comment: body.note || '',
          updatedAt: new Date(),
        },
      ];
    }
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    if (adminNotes !== undefined) {
      updateData.notes = adminNotes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('customer', 'name email');

    // Update payment status if provided
    if (paymentStatus) {
      await Payment.findOneAndUpdate(
        { order: orderId },
        { 
          status: paymentStatus === 'verified' ? 'completed' : paymentStatus,
          verificationStatus: paymentStatus === 'verified' ? 'approved' : paymentStatus === 'rejected' ? 'rejected' : 'pending',
        }
      );
    }

    // Send email notifications for status changes
    if (updatedOrder && updatedOrder.customerEmail && updatedOrder.customerName) {
      if (paymentStatus && ['payment_submitted', 'under_verification', 'verified', 'rejected', 'refunded'].includes(paymentStatus)) {
        sendPaymentStatusEmail(
          updatedOrder.customerEmail,
          updatedOrder.displayOrderNumber,
          updatedOrder.customerName,
          paymentStatus,
          updatedOrder.paymentMethod
        ).catch(err => console.error('Failed to send payment status email:', err));
      }

      if (status && ['confirmed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'].includes(status)) {
        sendOrderStatusEmail(
          updatedOrder.customerEmail,
          updatedOrder.displayOrderNumber,
          updatedOrder.customerName,
          status
        ).catch(err => console.error('Failed to send order status email:', err));
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('[ORDERS PUT] Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

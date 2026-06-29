import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Product from '@/models/Product';
import Inventory from '@/models/Inventory';
import StockHistory from '@/models/StockHistory';
import Notification from '@/models/Notification';
import { sendOrderStatusEmail } from '@/lib/email-service';
import { extractOrderNumber } from '@/lib/order-number';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const searchValue = params.id.trim();
    console.log('[ORDERS ID GET] Looking up order:', searchValue);
    
    let order;
    // Check if it's a MongoDB ObjectId
    if (/^[0-9A-F]{24}$/i.test(searchValue)) {
      order = await Order.findById(searchValue).populate('customer', 'name email');
    } else {
      // Try to extract numeric order number from display format
      const numericOrderNumber = extractOrderNumber(searchValue);
      if (numericOrderNumber !== null) {
        order = await Order.findOne({ orderNumber: numericOrderNumber }).populate('customer', 'name email');
      } else {
        // Try searching by displayOrderNumber as fallback
        order = await Order.findOne({ displayOrderNumber: searchValue }).populate('customer', 'name email');
      }
    }

    if (!order) {
      console.log('[ORDERS ID GET] Order not found:', searchValue);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const payment = await Payment.findOne({ order: order._id });
    console.log('[ORDERS ID GET] Order found successfully:', order.displayOrderNumber);

    return NextResponse.json({
      success: true,
      order,
      payment
    });
  } catch (error) {
    console.error('[ORDERS ID GET] Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { status, paymentStatus, trackingNumber, customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingProvince, notes, adminNotes } = body;

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = order.status;

    // Update order fields
    const updateData: any = {};

    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
      
      // Handle stock restoration for cancelled/returned orders
      const isRestoringStock = (status === 'cancelled' || status === 'returned') && 
                              (oldStatus as string) !== 'cancelled' && 
                              (oldStatus as string) !== 'returned';
      if (isRestoringStock) {
        // Restore stock for each item
        for (const item of order.items || []) {
          const product = await Product.findById(item.product);
          if (product) {
            const previousQuantity = product.stock;
            const newStock = previousQuantity + item.quantity;
            await Product.findByIdAndUpdate(item.product, { stock: newStock });

            // Update inventory
            const inventory = await Inventory.findOne({ product: item.product });
            if (inventory) {
              inventory.quantity = newStock;
              inventory.available = newStock;
              inventory.status = newStock <= inventory.lowStockThreshold ? 'low_stock' : 'in_stock';
              await inventory.save();
            }

            // Create stock history
            await StockHistory.create({
              product: item.product,
              type: 'return',
              quantity: item.quantity,
              previousQuantity,
              newQuantity: newStock,
              reason: `Order ${order.displayOrderNumber} ${status} - ${item.quantity} items restored`,
              reference: order.displayOrderNumber,
              referenceType: 'order',
            });
          }
        }
      }
      
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

    if (customerName) {
      updateData.customerName = customerName;
    }

    if (customerEmail) {
      updateData.customerEmail = customerEmail;
    }

    if (customerPhone) {
      updateData.customerPhone = customerPhone;
    }

    if (shippingAddress) {
      updateData.shippingAddress = {
        ...order.shippingAddress,
        street: shippingAddress,
      };
    }

    if (shippingCity) {
      updateData.shippingAddress = {
        ...order.shippingAddress,
        city: shippingCity,
      };
    }

    if (shippingProvince) {
      updateData.shippingAddress = {
        ...order.shippingAddress,
        state: shippingProvince,
      };
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Handle payment status updates
    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['pending_payment', 'payment_submitted', 'under_verification', 'verified', 'rejected', 'refunded', 'paid', 'approved', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment status' },
          { status: 400 }
        );
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (adminNotes !== undefined) {
      updateData.notes = adminNotes;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('customer', 'name email');

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found after update' },
        { status: 404 }
      );
    }

    // Update payment status if provided
    if (paymentStatus) {
      await Payment.findOneAndUpdate(
        { order: params.id },
        { 
          status: paymentStatus === 'verified' ? 'completed' : paymentStatus,
          verificationStatus: paymentStatus === 'verified' ? 'approved' : paymentStatus === 'rejected' ? 'rejected' : 'pending',
        }
      );
    }

    // Create customer notification for status change
    if (status && oldStatus !== status && updatedOrder.customer) {
      try {
        await Notification.create({
          recipient: updatedOrder.customer,
          recipientType: 'user',
          type: 'order',
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your order ${updatedOrder.displayOrderNumber} has been ${status}`,
          link: `/orders/${updatedOrder._id}`,
          data: { orderId: updatedOrder._id },
        });
      } catch (notifError) {
        console.error('Failed to create customer notification:', notifError);
      }
    }

    // Send status update email if status changed
    if (updatedOrder.customerEmail && status && oldStatus !== status) {
      await sendOrderStatusEmail(
        updatedOrder.customerEmail,
        updatedOrder.displayOrderNumber,
        updatedOrder.customerName || 'Customer',
        status
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete associated payment
    await Payment.deleteOne({ order: params.id });

    // Delete order
    await Order.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}

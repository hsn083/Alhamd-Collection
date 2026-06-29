import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { generateInvoicePDF, InvoiceData } from '@/lib/invoice';
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
    let order;
    
    // Check if it's a MongoDB ObjectId
    if (/^[0-9A-F]{24}$/i.test(searchValue)) {
      order = await Order.findById(searchValue);
    } else {
      // Try to extract numeric order number from display format
      const numericOrderNumber = extractOrderNumber(searchValue);
      if (numericOrderNumber !== null) {
        order = await Order.findOne({ orderNumber: numericOrderNumber });
      } else {
        // Try searching by displayOrderNumber as fallback
        order = await Order.findOne({ displayOrderNumber: searchValue });
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderId: order.displayOrderNumber || order._id.toString(),
      customerName: order.customerName || 'N/A',
      customerEmail: order.customerEmail || 'N/A',
      customerPhone: order.customerPhone || 'N/A',
      customerAddress: order.shippingAddress?.street || 'N/A',
      customerCity: order.shippingAddress?.city || 'N/A',
      customerProvince: order.shippingAddress?.state || 'N/A',
      items: order.items?.map((item: any) => ({
        name: item.name || 'Product',
        quantity: item.quantity,
        price: item.price || 0,
      })) || [],
      subtotal: order.subtotal || 0,
      total: order.total || 0,
      date: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.displayOrderNumber || order._id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

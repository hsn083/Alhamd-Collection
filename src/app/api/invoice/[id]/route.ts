import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateInvoicePDF, InvoiceData } from '@/lib/invoice';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// File paths
const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

// Helper function to read orders from disk
function getOrders(): any[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf-8');
      return JSON.parse(data) || [];
    }
    return [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orders = getOrders();
    const order = orders.find((o: any) => o.id === params.id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderId: order.id,
      customerName: order.user?.name || order.address?.fullName || 'N/A',
      customerEmail: order.user?.email || 'N/A',
      customerPhone: order.user?.phone || order.address?.phone || 'N/A',
      customerAddress: order.address?.address || 'N/A',
      customerCity: order.address?.city || 'N/A',
      customerProvince: order.address?.province || 'N/A',
      items: order.items?.map((item: any) => ({
        name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.price || 0,
      })) || [],
      subtotal: order.subtotal || 0,
      total: order.total || 0,
      date: order.createdAt || new Date().toISOString(),
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id}.pdf"`,
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

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerProvince: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  date: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add fonts
      doc.font('Helvetica');

      // Header
      doc.fontSize(24).fillColor('#10b981').text('AlhamdCollection Store', 50, 50);
      doc.fontSize(10).fillColor('#666').text('Your Trusted Fashion Store', 50, 80);

      // Invoice Title
      doc.fontSize(20).fillColor('#333').text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(12).fillColor('#666').text(`Invoice #: ${data.orderId}`, 400, 75, { align: 'right' });
      doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 400, 90, { align: 'right' });

      // Customer Information
      doc.fontSize(14).fillColor('#333').text('Bill To:', 50, 120);
      doc.fontSize(11).fillColor('#666').text(data.customerName, 50, 140);
      doc.text(data.customerEmail, 50, 155);
      doc.text(data.customerPhone, 50, 170);
      doc.text(data.customerAddress, 50, 185);
      doc.text(`${data.customerCity}, ${data.customerProvince}`, 50, 200);

      // Line
      doc.moveTo(50, 230).lineTo(550, 230).strokeColor('#ddd').lineWidth(1).stroke();

      // Items Table Header
      doc.fontSize(12).fillColor('#333').text('Item', 50, 250);
      doc.text('Quantity', 250, 250);
      doc.text('Price', 350, 250);
      doc.text('Total', 450, 250);

      // Line
      doc.moveTo(50, 265).lineTo(550, 265).strokeColor('#ddd').lineWidth(1).stroke();

      // Items
      let y = 285;
      data.items.forEach((item) => {
        doc.fontSize(11).fillColor('#666').text(item.name, 50, y);
        doc.text(item.quantity.toString(), 250, y);
        doc.text(`PKR ${item.price.toLocaleString()}`, 350, y);
        doc.text(`PKR ${(item.quantity * item.price).toLocaleString()}`, 450, y);
        y += 25;
      });

      // Line
      doc.moveTo(50, y + 10).lineTo(550, y + 10).strokeColor('#ddd').lineWidth(1).stroke();

      // Totals
      y += 30;
      doc.fontSize(12).fillColor('#333').text('Subtotal:', 350, y, { align: 'right' });
      doc.text(`PKR ${data.subtotal.toLocaleString()}`, 450, y);
      y += 20;
      doc.fontSize(14).fillColor('#10b981').text('Total:', 350, y, { align: 'right' });
      doc.text(`PKR ${data.total.toLocaleString()}`, 450, y);

      // Footer
      doc.fontSize(10).fillColor('#666').text('Thank you for your purchase!', 50, 700);
      doc.text('For any questions, contact us at support@alhamdcollection.com', 50, 715);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function getInvoiceFilename(orderId: string): string {
  return `invoice-${orderId}-${Date.now()}.pdf`;
}

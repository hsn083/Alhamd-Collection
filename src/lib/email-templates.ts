// Professional HTML email templates for AlhamdCollection

const BRAND_COLOR = '#0F766E';
const GOLD_COLOR = '#D4AF37';

function baseTemplate(title: string, content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,${BRAND_COLOR},#065F46);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">ALHAMD<span style="color:${GOLD_COLOR};"> Collection</span></h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Premium Clothing & Shoes</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="background:#fff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f1f5f9;padding:24px 40px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;text-align:center;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">© 2024 AlhamdCollection. All rights reserved.</p>
    <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">
      <a href="https://alhamdcollection.pk" style="color:${BRAND_COLOR};text-decoration:none;">alhamdcollection.pk</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function otpEmailTemplate(name: string, otp: string) {
  const content = `
    <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Here is your verification code to complete your order:</p>
    <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px dashed ${BRAND_COLOR};border-radius:12px;padding:32px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 8px;font-size:13px;color:#059669;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your OTP Code</p>
      <p style="margin:0;font-size:48px;font-weight:900;color:${BRAND_COLOR};letter-spacing:12px;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">⏱ This code expires in <strong>1 minute</strong>.</p>
    <p style="margin:0;color:#6b7280;font-size:14px;">If you didn't request this, please ignore this email.</p>
  `;
  return baseTemplate('Order Verification OTP', content);
}

export function orderConfirmationTemplate(name: string, orderId: string, order: any) {
  const itemsHtml = order.items?.map((item: any) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f1f5f9;color:#374151;font-size:14px;">${item.product?.name}</td>
      <td style="padding:12px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:14px;text-align:center;">×${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #f1f5f9;color:#374151;font-size:14px;text-align:right;font-weight:600;">PKR ${(item.price * item.quantity)?.toLocaleString()}</td>
    </tr>
  `).join('') || '';

  const content = `
    <p style="margin:0 0 8px;color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Thank you for your order! We've received it and will start processing soon.</p>
    <div style="background:#ecfdf5;border-radius:8px;padding:16px 20px;margin:0 0 24px;border-left:4px solid ${BRAND_COLOR};">
      <p style="margin:0;font-size:13px;color:#059669;">Order Number: <strong style="font-family:monospace;">${orderId}</strong></p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Item</th>
          <th style="padding:12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Qty</th>
          <th style="padding:12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr style="background:#f8fafc;">
          <td colspan="2" style="padding:16px;font-weight:700;color:#111827;font-size:15px;">Total</td>
          <td style="padding:16px;font-weight:700;color:${BRAND_COLOR};font-size:15px;text-align:right;">PKR ${order.total?.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;font-size:14px;color:#374151;">
      <p style="margin:0 0 8px;"><strong>Payment:</strong> ${order.paymentMethod?.replace('_',' ').toUpperCase()}</p>
      <p style="margin:0;"><strong>Delivery to:</strong> ${order.address?.city}, ${order.address?.province}</p>
    </div>
  `;
  return baseTemplate('Order Confirmed', content);
}

export function orderStatusUpdateTemplate(name: string, orderId: string, status: string, trackingNumber?: string) {
  const statusMessages: Record<string, { emoji: string; title: string; message: string }> = {
    confirmed: { emoji: '✅', title: 'Order Confirmed', message: "Great news! Your order has been confirmed and will start processing soon." },
    processing: { emoji: '⚙️', title: 'Order Processing', message: "We're preparing your items with care. Your order is being processed." },
    packed: { emoji: '📦', title: 'Order Packed', message: "Your order has been carefully packed and is ready for shipment." },
    shipped: { emoji: '🚚', title: 'Order Shipped', message: "Your order is on its way! It has been handed over to the courier." },
    in_transit: { emoji: '🛣️', title: 'In Transit', message: "Your parcel is in transit and getting closer to you." },
    out_for_delivery: { emoji: '🏠', title: 'Out for Delivery', message: "Great news! Your order is out for delivery and will arrive today." },
    delivered: { emoji: '🎉', title: 'Order Delivered', message: "Your order has been delivered. We hope you love your purchase!" },
    cancelled: { emoji: '❌', title: 'Order Cancelled', message: "Your order has been cancelled. If you have questions, please contact support." },
    returned: { emoji: '↩️', title: 'Return Initiated', message: "Your return has been initiated. We'll process your refund soon." },
    refunded: { emoji: '💰', title: 'Refund Processed', message: "Your refund has been processed. It may take 3-5 business days to reflect." },
  };

  const info = statusMessages[status] || { emoji: '📋', title: 'Order Update', message: `Your order status has been updated to: ${status}.` };

  const content = `
    <div style="text-align:center;margin:0 0 32px;">
      <div style="font-size:48px;margin:0 0 16px;">${info.emoji}</div>
      <h2 style="margin:0;color:#111827;font-size:24px;font-weight:700;">${info.title}</h2>
    </div>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">${info.message}</p>
    <div style="background:#ecfdf5;border-radius:8px;padding:16px 20px;margin:0 0 24px;border-left:4px solid ${BRAND_COLOR};">
      <p style="margin:0;font-size:13px;color:#059669;">Order Number: <strong style="font-family:monospace;">${orderId}</strong></p>
      ${trackingNumber ? `<p style="margin:8px 0 0;font-size:13px;color:#059669;">Tracking #: <strong style="font-family:monospace;">${trackingNumber}</strong></p>` : ''}
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://alhamdcollection.pk/track-order" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Track Your Order →</a>
    </div>
  `;
  return baseTemplate(info.title, content);
}

export function welcomeEmailTemplate(name: string) {
  const content = `
    <p style="margin:0 0 16px;color:#374151;font-size:16px;">Welcome, <strong>${name}</strong>! 🎉</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Your AlhamdCollection account has been created. Discover premium clothing and footwear for every occasion.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://alhamdcollection.pk/shop" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Shop Now →</a>
    </div>
  `;
  return baseTemplate('Welcome to AlhamdCollection', content);
}

export function passwordResetTemplate(name: string, resetLink: string) {
  const content = `
    <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetLink}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Reset Password →</a>
    </div>
    <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
  `;
  return baseTemplate('Reset Your Password', content);
}

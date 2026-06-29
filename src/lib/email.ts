import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

// Send verification code email
export async function sendVerificationCode(email: string, code: string, name: string) {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'AlhamdCollection Store'}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Email Verification Code - AlhamdCollection Store',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .code { font-size: 36px; font-weight: bold; color: #10b981; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Email Verification</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for choosing AlhamdCollection Store. To complete your order, please verify your email address using the code below:</p>
            <div class="code">${code}</div>
            <p>This code will expire in <strong>1 minute</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AlhamdCollection Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return false;
  }
}

// Send order verification email
export async function sendOrderVerificationEmail(
  email: string,
  name: string,
  orderId: string,
  verificationToken: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-order?token=${verificationToken}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'AlhamdCollection Store'}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Verify Your Order - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .order-id { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verify Your Order</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for your order! We've received your order successfully.</p>
            
            <div class="order-id">Order #${orderId}</div>
            
            <div class="info-box">
              <h3>📦 Order Details</h3>
              <p><strong>Status:</strong> Pending Verification</p>
              <p><strong>Estimated Delivery:</strong> 3-5 business days (after verification)</p>
            </div>
            
            <p>To complete your order, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Order</a>
            </div>
            
            <p style="text-align: center; margin: 20px 0;">or copy and paste this link:</p>
            <p style="text-align: center; word-break: break-all; font-size: 12px; color: #666;">${verificationUrl}</p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
            
            <p>If you didn't place this order, please ignore this email.</p>
            
            <p>If you have any questions, please contact us at support@alhamdcollection.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AlhamdCollection Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending order verification email:', error);
    return false;
  }
}

// Send order confirmation email (after verification)
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string,
  orderData: any
) {
  const itemsHtml = orderData.items
    .map(
      (item: any) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px;">${item.product?.name || 'Product'}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">PKR ${item.price.toLocaleString()}</td>
        <td style="padding: 12px; text-align: right;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'AlhamdCollection Store'}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Order Confirmed - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .order-id { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { background: #10b981; color: white; padding: 12px; text-align: left; }
          .table td { padding: 12px; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for verifying your order! We're pleased to confirm that your order has been confirmed successfully.</p>
            
            <div class="order-id">Order #${orderId}</div>
            
            <div class="info-box">
              <h3>📦 Order Details</h3>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Status:</strong> Confirmed</p>
              <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
            </div>
            
            <h3>Order Items:</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              <p>Total: PKR ${orderData.total.toLocaleString()}</p>
            </div>
            
            <div class="info-box">
              <h3>📍 Shipping Address</h3>
              <p>${orderData.address?.fullName}</p>
              <p>${orderData.address?.phone}</p>
              <p>${orderData.address?.address}</p>
              <p>${orderData.address?.city}, ${orderData.address?.province}</p>
            </div>
            
            <p>If you have any questions, please contact us at support@alhamdcollection.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AlhamdCollection Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

// Send order status update email
export async function sendOrderStatusEmail(
  email: string,
  name: string,
  orderId: string,
  status: string,
  trackingNumber?: string
) {
  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and is being prepared for shipment.',
    processing: 'Your order is being processed and will be shipped soon.',
    shipped: `Your order has been shipped! Tracking Number: ${trackingNumber || 'N/A'}`,
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact us.',
  };

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'AlhamdCollection Store'}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Order Status Update - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .status { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Status Update</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your order status has been updated:</p>
            <div class="status">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
            <p>${statusMessages[status] || 'Your order status has been updated.'}</p>
            <p>Order ID: #${orderId}</p>
            <p>If you have any questions, please contact us at support@alhamdcollection.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 AlhamdCollection Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order status email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error);
    return false;
  }
}

// Import new templates
import { orderStatusUpdateTemplate, orderConfirmationTemplate, otpEmailTemplate } from './email-templates';

// Override sendOrderStatusEmail to use new template
export async function sendOrderStatusEmailEnhanced(
  email: string,
  name: string,
  orderId: string,
  status: string,
  trackingNumber?: string
) {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'AlhamdCollection'}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Order Update: ${status.replace('_', ' ').toUpperCase()} - #${orderId.slice(0,12)}`,
    html: orderStatusUpdateTemplate(name, orderId, status, trackingNumber),
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending status email:', error);
    return false;
  }
}

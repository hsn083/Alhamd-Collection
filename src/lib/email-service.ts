// Email Service for OTP Sending
import nodemailer from 'nodemailer';

// Email configuration - Use environment variables from .env.local
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || 'your-app-password',
  },
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string, orderId?: string): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();
  console.log(`[Email] Starting OTP email send to ${email} at ${new Date(startTime).toISOString()}`);
  
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"AlhamdCollection" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: 'Your Verification Code for AlhamdCollection Order',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #22c55e;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #22c55e;
              text-align: center;
              letter-spacing: 8px;
              margin: 30px 0;
              padding: 20px;
              background: #fff;
              border-radius: 8px;
              border: 2px dashed #22c55e;
            }
            .info {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #22c55e;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AlhamdCollection</div>
              <h2>Order Verification</h2>
            </div>
            
            <p>Hello,</p>
            
            <p>Thank you for choosing AlhamdCollection! To complete your order${orderId ? ` (${orderId})` : ''}, please use the following verification code:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="info">
              <strong>Important:</strong>
              <ul>
                <li>This code will expire in 1 minute</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AlhamdCollection. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    const sendTime = Date.now() - startTime;
    console.log(`[Email] OTP email sent successfully to ${email} in ${sendTime}ms`);
    return { success: true };
  } catch (error: any) {
    const sendTime = Date.now() - startTime;
    console.error(`[Email] Failed to send OTP email to ${email} after ${sendTime}ms:`, error);
    return { 
      success: false, 
      error: error.message || 'Failed to send OTP email' 
    };
  }
}

// Send verification email for customer registration
export async function sendVerificationEmail(
  email: string,
  otp: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();
  console.log(`[Email] Starting verification email send to ${email} at ${new Date(startTime).toISOString()}`);
  
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"AlhamdCollection" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: 'Verify Your Email Address - AlhamdCollection',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #22c55e;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #22c55e;
              text-align: center;
              letter-spacing: 8px;
              margin: 30px 0;
              padding: 20px;
              background: #fff;
              border-radius: 8px;
              border: 2px dashed #22c55e;
            }
            .info {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AlhamdCollection</div>
              <h2>Email Verification</h2>
            </div>
            
            <p>Dear ${customerName},</p>
            
            <p>Thank you for registering with AlhamdCollection! To complete your registration, please use the following verification code:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="info">
              <strong>Important:</strong>
              <ul>
                <li>This code will expire in 1 minute</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't create an account, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AlhamdCollection. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    const sendTime = Date.now() - startTime;
    console.log(`[Email] Verification email sent successfully to ${email} in ${sendTime}ms`);
    return { success: true };
  } catch (error: any) {
    const sendTime = Date.now() - startTime;
    console.error(`[Email] Failed to send verification email to ${email} after ${sendTime}ms:`, error);
    return { 
      success: false, 
      error: error.message || 'Failed to send verification email' 
    };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();
  console.log(`[Email] Starting password reset email send to ${email} at ${new Date(startTime).toISOString()}`);
  
  try {
    const transporter = getTransporter();
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"AlhamdCollection" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: 'Reset Your Password - AlhamdCollection',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #22c55e;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #22c55e;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              text-align: center;
            }
            .info {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AlhamdCollection</div>
              <h2>Password Reset</h2>
            </div>
            
            <p>Dear ${customerName},</p>
            
            <p>We received a request to reset your password for your AlhamdCollection account. Click the button below to reset your password:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #22c55e;">${resetLink}</p>
            
            <div class="info">
              <strong>Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>For your security, never share your password with anyone</li>
              </ul>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AlhamdCollection. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    const sendTime = Date.now() - startTime;
    console.log(`[Email] Password reset email sent successfully to ${email} in ${sendTime}ms`);
    return { success: true };
  } catch (error: any) {
    const sendTime = Date.now() - startTime;
    console.error(`[Email] Failed to send password reset email to ${email} after ${sendTime}ms:`, error);
    return { 
      success: false, 
      error: error.message || 'Failed to send password reset email' 
    };
  }
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"AlhamdCollection" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: `Order Confirmed - ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmed</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #22c55e;
            }
            .success {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
              margin: 20px 0;
            }
            .order-details {
              background: #fff;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AlhamdCollection</div>
              <h2>Order Confirmed!</h2>
            </div>
            
            <p>Dear ${customerName},</p>
            
            <div class="success">
              <strong>✓ Your order has been confirmed successfully!</strong>
            </div>
            
            <div class="order-details">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>We will process your order and ship it as soon as possible. You will receive another email with tracking information once your order is shipped.</p>
            
            <p>Thank you for shopping with AlhamdCollection!</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AlhamdCollection. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send confirmation email' 
    };
  }
}

// Send payment status update email
export async function sendPaymentStatusEmail(
  email: string,
  orderId: string,
  customerName: string,
  paymentStatus: string,
  paymentMethod: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      payment_submitted: {
        title: 'Payment Submitted',
        message: 'Your payment has been submitted and is under review.',
        color: '#3b82f6'
      },
      under_verification: {
        title: 'Payment Under Verification',
        message: 'Your payment is being verified by our team.',
        color: '#8b5cf6'
      },
      verified: {
        title: 'Payment Verified',
        message: 'Your payment has been verified successfully! Your order will be processed soon.',
        color: '#22c55e'
      },
      rejected: {
        title: 'Payment Rejected',
        message: 'Your payment could not be verified. Please contact our support team for assistance.',
        color: '#ef4444'
      },
      refunded: {
        title: 'Payment Refunded',
        message: 'Your payment has been refunded. The refund will appear in your account within 3-5 business days.',
        color: '#ec4899'
      }
    };

    const statusConfig = statusMessages[paymentStatus] || statusMessages.payment_submitted;
    
    const mailOptions = {
      from: `"AlhamdCollection" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: `Payment Status Update - ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Status Update</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #22c55e;
            }
            .status-box {
              background: ${statusConfig.color}20;
              border: 2px solid ${statusConfig.color};
              color: ${statusConfig.color};
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .order-details {
              background: #fff;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AlhamdCollection</div>
              <h2>Payment Status Update</h2>
            </div>
            
            <p>Dear ${customerName},</p>
            
            <div class="status-box">
              <h3 style="margin: 0 0 10px 0;">${statusConfig.title}</h3>
              <p style="margin: 0;">${statusConfig.message}</p>
            </div>
            
            <div class="order-details">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Status:</strong> ${statusConfig.title}</p>
            </div>
            
            <p>If you have any questions about your payment, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AlhamdCollection. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending payment status email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send payment status email' 
    };
  }
}

// Send order status update email
export async function sendOrderStatusEmail(
  email: string,
  orderId: string,
  customerName: string,
  orderStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      confirmed: {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being processed.',
        color: '#3b82f6'
      },
      processing: {
        title: 'Order Processing',
        message: 'Your order is being prepared for shipment.',
        color: '#8b5cf6'
      },
      packed: {
        title: 'Order Packed',
        message: 'Your order has been packed and is ready for shipment.',
        color: '#6366f1'
      },
      shipped: {
        title: 'Order Shipped',
        message: 'Your order has been shipped! You will receive tracking information soon.',
        color: '#14b8a6'
      },
      in_transit: {
        title: 'Order In Transit',
        message: 'Your order is on its way to you!',
        color: '#06b6d4'
      },
      out_for_delivery: {
        title: 'Out for Delivery',
        message: 'Your order is out for delivery and will arrive today!',
        color: '#f97316'
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been delivered successfully. Thank you for shopping with us!',
        color: '#22c55e'
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact support.',
        color: '#ef4444'
      }
    };

    const statusConfig = statusMessages[orderStatus] || { title: 'Order Status Update', message: 'Your order status has been updated.', color: '#6b7280' };
    
    const mailOptions = {
      from: `"AlhamdCollection" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: `Order Status Update - ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #22c55e;
            }
            .status-box {
              background: ${statusConfig.color}20;
              border: 2px solid ${statusConfig.color};
              color: ${statusConfig.color};
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .order-details {
              background: #fff;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AlhamdCollection</div>
              <h2>Order Status Update</h2>
            </div>
            
            <p>Dear ${customerName},</p>
            
            <div class="status-box">
              <h3 style="margin: 0 0 10px 0;">${statusConfig.title}</h3>
              <p style="margin: 0;">${statusConfig.message}</p>
            </div>
            
            <div class="order-details">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Status:</strong> ${statusConfig.title}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p> Thank you for shopping with AlhamdCollection!</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AlhamdCollection. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending order status email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send order status email' 
    };
  }
}

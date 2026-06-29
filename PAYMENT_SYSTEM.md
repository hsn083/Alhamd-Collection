# Payment System Documentation

This document describes the complete payment system integrated into the Zorynix e-commerce website.

## Overview

The payment system supports multiple payment methods:
- **Stripe** - Credit/Debit card payments (international)
- **Cash on Delivery (COD)** - Pay when order arrives
- **JazzCash** - Mobile wallet payment (Pakistan)
- **EasyPaisa** - Mobile wallet payment (Pakistan)
- **Bank Transfer** - Direct bank transfer

## Architecture

### Frontend Components

1. **Checkout Page** (`src/app/checkout/page.tsx`)
   - Customer information form
   - Shipping address
   - Payment method selection
   - Order summary
   - Stripe checkout integration
   - Loading states and error handling

2. **Payment Success Page** (`src/app/payment/success/page.tsx`)
   - Payment verification
   - Order confirmation display
   - Transaction details

3. **Payment Cancel Page** (`src/app/payment/cancel/page.tsx`)
   - Cancellation message
   - Retry options
   - Common reasons for cancellation

### Backend API Routes

1. **Create Payment Session** (`/api/payment/create-session`)
   - Creates Stripe checkout session
   - Validates customer information
   - Returns session ID for redirect

2. **Verify Payment** (`/api/payment/verify`)
   - Verifies Stripe payment status
   - Returns payment verification result

3. **Webhook Handler** (`/api/payment/webhook`)
   - Handles Stripe webhook events
   - Automatically creates orders on successful payment
   - Handles payment failures and expirations

4. **Orders API** (`/api/orders`)
   - Creates and stores orders
   - Stores transaction records
   - Retrieves order history

## Setup Instructions

### 1. Environment Variables

Create or update `.env.local` file with the following variables:

```env
# Stripe Payment Gateway
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Base URL (important for webhooks and redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Local Payment Methods (Pakistan) - Optional
JAZZCASH_MERCHANT_ID=your_jazzcash_merchant_id
JAZZCASH_SECRET_KEY=your_jazzcash_secret_key
EASYPAISA_MERCHANT_ID=your_easypaisa_merchant_id
EASYPAISA_SECRET_KEY=your_easypaisa_secret_key
```

### 2. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in
3. Navigate to Developers > API keys
4. Copy the Publishable key and Secret key
5. Add them to your `.env.local` file

### 3. Setup Stripe Webhook

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add a new webhook endpoint: `https://your-domain.com/api/payment/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret and add to `.env.local`

**For local development:**
Use the Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

### 4. Install Dependencies

Dependencies are already installed:
- `stripe` - Stripe SDK for backend
- `@stripe/stripe-js` - Stripe SDK for frontend

## Payment Flow

### Stripe Payment Flow

1. User fills checkout form and selects "Credit/Debit Card (Stripe)"
2. Frontend calls `/api/payment/create-session` with order details
3. Backend creates Stripe checkout session
4. Frontend redirects user to Stripe checkout
5. User completes payment on Stripe's secure page
6. Stripe redirects to success or cancel page
7. Webhook automatically creates order in database
8. Success page verifies payment and shows confirmation

### Local Payment Flow (COD, JazzCash, EasyPaisa, Bank Transfer)

1. User fills checkout form and selects payment method
2. Frontend calls `/api/orders` directly
3. Backend creates order with `paymentStatus: 'pending'`
4. User is redirected to success page
5. Admin can update payment status manually
6. Payment instructions are shown to user

## Security Features

- ✅ Secret keys never exposed to frontend
- ✅ Environment variables for sensitive data
- ✅ Webhook signature verification
- ✅ Payment verification on backend only
- ✅ HTTPS required for production
- ✅ Input validation on all API endpoints

## Error Handling

The system handles various error scenarios:

- **Payment Failed**: User sees error message and can retry
- **Payment Cancelled**: User redirected to cancel page with retry options
- **Network Issues**: Loading states and timeout handling
- **Invalid Session**: Verification fails with clear error message
- **Webhook Failures**: Logged for manual review

## Database Schema

### Order Structure

```typescript
{
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'easypaisa' | 'jazzcash' | 'bank_transfer' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shipping: {
    method: 'standard' | 'express';
    courier: 'TCS' | 'Leopards' | 'M&P' | 'Call Courier';
    cost: number;
    trackingNumber?: string;
  };
  address: Address;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction Structure

```typescript
{
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'jazzcash' | 'easypaisa';
  paymentGatewayId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Testing

### Test Mode

Stripe provides test mode with test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Failure**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Test Flow

1. Add items to cart
2. Go to checkout
3. Fill in customer information
4. Select payment method
5. Complete payment
6. Verify order creation
7. Check webhook logs

## Production Deployment

### Checklist

- [ ] Update Stripe keys to production keys
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Configure production webhook endpoint
- [ ] Enable HTTPS
- [ ] Set up database (currently using in-memory storage)
- [ ] Configure email/SMS notifications
- [ ] Test payment flow in production
- [ ] Set up monitoring for webhook failures
- [ ] Configure backup payment methods

### Database Integration

Currently using in-memory storage. For production, integrate with:
- PostgreSQL (recommended)
- MySQL
- MongoDB
- Or any other database of your choice

Update the `/api/orders` route to use your database instead of in-memory arrays.

## Local Payment Methods (JazzCash/EasyPaisa)

To integrate JazzCash or EasyPaisa:

1. Get merchant accounts from respective providers
2. Add API credentials to `.env.local`
3. Create API integration following their documentation
4. Update payment flow to handle their specific requirements
5. Add payment verification endpoints

## Support

For issues or questions:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- JazzCash: Contact their merchant support
- EasyPaisa: Contact their merchant support

## Notes

- Currency is set to PKR (Pakistani Rupee)
- Shipping costs: Standard (PKR 250), Express (PKR 500)
- Orders are automatically confirmed for Stripe payments
- Local payment methods require manual payment confirmation
- Webhook endpoint must be publicly accessible for Stripe to send events

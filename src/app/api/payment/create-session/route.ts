import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentSession } from '@/types';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { items, amount, currency = 'pkr', customerInfo, shippingMethod, shippingCost, orderId } = body;

    // Validate required fields
    if (!items || !amount || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.product.name,
            description: item.product.description || '',
            images: item.product.images || [],
          },
          unit_amount: Math.round((item.product.discountPrice || item.product.price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/payment/cancel`,
      customer_email: customerInfo.email,
      metadata: {
        customerName: customerInfo.fullName,
        customerPhone: customerInfo.phone,
        customerCity: customerInfo.city,
        customerProvince: customerInfo.province,
        customerAddress: customerInfo.address,
        shippingMethod: shippingMethod,
        shippingCost: shippingCost.toString(),
        orderNotes: customerInfo.notes || '',
        orderId: orderId || '',
      },
    });

    // Create payment record in MongoDB
    const payment = await Payment.create({
      order: orderId,
      amount,
      method: 'stripe',
      status: 'pending',
      transactionId: session.payment_intent as string,
      verificationStatus: 'pending',
      metadata: {
        customerInfo,
        shippingMethod,
        shippingCost,
        stripeSessionId: session.id,
      },
    });

    const paymentSession: PaymentSession = {
      sessionId: session.id,
      clientSecret: session.client_secret || '',
      amount: amount,
      currency: currency,
      paymentMethod: 'stripe',
    };

    return NextResponse.json(paymentSession);
  } catch (error: any) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment session' },
      { status: 500 }
    );
  }
}

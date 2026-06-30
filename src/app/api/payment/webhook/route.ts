import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

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

    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // Create order in database
        try {
          const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order: {
                userId: session.metadata?.customerEmail || 'guest',
                user: {
                  id: session.metadata?.customerEmail || 'guest',
                  name: session.metadata?.customerName || 'Customer',
                  email: session.customer_email || '',
                  phone: session.metadata?.customerPhone || '',
                  addresses: [],
                  wishlist: [],
                  createdAt: new Date(),
                },
                items: [], // Items would need to be stored in session metadata or retrieved from cart
                status: 'confirmed',
                paymentMethod: 'card',
                paymentStatus: 'paid',
                shipping: {
                  method: session.metadata?.shippingMethod || 'standard',
                  courier: 'TCS',
                  cost: parseFloat(session.metadata?.shippingCost || '0'),
                },
                address: {
                  id: 'temp',
                  fullName: session.metadata?.customerName || '',
                  phone: session.metadata?.customerPhone || '',
                  city: session.metadata?.customerCity || '',
                  province: session.metadata?.customerProvince || '',
                  address: session.metadata?.customerAddress || '',
                  isDefault: false,
                },
                subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                discount: session.total_details?.amount_discount ? session.total_details.amount_discount / 100 : 0,
                total: session.amount_total ? session.amount_total / 100 : 0,
                notes: session.metadata?.orderNotes || '',
              },
              transaction: {
                orderId: '', // Will be set by backend
                userId: session.metadata?.customerEmail || 'guest',
                amount: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency?.toUpperCase() || 'PKR',
                paymentMethod: 'stripe',
                paymentGatewayId: session.payment_intent as string,
                status: 'completed',
                metadata: {
                  sessionId: session.id,
                  customerEmail: session.customer_email,
                  ...session.metadata,
                },
              },
            }),
          });

          if (orderResponse.ok) {
            console.log('Order created successfully via webhook');
          } else {
            console.error('Failed to create order via webhook');
          }
        } catch (error) {
          console.error('Error creating order in webhook:', error);
        }
        
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);
        // Handle expired session - maybe notify user
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        // Additional payment success handling
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent failed:', paymentIntent.id);
        // Handle payment failure - notify user
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

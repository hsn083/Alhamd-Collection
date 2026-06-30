import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentVerification as PaymentVerificationType } from '@/types';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import PaymentVerification from '@/models/PaymentVerification';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update payment record in MongoDB
    const payment = await Payment.findOne({ 
      'metadata.stripeSessionId': sessionId 
    });

    if (payment) {
      payment.status = session.payment_status === 'paid' ? 'completed' : 'failed';
      payment.verificationStatus = session.payment_status === 'paid' ? 'approved' : 'rejected';
      payment.verifiedAt = new Date();
      await payment.save();
    }

    // Create payment verification record
    await PaymentVerification.create({
      payment: payment?._id,
      order: payment?.order,
      status: session.payment_status === 'paid' ? 'approved' : 'rejected',
      transactionId: session.payment_intent as string,
      reviewedAt: new Date(),
    });

    // Check payment status
    const verification: PaymentVerificationType = {
      success: session.payment_status === 'paid',
      transactionId: session.payment_intent as string,
    };

    if (session.payment_status !== 'paid') {
      verification.error = `Payment status: ${session.payment_status}`;
    }

    return NextResponse.json(verification);
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

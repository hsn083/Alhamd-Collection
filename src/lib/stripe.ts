import { loadStripe } from '@stripe/stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.");
}

export const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : Promise.resolve(null);

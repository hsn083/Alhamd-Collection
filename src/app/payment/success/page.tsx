'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, Home, ShoppingBag } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (sessionId) {
          // Verify Stripe payment
          const response = await fetch(`/api/payment/verify?session_id=${sessionId}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Payment verification failed');
          }

          if (data.success) {
            // For Stripe, the order should have been created before payment
            // Redirect to orders page or show success
            if (orderId) {
              router.push(`/order-confirmation/${orderId}`);
            } else {
              // If no orderId, redirect to orders page
              router.push('/orders');
            }
            return;
          } else {
            throw new Error(data.error || 'Payment verification failed');
          }
        } else if (orderId) {
          // Local payment method (COD, JazzCash, etc.) - redirect to confirmation
          router.push(`/order-confirmation/${orderId}`);
          return;
        } else {
          throw new Error('No payment information provided');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId, method, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Verifying your payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your order</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">Payment Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/checkout')} className="w-full">
                Try Again
              </Button>
              <Button onClick={() => router.push('/shop')} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-green-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Payment Successful!</h1>
            <p className="text-green-700">Thank you for your order</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Order Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderDetails?.order && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">{orderDetails.order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium capitalize">
                        {method === 'stripe' ? 'Credit/Debit Card' : method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-green-600">Confirmed</span>
                    </div>
                  </div>
                )}

                {sessionId && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Transaction ID:</strong> {sessionId}
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Confirmation sent!</strong> You will receive an email and SMS confirmation shortly with your order details.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Button onClick={() => router.push('/orders')} className="w-full" size="lg">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    View My Orders
                  </Button>
                  <Button onClick={() => router.push('/')} variant="outline" className="w-full" size="lg">
                    <Home className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

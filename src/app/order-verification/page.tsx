'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

function OrderVerificationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Auto-redirect to orders page after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/orders';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto border-2 border-green-500/30 bg-black/50">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Order Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Mail className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-400 mb-4">Check Your Email</h3>
                <p className="text-muted-foreground mb-6">
                  Your order has been received successfully. We've sent a verification email to your email address.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Please check your inbox and click the verification link to confirm your order.
                </p>
                {orderId && (
                  <p className="text-sm text-muted-foreground mb-8">Order ID: {orderId}</p>
                )}
                <div className="flex flex-col gap-3 w-full">
                  <Button onClick={() => window.location.href = '/orders'} className="w-full">
                    View My Orders
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    variant="outline" 
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                  Redirecting to orders page in 5 seconds...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderVerificationContent />
    </Suspense>
  );
}

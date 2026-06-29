'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, ShoppingBag, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-red-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-800 mb-2">Payment Cancelled</h1>
            <p className="text-red-700">Your payment was not completed</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>What Happened?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Your payment was cancelled either by you or due to an issue with the payment process. 
                    Don't worry, your order has not been placed and no charges were made.
                  </p>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> If you cancelled accidentally, you can try again. 
                      Your cart items are still saved.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Common Reasons:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
                      <li>Payment was cancelled by user</li>
                      <li>Card was declined</li>
                      <li>Network connection issues</li>
                      <li>Payment session expired</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button onClick={() => router.push('/checkout')} className="w-full" size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Payment Again
                  </Button>
                  <Button onClick={() => router.push('/cart')} variant="outline" className="w-full" size="lg">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Review Cart
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

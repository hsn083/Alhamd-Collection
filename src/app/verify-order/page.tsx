'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

function VerifyOrderContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyOrder(token);
  }, [token]);

  const verifyOrder = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/orders/verify?token=${verificationToken}`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setOrderId(data.orderId);
        setMessage('Your order has been verified successfully!');
      } else if (data.error === 'Token expired') {
        setStatus('expired');
        setMessage('The verification link has expired. Please contact support.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to verify order. Please contact support.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while verifying your order. Please try again or contact support.');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto border-2 border-green-500/30 bg-black/50">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Order Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {status === 'loading' && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-green-400 mb-4" />
                  <p className="text-muted-foreground">Verifying your order...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-green-400 mb-2">Order Verified!</h3>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  {orderId && (
                    <p className="text-sm text-muted-foreground mb-6">Order ID: {orderId}</p>
                  )}
                  <Button onClick={() => window.location.href = '/orders'}>
                    View My Orders
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center py-8 text-center">
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-red-400 mb-2">Verification Failed</h3>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <Button onClick={() => window.location.href = '/'} variant="outline">
                    Return to Home
                  </Button>
                </div>
              )}

              {status === 'expired' && (
                <div className="flex flex-col items-center py-8 text-center">
                  <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">Link Expired</h3>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <Button onClick={() => window.location.href = '/contact'} variant="outline">
                    Contact Support
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function VerifyOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOrderContent />
    </Suspense>
  );
}

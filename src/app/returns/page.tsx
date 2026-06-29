'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';

export default function ReturnsPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const returnReasons = [
    'Defective or damaged product',
    'Wrong item received',
    'Product not as described',
    'Changed mind (within 7 days)',
    'Other',
  ];

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
        setEmail(data.user.email);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validation
    if (!orderNumber.trim()) {
      setError('Order number is required');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!reason) {
      setError('Please select a reason for return');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      window.location.href = '/account?redirect=/returns';
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          email,
          reason,
          description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Return request submitted successfully! Reference: ' + data.returnRequest.returnNumber);
        // Reset form
        setOrderNumber('');
        setReason('');
        setDescription('');
      } else {
        setError(data.error || 'Failed to submit return request');
      }
    } catch (err) {
      setError('Failed to submit return request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const returnProcess = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Contact our support team within 7 days of delivery to initiate the return process.',
    },
    {
      step: 2,
      title: 'Provide Details',
      description: 'Share your order number, reason for return, and photos if applicable.',
    },
    {
      step: 3,
      title: 'Get Approval',
      description: 'Our team will review your request and approve eligible returns within 24 hours.',
    },
    {
      step: 4,
      title: 'Ship the Item',
      description: 'Pack the item securely and ship it to our warehouse using the provided label.',
    },
    {
      step: 5,
      title: 'Receive Refund',
      description: 'Once we receive and inspect the item, your refund will be processed within 5-7 business days.',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Returns & Refunds</h1>
            <p className="text-xl text-white/90">Hassle-free return policy for your peace of mind</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Return Policy Summary */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Return Policy Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">7-Day Return Window</h3>
                  <p className="text-muted-foreground">
                    You can return products within 7 days of delivery if they are defective, damaged, or not as described.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Original Condition Required</h3>
                  <p className="text-muted-foreground">
                    Products must be returned in their original packaging with all accessories and tags intact.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Full Refund</h3>
                  <p className="text-muted-foreground">
                    Eligible returns receive a full refund to your original payment method within 5-7 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Process */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How to Return</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {returnProcess.map((step) => (
                <Card key={step.step}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.step}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Non-Returnable Items</h2>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2 text-red-900">The following items cannot be returned:</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Used or worn clothing items</li>
                      <li>• Innerwear and personal hygiene products</li>
                      <li>• Accessories and personal-use items</li>
                      <li>• Customized or specially ordered products</li>
                      <li>• Sale, discount, or clearance items</li>
                      <li>• Items damaged due to misuse or improper handling</li>
                      <li>• Items without original tags, packaging, or accessories</li>
                      <li>• Items returned after the 7-day return window</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Return Form */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Initiate a Return</h2>
            <Card>
              <CardHeader>
                <CardTitle>Return Request Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    {success}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium mb-2">Order Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., 100001 or Order# (100001)"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      disabled={isLoading || isAuthenticated}
                    />
                    {isAuthenticated && (
                      <p className="text-xs text-gray-500 mt-1">Auto-filled from your account</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason for Return *</label>
                    <select 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      disabled={isLoading}
                    >
                      <option value="">Select a reason</option>
                      {returnReasons.map((reason, index) => (
                        <option key={index} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Details</label>
                    <textarea
                      rows={4}
                      placeholder="Please provide more details about your return request..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Return Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <RefreshCw className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-blue-900">Need Help?</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    If you have any questions about our return policy or need assistance with your return, our support team is here to help.
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => window.location.href = '/contact'}>
                      Contact Support
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/account'}>
                      View My Orders
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Truck, Package, CheckCircle, Clock, XCircle,
  MapPin, Phone, Mail, Calendar, Loader2, Search, AlertCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Status flow matching the actual Order model enum
const STATUS_FLOW = [
  { value: 'pending', label: 'Order Placed', desc: 'Your order has been placed successfully', icon: Clock },
  { value: 'confirmed', label: 'Order Confirmed', desc: 'Order confirmed by seller', icon: CheckCircle },
  { value: 'processing', label: 'Processing', desc: 'Preparing your items for shipment', icon: Package },
  { value: 'shipped', label: 'Shipped', desc: 'Handed to courier service', icon: Truck },
  { value: 'delivered', label: 'Delivered', desc: 'Order delivered successfully!', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', desc: 'Order has been cancelled', icon: XCircle },
  { value: 'refunded', label: 'Refunded', desc: 'Order has been refunded', icon: XCircle },
  { value: 'returned', label: 'Returned', desc: 'Order returned by customer', icon: XCircle },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-teal-100 text-teal-700 border-teal-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-gray-100 text-gray-700 border-gray-200',
  returned: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setIsLoading(true);

    const trimmedOrderId = orderId.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: trimmedOrderId, 
          phone: trimmedPhone,
          email: trimmedEmail
        }),
      });
      
      const data = await res.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Failed to track order');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentIdx = STATUS_FLOW.findIndex(s => s.value === order?.status);
  const isTerminal = ['cancelled', 'refunded', 'returned'].includes(order?.status || '');
  const badgeClass = STATUS_BADGE[order?.status] || 'bg-gray-100 text-gray-700';

  const progressPct = isTerminal ? 0 : currentIdx >= 0
    ? Math.round(((currentIdx + 1) / STATUS_FLOW.length) * 100) : 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Truck className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Track Your Order</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter your order ID to track your shipment in real-time
            </p>
          </div>

          {/* Search Form */}
          <Card className="border border-emerald-100 shadow-lg mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Order ID *</label>
                  <Input
                    type="text"
                    placeholder="e.g., 100001 or Order# (100001)"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number (Optional)</label>
                  <Input
                    type="tel"
                    placeholder="0300-xxxxxxx or +923xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !orderId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border border-red-200 bg-red-50 mb-8">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Tracking Result */}
          {order && (
            <div className="space-y-6">
              {/* Order Header */}
              <Card className="border border-emerald-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Order ID</p>
                      <p className="font-mono text-lg font-bold text-gray-900">{order.id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-PK', { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-sm px-4 py-2 border ${badgeClass}`}>
                        {STATUS_FLOW.find(s => s.value === order.status)?.label || order.status}
                      </Badge>
                      <p className="text-3xl font-bold text-emerald-700 mt-2">PKR {order.total?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-gray-400">{order.items?.length || 0} item(s)</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!isTerminal && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Order Progress</span>
                        <span className="font-semibold text-emerald-600">{progressPct}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isTerminal && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-700">Order {STATUS_FLOW.find(s => s.value === order.status)?.label}</p>
                        <p className="text-sm text-red-600">This order has been {order.status}. Contact support for more information.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              {!isTerminal && (
                <Card className="border border-emerald-100 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-emerald-600" /> Delivery Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-0">
                      {STATUS_FLOW.filter(s => !['cancelled', 'refunded', 'returned'].includes(s.value)).map((step, i) => {
                        const isDone = currentIdx > i;
                        const isCurrent = currentIdx === i;
                        const Icon = step.icon;
                        return (
                          <div key={step.value} className="flex gap-4 pb-8 last:pb-0 relative">
                            {i < STATUS_FLOW.length - 3 && (
                              <div className={`absolute left-4 top-8 w-0.5 h-full ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                            )}
                            <div className={`relative z-10 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                              isCurrent ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200 animate-pulse' :
                              isDone ? 'border-emerald-400 bg-emerald-50 text-emerald-600' :
                              'border-gray-200 bg-white text-gray-300'
                            }`}>
                              {isDone ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                            </div>
                            <div className="pt-1 flex-1">
                              <p className={`text-sm font-semibold ${isCurrent ? 'text-emerald-700' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                                {step.label}
                              </p>
                              <p className={`text-sm mt-1 ${isCurrent ? 'text-emerald-600' : isDone ? 'text-gray-500' : 'text-gray-300'}`}>
                                {step.desc}
                              </p>
                              {isCurrent && (
                                <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                                  Current Status
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <Card className="border border-gray-100 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-emerald-600" /> Shipping Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Courier</span>
                        <span className="font-medium text-gray-800">{order.shipping?.courier || 'TCS Courier'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method</span>
                        <span className="font-medium text-gray-800 capitalize">{order.shipping?.method || 'standard'}</span>
                      </div>
                      {order.shipping?.trackingNumber && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="text-xs text-emerald-600 mb-1">Tracking Number</p>
                          <p className="font-mono text-sm font-bold text-emerald-800">{order.shipping.trackingNumber}</p>
                        </div>
                      )}
                      {order.shipping?.deliveryNotes && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">Delivery Notes</p>
                          <p className="text-sm text-blue-800">{order.shipping.deliveryNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                <Card className="border border-gray-100 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600" /> Delivery Address
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-gray-800">{order.address?.fullName || 'N/A'}</p>
                      <p className="text-gray-600">{order.address?.city || 'N/A'}, {order.address?.province || 'N/A'}</p>
                      <div className="flex items-center gap-2 text-gray-500 mt-2">
                        <Phone className="h-4 w-4" />
                        <span>{order.address?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card className="border border-gray-100 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" /> Ordered Items ({order.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        {item.product?.images?.[0] ? (
                          <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">👗</span>
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center text-2xl">👗</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-400">{item.product?.brand || 'AlhamdCollection'} · Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">PKR {((item.price || 0) * (item.quantity || 0))?.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">PKR {(item.price || 0)?.toLocaleString()} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span><span>PKR {(order.subtotal || 0)?.toLocaleString()}</span>
                    </div>
                    {(order.discount || 0) > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount</span><span>-PKR {(order.discount || 0)?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 text-base">
                      <span>Total</span><span className="text-emerald-700">PKR {(order.total || 0)?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card className="border border-emerald-100 bg-emerald-50 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-emerald-800 mb-3">Need Help?</h3>
                  <p className="text-sm text-emerald-700 mb-4">
                    If you have any questions about your order, please contact our support team.
                  </p>
                  <div className="space-y-2">
                    <a href="mailto:alhamdcollection518@gmail.com" className="block">
                      <Button variant="outline" size="sm" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 justify-start">
                        <Mail className="h-4 w-4 mr-2" /> Email Support
                        <span className="ml-auto text-xs opacity-70">alhamdcollection518@gmail.com</span>
                      </Button>
                    </a>
                    <a href="tel:+923457791198" className="block">
                      <Button variant="outline" size="sm" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 justify-start">
                        <Phone className="h-4 w-4 mr-2" /> Call Us
                        <span className="ml-auto text-xs opacity-70">+923457791198</span>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

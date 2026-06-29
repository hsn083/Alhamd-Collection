'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  Download, Loader2, MapPin, Phone, Mail, Calendar, RotateCcw,
  RefreshCw, MessageCircle, Star, Share2, PrinterIcon
} from 'lucide-react';
import Link from 'next/link';

const STATUS_FLOW = [
  { value: 'pending', label: 'Order Placed', desc: 'Your order has been placed', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', desc: 'Order confirmed by seller', icon: CheckCircle },
  { value: 'processing', label: 'Processing', desc: 'Preparing your items', icon: Package },
  { value: 'packed', label: 'Packed', desc: 'Order packed and ready', icon: Package },
  { value: 'shipped', label: 'Shipped', desc: 'Handed to courier', icon: Truck },
  { value: 'in_transit', label: 'In Transit', desc: 'On the way to you', icon: Truck },
  { value: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving today', icon: Truck },
  { value: 'delivered', label: 'Delivered', desc: 'Order delivered!', icon: CheckCircle },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  packed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  shipped: 'bg-teal-100 text-teal-700 border-teal-200',
  in_transit: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  out_for_delivery: 'bg-orange-100 text-orange-700 border-orange-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  returned: 'bg-gray-100 text-gray-700 border-gray-200',
  refunded: 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => { 
    fetchOrder(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Auto-refresh order status every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !order) return;

    const interval = setInterval(() => {
      fetchOrder();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, order]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/invoice/${orderId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); document.body.removeChild(a);
      }
    } catch {}
    finally { setIsDownloading(false); }
  };

  const currentIdx = STATUS_FLOW.findIndex(s => s.value === order?.status);
  const isTerminal = ['cancelled','returned','refunded'].includes(order?.status || '');
  const badgeClass = STATUS_BADGE[order?.status] || 'bg-gray-100 text-gray-700';

  const progressPct = isTerminal ? 0 : currentIdx >= 0
    ? Math.round(((currentIdx + 1) / STATUS_FLOW.length) * 100) : 0;

  if (isLoading) return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
      <Footer />
    </>
  );

  if (!order) return (
    <>
      <Header />
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Order Not Found</h2>
        <p className="text-gray-400 mb-6">We couldn't find an order with this ID.</p>
        <Link href="/orders"><Button className="bg-emerald-600 text-white hover:bg-emerald-700">View My Orders</Button></Link>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back + Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-gray-200 text-gray-600"}>
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refreshing' : 'Auto-refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadInvoice} disabled={isDownloading}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                Invoice
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}
                className="border-gray-200 text-gray-600">
                <PrinterIcon className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          </div>

          {/* Order Header Card */}
          <Card className="border border-gray-100 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order Number</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">{order.displayOrderNumber || order.orderNumber || order._id?.slice(0, 18)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`text-sm px-3 py-1 border ${badgeClass}`}>
                    {STATUS_FLOW.find(s => s.value === order.status)?.label || order.status}
                  </Badge>
                  <p className="text-2xl font-bold text-emerald-700 mt-2">PKR {order.total?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                </div>
              </div>

              {/* Progress Bar */}
              {!isTerminal && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Order Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {isTerminal && order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">This order has been cancelled. Contact support for more information.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          {!isTerminal && (
            <Card className="border border-gray-100 shadow-sm mb-6">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" /> Delivery Timeline
                </h3>
                <div className="space-y-0">
                  {STATUS_FLOW.map((step, i) => {
                    const isDone = currentIdx > i;
                    const isCurrent = currentIdx === i;
                    const Icon = step.icon;
                    return (
                      <div key={step.value} className="flex gap-4 pb-6 last:pb-0 relative">
                        {/* Line */}
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-full ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                        )}
                        {/* Icon */}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                          isCurrent ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200 animate-pulse' :
                          isDone ? 'border-emerald-400 bg-emerald-50 text-emerald-600' :
                          'border-gray-200 bg-white text-gray-300'
                        }`}>
                          {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                        </div>
                        {/* Text */}
                        <div className="pt-1">
                          <p className={`text-sm font-medium ${isCurrent ? 'text-emerald-700' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${isCurrent ? 'text-emerald-500' : isDone ? 'text-gray-400' : 'text-gray-300'}`}>
                            {step.desc}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-emerald-600 font-medium mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">
                              Current Status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Shipping Info */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" /> Shipping Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Courier</span>
                    <span className="font-medium text-gray-800">TCS Courier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium text-gray-800 capitalize">Standard</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1">Tracking Number</p>
                      <p className="font-mono text-sm font-bold text-emerald-800">{order.trackingNumber}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-medium text-gray-800 capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Delivery Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-800">{order.customerName || 'N/A'}</p>
                  <p className="text-gray-600">{order.shippingAddress?.street || 'N/A'}</p>
                  <p className="text-gray-600">{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}</p>
                  <p className="text-gray-600">{order.shippingAddress?.zipCode || ''}</p>
                  <p className="text-gray-600">{order.shippingAddress?.country || 'N/A'}</p>
                  <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{order.shippingAddress?.phone || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="border border-gray-100 shadow-sm mb-6">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" /> Ordered Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    {item.product?.images?.[0] || item.product?.image || item.image ? (
                      <div className="relative w-14 h-14">
                        <Image src={item.product?.images?.[0] || item.product?.image || item.image} alt={item.product?.name || item.name || 'Product'}
                          fill
                          className="object-cover rounded-lg border border-gray-100" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center text-2xl">👗</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.product?.name || item.name || 'Product'}</p>
                      <p className="text-xs text-gray-400">{(item.product?.brand || item.brand || 'AlhamdCollection')} · Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">PKR {(item.price * item.quantity)?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">PKR {item.price?.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>PKR {order.subtotal?.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span><span>-PKR {order.discount?.toLocaleString()}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <span>Coupon: {order.couponCode}</span>
                    <span>-PKR {order.couponDiscount?.toLocaleString() || order.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span><span>PKR {order.shippingCost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total</span><span className="text-emerald-700">PKR {order.total?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="border border-emerald-100 bg-emerald-50 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-emerald-800 mb-3">Need Help?</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                    <MessageCircle className="h-4 w-4 mr-1" /> Contact Support
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  onClick={handleDownloadInvoice}>
                  <Download className="h-4 w-4 mr-1" /> Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

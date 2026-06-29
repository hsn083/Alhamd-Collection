'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Download,
  Printer,
  ArrowLeft,
  Share2,
  MessageCircle,
  Smartphone,
  Landmark,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  payment_submitted: { label: 'Payment Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  under_verification: { label: 'Under Verification', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  verified: { label: 'Payment Verified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Payment Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: CreditCard },
  refunded: { label: 'Refunded', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: CreditCard },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shipped: { label: 'Shipped', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  in_transit: { label: 'In Transit', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  refunded: { label: 'Refunded', color: 'bg-pink-100 text-pink-700 border-pink-200' },
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        router.push('/orders');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      router.push('/orders');
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
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch {}
    finally { setIsDownloading(false); }
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.createdAt);
    const estimatedDays = order.shipping?.method === 'express' ? 2 : 5;
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
    return deliveryDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getPaymentIcon = () => {
    switch (order.paymentMethod) {
      case 'cod': return CreditCard;
      case 'jazzcash':
      case 'easypaisa': return Smartphone;
      case 'bank_transfer': return Landmark;
      default: return CreditCard;
    }
  };

  const getPaymentMethodName = () => {
    switch (order.paymentMethod) {
      case 'cod': return 'Cash on Delivery';
      case 'jazzcash': return 'JazzCash';
      case 'easypaisa': return 'EasyPaisa';
      case 'bank_transfer': return 'Bank Transfer';
      case 'stripe': return 'Credit/Debit Card';
      default: return order.paymentMethod;
    }
  };

  const getWhatsAppMessage = () => {
    const orderNumber = order.id;
    const customerName = order.user?.name || order.address?.fullName;
    const amount = order.total?.toLocaleString();
    const paymentMethod = getPaymentMethodName();
    
    return `Hello Alhamd Collection,

I have completed my payment.

Order Number:
${orderNumber}

Customer Name:
${customerName}

Amount:
PKR ${amount}

Payment Method:
${paymentMethod}

Please verify my payment.`;
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = '+923457791198'; // This should come from settings
    const message = getWhatsAppMessage();
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-6">We couldn't find an order with this ID.</p>
          <Link href="/orders">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">View My Orders</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const PaymentIcon = getPaymentIcon();
  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order?.paymentStatus] || PAYMENT_STATUS_CONFIG.pending_payment;
  const PaymentStatusIcon = paymentStatusConfig.icon;
  const orderStatusConfig = ORDER_STATUS_CONFIG[order?.status] || ORDER_STATUS_CONFIG.pending;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4 animate-bounce">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-lg text-gray-600">Your order has been placed successfully</p>
          </div>

          {/* Order Summary Card */}
          <Card className="border border-emerald-200 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Number</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{order.displayOrderNumber || order.id}</p>
                </div>
                <div className="flex gap-3">
                  <Badge className={`text-sm px-4 py-2 border ${orderStatusConfig.color}`}>
                    {orderStatusConfig.label}
                  </Badge>
                  <Badge className={`text-sm px-4 py-2 border ${paymentStatusConfig.color} flex items-center gap-2`}>
                    <PaymentStatusIcon className="h-4 w-4" />
                    {paymentStatusConfig.label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Order Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Est. Delivery</p>
                    <p className="text-sm font-medium text-gray-900">{getEstimatedDelivery()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentIcon className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">{getPaymentMethodName()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleDownloadInvoice} disabled={isDownloading} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700">
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Download Invoice
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Printer className="h-4 w-4 mr-2" /> Print Order
                </Button>
                <Link href={`/orders/${order.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Package className="h-4 w-4 mr-2" /> Track Order
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Customer Instructions */}
          {(order.paymentMethod === 'jazzcash' || order.paymentMethod === 'easypaisa' || order.paymentMethod === 'bank_transfer') && (
            <Card className="border border-blue-200 bg-blue-50 shadow-sm mb-6">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Payment Instructions
                </h3>
                <ol className="space-y-2 text-sm text-blue-700 list-decimal list-inside">
                  <li>Complete the payment to the account details shown above</li>
                  <li>Save your payment receipt/screenshot</li>
                  <li>Upload the payment screenshot (if not already done)</li>
                  <li>Click the WhatsApp button below to send payment confirmation</li>
                  <li>Attach the payment screenshot with your Order Number</li>
                  <li>Our team will verify your payment</li>
                  <li>Once verified, your order status will automatically update</li>
                </ol>
                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full mt-4 bg-green-600 text-white hover:bg-green-700"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Send Payment Screenshot on WhatsApp
                </Button>
              </CardContent>
            </Card>
          )}

          {order.paymentMethod === 'cod' && (
            <Card className="border border-emerald-200 bg-emerald-50 shadow-sm mb-6">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Cash on Delivery Instructions
                </h3>
                <ul className="space-y-2 text-sm text-emerald-700 list-disc list-inside">
                  <li>Your order has been confirmed</li>
                  <li>Please keep the exact payment ready (PKR {order.total?.toLocaleString()})</li>
                  <li>Our delivery partner will collect payment at delivery</li>
                  <li>Make sure someone is available at the delivery address</li>
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Customer Information */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" /> Customer Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{order.user?.name || order.address?.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{order.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    <span>{order.address?.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Shipping Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-900">{order.address?.fullName}</p>
                  <p className="text-gray-600">{order.address?.address}</p>
                  <p className="text-gray-600">{order.address?.city}, {order.address?.province}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Shipping Method */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" /> Shipping Method
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Courier</span>
                    <span className="font-medium text-gray-900">{order.shipping?.courier || 'TCS Courier'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium text-gray-900 capitalize">{order.shipping?.method || 'standard'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping Cost</span>
                    <span className="font-medium text-gray-900">PKR {order.shipping?.cost?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Details */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <PaymentIcon className="h-4 w-4 text-emerald-600" /> Payment Method
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium text-gray-900">{getPaymentMethodName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge className={`text-xs px-2 py-1 border ${paymentStatusConfig.color}`}>
                      {paymentStatusConfig.label}
                    </Badge>
                  </div>
                  {order.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-medium text-gray-900 font-mono text-xs">{order.transactionId}</span>
                    </div>
                  )}
                  {order.paymentTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Time</span>
                      <span className="font-medium text-gray-900">{new Date(order.paymentTime).toLocaleString('en-PK')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="border border-gray-100 shadow-sm mb-6">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" /> Order Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    {item.product?.images?.[0] || item.product?.image || item.image ? (
                      <div className="relative w-16 h-16">
                        <Image src={item.product?.images?.[0] || item.product?.image || item.image} alt={item.product?.name || item.name || 'Product'}
                          fill
                          className="object-cover rounded-lg border border-gray-100" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-2xl">👗</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.product?.name || item.name || 'Product'}</p>
                      <p className="text-xs text-gray-400">{(item.product?.brand || item.brand || 'AlhamdCollection')} · Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">PKR {(item.price * item.quantity)?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">PKR {item.price?.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>PKR {order.subtotal?.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-PKR {order.discount?.toLocaleString()}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Coupon Applied</span>
                    <span>{order.couponCode}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>PKR {order.shipping?.cost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 text-lg">
                  <span>Total</span>
                  <span className="text-emerald-700">PKR {order.total?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link href="/shop" className="flex-1">
              <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
              </Button>
            </Link>
            <Link href="/orders" className="flex-1">
              <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Package className="h-4 w-4 mr-2" /> View All Orders
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <Card className="border border-emerald-100 bg-emerald-50 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-emerald-800 mb-3">Need Help?</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                    <MessageCircle className="h-4 w-4 mr-1" /> Contact Support
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  onClick={() => {
                    const whatsappNumber = order.user?.phone || '+923457791198';
                    const message = `Hello Alhamd Collection, I have a question about my order ${order.id}`;
                    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4 mr-1" /> WhatsApp Us
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

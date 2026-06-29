'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  User, MapPin, Phone, Mail, Calendar, Edit, Download,
  Printer, Trash2, Loader2, RotateCcw, Send, RefreshCw
} from 'lucide-react';

const STATUS_FLOW = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-100 border-amber-200' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600 bg-blue-100 border-blue-200' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'text-purple-600 bg-purple-100 border-purple-200' },
  { value: 'packed', label: 'Packed', icon: Package, color: 'text-indigo-600 bg-indigo-100 border-indigo-200' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-teal-600 bg-teal-100 border-teal-200' },
  { value: 'in_transit', label: 'In Transit', icon: Truck, color: 'text-cyan-600 bg-cyan-100 border-cyan-200' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'text-orange-600 bg-orange-100 border-orange-200' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100 border-red-200' },
  { value: 'returned', label: 'Returned', icon: RotateCcw, color: 'text-gray-600 bg-gray-100 border-gray-200' },
  { value: 'refunded', label: 'Refunded', icon: RefreshCw, color: 'text-pink-600 bg-pink-100 border-pink-200' },
];

const PAYMENT_STATUSES = [
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'payment_submitted', label: 'Payment Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'under_verification', label: 'Under Verification', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'verified', label: 'Verified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'refunded', label: 'Refunded', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

const MAIN_FLOW = ['pending','confirmed','processing','packed','shipped','in_transit','out_for_delivery','delivered'];

function getStatusCfg(status: string) {
  return STATUS_FLOW.find(s => s.value === status) || { label: status, icon: Clock, color: 'text-gray-600 bg-gray-100 border-gray-200' };
}

function getPaymentStatusCfg(status: string) {
  return PAYMENT_STATUSES.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingData, setTrackingData] = useState({
    trackingId: '',
    courier: '',
    trackingNumber: '',
    estimatedDelivery: '',
    deliveryNotes: '',
  });
  const { success, error } = useToast();

  useEffect(() => { fetchOrder(); }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setPayment(data.payment);
        setAdminNotes(data.order.adminNotes || '');
        setTrackingData({
          trackingId: data.order.trackingId || '',
          courier: data.order.shipping?.courier || '',
          trackingNumber: data.order.shipping?.trackingNumber || '',
          estimatedDelivery: data.order.shipping?.estimatedDelivery?.split('T')[0] || '',
          deliveryNotes: data.order.shipping?.deliveryNotes || '',
        });
      }
      else error('Failed to load order');
    } catch { error('Failed to fetch order'); }
    finally { setIsLoading(false); }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) { success(`Status updated to ${newStatus}`); fetchOrder(); }
      else error(data.error || 'Failed to update');
    } catch { error('Failed to update status'); }
    finally { setIsUpdatingStatus(false); }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus: string) => {
    setIsUpdatingPaymentStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) { success(`Payment status updated to ${newPaymentStatus}`); fetchOrder(); }
      else error(data.error || 'Failed to update payment status');
    } catch { error('Failed to update payment status'); }
    finally { setIsUpdatingPaymentStatus(false); }
  };

  const handleAdminNotesUpdate = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });
      const data = await res.json();
      if (data.success) { success('Admin notes updated'); }
      else error(data.error || 'Failed to update notes');
    } catch { error('Failed to update notes'); }
  };

  const handleTrackingUpdate = (field: string, value: string) => {
    setTrackingData(prev => ({ ...prev, [field]: value }));
  };

  const saveTrackingInfo = async () => {
    setIsUpdatingTracking(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: trackingData.trackingId,
          courier: trackingData.courier,
          trackingNumber: trackingData.trackingNumber,
          estimatedDelivery: trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery).toISOString() : undefined,
          deliveryNotes: trackingData.deliveryNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Tracking information updated');
        fetchOrder();
      } else {
        error(data.error || 'Failed to update tracking info');
      }
    } catch { error('Failed to update tracking info'); }
    finally { setIsUpdatingTracking(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this order? Cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { success('Order deleted'); router.push('/admin/orders'); }
      else error(data.error || 'Failed to delete');
    } catch { error('Failed to delete order'); }
    finally { setIsDeleting(false); }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await fetch(`/api/invoice/${orderId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); document.body.removeChild(a);
        success('Invoice downloaded');
      } else error('Failed to download invoice');
    } catch { error('Failed to download invoice'); }
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    </AdminLayout>
  );

  if (!order) return (
    <AdminLayout>
      <div className="p-8 text-center text-gray-400">Order not found</div>
    </AdminLayout>
  );

  const sc = getStatusCfg(order.status);
  const currentFlowIndex = MAIN_FLOW.indexOf(order.status);
  const isTerminal = ['cancelled','returned','refunded'].includes(order.status);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/orders')} className="text-gray-500">
              <ArrowLeft className="h-4 w-4 mr-1" /> Orders
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{order._id || order.orderNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/orders/${orderId}/edit`)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadInvoice}
              className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Download className="h-4 w-4 mr-1" /> Invoice
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/admin/orders/${orderId}/print`, '_blank')}
              className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}
              className="border-red-200 text-red-600 hover:bg-red-50">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order Tracking Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            {!isTerminal && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600" /> Order Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      {MAIN_FLOW.map((status, i) => {
                        const cfg = getStatusCfg(status);
                        const Icon = cfg.icon;
                        const isDone = currentFlowIndex > i;
                        const isCurrent = currentFlowIndex === i;
                        return (
                          <div key={status} className="flex flex-col items-center flex-1 relative">
                            {i < MAIN_FLOW.length - 1 && (
                              <div className={`absolute top-4 left-1/2 w-full h-0.5 ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                            )}
                            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              isCurrent ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                              isDone ? 'border-emerald-400 bg-emerald-100 text-emerald-700' :
                              'border-gray-200 bg-white text-gray-400'
                            }`}>
                              {isDone ? <CheckCircle className="h-4 w-4 text-emerald-600" /> :
                               isCurrent ? <Icon className="h-3.5 w-3.5" /> :
                               <span className="text-xs font-bold">{i + 1}</span>}
                            </div>
                            <p className={`text-xs mt-2 text-center leading-tight ${
                              isCurrent ? 'font-semibold text-emerald-700' :
                              isDone ? 'text-emerald-600' : 'text-gray-400'
                            }`}>
                              {cfg.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isTerminal && (
              <Card className="border border-red-100 bg-red-50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-700">Order {sc.label}</p>
                    <p className="text-sm text-red-500">This order has been {order.status}.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Update Status */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Update Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 items-center">
                  <Select value={order.status} onValueChange={handleStatusUpdate} disabled={isUpdatingStatus}>
                    <SelectTrigger className="flex-1 border-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FLOW.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isUpdatingStatus && <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                  {STATUS_FLOW.slice(0, 8).map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusUpdate(s.value)}
                      disabled={isUpdatingStatus || order.status === s.value}
                      className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${
                        order.status === s.value ? s.color + ' font-semibold' :
                        'bg-white border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Management */}
            <Card className="border border-emerald-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" /> Tracking Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Tracking ID</label>
                  <Input
                    type="text"
                    value={trackingData.trackingId}
                    onChange={(e) => handleTrackingUpdate('trackingId', e.target.value)}
                    placeholder="Enter tracking ID"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Courier Name</label>
                  <Input
                    type="text"
                    value={trackingData.courier}
                    onChange={(e) => handleTrackingUpdate('courier', e.target.value)}
                    placeholder="e.g., TCS, Leopards"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Courier Tracking Number</label>
                  <Input
                    type="text"
                    value={trackingData.trackingNumber}
                    onChange={(e) => handleTrackingUpdate('trackingNumber', e.target.value)}
                    placeholder="Enter courier tracking number"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Estimated Delivery Date</label>
                  <Input
                    type="date"
                    value={trackingData.estimatedDelivery}
                    onChange={(e) => handleTrackingUpdate('estimatedDelivery', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Delivery Notes</label>
                  <textarea
                    value={trackingData.deliveryNotes}
                    onChange={(e) => handleTrackingUpdate('deliveryNotes', e.target.value)}
                    placeholder="Add delivery instructions or notes..."
                    className="w-full p-2 text-sm border rounded-lg"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={saveTrackingInfo}
                  disabled={isUpdatingTracking}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                  size="sm"
                >
                  {isUpdatingTracking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Save Tracking Info
                </Button>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" /> Order Items ({order.items?.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                        <p className="font-medium text-gray-800 truncate">{item.product?.name || item.name || 'Product'}</p>
                        <p className="text-xs text-gray-400">{(item.product?.brand || item.brand || 'AlhamdCollection')} · Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">PKR {(item.price * item.quantity).toLocaleString()}</p>
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
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span><span>PKR {order.shipping?.cost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                    <span>Total</span><span className="text-emerald-700">PKR {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Info Cards */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card className={`border shadow-sm ${sc.color}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <sc.icon className="h-8 w-8" />
                  <div>
                    <p className="text-xs font-medium opacity-70">Current Status</p>
                    <p className="text-lg font-bold">{sc.label}</p>
                    <p className="text-xs opacity-60">{new Date(order.updatedAt).toLocaleString('en-PK')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" /> Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{order.customerName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{order.customerEmail || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{order.customerPhone || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-800">{order.customerName || 'N/A'}</p>
                <p>{order.shippingAddress?.street || 'N/A'}</p>
                <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}</p>
                <p>{order.shippingAddress?.zipCode || ''}</p>
                <p>{order.shippingAddress?.country || 'N/A'}</p>
                <p>{order.shippingAddress?.phone || 'N/A'}</p>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" /> Shipping Info
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Courier</span>
                  <span className="font-medium text-gray-800">{order.shipping?.courier || 'TCS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-800 capitalize">{order.shipping?.method || 'standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking ID</span>
                  <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{order.trackingId || 'N/A'}</span>
                </div>
                {order.shipping?.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Courier Tracking #</span>
                    <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{order.shipping.trackingNumber}</span>
                  </div>
                )}
                {order.shipping?.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. Delivery</span>
                    <span className="font-medium text-emerald-700">{new Date(order.shipping.estimatedDelivery).toLocaleDateString('en-PK')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-800 capitalize">{order.paymentMethod?.replace('_',' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pay Status</span>
                  <Badge className={order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}>
                    {order.paymentStatus || 'pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Verification - Only for manual payments */}
            {['jazzcash', 'easypaisa', 'bank_transfer'].includes(order.paymentMethod) && (
              <Card className="border border-blue-200 bg-blue-50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Payment Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Payment Status</label>
                    <Select 
                      value={order.paymentStatus || 'pending_payment'} 
                      onValueChange={handlePaymentStatusUpdate}
                      disabled={isUpdatingPaymentStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {payment?.screenshot && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Payment Screenshot</label>
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <Image
                          src={payment.screenshot}
                          alt="Payment Screenshot"
                          fill
                          className="object-contain rounded-lg cursor-pointer"
                          onClick={() => window.open(payment.screenshot, '_blank')}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(payment.screenshot, '_blank')}
                          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.transactionId && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Transaction ID</label>
                      <p className="text-sm font-mono bg-white px-2 py-1 rounded border">{order.transactionId}</p>
                    </div>
                  )}

                  {order.paymentTime && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Payment Time</label>
                      <p className="text-sm">{new Date(order.paymentTime).toLocaleString('en-PK')}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Admin Notes</label>
                    <textarea
                      className="w-full p-2 text-sm border rounded-lg"
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this payment..."
                    />
                    <Button
                      size="sm"
                      onClick={handleAdminNotesUpdate}
                      className="mt-2"
                      variant="outline"
                    >
                      Save Notes
                    </Button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handlePaymentStatusUpdate('verified')}
                      disabled={isUpdatingPaymentStatus}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePaymentStatusUpdate('rejected')}
                      disabled={isUpdatingPaymentStatus}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const phone = order.customerPhone || order.shippingAddress?.phone;
                      if (phone) {
                        const message = `Hello from Alhamd Collection. Regarding your order ${order.orderNumber || order._id}, we need to discuss your payment verification. Please contact us.`;
                        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      }
                    }}
                    className="w-full bg-green-600 text-white hover:bg-green-700 border-green-600"
                  >
                    <Send className="h-4 w-4 mr-1" /> WhatsApp Customer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Order Date */}
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Ordered {new Date(order.createdAt).toLocaleString('en-PK')}</span>
                </div>
                {order.notes && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
                    <p className="text-xs text-amber-600">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

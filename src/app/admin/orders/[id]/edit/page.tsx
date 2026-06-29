'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, Loader2, Save, Package, User, MapPin, Phone, Mail, Truck } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
  { value: 'refunded', label: 'Refunded' },
];

const COURIER_OPTIONS = ['TCS', 'Leopards', 'M&P', 'Call Courier', 'Pakistan Post', 'Trax', 'Swyft'];

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    courier: '',
    estimatedDelivery: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingProvince: '',
    notes: '',
    deliveryNotes: '',
  });

  useEffect(() => { fetchOrder(); }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setFormData({
          status: data.order.status || '',
          trackingNumber: data.order.shipping?.trackingNumber || '',
          courier: data.order.shipping?.courier || 'TCS',
          estimatedDelivery: data.order.shipping?.estimatedDelivery || '',
          customerName: data.order.user?.name || '',
          customerEmail: data.order.user?.email || '',
          customerPhone: data.order.user?.phone || '',
          shippingAddress: data.order.address?.address || '',
          shippingCity: data.order.address?.city || '',
          shippingProvince: data.order.address?.province || '',
          notes: data.order.notes || '',
          deliveryNotes: data.order.shipping?.deliveryNotes || '',
        });
      } else error('Failed to load order');
    } catch { error('Failed to fetch order'); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        success('Order updated successfully');
        router.push(`/admin/orders/${orderId}`);
      } else error(data.error || 'Failed to update order');
    } catch { error('Failed to save changes'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    </AdminLayout>
  );

  if (!order) return (
    <AdminLayout>
      <div className="p-8 text-center">
        <p className="text-gray-400 mb-4">Order not found</p>
        <Button onClick={() => router.push('/admin/orders')} variant="outline">Back to Orders</Button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/orders/${orderId}`)} className="text-gray-500">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Order</h1>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{orderId}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status & Shipping */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" /> Order Status & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Order Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="mt-1 border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Courier Service</Label>
                <Select value={formData.courier} onValueChange={v => setFormData({ ...formData, courier: v })}>
                  <SelectTrigger className="mt-1 border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURIER_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Tracking Number</Label>
                <Input
                  value={formData.trackingNumber}
                  onChange={e => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                  className="mt-1 border-emerald-200 font-mono"
                />
              </div>

              <div>
                <Label className="text-sm text-gray-600">Estimated Delivery Date</Label>
                <Input
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  className="mt-1 border-emerald-200"
                />
              </div>

              <div>
                <Label className="text-sm text-gray-600">Delivery Notes</Label>
                <Textarea
                  value={formData.deliveryNotes}
                  onChange={e => setFormData({ ...formData, deliveryNotes: e.target.value })}
                  placeholder="e.g. Ring the doorbell, leave at gate..."
                  className="mt-1 border-emerald-200 text-sm"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sm text-gray-600">Order Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes about this order..."
                  className="mt-1 border-emerald-200 text-sm"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer & Address */}
          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" /> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Full Name</Label>
                  <Input value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="mt-1 border-emerald-200" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <Input type="email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="mt-1 border-emerald-200" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <Input value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="mt-1 border-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Street Address</Label>
                  <Textarea value={formData.shippingAddress} onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="mt-1 border-emerald-200 text-sm" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600">City</Label>
                    <Input value={formData.shippingCity} onChange={e => setFormData({ ...formData, shippingCity: e.target.value })}
                      className="mt-1 border-emerald-200" />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Province</Label>
                    <Input value={formData.shippingProvince} onChange={e => setFormData({ ...formData, shippingProvince: e.target.value })}
                      className="mt-1 border-emerald-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border border-emerald-100 bg-emerald-50 shadow-sm">
              <CardContent className="p-4">
                <h4 className="text-xs font-semibold text-emerald-700 mb-3">Order Summary</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Items</span><span>{order.items?.length}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>PKR {order.subtotal?.toLocaleString()}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-PKR {order.discount?.toLocaleString()}</span></div>}
                  <div className="flex justify-between font-bold text-gray-900 border-t border-emerald-200 pt-2 mt-2">
                    <span>Total</span><span className="text-emerald-700">PKR {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button Bottom */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => router.push(`/admin/orders/${orderId}`)}
            className="border-gray-200 text-gray-600">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

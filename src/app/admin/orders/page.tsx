'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import {
  Search, Package, Truck, CheckCircle, Clock, XCircle,
  Eye, Download, Loader2, Edit, Trash2, Printer, RefreshCw
} from 'lucide-react';

const ALL_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'shipped', label: 'Shipped', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'returned', label: 'Returned', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'refunded', label: 'Refunded', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

const PAYMENT_STATUSES = [
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'payment_submitted', label: 'Payment Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'under_verification', label: 'Under Verification', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'verified', label: 'Verified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'refunded', label: 'Refunded', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

function getStatusCfg(status: string) {
  return ALL_STATUSES.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
}

function getPaymentStatusCfg(status: string) {
  return PAYMENT_STATUSES.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch { error('Failed to fetch orders'); }
    finally { setIsLoading(false); }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) { success(`Status updated to ${newStatus}`); fetchOrders(); }
      else error(data.error || 'Failed to update status');
    } catch { error('Failed to update order status'); }
    finally { setUpdatingOrderId(null); }
  };

  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) { 
        success(`Payment status updated to ${newPaymentStatus}`); 
        fetchOrders(); 
        // If payment is verified, also update order status to confirmed
        if (newPaymentStatus === 'verified') {
          await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'confirmed' }),
          });
        }
      }
      else error(data.error || 'Failed to update payment status');
    } catch { error('Failed to update payment status'); }
    finally { setUpdatingOrderId(null); }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    setDeletingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { success('Order deleted'); fetchOrders(); }
      else error(data.error || 'Failed to delete order');
    } catch { error('Failed to delete order'); }
    finally { setDeletingOrderId(null); }
  };

  const handleDownloadInvoice = async (orderId: string) => {
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

  const filtered = orders.filter(o => {
    const matchesSearch = !searchQuery ||
      o._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.displayOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber?.toString().includes(searchQuery) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s.value] = orders.filter(o => o.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
          </div>
          <Button onClick={fetchOrders} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Status Summary Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusFilter === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'}`}
          >
            All ({orders.length})
          </button>
          {ALL_STATUSES.map(s => counts[s.value] > 0 && (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusFilter === s.value ? 'bg-emerald-600 text-white border-emerald-600' : `${s.color} hover:opacity-80`}`}
            >
              {s.label} ({counts[s.value]})
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <Card className="border border-gray-100 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, customer name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 border-gray-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-gray-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ALL_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Order ID</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Items</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Payment</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Payment Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(order => {
                      const sc = getStatusCfg(order.status);
                      const psc = getPaymentStatusCfg(order.paymentStatus || 'pending_payment');
                      const isManualPayment = ['jazzcash', 'easypaisa', 'bank_transfer'].includes(order.paymentMethod);
                      return (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-mono text-gray-600">{order.displayOrderNumber || order.orderNumber || order._id?.slice(0, 18)}...</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-800">{order.customerName || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{order.customerEmail || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">{order.items?.length || 0} item(s)</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-800">PKR {order.total?.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                              {order.paymentMethod?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isManualPayment ? (
                              <Select
                                value={order.paymentStatus || 'pending_payment'}
                                onValueChange={val => handlePaymentStatusUpdate(order._id, val)}
                                disabled={updatingOrderId === order._id}
                              >
                                <SelectTrigger className={`w-32 h-7 text-xs border ${psc.color}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge className={`text-xs px-2 py-1 border ${psc.color}`}>
                                {psc.label}
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Select
                              value={order.status}
                              onValueChange={val => handleStatusUpdate(order._id, val)}
                              disabled={updatingOrderId === order._id}
                            >
                              <SelectTrigger className={`w-40 h-7 text-xs border ${sc.color}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ALL_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-PK')}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => window.location.href = `/admin/orders/${order._id}`}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => window.location.href = `/admin/orders/${order._id}/edit`}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Edit Order"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(order._id)}
                                className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                                title="Download Invoice"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/admin/orders/${order._id}/print`, '_blank')}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(order._id)}
                                disabled={deletingOrderId === order._id}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                title="Delete"
                              >
                                {deletingOrderId === order._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
// Footer replaced by AdminLayout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  Eye,
  Loader2,
  Trash2,
  Ban,
  CheckCircle,
  Shield,
  Edit,
  Key,
  Clock,
  MapPin,
  Package,
  DollarSign,
  Activity,
  X,
  Save
} from 'lucide-react';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  createdAt?: string;
  joinedDate?: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpending?: number;
  isBlocked?: boolean;
  isDeleted?: boolean;
  orders?: any[];
  activityLogs?: any[];
}

export default function CustomerProfilePage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setCustomer(data.customer);
        setEditForm({
          fullName: data.customer.fullName,
          email: data.customer.email,
          phone: data.customer.phone || '',
        });
      } else {
        setError(data.error || 'Failed to fetch customer');
      }
    } catch (err) {
      setError('Failed to fetch customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: params.id,
          action: 'update',
          data: editForm,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Customer updated successfully' });
        setIsEditing(false);
        fetchCustomer();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update customer' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update customer' });
    }
  };

  const handleBlockCustomer = async (block: boolean) => {
    if (!confirm(`Are you sure you want to ${block ? 'block' : 'unblock'} this customer?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: params.id,
          action: block ? 'block' : 'unblock',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNotification({ type: 'success', message: block ? 'Customer blocked successfully' : 'Customer unblocked successfully' });
        fetchCustomer();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update customer' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update customer' });
    }
  };

  const handleDeleteCustomer = async () => {
    if (!confirm('Are you sure you want to permanently delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers?id=${params.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Customer deleted successfully' });
        setTimeout(() => window.location.href = '/admin/customers', 2000);
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to delete customer' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete customer' });
    }
  };

  const handleVerifyCustomer = async (verify: boolean) => {
    try {
      const response = await fetch(`/api/admin/customers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: verify ? 'verify' : 'revoke-verification',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNotification({ type: 'success', message: verify ? 'Customer verified successfully' : 'Customer verification revoked successfully' });
        fetchCustomer();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update customer' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update customer' });
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setNotification({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: params.id,
          action: 'resetPassword',
          data: { newPassword },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Password reset successfully' });
        setShowResetPassword(false);
        setNewPassword('');
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to reset password' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to reset password' });
    }
  };

  const getStatusColor = () => {
    if (customer?.isBlocked) {
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    }
    if (customer?.emailVerified) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  };

  const getStatusText = () => {
    if (customer?.isBlocked) return 'Blocked';
    if (customer?.emailVerified) return 'Verified';
    return 'Unverified';
  };

  const formatJoinedDate = (customer: Customer) => {
    // Use createdAt as primary, joinedDate as fallback
    const date = customer.createdAt || customer.joinedDate;
    if (!date) return 'N/A';
    
    try {
      const d = new Date(date);
      // Check if date is valid
      if (isNaN(d.getTime())) return 'N/A';
      
      // Format: 29 Jun 2026, 10:45 AM
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
      return d.toLocaleDateString('en-GB', options);
    } catch (error) {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !customer) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">{error || 'Customer not found'}</p>
            <Button onClick={() => window.location.href = '/admin/customers'}>
              Back to Customers
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500 mb-2"
                onClick={() => window.location.href = '/admin/customers'}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Customer Profile</h1>
              <p className="text-sm text-gray-500">{customer.fullName}</p>
            </div>
              <div className="flex space-x-2">
                {customer.isBlocked ? (
                  <Button
                    variant="outline"
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-100"
                    onClick={() => handleBlockCustomer(false)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Unblock
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    onClick={() => handleBlockCustomer(true)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Block
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="bg-emerald-600/10 hover:bg-emerald-600/20 text-black border-black/30"
                  onClick={() => setShowResetPassword(true)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                  onClick={handleDeleteCustomer}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

        <div className="container mx-auto px-4 py-8">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 hover:opacity-80"
              >
                ×
              </button>
            </div>
          )}

          {/* Reset Password Modal */}
          {showResetPassword && (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
              <Card className="border border-emerald-100 bg-white shadow-sm/90 max-w-md w-full mx-4">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => { setShowResetPassword(false); setNewPassword(''); }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleResetPassword}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-black"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Customer Details Card */}
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700 flex items-center justify-between">
                    <span>Customer Details</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{customer.fullName}</p>
                        <p className="text-sm text-muted-foreground">{customer.id}</p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                          <Input
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                          <Input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                          <Input
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleUpdateCustomer} className="w-full bg-emerald-600 hover:bg-emerald-700 text-black">
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{customer.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Joined: {formatJoinedDate(customer)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Last Login: {customer.lastLogin ? new Date(customer.lastLogin).toLocaleString() : 'Never'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`capitalize ${getStatusColor()}`}>
                            {getStatusText()}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total Orders</span>
                      </div>
                      <span className="font-semibold">{customer.totalOrders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total Spending</span>
                      </div>
                      <span className="font-semibold">PKR {(customer.totalSpending || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Avg Order Value</span>
                      </div>
                      <span className="font-semibold">
                        PKR {customer.totalOrders ? Math.round((customer.totalSpending || 0) / customer.totalOrders).toLocaleString() : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Actions */}
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={customer.emailVerified ? 'outline' : 'default'}
                    className={`w-full ${customer.emailVerified ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30' : 'bg-emerald-600 hover:bg-emerald-700 text-black'}`}
                    onClick={() => handleVerifyCustomer(!customer.emailVerified)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {customer.emailVerified ? 'Revoke Verification' : 'Verify Email'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Orders & Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order History */}
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.orders && customer.orders.length > 0 ? (
                    <div className="space-y-4">
                      {customer.orders.map((order: any) => (
                        <div key={order.id} className="p-4 border rounded-lg hover:bg-emerald-600/5 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">PKR {(order.total || 0).toLocaleString()}</p>
                              <span className={`text-xs px-2 py-1 rounded-full border ${
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                                order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                'bg-gray-500/20 text-gray-400 border-gray-500/50'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.items?.length || 0} items • {order.paymentMethod?.toUpperCase() || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No orders yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Logs */}
              <Card className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-emerald-700">Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.activityLogs && customer.activityLogs.length > 0 ? (
                    <div className="space-y-3">
                      {customer.activityLogs.map((log: any) => (
                        <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Activity className="h-4 w-4 text-emerald-700 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{log.details}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No activity logs yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
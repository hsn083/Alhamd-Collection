'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { 
  Plus, 
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Loader2
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCouponsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string } | null>(null);
  const { success, error } = useToast();
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/coupons');
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      } else {
        error('Failed to fetch coupons');
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
      error('Failed to fetch coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingCoupon ? '/api/admin/coupons' : '/api/admin/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';
      const body = editingCoupon 
        ? { ...newCoupon, id: editingCoupon.id, isActive: editingCoupon.isActive }
        : newCoupon;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        success(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully');
        resetForm();
        fetchCoupons();
      } else {
        error(data.error || 'Failed to save coupon');
      }
    } catch (err) {
      console.error('Error saving coupon:', err);
      error('Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit.toString(),
      expiryDate: coupon.expiryDate,
    });
    setShowAddForm(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        success('Coupon deleted successfully');
        setCoupons(coupons.filter(c => c.id !== id));
        setDeleteConfirm(null);
      } else {
        error(data.error || 'Failed to delete coupon');
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      error('Failed to delete coupon');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success('Coupon code copied to clipboard');
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingCoupon(null);
    setNewCoupon({
      code: '',
      type: 'percentage',
      value: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      expiryDate: '',
    });
  };

  return (
    

      <AdminLayout><ToastContainer /><div className="p-8">
        <div className="mb-8 pb-6 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  className="text-gray-500 hover:bg-gray-50 mb-4"
                  onClick={() => window.location.href = '/admin'}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                <h1 className="text-xl font-bold text-gray-900">Coupon Management</h1>
                <p className="text-sm text-gray-500">Create and manage discount codes</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 font-semibold"
                onClick={() => {
                  resetForm();
                  setShowAddForm(!showAddForm);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {showAddForm ? 'Cancel' : 'Add Coupon'}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Add/Edit Coupon Form */}
          {showAddForm && (
            <Card className="mb-6 border border-emerald-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Coupon Code *</Label>
                      <Input
                        id="code"
                        placeholder="e.g., SAVE10"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Discount Type *</Label>
                      <Select value={newCoupon.type} onValueChange={(v: "fixed" | "percentage") => setNewCoupon({ ...newCoupon, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value">Discount Value *</Label>
                      <Input
                        id="value"
                        type="number"
                        placeholder={newCoupon.type === 'percentage' ? 'e.g., 10' : 'e.g., 500'}
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="minPurchase">Minimum Purchase (PKR)</Label>
                      <Input
                        id="minPurchase"
                        type="number"
                        placeholder="e.g., 5000"
                        value={newCoupon.minPurchase}
                        onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                      />
                    </div>
                    {newCoupon.type === 'percentage' && (
                      <div>
                        <Label htmlFor="maxDiscount">Maximum Discount (PKR)</Label>
                        <Input
                          id="maxDiscount"
                          type="number"
                          placeholder="e.g., 2000"
                          value={newCoupon.maxDiscount}
                          onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="usageLimit">Usage Limit</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        placeholder="e.g., 100"
                        value={newCoupon.usageLimit}
                        onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={newCoupon.expiryDate}
                        onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-black hover:bg-emerald-500">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Coupons List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No coupons found. Create your first coupon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
              <Card key={coupon.id} className="border border-emerald-100 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{coupon.code}</span>
                        <Badge className={coupon.isActive ? 'bg-emerald-600 text-black' : 'bg-gray-500'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => copyCode(coupon.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteConfirm({ id: coupon.id, code: coupon.code })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Discount</span>
                    <span className="font-medium">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `PKR ${coupon.value}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Minimum Purchase</span>
                    <span className="font-medium">PKR {coupon.minPurchase.toLocaleString()}</span>
                  </div>
                  {coupon.maxDiscount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max Discount</span>
                      <span className="font-medium">PKR {coupon.maxDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usage</span>
                    <span className="font-medium">{coupon.usedCount} / {coupon.usageLimit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expiry Date</span>
                    <span className="font-medium">{coupon.expiryDate}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="max-w-md w-full mx-4">
                <CardHeader>
                  <CardTitle>Confirm Delete</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    Are you sure you want to delete coupon <strong>{deleteConfirm.code}</strong>? This action cannot be undone.
                  </p>
                  <div className="flex space-x-4">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteCoupon(deleteConfirm.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      </AdminLayout>  
  
  );
}

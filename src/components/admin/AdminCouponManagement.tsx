'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  Trash2,
  Edit,
  Plus,
  ChevronDown,
  Calendar,
  Percent,
  DollarSign,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiryDate?: string;
  createdAt: string;
}

interface AdminCouponManagementProps {
  coupons: Coupon[];
  onUpdate: (couponIds: string[], updates: Partial<Coupon>) => Promise<void>;
  onDelete: (couponIds: string[]) => Promise<void>;
  onExport?: () => void;
  onCreate?: () => void;
}

export function AdminCouponManagement({
  coupons,
  onUpdate,
  onDelete,
  onExport,
  onCreate,
}: AdminCouponManagementProps) {
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    isActive: false,
    expiryDate: '',
  });

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = coupon.code.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !coupon.isActive) return false;
      if (statusFilter === 'inactive' && coupon.isActive) return false;
      if (statusFilter === 'expired' && coupon.expiryDate && new Date(coupon.expiryDate) > new Date()) return false;
      if (statusFilter === 'expired' && (!coupon.expiryDate || new Date(coupon.expiryDate) <= new Date())) return false;
    }

    // Type filter
    if (typeFilter !== 'all' && coupon.type !== typeFilter) {
      return false;
    }

    return true;
  });

  // Select all
  const handleSelectAll = () => {
    if (selectedCoupons.size === filteredCoupons.length) {
      setSelectedCoupons(new Set());
    } else {
      setSelectedCoupons(new Set(filteredCoupons.map((coupon) => coupon._id)));
    }
  };

  // Select individual coupon
  const handleSelectCoupon = (couponId: string) => {
    const newSelected = new Set(selectedCoupons);
    if (newSelected.has(couponId)) {
      newSelected.delete(couponId);
    } else {
      newSelected.add(couponId);
    }
    setSelectedCoupons(newSelected);
  };

  // Bulk update
  const handleBulkUpdate = async () => {
    if (selectedCoupons.size === 0) {
      toast.error('Please select at least one coupon');
      return;
    }

    setIsProcessing(true);
    try {
      const updates: any = {};
      if (bulkEditData.isActive !== undefined) updates.isActive = bulkEditData.isActive;
      if (bulkEditData.expiryDate) updates.expiryDate = bulkEditData.expiryDate;

      await onUpdate(Array.from(selectedCoupons), updates);
      toast.success(`Updated ${selectedCoupons.size} coupons`);
      setSelectedCoupons(new Set());
      setBulkEditOpen(false);
      setBulkEditData({
        isActive: false,
        expiryDate: '',
      });
    } catch (error) {
      toast.error('Failed to update coupons');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedCoupons.size === 0) {
      toast.error('Please select at least one coupon');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCoupons.size} coupons?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await onDelete(Array.from(selectedCoupons));
      toast.success(`Deleted ${selectedCoupons.size} coupons`);
      setSelectedCoupons(new Set());
    } catch (error) {
      toast.error('Failed to delete coupons');
    } finally {
      setIsProcessing(false);
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isUsageLimitReached = (coupon: Coupon) => {
    return coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
  };

  const formatDate = ( dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Coupon Management</CardTitle>
          <div className="flex gap-2">
            {selectedCoupons.size > 0 && (
              <>
                <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Bulk Edit ({selectedCoupons.size})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Edit Coupons</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          checked={bulkEditData.isActive}
                          onCheckedChange={(checked) => setBulkEditData({ ...bulkEditData, isActive: checked as boolean })}
                        />
                        <Label htmlFor="isActive">Set Active</Label>
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          placeholder="Leave empty to keep current"
                          value={bulkEditData.expiryDate}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, expiryDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkUpdate} disabled={isProcessing}>
                        Update Coupons
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedCoupons.size})
                </Button>
              </>
            )}
            {onCreate && (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Coupon
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
              setSelectedCoupons(new Set());
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3">
                  <Checkbox
                    checked={selectedCoupons.size === filteredCoupons.length && filteredCoupons.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 font-medium text-sm">Code</th>
                <th className="text-left p-3 font-medium text-sm">Type</th>
                <th className="text-left p-3 font-medium text-sm">Value</th>
                <th className="text-left p-3 font-medium text-sm">Min Purchase</th>
                <th className="text-left p-3 font-medium text-sm">Usage</th>
                <th className="text-left p-3 font-medium text-sm">Expiry</th>
                <th className="text-left p-3 font-medium text-sm">Status</th>
                <th className="text-left p-3 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No coupons found
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedCoupons.has(coupon._id)}
                        onCheckedChange={() => handleSelectCoupon(coupon._id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-medium text-sm">{coupon.code}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant={coupon.type === 'percentage' ? 'default' : 'secondary'}>
                        {coupon.type === 'percentage' ? (
                          <>
                            <Percent className="h-3 w-3 mr-1" />
                            Percentage
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-3 w-3 mr-1" />
                            Fixed
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `PKR ${coupon.value.toLocaleString()}`}
                    </td>
                    <td className="p-3 text-sm">
                      {coupon.minPurchase ? `PKR ${coupon.minPurchase.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{coupon.usedCount}</span>
                        {coupon.usageLimit && <span>/ {coupon.usageLimit}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {coupon.expiryDate ? formatDate(coupon.expiryDate) : 'No expiry'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {!coupon.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {isExpired(coupon.expiryDate) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {isUsageLimitReached(coupon) && (
                          <Badge variant="outline">Limit Reached</Badge>
                        )}
                        {coupon.isActive && !isExpired(coupon.expiryDate) && !isUsageLimitReached(coupon) && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.location.href = `/admin/coupons/${coupon._id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              toast.success('Coupon code copied');
                            }}
                          >
                            <Tag className="h-4 w-4 mr-2" />
                            Copy Code
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {filteredCoupons.length} of {coupons.length} coupons
            </span>
            {selectedCoupons.size > 0 && (
              <span>
                {selectedCoupons.size} coupon{selectedCoupons.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

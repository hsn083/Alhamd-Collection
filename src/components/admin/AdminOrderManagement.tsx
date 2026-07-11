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
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  paymentMethod: string;
  createdAt: string;
}

interface AdminOrderManagementProps {
  orders: Order[];
  onUpdateStatus: (orderIds: string[], status: string) => Promise<void>;
  onDelete: (orderIds: string[]) => Promise<void>;
  onExport?: () => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export function AdminOrderManagement({
  orders,
  onUpdateStatus,
  onDelete,
  onExport,
}: AdminOrderManagementProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.customer.phone.includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case 'today':
          if (daysDiff > 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
        case 'quarter':
          if (daysDiff > 90) return false;
          break;
      }
    }

    return true;
  });

  // Select all
  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((order) => order._id)));
    }
  };

  // Select individual order
  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order');
      return;
    }

    setIsProcessing(true);
    try {
      await onUpdateStatus(Array.from(selectedOrders), status);
      toast.success(`Updated ${selectedOrders.size} orders to ${status}`);
      setSelectedOrders(new Set());
    } catch (error) {
      toast.error('Failed to update orders');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedOrders.size} orders?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await onDelete(Array.from(selectedOrders));
      toast.success(`Deleted ${selectedOrders.size} orders`);
      setSelectedOrders(new Set());
    } catch (error) {
      toast.error('Failed to delete orders');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
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
          <CardTitle>Order Management</CardTitle>
          <div className="flex gap-2">
            {selectedOrders.size > 0 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isProcessing}>
                      Update Status ({selectedOrders.size})
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('pending')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('processing')}>
                      <Package className="h-4 w-4 mr-2" />
                      Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('shipped')}>
                      <Truck className="h-4 w-4 mr-2" />
                      Shipped
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('delivered')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Delivered
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('cancelled')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedOrders.size})
                </Button>
              </>
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
              placeholder="Search orders..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
              setSelectedOrders(new Set());
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
                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 font-medium text-sm">Order</th>
                <th className="text-left p-3 font-medium text-sm">Customer</th>
                <th className="text-left p-3 font-medium text-sm">Status</th>
                <th className="text-left p-3 font-medium text-sm">Payment</th>
                <th className="text-left p-3 font-medium text-sm">Total</th>
                <th className="text-left p-3 font-medium text-sm">Date</th>
                <th className="text-left p-3 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedOrders.has(order._id)}
                          onCheckedChange={() => handleSelectOrder(order._id)}
                        />
                      </td>
                      <td className="p-3 text-sm font-medium">{order.orderNumber}</td>
                      <td className="p-3 text-sm">
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-gray-500 text-xs">{order.customer.email}</div>
                          <div className="text-gray-500 text-xs">{order.customer.phone}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={statusColors[order.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{order.paymentMethod}</td>
                      <td className="p-3 text-sm font-medium">
                        PKR {order.total.toLocaleString()}
                      </td>
                      <td className="p-3 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => window.location.href = `/admin/orders/${order._id}`}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.location.href = `/admin/orders/${order._id}/edit`}
                            >
                              Edit Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            {selectedOrders.size > 0 && (
              <span>
                {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

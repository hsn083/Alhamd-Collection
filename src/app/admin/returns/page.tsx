'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ArrowLeft,
  RefreshCw,
  Eye,
  Loader2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Package,
  User,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReturnRequest {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  refundAmount: number;
  createdAt: string;
  items: any[];
}

export default function AdminReturnsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returns, searchQuery, statusFilter]);

  const fetchReturns = async () => {
    try {
      const response = await fetch('/api/admin/returns');
      const data = await response.json();
      if (data.success) {
        setReturns(data.returns);
      } else {
        setError(data.error || 'Failed to fetch returns');
      }
    } catch (err) {
      setError('Failed to fetch returns');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...returns];

    // Search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((ret) =>
        ret.returnNumber?.toLowerCase().includes(searchLower) ||
        ret.orderNumber?.toLowerCase().includes(searchLower) ||
        ret.customerName?.toLowerCase().includes(searchLower) ||
        ret.customerEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((ret) => ret.status === statusFilter);
    }

    setFilteredReturns(filtered);
  };

  const handleUpdateStatus = async (returnId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this return request?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnId,
          action,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Return ${action} successful`);
        fetchReturns();
      } else {
        alert(data.error || 'Failed to update return');
      }
    } catch (err) {
      alert('Failed to update return');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <AdminLayout>
      <div className="p-8">
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
                <h1 className="text-xl font-bold text-gray-900">Return Management</h1>
                <p className="text-sm text-gray-500">View and manage return requests</p>
              </div>
              <Button 
                variant="outline" 
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-100"
                onClick={fetchReturns}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <Card className="mb-6 border border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search by return number, order number, customer name, or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                  <select
                    className="w-full bg-white border border-emerald-100 rounded-md p-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Total', value: returns.length, color: 'text-emerald-700' },
              { label: 'Pending', value: returns.filter(r => r.status === 'pending').length, color: 'text-yellow-600' },
              { label: 'Approved', value: returns.filter(r => r.status === 'approved').length, color: 'text-blue-600' },
              { label: 'Processing', value: returns.filter(r => r.status === 'processing').length, color: 'text-purple-600' },
              { label: 'Completed', value: returns.filter(r => r.status === 'completed').length, color: 'text-green-600' },
              { label: 'Rejected', value: returns.filter(r => r.status === 'rejected').length, color: 'text-red-600' },
            ].map((stat) => (
              <Card key={stat.label} className="border border-emerald-100 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Returns Table */}
          <Card className="border border-emerald-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-700">
                All Return Requests ({filteredReturns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Return #</th>
                      <th className="text-left p-4 font-medium">Order #</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Reason</th>
                      <th className="text-left p-4 font-medium">Refund</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturns.map((ret) => (
                      <tr key={ret._id} className="border-b hover:bg-emerald-600/5">
                        <td className="p-4">
                          <p className="font-medium">{ret.returnNumber}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{ret.orderNumber}</p>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {ret.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">{ret.customerEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{ret.reason}</p>
                          {ret.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {ret.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium">PKR {ret.refundAmount.toLocaleString()}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(ret.status)}`}>
                            {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(ret.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {ret.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(ret._id, 'approve')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(ret._id, 'reject')}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {ret.status === 'approved' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(ret._id, 'process')}>
                                  <Package className="mr-2 h-4 w-4" />
                                  Start Processing
                                </DropdownMenuItem>
                              )}
                              {ret.status === 'processing' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(ret._id, 'complete')}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Mark Complete
                                </DropdownMenuItem>
                              )}
                              {(ret.status === 'pending' || ret.status === 'approved') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(ret._id, 'cancel')} className="text-red-600">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredReturns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No return requests found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
// Footer replaced by AdminLayout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
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
  Download,
  Printer,
  Filter,
  X,
  MoreHorizontal,
  Edit,
  Shield,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Customer {
  id: string;
  customerId?: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  provider: string;
  createdAt: string;
  joinedDate?: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpending?: number;
  isBlocked?: boolean;
  isDeleted?: boolean;
}

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [ordersFilter, setOrdersFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCustomers();
      fetchStats();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, searchQuery, statusFilter, verifiedFilter, ordersFilter]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.error || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/customers/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.statistics);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];

    // Search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((customer: Customer) =>
        customer.fullName?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchQuery) ||
        customer.id?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter === 'blocked') {
      filtered = filtered.filter((c: Customer) => c.isBlocked);
    } else if (statusFilter === 'active') {
      filtered = filtered.filter((c: Customer) => !c.isBlocked);
    }

    // Verified filter
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((c: Customer) => c.emailVerified);
    } else if (verifiedFilter === 'unverified') {
      filtered = filtered.filter((c: Customer) => !c.emailVerified);
    }

    // Orders filter
    if (ordersFilter === 'yes') {
      filtered = filtered.filter((c: Customer) => (c.totalOrders || 0) > 0);
    } else if (ordersFilter === 'no') {
      filtered = filtered.filter((c: Customer) => (c.totalOrders || 0) === 0);
    }

    setFilteredCustomers(filtered);
  };

  const handleViewCustomer = (customerId: string) => {
    window.location.href = `/admin/customers/${customerId}`;
  };

  const handleBlockCustomer = async (customerId: string, block: boolean) => {
    if (!confirm(`Are you sure you want to ${block ? 'block' : 'unblock'} this customer?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          action: block ? 'block' : 'unblock',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(block ? 'Customer blocked successfully' : 'Customer unblocked successfully');
        fetchCustomers();
        fetchStats();
        // Refresh dashboard stats
        fetch('/api/admin/stats').then(res => res.json()).then(data => {
          if (data.success) {
            // Dashboard will auto-refresh via its interval
          }
        });
      } else {
        alert(data.error || data.message || 'Failed to update customer');
      }
    } catch (err) {
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers?id=${customerId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Customer deleted successfully');
        fetchCustomers();
        fetchStats();
        // Refresh dashboard stats
        fetch('/api/admin/stats').then(res => res.json()).then(data => {
          if (data.success) {
            // Dashboard will auto-refresh via its interval
          }
        });
      } else {
        alert(data.error || data.message || 'Failed to delete customer');
      }
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  const handleVerifyCustomer = async (customerId: string, verify: boolean) => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          action: verify ? 'verify' : 'unverify',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(verify ? 'Customer verified successfully' : 'Customer unverified successfully');
        fetchCustomers();
        fetchStats();
      } else {
        alert(data.error || 'Failed to update customer');
      }
    } catch (err) {
      alert('Failed to update customer');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Provider', 'Verified', 'Orders', 'Spending', 'Joined', 'Last Login'];
    const rows = filteredCustomers.map((c: Customer) => [
      c.id,
      c.fullName,
      c.email,
      c.phone || '',
      c.provider,
      c.emailVerified ? 'Yes' : 'No',
      c.totalOrders || 0,
      c.totalSpending || 0,
      new Date(c.createdAt).toLocaleDateString(),
      c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : 'Never',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printCustomerList = () => {
    window.print();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setVerifiedFilter('');
    setOrdersFilter('');
  };

  const getStatusColor = (customer: Customer) => {
    if (customer.isBlocked) {
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    }
    if (customer.emailVerified) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  };

  const getStatusText = (customer: Customer) => {
    if (customer.isBlocked) return 'Blocked';
    if (customer.emailVerified) return 'Verified';
    return 'Unverified';
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
                <h1 className="text-xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-sm text-gray-500">View and manage customer accounts</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="bg-emerald-600/10 hover:bg-emerald-600/20 text-black border-black/30"
                  onClick={exportToCSV}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-emerald-600/10 hover:bg-emerald-600/20 text-black border-black/30"
                  onClick={printCustomerList}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-100"
                  onClick={() => { fetchCustomers(); fetchStats(); }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
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
                    placeholder="Search by name, email, phone, or customer ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {(statusFilter || verifiedFilter || ordersFilter) && (
                      <Badge className="ml-2 bg-emerald-600 text-black">
                        {[
                          statusFilter && 'Status',
                          verifiedFilter && 'Verified',
                          ordersFilter && 'Orders',
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                  
                  {(statusFilter || verifiedFilter || ordersFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                      <select
                        className="w-full bg-white border border-emerald-100 rounded-md p-2 text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Email Verified</label>
                      <select
                        className="w-full bg-white border border-emerald-100 rounded-md p-2 text-sm"
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Orders</label>
                      <select
                        className="w-full bg-white border border-emerald-100 rounded-md p-2 text-sm"
                        value={ordersFilter}
                        onChange={(e) => setOrdersFilter(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="yes">Has Orders</option>
                        <option value="no">No Orders</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-emerald-100 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats?.totalCustomers || 0}</p>
                  </div>
                  <User className="h-8 w-8 text-emerald-700" />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-emerald-100 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Customers</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats?.activeCustomers || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-700" />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-emerald-100 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Blocked Customers</p>
                    <p className="text-2xl font-bold text-red-400">{stats?.blockedCustomers || 0}</p>
                  </div>
                  <Ban className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border border-emerald-100 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Today</p>
                    <p className="text-2xl font-bold text-blue-400">{stats?.newToday || 0}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card className="border border-emerald-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-700">
                All Customers ({filteredCustomers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Provider</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Orders</th>
                      <th className="text-left p-4 font-medium">Spending</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-emerald-600/5">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-emerald-700" />
                            </div>
                            <div>
                              <p className="font-medium">{customer.fullName}</p>
                              <p className="text-xs text-muted-foreground">{customer.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </p>
                            <p className="text-sm flex items-center text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {customer.phone || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm capitalize">{customer.provider}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(customer)}`}>
                            {getStatusText(customer)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{customer.totalOrders || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium">PKR {(customer.totalSpending || 0).toLocaleString()}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {customer.joinedDate ? new Date(customer.joinedDate).toLocaleDateString() : (customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A')}
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
                              <DropdownMenuItem onClick={() => handleViewCustomer(customer.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVerifyCustomer(customer.id, !customer.emailVerified)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {customer.emailVerified ? 'Unverify' : 'Verify'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {customer.isBlocked ? (
                                <DropdownMenuItem onClick={() => handleBlockCustomer(customer.id, false)}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Unblock
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleBlockCustomer(customer.id, true)} className="text-red-400">
                                  <Ban className="mr-2 h-4 w-4" />
                                  Block
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No customers found
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

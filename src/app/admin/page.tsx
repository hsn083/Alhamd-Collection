'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp,
  ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle,
  CheckCircle, Clock, XCircle, BarChart3, Activity, Eye,
  Folder, Image, Shield, Ticket, AlertCircle, RotateCcw
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shipped: { label: 'Shipped', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [lowStockStats, setLowStockStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetOptions, setResetOptions] = useState({
    revenue: false,
    orders: false,
    customers: false,
    products: false,
    categories: false,
    salesAnalytics: false,
    customerStatistics: false,
    orderStatistics: false,
  });

  const clearCart = useCartStore(state => state.clearCart);
  const clearWishlist = useWishlistStore(state => state.clearWishlist);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const adminId = localStorage.getItem('adminId') || 'unknown';
      const adminUsername = localStorage.getItem('adminUsername') || 'unknown';

      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetOptions,
          adminId,
          adminUsername,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResetSuccess(true);
        setIsResetModalOpen(false);
        // Refresh dashboard data
        await fetchStats();
        // Dispatch custom event to refresh other components
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        // Reset success message after 3 seconds
        setTimeout(() => setResetSuccess(false), 3000);
      } else {
        alert('Failed to reset data: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [statsRes, customerRes, lowStockRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/customers/stats'),
        fetch('/api/admin/low-stock'),
      ]);
      const [statsData, customerData, lowStockData] = await Promise.all([statsRes.json(), customerRes.json(), lowStockRes.json()]);
      if (statsData.success) setStats(statsData.statistics);
      if (customerData.success) setCustomerStats(customerData.statistics);
      if (lowStockData.success) setLowStockStats(lowStockData.summary);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    const localAuth = localStorage.getItem('adminAuth');
    const cookieAuth = document.cookie.includes('adminAuth=true');
    if (!localAuth && !cookieAuth) {
      window.location.href = '/admin/login';
    } else {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    
    // Listen for dashboard refresh event
    const handleDashboardRefresh = () => {
      console.log('[Dashboard] Refresh event received, fetching stats...');
      fetchStats();
    };
    
    window.addEventListener('dashboard-refresh', handleDashboardRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboard-refresh', handleDashboardRefresh);
    };
  }, []);

  if (!isAuthenticated) return null;

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `PKR ${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-50 border-emerald-100',
      iconColor: 'bg-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-50 border-blue-100',
      iconColor: 'bg-blue-600',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-50 border-purple-100',
      iconColor: 'bg-purple-600',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      change: '',
      trend: 'neutral',
      icon: Package,
      color: 'bg-amber-50 border-amber-100',
      iconColor: 'bg-amber-600',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      change: '',
      trend: 'neutral',
      icon: Folder,
      color: 'bg-teal-50 border-teal-100',
      iconColor: 'bg-teal-600',
    },
  ];

  const quickActions = [
    { href: '/admin/products', label: 'Manage Products', desc: 'Add, edit, delete products', icon: Package, color: 'bg-emerald-600' },
    { href: '/admin/orders', label: 'Manage Orders', desc: 'View and update order status', icon: ShoppingCart, color: 'bg-blue-600' },
    { href: '/admin/customers', label: 'Customers', desc: 'View and manage customers', icon: Users, color: 'bg-purple-600' },
    { href: '/admin/categories', label: 'Categories', desc: 'Organize product categories', icon: Folder, color: 'bg-amber-600' },
    { href: '/admin/coupons', label: 'Coupons', desc: 'Create discount codes', icon: Ticket, color: 'bg-pink-600' },
    { href: '/admin/hero-banner', label: 'Hero Banner', desc: 'Manage homepage banner', icon: Image, color: 'bg-teal-600' },
    { href: '/admin/settings', label: 'Settings', desc: 'Configure your store', icon: Activity, color: 'bg-indigo-600' },
    { href: '/admin/settings/account', label: 'Admin Account', desc: 'Manage admin credentials', icon: Shield, color: 'bg-gray-700' },
  ];

  const recentOrders = stats?.recentOrders || [];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back! Last updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Reset Dashboard Data?</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Select what you want to reset. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.revenue}
                      onChange={(e) => setResetOptions({ ...resetOptions, revenue: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Total Revenue</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.orders}
                      onChange={(e) => setResetOptions({ ...resetOptions, orders: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Total Orders</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.customers}
                      onChange={(e) => setResetOptions({ ...resetOptions, customers: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Total Customers</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.products}
                      onChange={(e) => setResetOptions({ ...resetOptions, products: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Total Products</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.categories}
                      onChange={(e) => setResetOptions({ ...resetOptions, categories: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Categories</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.salesAnalytics}
                      onChange={(e) => setResetOptions({ ...resetOptions, salesAnalytics: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Sales Statistics</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.customerStatistics}
                      onChange={(e) => setResetOptions({ ...resetOptions, customerStatistics: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Customer Statistics</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetOptions.orderStatistics}
                      onChange={(e) => setResetOptions({ ...resetOptions, orderStatistics: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Order Statistics</span>
                  </label>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setResetOptions({
                        revenue: false,
                        orders: false,
                        customers: false,
                        products: false,
                        categories: false,
                        salesAnalytics: false,
                        customerStatistics: false,
                        orderStatistics: false,
                      });
                    }}
                    disabled={isResetting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResetData}
                    disabled={isResetting || Object.values(resetOptions).every(v => !v)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isResetting ? 'Resetting...' : 'Reset Selected'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              onClick={fetchStats}
              disabled={isLoadingStats}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {resetSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Reset completed successfully</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {metricCards.map((card) => (
            <Card key={card.title} className={`border ${card.color} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${card.iconColor} flex items-center justify-center`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  {card.trend !== 'neutral' && (
                    <span className={`flex items-center text-xs font-medium ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {card.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {card.change}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingStats ? <span className="animate-pulse bg-gray-200 rounded h-8 w-24 inline-block" /> : card.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border border-emerald-100 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-emerald-700">PKR {(stats?.analytics?.todayRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{stats?.analytics?.todayOrders || 0} orders today</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-100 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-1">This Week</p>
              <p className="text-3xl font-bold text-blue-700">PKR {(stats?.analytics?.weekRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{stats?.analytics?.weekOrders || 0} orders this week</p>
            </CardContent>
          </Card>
          <Card className="border border-purple-100 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-1">This Month</p>
              <p className="text-3xl font-bold text-purple-700">PKR {(stats?.analytics?.monthRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{stats?.analytics?.monthOrders || 0} orders this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert Widget */}
        <Card 
          className={`border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
            lowStockStats?.outOfStock > 0 
              ? 'bg-red-50 border-red-200' 
              : lowStockStats?.totalLowStock > 0 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-emerald-50 border-emerald-200'
          }`}
          onClick={() => window.location.href = '/admin/low-stock'}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  lowStockStats?.outOfStock > 0 
                    ? 'bg-red-600' 
                    : lowStockStats?.totalLowStock > 0 
                      ? 'bg-amber-600' 
                      : 'bg-emerald-600'
                }`}>
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                  <p className="text-sm text-gray-600">
                    {lowStockStats?.outOfStock > 0 
                      ? `${lowStockStats.outOfStock} products out of stock` 
                      : lowStockStats?.totalLowStock > 0 
                        ? `${lowStockStats.totalLowStock} products need attention` 
                        : 'All products are in stock'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Critical</p>
                    <p className="text-xl font-bold text-red-600">{lowStockStats?.criticalStock || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Out of Stock</p>
                    <p className="text-xl font-bold text-red-700">{lowStockStats?.outOfStock || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Low Stock</p>
                    <p className="text-xl font-bold text-amber-600">{lowStockStats?.totalLowStock || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Summary */}
        {stats?.ordersByStatus && (
          <Card className="border border-gray-100 shadow-sm mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" /> Order Status Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className={`px-3 py-3 rounded-lg border text-center ${cfg.color}`}>
                    <p className="text-lg font-bold">{stats.ordersByStatus?.[key] || 0}</p>
                    <p className="text-xs mt-0.5">{cfg.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" /> Recent Orders
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin/orders'}
                className="text-emerald-700 hover:bg-emerald-50 text-xs">
                View All <Eye className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.length > 0 ? recentOrders.slice(0, 6).map((order: any) => {
                  const sc = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
                  return (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{order.id?.slice(0, 16)}...</p>
                        <p className="text-xs text-gray-400">{order.customer || order.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">PKR {order.total?.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center text-sm text-gray-400 py-8">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Products & Customer Stats */}
          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topProducts?.slice(0, 4).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sales} sold</p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">PKR {p.revenue?.toLocaleString()}</p>
                    </div>
                  )) || <p className="text-sm text-gray-400 text-center py-4">No sales data</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" /> Customer Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total', value: customerStats?.totalCustomers || 0, color: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Active', value: customerStats?.activeCustomers || 0, color: 'bg-blue-50 text-blue-700' },
                    { label: 'New Today', value: customerStats?.newCustomersToday || 0, color: 'bg-purple-50 text-purple-700' },
                    { label: 'Blocked', value: customerStats?.blockedCustomers || 0, color: 'bg-red-50 text-red-700' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.color} rounded-lg p-3 text-center`}>
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats?.lowStockProducts?.length > 0 && (
          <Card className="border border-amber-200 bg-amber-50 shadow-sm mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Low Stock Alert ({stats.lowStockProducts.length} products)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stats.lowStockProducts.slice(0, 6).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
                    <p className="text-sm text-gray-700 truncate">{p.name}</p>
                    <Badge className="ml-2 bg-amber-100 text-amber-700 border-amber-200">{p.stock} left</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => window.location.href = action.href}
                  className="p-4 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{action.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

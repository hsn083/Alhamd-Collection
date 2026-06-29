'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  History,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Folder,
  BarChart3,
  TrendingUp,
  Activity,
  AlertCircle,
  Ticket
} from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface ResetOptions {
  revenue: boolean;
  orders: boolean;
  customers: boolean;
  products: boolean;
  categories: boolean;
  customerStatistics: boolean;
  orderStatistics: boolean;
  salesAnalytics: boolean;
  dashboardStatistics: boolean;
  lowStockStatistics: boolean;
  couponUsageStatistics: boolean;
}

interface ResetHistoryEntry {
  id: string;
  adminId: string;
  adminUsername: string;
  selectedOptions: string[];
  results: any;
  timestamp: string;
}

export default function ResetDataPage() {
  const [resetOptions, setResetOptions] = useState<ResetOptions>({
    revenue: false,
    orders: false,
    customers: false,
    products: false,
    categories: false,
    customerStatistics: false,
    orderStatistics: false,
    salesAnalytics: false,
    dashboardStatistics: false,
    lowStockStatistics: false,
    couponUsageStatistics: false,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetHistory, setResetHistory] = useState<ResetHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { success, error } = useToast();

  const resetOptionConfig = [
    { key: 'revenue', label: 'Total Revenue', description: 'Reset revenue counter, sales analytics, and revenue charts', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { key: 'orders', label: 'Total Orders', description: 'Reset order count, order statistics, and recent orders', icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { key: 'customers', label: 'Total Customers', description: 'Reset customer count and customer statistics (keeps admin accounts)', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { key: 'products', label: 'Total Products', description: 'Reset product count, product statistics, and analytics', icon: Package, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { key: 'categories', label: 'Categories', description: 'Reset category count and category statistics', icon: Folder, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { key: 'customerStatistics', label: 'Customer Statistics', description: 'Reset customer activity logs and session data', icon: Activity, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { key: 'orderStatistics', label: 'Order Statistics', description: 'Reset stock history and stock alerts', icon: BarChart3, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { key: 'salesAnalytics', label: 'Sales Analytics', description: 'Reset sales analytics data (cleared via revenue reset)', icon: TrendingUp, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { key: 'dashboardStatistics', label: 'Dashboard Statistics', description: 'Reset dashboard statistics and notifications', icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { key: 'lowStockStatistics', label: 'Low Stock Statistics', description: 'Reset low stock statistics (cleared via order statistics)', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { key: 'couponUsageStatistics', label: 'Coupon Usage Statistics', description: 'Reset coupon usage counts and discount totals', icon: Ticket, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  ];

  const selectedOptions = Object.keys(resetOptions).filter(key => resetOptions[key as keyof ResetOptions]);

  useEffect(() => {
    loadResetHistory();
  }, []);

  const loadResetHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/admin/reset');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResetHistory(data.history || []);
        }
      }
    } catch (err) {
      console.error('Failed to load reset history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Get admin info from localStorage
      const adminAuth = localStorage.getItem('adminAuth');
      const adminId = localStorage.getItem('adminId') || 'unknown';
      const adminUsername = localStorage.getItem('adminUsername') || 'unknown';

      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetOptions,
          adminId,
          adminUsername,
        }),
      });

      const data = await response.json();

      if (data.success) {
        success('Data reset successfully!');
        setShowConfirmModal(false);
        
        // Reset all checkboxes
        setResetOptions({
          revenue: false,
          orders: false,
          customers: false,
          products: false,
          categories: false,
          customerStatistics: false,
          orderStatistics: false,
          salesAnalytics: false,
          dashboardStatistics: false,
          lowStockStatistics: false,
          couponUsageStatistics: false,
        });

        // Reload reset history
        loadResetHistory();

        // Trigger dashboard refresh by emitting a custom event
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      } else {
        error(data.error || 'Failed to reset data');
      }
    } catch (err) {
      console.error('Failed to reset data:', err);
      error('Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  const handleConfirmReset = () => {
    if (selectedOptions.length === 0) {
      error('Please select at least one option to reset');
      return;
    }
    setShowConfirmModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  className="text-gray-500 hover:bg-gray-50 mb-4"
                  onClick={() => window.location.href = '/admin/settings'}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Settings
                </Button>
                <h1 className="text-xl font-bold text-gray-900">Reset Data</h1>
                <p className="text-sm text-gray-500">Safely reset selected statistics and data</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Warning Card */}
          <Card className="border border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Important Warning</h3>
                  <p className="text-sm text-red-700 leading-relaxed">
                    This action will permanently reset the selected data. Make sure you have backups if needed. 
                    Admin accounts will not be deleted when resetting customers. This action cannot be undone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Select Data to Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resetOptionConfig.map((option) => (
                  <div
                    key={option.key}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      resetOptions[option.key as keyof ResetOptions]
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setResetOptions(prev => ({
                      ...prev,
                      [option.key]: !prev[option.key as keyof ResetOptions]
                    }))}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <option.icon className={`h-5 w-5 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={resetOptions[option.key as keyof ResetOptions]}
                            onChange={() => setResetOptions(prev => ({
                              ...prev,
                              [option.key]: !prev[option.key as keyof ResetOptions]
                            }))}
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {selectedOptions.length === 0 
                    ? 'No options selected' 
                    : `${selectedOptions.length} option${selectedOptions.length > 1 ? 's' : ''} selected`}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setResetOptions({
                      revenue: false,
                      orders: false,
                      customers: false,
                      products: false,
                      categories: false,
                      customerStatistics: false,
                      orderStatistics: false,
                      salesAnalytics: false,
                      dashboardStatistics: false,
                      lowStockStatistics: false,
                      couponUsageStatistics: false,
                    })}
                    disabled={selectedOptions.length === 0}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={handleConfirmReset}
                    disabled={selectedOptions.length === 0 || isResetting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Reset Selected Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600" />
                Reset History
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadResetHistory}
                disabled={isLoadingHistory}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : resetHistory.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No reset history yet</p>
              ) : (
                <div className="space-y-3">
                  {resetHistory.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{entry.adminUsername}</p>
                          <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.selectedOptions.map((option) => (
                          <span
                            key={option}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Warning!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              Selected data will be permanently reset. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Selected options:</p>
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map((option) => (
                <span
                  key={option}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {option}
                </span>
              ))}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Selected Data'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

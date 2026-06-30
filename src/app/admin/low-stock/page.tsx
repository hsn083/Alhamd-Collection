'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, Package, Search, Filter, Download, RefreshCw,
  Plus, Minus, Edit, Eye, Calendar
} from 'lucide-react';

export default function LowStockPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showStockModal, setShowStockModal] = useState(false);

  useEffect(() => {
    const localAuth = localStorage.getItem('adminAuth');
    const cookieAuth = document.cookie.includes('adminAuth=true');
    if (!localAuth && !cookieAuth) {
      window.location.href = '/admin/login';
    } else {
      setIsAuthenticated(true);
      fetchLowStockData();
    }
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const fetchLowStockData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/low-stock');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching low stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.stockStatus === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleStockUpdate = (product: any) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' },
      low_stock: { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      in_stock: { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    };
    const configItem = config[status] || config.in_stock;
    return <Badge className={configItem.color}>{configItem.label}</Badge>;
  };

  const exportCSV = () => {
    const headers = ['Product Name', 'Category', 'Current Stock', 'Threshold', 'Status', 'Last Updated'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.category,
      p.stockQuantity,
      p.lowStockThreshold,
      p.stockStatus,
      new Date(p.updatedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Low Stock Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor and manage products with low inventory
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchLowStockData}
              disabled={isLoading}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={exportCSV}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-red-100 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-700">{summary?.outOfStock || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-amber-100 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Critical Stock (≤5)</p>
                  <p className="text-3xl font-bold text-amber-700">{summary?.criticalStock || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-600 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-emerald-100 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Low Stock</p>
                  <p className="text-3xl font-bold text-emerald-700">{summary?.totalLowStock || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                <option value="mens-clothing">Men's Clothing</option>
                <option value="womens-clothing">Women's Clothing</option>
                <option value="shoes">Shoes</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Status</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Low Stock Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No low stock products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Current Stock</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Threshold</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Updated</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <div className="relative w-12 h-12">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 capitalize">
                          {product.category?.replace(/-/g, ' ')}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold ${
                            product.stockQuantity === 0 
                              ? 'text-red-600' 
                              : product.stockQuantity <= 5 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{product.lowStockThreshold}</td>
                        <td className="py-4 px-4">{getStatusBadge(product.stockStatus)}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStockUpdate(product)}
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Update Modal */}
        {showStockModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Update Stock - {selectedProduct.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <StockUpdateForm
                  product={selectedProduct}
                  onClose={() => setShowStockModal(false)}
                  onSuccess={() => {
                    setShowStockModal(false);
                    fetchLowStockData();
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StockUpdateForm({ product, onClose, onSuccess }: any) {
  const [quantity, setQuantity] = useState(product.stockQuantity);
  const [changeType, setChangeType] = useState<'increase' | 'decrease' | 'adjustment'>('adjustment');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          changeType,
          reason,
          changedBy: 'admin',
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch (error) {
      alert('Failed to update stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Current Stock</label>
        <p className="text-2xl font-bold text-gray-900">{product.stockQuantity}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">New Quantity</label>
        <Input
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Change Type</label>
        <select
          value={changeType}
          onChange={(e) => setChangeType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="adjustment">Adjustment</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Reason</label>
        <Input
          placeholder="e.g., Restock, Damage, Return, etc."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? 'Updating...' : 'Update Stock'}
        </Button>
      </div>
    </form>
  );
}

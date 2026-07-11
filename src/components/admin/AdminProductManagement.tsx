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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Package,
  Image as ImageIcon,
  DollarSign,
  Box,
  ChevronDown,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  status: 'active' | 'inactive';
  category?: {
    name: string;
  };
  brand?: string;
  images: string[];
  newArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
}

interface AdminProductManagementProps {
  products: Product[];
  onUpdate: (productIds: string[], updates: Partial<Product>) => Promise<void>;
  onDelete: (productIds: string[]) => Promise<void>;
  onExport?: () => void;
  onCreate?: () => void;
}

export function AdminProductManagement({
  products,
  onUpdate,
  onDelete,
  onExport,
  onCreate,
}: AdminProductManagementProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    status: '',
    price: '',
    discountPrice: '',
    stock: '',
    newArrival: false,
    isBestSeller: false,
    isFeatured: false,
  });

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  ) as string[];

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.slug.toLowerCase().includes(searchLower) ||
        (product.brand && product.brand.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && product.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && product.category?.name !== categoryFilter) {
      return false;
    }

    // Stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'in_stock':
          if (product.stock <= 0) return false;
          break;
        case 'low_stock':
          if (product.stock > 5 || product.stock <= 0) return false;
          break;
        case 'out_of_stock':
          if (product.stock > 0) return false;
          break;
      }
    }

    return true;
  });

  // Select all
  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((product) => product._id)));
    }
  };

  // Select individual product
  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Bulk update
  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select at least one product');
      return;
    }

    setIsProcessing(true);
    try {
      const updates: any = {};
      if (bulkEditData.status) updates.status = bulkEditData.status;
      if (bulkEditData.price) updates.price = parseFloat(bulkEditData.price);
      if (bulkEditData.discountPrice) updates.discountPrice = parseFloat(bulkEditData.discountPrice);
      if (bulkEditData.stock) updates.stock = parseInt(bulkEditData.stock);
      updates.newArrival = bulkEditData.newArrival;
      updates.isBestSeller = bulkEditData.isBestSeller;
      updates.isFeatured = bulkEditData.isFeatured;

      await onUpdate(Array.from(selectedProducts), updates);
      toast.success(`Updated ${selectedProducts.size} products`);
      setSelectedProducts(new Set());
      setBulkEditOpen(false);
      setBulkEditData({
        status: '',
        price: '',
        discountPrice: '',
        stock: '',
        newArrival: false,
        isBestSeller: false,
        isFeatured: false,
      });
    } catch (error) {
      toast.error('Failed to update products');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select at least one product');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await onDelete(Array.from(selectedProducts));
      toast.success(`Deleted ${selectedProducts.size} products`);
      setSelectedProducts(new Set());
    } catch (error) {
      toast.error('Failed to delete products');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock <= 5) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Product Management</CardTitle>
          <div className="flex gap-2">
            {selectedProducts.size > 0 && (
              <>
                <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Bulk Edit ({selectedProducts.size})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Bulk Edit Products</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={bulkEditData.status}
                          onValueChange={(value) => setBulkEditData({ ...bulkEditData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty to keep current"
                          value={bulkEditData.price}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, price: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Discount Price</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty to keep current"
                          value={bulkEditData.discountPrice}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, discountPrice: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty to keep current"
                          value={bulkEditData.stock}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, stock: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="newArrival"
                          checked={bulkEditData.newArrival}
                          onCheckedChange={(checked) => setBulkEditData({ ...bulkEditData, newArrival: checked as boolean })}
                        />
                        <Label htmlFor="newArrival">New Arrival</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isBestSeller"
                          checked={bulkEditData.isBestSeller}
                          onCheckedChange={(checked) => setBulkEditData({ ...bulkEditData, isBestSeller: checked as boolean })}
                        />
                        <Label htmlFor="isBestSeller">Best Seller</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isFeatured"
                          checked={bulkEditData.isFeatured}
                          onCheckedChange={(checked) => setBulkEditData({ ...bulkEditData, isFeatured: checked as boolean })}
                        />
                        <Label htmlFor="isFeatured">Featured</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkUpdate} disabled={isProcessing}>
                        Update Products
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
                  Delete ({selectedProducts.size})
                </Button>
              </>
            )}
            {onCreate && (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
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
              placeholder="Search products..."
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
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setStockFilter('all');
              setSelectedProducts(new Set());
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
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 font-medium text-sm">Product</th>
                <th className="text-left p-3 font-medium text-sm">Category</th>
                <th className="text-left p-3 font-medium text-sm">Price</th>
                <th className="text-left p-3 font-medium text-sm">Stock</th>
                <th className="text-left p-3 font-medium text-sm">Status</th>
                <th className="text-left p-3 font-medium text-sm">Badges</th>
                <th className="text-left p-3 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedProducts.has(product._id)}
                        onCheckedChange={() => handleSelectProduct(product._id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-gray-500 text-xs">{product.brand || 'No brand'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{product.category?.name || 'N/A'}</td>
                    <td className="p-3 text-sm">
                      <div>
                        <div className="font-medium">
                          PKR {product.price.toLocaleString()}
                        </div>
                        {product.discountPrice && (
                          <div className="text-gray-500 text-xs line-through">
                            PKR {product.discountPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{getStockBadge(product.stock)}</td>
                    <td className="p-3">
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {product.newArrival && (
                          <Badge variant="outline" className="text-xs">New</Badge>
                        )}
                        {product.isBestSeller && (
                          <Badge variant="outline" className="text-xs">Best Seller</Badge>
                        )}
                        {product.isFeatured && (
                          <Badge variant="outline" className="text-xs">Featured</Badge>
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
                            onClick={() => window.location.href = `/admin/products/${product._id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.location.href = `/product/${product.slug}`}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            View
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
              Showing {filteredProducts.length} of {products.length} products
            </span>
            {selectedProducts.size > 0 && (
              <span>
                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

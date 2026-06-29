'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
// Footer replaced by AdminLayout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Folder,
  ArrowLeft,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { Category } from '@/types';
import { useToast, ToastContainer } from '@/components/ui/toast';

export default function AdminCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryImage, setCategoryImage] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const itemsPerPage = 10;
  const { success, error } = useToast();

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories?updateCounts=true');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryImage(category.image);
    setShowAddForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories?id=${categoryId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          success('Category deleted successfully!');
          fetchCategories();
        } else {
          error(result.error || 'Failed to delete category');
        }
      } catch (err) {
        error('Failed to delete category');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) {
      error('Please select categories to delete');
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedCategories.size} categories?`)) {
      try {
        const ids = Array.from(selectedCategories);
        for (const id of ids) {
          await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
        }
        setSelectedCategories(new Set());
        success('Categories deleted successfully!');
        fetchCategories();
      } catch (err) {
        error('Failed to delete categories');
      }
    }
  };

  const handleAddCategory = () => {
    setShowAddForm(true);
    setEditingCategory(null);
    setCategoryImage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', 'categories');

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          setCategoryImage(result.data.optimizedPath);
          success('Image uploaded successfully');
        } else {
          error(`Failed to upload image: ${result.error}`);
        }
      } catch (err) {
        error('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById('category-image-upload')?.click();
  };

  const removeImage = () => {
    setCategoryImage('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const categoryData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      image: categoryImage,
      description: formData.get('description') as string,
      status: formData.get('status') as 'active' | 'inactive',
      displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
    };

    try {
      const url = editingCategory ? '/api/categories' : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory 
        ? { ...categoryData, id: editingCategory.id }
        : categoryData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        success(editingCategory ? 'Category updated successfully!' : 'Category added successfully!');
        setShowAddForm(false);
        setEditingCategory(null);
        setCategoryImage('');
        fetchCategories();
      } else {
        error(result.error || 'Failed to save category');
      }
    } catch (err) {
      error('Failed to save category');
    }
  };

  const toggleSelectAll = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(filteredCategories.map(cat => cat.id)));
    }
  };

  const toggleSelectCategory = (id: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCategories(newSelected);
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                <h1 className="text-xl font-bold text-gray-900">Category Management</h1>
                <p className="text-sm text-gray-500">Manage your product categories</p>
              </div>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 font-semibold" onClick={handleAddCategory}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Add/Edit Category Form */}
          {showAddForm && (
            <Card className="mb-6 border border-emerald-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-emerald-700">{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <Label>Category Image</Label>
                    <div className="mt-2 border-2 border-dashed border-emerald-100 rounded-lg p-6 bg-white">
                      <div className="flex flex-col items-center justify-center">
                        {categoryImage ? (
                          <div className="relative w-full h-48 mb-4">
                            <img 
                              src={categoryImage} 
                              alt="Category preview" 
                              className="w-full h-full object-contain rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                         ) : (
                          <>
                            <Upload className="h-12 w-12 text-emerald-700 mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">Upload category image</p>
                          </>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="category-image-upload"
                        />
                        <Button type="button" className="bg-emerald-600 text-black hover:bg-emerald-500 font-semibold" onClick={triggerFileInput} disabled={isUploading}>
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Image
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Category Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Men's Clothing"
                        defaultValue={editingCategory?.name || ''}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug (URL-friendly)</Label>
                      <Input
                        id="slug"
                        name="slug"
                        placeholder="e.g., gaming-accessories"
                        defaultValue={editingCategory?.slug || ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select name="status" defaultValue={editingCategory?.status || 'active'}>
                        <SelectTrigger className="bg-white border-emerald-100">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-emerald-100">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        name="displayOrder"
                        type="number"
                        placeholder="e.g., 1"
                        defaultValue={editingCategory?.displayOrder || 0}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Category description"
                      defaultValue={editingCategory?.description || ''}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                      <Input
                        id="metaTitle"
                        name="metaTitle"
                        placeholder="SEO meta title"
                        defaultValue={editingCategory?.metaTitle || ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                      <Input
                        id="metaDescription"
                        name="metaDescription"
                        placeholder="SEO meta description"
                        defaultValue={editingCategory?.metaDescription || ''}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-emerald-600 text-black hover:bg-emerald-500 font-semibold">
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowAddForm(false);
                      setEditingCategory(null);
                      setCategoryImage('');
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <Card className="mb-6 border border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search categories..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-40 bg-white border-emerald-100">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-emerald-100">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategories.size > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={handleBulkDelete}
                    className="ml-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedCategories.size})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories Table */}
          <Card className="border border-emerald-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-700">
                All Categories ({filteredCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
              ) : (
                <>
                
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium w-12">
                            <Checkbox
                              checked={selectedCategories.size === filteredCategories.length && filteredCategories.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </th>
                          <th className="text-left p-4 font-medium">Category</th>
                          <th className="text-left p-4 font-medium">Slug</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Products</th>
                          <th className="text-left p-4 font-medium">Order</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCategories.map((category) => (
                          <tr key={category.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <Checkbox
                                checked={selectedCategories.has(category.id)}
                                onCheckedChange={() => toggleSelectCategory(category.id)}
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100">
                                  {category.image ? (
                                    <img
                                      src={category.image}
                                      alt={category.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Folder className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{category.name}</p>
                                  <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm font-mono">{category.slug}</td>
                            <td className="p-4">
                              <Badge className={category.status === 'active' ? 'bg-emerald-600' : 'bg-gray-500'}>
                                {category.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm">{category.productCount}</td>
                            <td className="p-4 text-sm">{category.displayOrder}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="icon" className="hover:bg-emerald-100 hover:text-emerald-700" onClick={() => handleEditCategory(category)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-500/20" onClick={() => handleDeleteCategory(category.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredCategories.length)}{" "}
                        of {filteredCategories.length} categories
                      </p>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
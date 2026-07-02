'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Copy,
  GripVertical
} from 'lucide-react';
import Link from 'next/link';

interface HeroBanner {
  _id: string;
  desktopImage: string;
  mobileImage: string;
  heading: string;
  subHeading: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  textAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
  overlayColor: string;
  overlayOpacity: number;
  headingColor: string;
  subHeadingColor: string;
  descriptionColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;
  buttonBorderRadius: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch banners
  useEffect(() => {
    fetchBanners();
  }, []);

  // Filter banners based on search and active status
  useEffect(() => {
    let filtered = banners;

    if (searchQuery) {
      filtered = filtered.filter(
        (banner) =>
          banner.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
          banner.subHeading.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter === 'active') {
      filtered = filtered.filter((banner) => banner.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter((banner) => !banner.isActive);
    }

    setFilteredBanners(filtered);
  }, [banners, searchQuery, activeFilter]);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/hero-banners');
      const data = await response.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      showNotification('error', 'Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (bannerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/hero-banners/${bannerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        fetchBanners();
        showNotification('success', `Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        showNotification('error', data.error || 'Failed to update banner');
      }
    } catch (error) {
      console.error('Error toggling banner:', error);
      showNotification('error', 'Failed to update banner');
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/hero-banners/${bannerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchBanners();
        showNotification('success', 'Banner deleted successfully');
      } else {
        showNotification('error', data.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      showNotification('error', 'Failed to delete banner');
    }
  };

  const duplicateBanner = async (bannerId: string) => {
    try {
      const response = await fetch(`/api/hero-banners/${bannerId}`);
      const data = await response.json();
      
      if (data.success) {
        const originalBanner = data.banner;
        const { _id, createdAt, updatedAt, ...bannerData } = originalBanner;
        
        const createResponse = await fetch('/api/hero-banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bannerData,
            heading: `${bannerData.heading} (Copy)`,
          }),
        });

        const createData = await createResponse.json();
        if (createData.success) {
          fetchBanners();
          showNotification('success', 'Banner duplicated successfully');
        } else {
          showNotification('error', createData.error || 'Failed to duplicate banner');
        }
      }
    } catch (error) {
      console.error('Error duplicating banner:', error);
      showNotification('error', 'Failed to duplicate banner');
    }
  };

  const moveBanner = async (bannerId: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex((b) => b._id === bannerId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[currentIndex].displayOrder;
    newBanners[currentIndex].displayOrder = newBanners[targetIndex].displayOrder;
    newBanners[targetIndex].displayOrder = temp;

    try {
      await Promise.all([
        fetch(`/api/hero-banners/${newBanners[currentIndex]._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayOrder: newBanners[currentIndex].displayOrder }),
        }),
        fetch(`/api/hero-banners/${newBanners[targetIndex]._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayOrder: newBanners[targetIndex].displayOrder }),
        }),
      ]);

      fetchBanners();
      showNotification('success', 'Banner order updated');
    } catch (error) {
      console.error('Error moving banner:', error);
      showNotification('error', 'Failed to update banner order');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...filteredBanners];
    const draggedItem = newBanners[draggedIndex];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedItem);

    setFilteredBanners(newBanners);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    const bannerIds = filteredBanners.map(b => b._id);
    
    try {
      const response = await fetch('/api/hero-banners/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerIds }),
      });

      if (response.ok) {
        fetchBanners();
        showNotification('success', 'Banner order updated');
      }
    } catch (error) {
      console.error('Error reordering banners:', error);
      showNotification('error', 'Failed to update banner order');
    }

    setDraggedIndex(null);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center text-muted-foreground">Loading hero banners...</div>
          </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Hero Banner Manager</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your homepage hero slider banners</p>
              </div>
              <Link href="/admin/hero-banners/new">
                <Button className="bg-emerald-600 text-black hover:bg-emerald-500 font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Banner
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter */}
          <Card className="mb-6 border border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search banners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveFilter('all')}
                    className={activeFilter === 'all' ? 'bg-emerald-600 text-black' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={activeFilter === 'active' ? 'default' : 'outline'}
                    onClick={() => setActiveFilter('active')}
                    className={activeFilter === 'active' ? 'bg-emerald-600 text-black' : ''}
                  >
                    Active
                  </Button>
                  <Button
                    variant={activeFilter === 'inactive' ? 'default' : 'outline'}
                    onClick={() => setActiveFilter('inactive')}
                    className={activeFilter === 'inactive' ? 'bg-emerald-600 text-black' : ''}
                  >
                    Inactive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banners List */}
          <div className="space-y-4">
            {filteredBanners.length === 0 ? (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-12 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No banners found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || activeFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first hero banner'}
                  </p>
                  {!searchQuery && activeFilter === 'all' && (
                    <Link href="/admin/hero-banners/new">
                      <Button className="bg-emerald-600 text-black hover:bg-emerald-500 font-semibold">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Banner
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredBanners.map((banner, index) => (
                <Card
                  key={banner._id}
                  className="border border-gray-200 bg-white hover:border-emerald-200 transition-colors"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Drag Handle */}
                      <div className="hidden md:flex items-center">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      </div>

                      {/* Thumbnail */}
                      <div className="w-full md:w-48 flex-shrink-0">
                        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1920/800' }}>
                          <img
                            src={banner.desktopImage}
                            alt={banner.heading}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{banner.heading}</h3>
                            <p className="text-sm text-gray-500 truncate">{banner.subHeading}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                banner.isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                          <span>Order: {banner.displayOrder}</span>
                          <span>Position: {banner.textAlignment}</span>
                          <span>Vertical: {banner.verticalAlignment}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/admin/hero-banners/${banner._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(banner._id, banner.isActive)}
                          >
                            {banner.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateBanner(banner._id)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveBanner(banner._id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveBanner(banner._id, 'down')}
                            disabled={index === filteredBanners.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBanner(banner._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
              notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-80">
              ×
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

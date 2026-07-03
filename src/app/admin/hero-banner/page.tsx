'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
// Footer replaced by AdminLayout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Upload,
  X,
  Save,
  Eye,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { HeroBanner } from '@/types';
import SliderSettingsPanel from '@/components/admin/SliderSettingsPanel';

export default function AdminHeroBannerPage() {
  const [heroBanner, setHeroBanner] = useState<HeroBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bannerImage, setBannerImage] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('banners');

  // Fetch hero banner data
  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        const response = await fetch('/api/hero-banner');
        const data = await response.json();
        if (data.success) {
          setHeroBanner(data.heroBanner);
          setBannerImage(data.heroBanner.desktopImage);
        }
      } catch (error) {
        console.error('Error fetching hero banner:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroBanner();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          setBannerImage(result.data.optimizedPath);
        } else {
          alert(`Failed to upload image: ${result.error}`);
        }
      } catch (error) {
        alert('Failed to upload image');
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById('banner-image-upload')?.click();
  };

  const removeImage = () => {
    setBannerImage('');
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    const formData = new FormData(e.currentTarget);
    const bannerData = {
      desktopImage: bannerImage,
      mobileImage: bannerImage,
      heading: formData.get('heading') as string,
      subHeading: formData.get('subheading') as string,
      buttonText: formData.get('buttonText') as string,
      buttonUrl: formData.get('buttonLink') as string,
      isActive: formData.get('isActive') === 'on',
    };

    try {
      const response = await fetch('/api/hero-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      });

      const result = await response.json();
      if (result.success) {
        setHeroBanner(result.heroBanner);
        setNotification({
          type: 'success',
          message: 'Hero banner updated successfully!',
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to update hero banner',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update hero banner',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout><div className="p-8">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center text-muted-foreground">Loading hero banner settings...</div>
          </div>
        </div></AdminLayout>
    );
  }

  return (
      <AdminLayout><div className="p-8">
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
                <h1 className="text-xl font-bold text-gray-900">Hero Banner Management</h1>
                <p className="text-sm text-gray-500">Manage your homepage hero banner</p>
              </div>
              <Button 
                variant="outline" 
                className="bg-emerald-600/10 hover:bg-emerald-600/20 text-black border-black/30 font-semibold"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="banners">
                <ImageIcon className="mr-2 h-4 w-4" />
                Banner Management
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Slider Settings
              </TabsTrigger>
            </TabsList>

            {/* Banner Management Tab */}
            <TabsContent value="banners">
              {/* Preview Mode */}
              {previewMode && heroBanner && (
                <Card className="mb-8 border border-emerald-100 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden rounded-lg">
                      {bannerImage ? (
                        <img
                          src={bannerImage}
                          alt="Hero Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-green-600/10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-4">🎮</div>
                            <p className="text-muted-foreground">No banner image uploaded</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 via-black/50 to-transparent flex items-end p-8">
                        <div className="max-w-3xl">
                          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            {heroBanner.heading}
                          </h1>
                          <p className="text-lg md:text-xl text-white/90 mb-6">
                            {heroBanner.subHeading}
                          </p>
                          {heroBanner.isActive && (
                            <Button 
                              size="lg" 
                              className="bg-emerald-600 text-black hover:bg-emerald-500 font-bold transition-all hover:scale-105"
                              onClick={() => window.location.href = heroBanner.buttonUrl}
                            >
                              {heroBanner.buttonText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edit Form */}
              {!previewMode && (
                <Card className="border border-emerald-100 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">Edit Hero Banner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                      {/* Image Upload */}
                      <div>
                        <Label>Banner Image *</Label>
                        <div className="mt-2 border-2 border-dashed border-emerald-100 rounded-lg p-6 bg-white">
                          <div className="flex flex-col items-center justify-center">
                            {bannerImage ? (
                              <div className="relative w-full h-64 mb-4">
                                <img 
                                  src={bannerImage} 
                                  alt="Banner preview" 
                                  className="w-full h-full object-cover rounded"
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
                                <p className="text-sm text-muted-foreground mb-2">Upload banner image (Recommended: 1920x600px)</p>
                              </>
                            )}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="banner-image-upload"
                            />
                            <Button type="button" className="bg-emerald-600 text-black hover:bg-emerald-500 font-semibold" onClick={triggerFileInput}>
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Image
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="heading">Heading *</Label>
                          <Input
                            id="heading"
                            name="heading"
                            placeholder="e.g., PREMIUM CLOTHING & SHOES COLLECTION"
                            defaultValue={heroBanner?.heading || ''}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="buttonText">Button Text *</Label>
                          <Input
                            id="buttonText"
                            name="buttonText"
                            placeholder="e.g., Shop Now"
                            defaultValue={heroBanner?.buttonText || ''}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subheading">Subheading *</Label>
                        <Input
                          id="subheading"
                          name="subheading"
                          placeholder="e.g., Discover premium clothing and footwear..."
                          defaultValue={heroBanner?.subHeading || ''}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="buttonLink">Button Link *</Label>
                        <Input
                          id="buttonLink"
                          name="buttonLink"
                          placeholder="e.g., /shop"
                          defaultValue={heroBanner?.buttonUrl || ''}
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          name="isActive"
                          defaultChecked={heroBanner?.isActive}
                        />
                        <Label htmlFor="isActive" className="text-sm cursor-pointer">
                          Show banner on homepage
                        </Label>
                      </div>

                      <div className="flex space-x-4">
                        <Button type="submit" className="bg-emerald-600 text-black hover:bg-emerald-500 font-semibold" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Save className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setPreviewMode(true)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Slider Settings Tab */}
            <TabsContent value="settings">
              <SliderSettingsPanel />
            </TabsContent>
          </Tabs>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === 'success' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-80"
            >
              ×
            </button>
          </div>
        )}
      </div></AdminLayout>
  );
}

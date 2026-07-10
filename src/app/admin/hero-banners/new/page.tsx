'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, X, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BannerFormData {
  desktopImage: string;
  mobileImage: string;
  heading: string;
  subHeading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  textAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
  overlayColor: string;
  overlayOpacity: number;
  headingColor: string;
  subHeadingColor: string;
  descriptionColor: string;
  badgeColor: string;
  badgeTextColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  buttonHoverBorderColor: string;
  buttonBorderRadius: number;
  buttonShadow: string;
  buttonHoverShadow: string;
  bannerBackgroundColor: string;
  contentBoxBackgroundColor: string;
  contentBoxOpacity: number;
  useGradientOverlay: boolean;
  gradientColors: string[];
  fontFamily: string;
  headingFontSize: number;
  subHeadingFontSize: number;
  descriptionFontSize: number;
  buttonFontSize: number;
  fontWeight: string;
  letterSpacing: number;
  lineHeight: number;
  textShadow: string;
  textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  contentBoxWidth: number;
  contentBoxPadding: number;
  contentBoxBorderRadius: number;
  contentBoxBlur: number;
  contentBoxShadow: string;
  contentBoxMaxWidth: number;
  isActive: boolean;
}

export default function NewHeroBannerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'desktop' | 'mobile' | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<BannerFormData>({
    desktopImage: '',
    mobileImage: '',
    heading: '',
    subHeading: '',
    description: '',
    buttonText: '',
    buttonUrl: '',
    textAlignment: 'left',
    verticalAlignment: 'center',
    overlayColor: '#000000',
    overlayOpacity: 50,
    headingColor: '#ffffff',
    subHeadingColor: '#ffffff',
    descriptionColor: '#ffffff',
    badgeColor: '',
    badgeTextColor: '',
    buttonBackgroundColor: '#10b981',
    buttonTextColor: '#ffffff',
    buttonBorderColor: '',
    buttonHoverBackgroundColor: '#059669',
    buttonHoverTextColor: '#ffffff',
    buttonHoverBorderColor: '',
    buttonBorderRadius: 8,
    buttonShadow: '',
    buttonHoverShadow: '',
    bannerBackgroundColor: '#f3f4f6',
    contentBoxBackgroundColor: '',
    contentBoxOpacity: 0,
    useGradientOverlay: false,
    gradientColors: ['#000000', '#000000'],
    fontFamily: '',
    headingFontSize: 0,
    subHeadingFontSize: 0,
    descriptionFontSize: 0,
    buttonFontSize: 0,
    fontWeight: '',
    letterSpacing: 0,
    lineHeight: 0,
    textShadow: '',
    textTransform: 'none',
    contentBoxWidth: 0,
    contentBoxPadding: 0,
    contentBoxBorderRadius: 0,
    contentBoxBlur: 0,
    contentBoxShadow: '',
    contentBoxMaxWidth: 0,
    isActive: true,
  });

  const handleInputChange = (field: keyof BannerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('error', 'Invalid file type. Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotification('error', 'File size exceeds 5MB limit');
      return;
    }

    setIsUploading(true);
    setUploadType(type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', type);

    try {
      const response = await fetch('/api/upload/hero-banner', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        if (type === 'desktop') {
          setFormData(prev => ({ ...prev, desktopImage: data.data.url }));
        } else {
          setFormData(prev => ({ ...prev, mobileImage: data.data.url }));
        }
        showNotification('success', 'Image uploaded successfully');
      } else {
        showNotification('error', data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('error', 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadType(null);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'desktop' | 'mobile') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file, type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.desktopImage || !formData.mobileImage) {
      showNotification('error', 'Please upload both desktop and mobile images');
      return;
    }
    if (!formData.heading || !formData.subHeading || !formData.buttonText || !formData.buttonUrl) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/hero-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Banner created successfully');
        setTimeout(() => {
          router.push('/admin/hero-banners');
        }, 1000);
      } else {
        showNotification('error', data.error || 'Failed to create banner');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      showNotification('error', 'Failed to create banner');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 overflow-x-hidden">
        <div className="container mx-auto px-4 max-w-full">
          <div className="mb-6">
            <Link href="/admin/hero-banners">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Banners
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add New Hero Banner</h1>
            <p className="text-sm text-gray-500 mt-1">Create a new banner for your homepage slider</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Images Section */}
                <Card className="w-full overflow-hidden">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle>Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6">
                    {/* Desktop Image */}
                    <div>
                      <Label>Desktop Image (Recommended: 1920×800)</Label>
                      <div
                        className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, 'desktop')}
                      >
                        {formData.desktopImage ? (
                          <div className="relative">
                            <img
                              src={formData.desktopImage}
                              alt="Desktop preview"
                              className="w-full h-32 sm:h-48 object-cover rounded max-w-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData(prev => ({ ...prev, desktopImage: '' }))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Drag & drop or click to upload
                            </p>
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="mt-2 w-full"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, 'desktop');
                              }}
                            />
                          </div>
                        )}
                        {isUploading && uploadType === 'desktop' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Image */}
                    <div>
                      <Label>Mobile Image (Recommended: 768×960)</Label>
                      <div
                        className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, 'mobile')}
                      >
                        {formData.mobileImage ? (
                          <div className="relative">
                            <img
                              src={formData.mobileImage}
                              alt="Mobile preview"
                              className="w-full h-32 sm:h-48 object-cover rounded max-w-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData(prev => ({ ...prev, mobileImage: '' }))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Drag & drop or click to upload
                            </p>
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="mt-2 w-full"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, 'mobile');
                              }}
                            />
                          </div>
                        )}
                        {isUploading && uploadType === 'mobile' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Section */}
                <Card className="w-full overflow-hidden">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6">
                    <div>
                      <Label htmlFor="heading">Heading *</Label>
                      <Input
                        id="heading"
                        value={formData.heading}
                        onChange={(e) => handleInputChange('heading', e.target.value)}
                        placeholder="Enter banner heading"
                        required
                        className="w-full min-w-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subHeading">Sub Heading *</Label>
                      <Input
                        id="subHeading"
                        value={formData.subHeading}
                        onChange={(e) => handleInputChange('subHeading', e.target.value)}
                        placeholder="Enter sub heading"
                        required
                        className="w-full min-w-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter description (optional)"
                        rows={3}
                        className="w-full min-w-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="buttonText">Button Text *</Label>
                      <Input
                        id="buttonText"
                        value={formData.buttonText}
                        onChange={(e) => handleInputChange('buttonText', e.target.value)}
                        placeholder="e.g., Shop Now"
                        required
                        className="w-full min-w-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="buttonUrl">Button URL *</Label>
                      <Input
                        id="buttonUrl"
                        value={formData.buttonUrl}
                        onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                        placeholder="e.g., /products"
                        required
                        className="w-full min-w-0"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Layout Section */}
                <Card className="w-full overflow-hidden">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle>Layout</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6">
                    <div>
                      <Label>Text Alignment</Label>
                      <Select
                        value={formData.textAlignment}
                        onValueChange={(value: any) => handleInputChange('textAlignment', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Vertical Alignment</Label>
                      <Select
                        value={formData.verticalAlignment}
                        onValueChange={(value: any) => handleInputChange('verticalAlignment', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Colors & Preview */}
              <div className="space-y-6">
                {/* Colors Section */}
                <Card className="w-full overflow-hidden">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle>Colors & Styling</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="headingColor">Heading Color</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Input
                            id="headingColor"
                            type="color"
                            value={formData.headingColor}
                            onChange={(e) => handleInputChange('headingColor', e.target.value)}
                            className="w-full sm:w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.headingColor}
                            onChange={(e) => handleInputChange('headingColor', e.target.value)}
                            className="w-full min-w-0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subHeadingColor">Sub Heading Color</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Input
                            id="subHeadingColor"
                            type="color"
                            value={formData.subHeadingColor}
                            onChange={(e) => handleInputChange('subHeadingColor', e.target.value)}
                            className="w-full sm:w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.subHeadingColor}
                            onChange={(e) => handleInputChange('subHeadingColor', e.target.value)}
                            className="w-full min-w-0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="descriptionColor">Description Color</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Input
                            id="descriptionColor"
                            type="color"
                            value={formData.descriptionColor}
                            onChange={(e) => handleInputChange('descriptionColor', e.target.value)}
                            className="w-full sm:w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.descriptionColor}
                            onChange={(e) => handleInputChange('descriptionColor', e.target.value)}
                            className="w-full min-w-0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="overlayColor">Overlay Color</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Input
                            id="overlayColor"
                            type="color"
                            value={formData.overlayColor}
                            onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                            className="w-full sm:w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.overlayColor}
                            onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                            className="w-full min-w-0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="badgeColor">Badge Color</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Input
                            id="badgeColor"
                            type="color"
                            value={formData.badgeColor}
                            onChange={(e) => handleInputChange('badgeColor', e.target.value)}
                            className="w-full sm:w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.badgeColor}
                            onChange={(e) => handleInputChange('badgeColor', e.target.value)}
                            className="w-full min-w-0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="badgeTextColor">Badge Text Color</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Input
                            id="badgeTextColor"
                            type="color"
                            value={formData.badgeTextColor}
                            onChange={(e) => handleInputChange('badgeTextColor', e.target.value)}
                            className="w-full sm:w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.badgeTextColor}
                            onChange={(e) => handleInputChange('badgeTextColor', e.target.value)}
                            className="w-full min-w-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          id="useGradientOverlay"
                          checked={formData.useGradientOverlay}
                          onChange={(e) => handleInputChange('useGradientOverlay', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="useGradientOverlay">Use Gradient Overlay</Label>
                      </div>
                      {formData.useGradientOverlay && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="gradientColor1">Gradient Color 1</Label>
                            <Input
                              id="gradientColor1"
                              type="color"
                              value={formData.gradientColors[0] || '#000000'}
                              onChange={(e) => {
                                const newColors = [...formData.gradientColors];
                                newColors[0] = e.target.value;
                                handleInputChange('gradientColors', newColors);
                              }}
                              className="w-full h-10 p-1 mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="gradientColor2">Gradient Color 2</Label>
                            <Input
                              id="gradientColor2"
                              type="color"
                              value={formData.gradientColors[1] || '#000000'}
                              onChange={(e) => {
                                const newColors = [...formData.gradientColors];
                                newColors[1] = e.target.value;
                                handleInputChange('gradientColors', newColors);
                              }}
                              className="w-full h-10 p-1 mt-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="overlayOpacity">Overlay Opacity: {formData.overlayOpacity}%</Label>
                      <Input
                        id="overlayOpacity"
                        type="range"
                        min="0"
                        max="100"
                        value={formData.overlayOpacity}
                        onChange={(e) => handleInputChange('overlayOpacity', parseInt(e.target.value))}
                        className="mt-2 w-full"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <Label className="mb-3 block">Button Settings</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buttonBackgroundColor">Background</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="buttonBackgroundColor"
                              type="color"
                              value={formData.buttonBackgroundColor}
                              onChange={(e) => handleInputChange('buttonBackgroundColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.buttonBackgroundColor}
                              onChange={(e) => handleInputChange('buttonBackgroundColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="buttonTextColor">Text</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="buttonTextColor"
                              type="color"
                              value={formData.buttonTextColor}
                              onChange={(e) => handleInputChange('buttonTextColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.buttonTextColor}
                              onChange={(e) => handleInputChange('buttonTextColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="buttonBorderColor">Border</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="buttonBorderColor"
                              type="color"
                              value={formData.buttonBorderColor}
                              onChange={(e) => handleInputChange('buttonBorderColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.buttonBorderColor}
                              onChange={(e) => handleInputChange('buttonBorderColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="buttonHoverBackgroundColor">Hover Background</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="buttonHoverBackgroundColor"
                              type="color"
                              value={formData.buttonHoverBackgroundColor}
                              onChange={(e) => handleInputChange('buttonHoverBackgroundColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.buttonHoverBackgroundColor}
                              onChange={(e) => handleInputChange('buttonHoverBackgroundColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="buttonHoverTextColor">Hover Text</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="buttonHoverTextColor"
                              type="color"
                              value={formData.buttonHoverTextColor}
                              onChange={(e) => handleInputChange('buttonHoverTextColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.buttonHoverTextColor}
                              onChange={(e) => handleInputChange('buttonHoverTextColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="buttonHoverBorderColor">Hover Border</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="buttonHoverBorderColor"
                              type="color"
                              value={formData.buttonHoverBorderColor}
                              onChange={(e) => handleInputChange('buttonHoverBorderColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.buttonHoverBorderColor}
                              onChange={(e) => handleInputChange('buttonHoverBorderColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="buttonBorderRadius">Border Radius: {formData.buttonBorderRadius}px</Label>
                          <Input
                            id="buttonBorderRadius"
                            type="range"
                            min="0"
                            max="30"
                            value={formData.buttonBorderRadius}
                            onChange={(e) => handleInputChange('buttonBorderRadius', parseInt(e.target.value))}
                            className="mt-2 w-full"
                          />
                        </div>
                        <div>
                          <Label htmlFor="buttonShadow">Shadow</Label>
                          <Input
                            id="buttonShadow"
                            value={formData.buttonShadow}
                            onChange={(e) => handleInputChange('buttonShadow', e.target.value)}
                            placeholder="e.g., 0 4px 6px rgba(0,0,0,0.1)"
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="buttonHoverShadow">Hover Shadow</Label>
                          <Input
                            id="buttonHoverShadow"
                            value={formData.buttonHoverShadow}
                            onChange={(e) => handleInputChange('buttonHoverShadow', e.target.value)}
                            placeholder="e.g., 0 6px 8px rgba(0,0,0,0.2)"
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Background */}
                    <div className="border-t pt-4">
                      <Label className="mb-3 block">Background</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bannerBackgroundColor">Banner Background</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="bannerBackgroundColor"
                              type="color"
                              value={formData.bannerBackgroundColor}
                              onChange={(e) => handleInputChange('bannerBackgroundColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.bannerBackgroundColor}
                              onChange={(e) => handleInputChange('bannerBackgroundColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="contentBoxBackgroundColor">Content Box Background</Label>
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input
                              id="contentBoxBackgroundColor"
                              type="color"
                              value={formData.contentBoxBackgroundColor}
                              onChange={(e) => handleInputChange('contentBoxBackgroundColor', e.target.value)}
                              className="w-full sm:w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.contentBoxBackgroundColor}
                              onChange={(e) => handleInputChange('contentBoxBackgroundColor', e.target.value)}
                              className="w-full min-w-0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="contentBoxOpacity">Content Box Opacity: {formData.contentBoxOpacity}%</Label>
                          <Input
                            id="contentBoxOpacity"
                            type="range"
                            min="0"
                            max="100"
                            value={formData.contentBoxOpacity}
                            onChange={(e) => handleInputChange('contentBoxOpacity', parseInt(e.target.value))}
                            className="mt-2 w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="border-t pt-4">
                      <Label className="mb-3 block">Typography</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fontFamily">Font Family</Label>
                          <Input
                            id="fontFamily"
                            value={formData.fontFamily}
                            onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                            placeholder="e.g., Inter, Arial"
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fontWeight">Font Weight</Label>
                          <Select
                            value={formData.fontWeight}
                            onValueChange={(value) => handleInputChange('fontWeight', value)}
                          >
                            <SelectTrigger className="mt-2 w-full">
                              <SelectValue placeholder="Select weight" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="semibold">Semibold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="headingFontSize">Heading Font Size: {formData.headingFontSize}px</Label>
                          <Input
                            id="headingFontSize"
                            type="number"
                            value={formData.headingFontSize}
                            onChange={(e) => handleInputChange('headingFontSize', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="subHeadingFontSize">Sub Heading Font Size: {formData.subHeadingFontSize}px</Label>
                          <Input
                            id="subHeadingFontSize"
                            type="number"
                            value={formData.subHeadingFontSize}
                            onChange={(e) => handleInputChange('subHeadingFontSize', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="descriptionFontSize">Description Font Size: {formData.descriptionFontSize}px</Label>
                          <Input
                            id="descriptionFontSize"
                            type="number"
                            value={formData.descriptionFontSize}
                            onChange={(e) => handleInputChange('descriptionFontSize', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="buttonFontSize">Button Font Size: {formData.buttonFontSize}px</Label>
                          <Input
                            id="buttonFontSize"
                            type="number"
                            value={formData.buttonFontSize}
                            onChange={(e) => handleInputChange('buttonFontSize', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="letterSpacing">Letter Spacing: {formData.letterSpacing}px</Label>
                          <Input
                            id="letterSpacing"
                            type="number"
                            value={formData.letterSpacing}
                            onChange={(e) => handleInputChange('letterSpacing', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lineHeight">Line Height: {formData.lineHeight}</Label>
                          <Input
                            id="lineHeight"
                            type="number"
                            step="0.1"
                            value={formData.lineHeight}
                            onChange={(e) => handleInputChange('lineHeight', parseFloat(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="textShadow">Text Shadow</Label>
                          <Input
                            id="textShadow"
                            value={formData.textShadow}
                            onChange={(e) => handleInputChange('textShadow', e.target.value)}
                            placeholder="e.g., 2px 2px 4px rgba(0,0,0,0.5)"
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="textTransform">Text Transform</Label>
                          <Select
                            value={formData.textTransform}
                            onValueChange={(value: any) => handleInputChange('textTransform', value)}
                          >
                            <SelectTrigger className="mt-2 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="uppercase">Uppercase</SelectItem>
                              <SelectItem value="lowercase">Lowercase</SelectItem>
                              <SelectItem value="capitalize">Capitalize</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="border-t pt-4">
                      <Label className="mb-3 block">Content Box</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contentBoxWidth">Width: {formData.contentBoxWidth}px</Label>
                          <Input
                            id="contentBoxWidth"
                            type="number"
                            value={formData.contentBoxWidth}
                            onChange={(e) => handleInputChange('contentBoxWidth', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contentBoxPadding">Padding: {formData.contentBoxPadding}px</Label>
                          <Input
                            id="contentBoxPadding"
                            type="number"
                            value={formData.contentBoxPadding}
                            onChange={(e) => handleInputChange('contentBoxPadding', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contentBoxBorderRadius">Border Radius: {formData.contentBoxBorderRadius}px</Label>
                          <Input
                            id="contentBoxBorderRadius"
                            type="number"
                            value={formData.contentBoxBorderRadius}
                            onChange={(e) => handleInputChange('contentBoxBorderRadius', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contentBoxBlur">Blur: {formData.contentBoxBlur}px</Label>
                          <Input
                            id="contentBoxBlur"
                            type="number"
                            value={formData.contentBoxBlur}
                            onChange={(e) => handleInputChange('contentBoxBlur', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contentBoxMaxWidth">Max Width: {formData.contentBoxMaxWidth}px</Label>
                          <Input
                            id="contentBoxMaxWidth"
                            type="number"
                            value={formData.contentBoxMaxWidth}
                            onChange={(e) => handleInputChange('contentBoxMaxWidth', parseInt(e.target.value) || 0)}
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contentBoxShadow">Shadow</Label>
                          <Input
                            id="contentBoxShadow"
                            value={formData.contentBoxShadow}
                            onChange={(e) => handleInputChange('contentBoxShadow', e.target.value)}
                            placeholder="e.g., 0 4px 6px rgba(0,0,0,0.1)"
                            className="mt-2 w-full min-w-0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isActive">Active (show on homepage)</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card className="w-full overflow-hidden">
                  <CardHeader className="px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <CardTitle>Live Preview</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {showPreview ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </CardHeader>
                  {showPreview && (
                    <CardContent className="px-4 sm:px-6">
                      <div
                        className="relative rounded-lg overflow-hidden w-full"
                        style={{
                          aspectRatio: '1920/800',
                          backgroundColor: '#f3f4f6',
                        }}
                      >
                        {formData.desktopImage ? (
                          <img
                            src={formData.desktopImage}
                            alt="Preview"
                            className="w-full h-full object-cover max-w-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-500">Upload an image to preview</span>
                          </div>
                        )}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: formData.overlayColor,
                            opacity: formData.overlayOpacity / 100,
                          }}
                        />
                        <div
                          className={`absolute inset-0 flex p-8 ${
                            formData.verticalAlignment === 'top'
                              ? 'items-start'
                              : formData.verticalAlignment === 'bottom'
                              ? 'items-end'
                              : 'items-center'
                          }`}
                        >
                          <div
                            className={`max-w-2xl ${
                              formData.textAlignment === 'center'
                                ? 'text-center mx-auto'
                                : formData.textAlignment === 'right'
                                ? 'text-right ml-auto'
                                : 'text-left'
                            }`}
                          >
                            <h2
                              className="text-3xl font-bold mb-2"
                              style={{ color: formData.headingColor }}
                            >
                              {formData.heading || 'Heading'}
                            </h2>
                            <p
                              className="text-xl mb-4"
                              style={{ color: formData.subHeadingColor }}
                            >
                              {formData.subHeading || 'Sub Heading'}
                            </p>
                            {formData.description && (
                              <p
                                className="text-lg mb-4"
                                style={{ color: formData.descriptionColor }}
                              >
                                {formData.description}
                              </p>
                            )}
                            {formData.buttonText && (
                              <button
                                className="px-6 py-3 font-semibold"
                                style={{
                                  backgroundColor: formData.buttonBackgroundColor,
                                  color: formData.buttonTextColor,
                                  borderRadius: `${formData.buttonBorderRadius}px`,
                                }}
                              >
                                {formData.buttonText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="submit"
                    className="w-full sm:flex-1 bg-emerald-600 text-black hover:bg-emerald-500"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Banner
                  </Button>
                  <Link href="/admin/hero-banners" className="w-full sm:flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
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

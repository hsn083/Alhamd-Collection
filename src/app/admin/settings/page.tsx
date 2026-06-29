'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Save,
  Building2,
  Globe,
  DollarSign,
  MapPin,
  CreditCard,
  Share2,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { useSettingsStore } from '@/store/settingsStore';
import type { AllSettings } from '@/lib/settings';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();
  const refreshSettings = useSettingsStore(state => state.refreshSettings);

  const [settings, setSettings] = useState<AllSettings | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        success('Settings saved successfully!');
        setSettings(data.settings);
        // Trigger global settings refresh to update all components
        await refreshSettings();
      } else {
        error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateGeneral = (key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        general: { ...settings.general, [key]: value }
      });
    }
  };

  const updateSEO = (key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        seo: { ...settings.seo, [key]: value }
      });
    }
  };

  const updateShipping = (key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        shipping: { ...settings.shipping, [key]: value }
      });
    }
  };

  const updateProvince = (province: string, key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        provinces: {
          ...settings.provinces,
          [province]: { ...settings.provinces[province], [key]: value }
        }
      });
    }
  };

  const updatePayment = (method: string, key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        payments: {
          ...settings.payments,
          [method]: { ...settings.payments[method as keyof typeof settings.payments], [key]: value }
        }
      });
    }
  };

  const updateSocialMedia = (platform: string, key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        socialMedia: {
          ...settings.socialMedia,
          [platform]: { ...settings.socialMedia[platform as keyof typeof settings.socialMedia], [key]: value }
        }
      });
    }
  };

  if (isLoading || !settings) {
    return (
      <AdminLayout>
        <ToastContainer />
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ToastContainer />
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
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your website settings and preferences</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 font-semibold" 
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-emerald-200">
              <TabsTrigger value="general" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Building2 className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="seo" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Globe className="mr-2 h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <DollarSign className="mr-2 h-4 w-4" />
                Shipping
              </TabsTrigger>
              <TabsTrigger value="provinces" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <MapPin className="mr-2 h-4 w-4" />
                Provinces
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <CreditCard className="mr-2 h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black">
                <Share2 className="mr-2 h-4 w-4" />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="reset-data" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Data
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Site Name</Label>
                      <Input 
                        value={settings.general.siteName}
                        onChange={(e) => updateGeneral('siteName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Site Tagline</Label>
                      <Input 
                        value={settings.general.siteTagline}
                        onChange={(e) => updateGeneral('siteTagline', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Email</Label>
                      <Input 
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateGeneral('contactEmail', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input 
                        value={settings.general.phoneNumber}
                        onChange={(e) => updateGeneral('phoneNumber', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>WhatsApp Number</Label>
                      <Input 
                        value={settings.general.whatsappNumber}
                        onChange={(e) => updateGeneral('whatsappNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Input 
                        value={settings.general.currency}
                        onChange={(e) => updateGeneral('currency', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Company Address</Label>
                    <Textarea 
                      value={settings.general.companyAddress}
                      onChange={(e) => updateGeneral('companyAddress', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Footer Information</Label>
                    <Textarea 
                      value={settings.general.footerInfo}
                      onChange={(e) => updateGeneral('footerInfo', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Timezone</Label>
                      <Input 
                        value={settings.general.timezone}
                        onChange={(e) => updateGeneral('timezone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Language</Label>
                      <Input 
                        value={settings.general.language}
                        onChange={(e) => updateGeneral('language', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => updateGeneral('maintenanceMode', checked)}
                    />
                    <Label>Maintenance Mode</Label>
                  </div>
                  {settings.general.maintenanceMode && (
                    <div>
                      <Label>Maintenance Message</Label>
                      <Textarea 
                        value={settings.general.maintenanceMessage}
                        onChange={(e) => updateGeneral('maintenanceMessage', e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Meta Title</Label>
                    <Input 
                      value={settings.seo.metaTitle}
                      onChange={(e) => updateSEO('metaTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea 
                      value={settings.seo.metaDescription}
                      onChange={(e) => updateSEO('metaDescription', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Meta Keywords</Label>
                    <Input 
                      value={settings.seo.metaKeywords}
                      onChange={(e) => updateSEO('metaKeywords', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>OG Title</Label>
                      <Input 
                        value={settings.seo.ogTitle}
                        onChange={(e) => updateSEO('ogTitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>OG Image</Label>
                      <Input 
                        value={settings.seo.ogImage}
                        onChange={(e) => updateSEO('ogImage', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>OG Description</Label>
                    <Textarea 
                      value={settings.seo.ogDescription}
                      onChange={(e) => updateSEO('ogDescription', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Robots</Label>
                    <Input 
                      value={settings.seo.robots}
                      onChange={(e) => updateSEO('robots', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Canonical URL</Label>
                    <Input 
                      value={settings.seo.canonicalUrl}
                      onChange={(e) => updateSEO('canonicalUrl', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Settings */}
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Free Shipping Threshold</Label>
                      <Input 
                        type="number"
                        value={settings.shipping.freeShippingThreshold}
                        onChange={(e) => updateShipping('freeShippingThreshold', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Standard Shipping Cost</Label>
                      <Input 
                        type="number"
                        value={settings.shipping.standardShippingCost}
                        onChange={(e) => updateShipping('standardShippingCost', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Express Shipping Cost</Label>
                      <Input 
                        type="number"
                        value={settings.shipping.expressShippingCost}
                        onChange={(e) => updateShipping('expressShippingCost', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Delivery Time</Label>
                      <Input 
                        value={settings.shipping.deliveryTime}
                        onChange={(e) => updateShipping('deliveryTime', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Shipping Rules</Label>
                    <Textarea 
                      value={settings.shipping.shippingRules}
                      onChange={(e) => updateShipping('shippingRules', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Province Settings */}
            <TabsContent value="provinces">
              <Card>
                <CardHeader>
                  <CardTitle>Province Shipping Zones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.provinces).map(([province, data]) => (
                    <div key={province} className="border p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{province}</h3>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={data.status === 'active'}
                            onCheckedChange={(checked) => updateProvince(province, 'status', checked ? 'active' : 'inactive')}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Standard Cost</Label>
                          <Input 
                            type="number"
                            value={data.standard}
                            onChange={(e) => updateProvince(province, 'standard', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Express Cost</Label>
                          <Input 
                            type="number"
                            value={data.express}
                            onChange={(e) => updateProvince(province, 'express', Number(e.target.value))}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={data.codAvailable}
                            onCheckedChange={(checked) => updateProvince(province, 'codAvailable', checked)}
                          />
                          <Label>COD Available</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.payments).map(([method, data]) => (
                    <div key={method} className="border p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{data.displayName}</h3>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={data.enabled}
                            onCheckedChange={(checked) => updatePayment(method, 'enabled', checked)}
                          />
                          <Label>Enabled</Label>
                        </div>
                      </div>
                      <div>
                        <Label>Instructions</Label>
                        <Textarea 
                          value={data.instructions}
                          onChange={(e) => updatePayment(method, 'instructions', e.target.value)}
                        />
                      </div>
                      {(method === 'jazzcash' || method === 'easypaisa') && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Account Title</Label>
                              <Input 
                                value={data.accountTitle || ''}
                                onChange={(e) => updatePayment(method, 'accountTitle', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Account Number</Label>
                              <Input 
                                value={data.accountNumber || ''}
                                onChange={(e) => updatePayment(method, 'accountNumber', e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Receiver Name</Label>
                            <Input 
                              value={data.receiverName || ''}
                              onChange={(e) => updatePayment(method, 'receiverName', e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      {method === 'bankTransfer' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Account Title</Label>
                              <Input 
                                value={data.accountTitle || ''}
                                onChange={(e) => updatePayment(method, 'accountTitle', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Account Number</Label>
                              <Input 
                                value={data.accountNumber || ''}
                                onChange={(e) => updatePayment(method, 'accountNumber', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Bank Name</Label>
                              <Input 
                                value={data.bankName || ''}
                                onChange={(e) => updatePayment(method, 'bankName', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>IBAN</Label>
                              <Input 
                                value={data.iban || ''}
                                onChange={(e) => updatePayment(method, 'iban', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Branch Name</Label>
                              <Input 
                                value={data.branchName || ''}
                                onChange={(e) => updatePayment(method, 'branchName', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Receiver Name</Label>
                              <Input 
                                value={data.receiverName || ''}
                                onChange={(e) => updatePayment(method, 'receiverName', e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Media Settings */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.socialMedia).map(([platform, data]) => (
                    <div key={platform} className="border p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold capitalize">{platform}</h3>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={data.enabled}
                            onCheckedChange={(checked) => updateSocialMedia(platform, 'enabled', checked)}
                          />
                          <Label>Enabled</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>URL</Label>
                          <Input 
                            value={data.url}
                            onChange={(e) => updateSocialMedia(platform, 'url', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Handle</Label>
                          <Input 
                            value={data.handle}
                            onChange={(e) => updateSocialMedia(platform, 'handle', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reset Data */}
            <TabsContent value="reset-data">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Reset Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <RotateCcw className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Access the comprehensive data reset system to safely reset selected statistics and data.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/admin/settings/reset-data'}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Go to Reset Data Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

interface SliderSettings {
  autoPlay: boolean;
  autoPlayDelay: number;
  transitionSpeed: number;
  animationDuration: number;
  animationType: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow';
  infiniteLoop: boolean;
  pauseOnHover: boolean;
  pauseOnTabHidden: boolean;
  touchSwipe: boolean;
  keyboardNavigation: boolean;
  mouseWheelNavigation: boolean;
  showArrows: boolean;
  arrowBackgroundColor: string;
  arrowIconColor: string;
  arrowHoverBackgroundColor: string;
  arrowHoverIconColor: string;
  showDots: boolean;
  dotColor: string;
  activeDotColor: string;
  dotSize: number;
  showProgressBar: boolean;
  progressColor: string;
  desktopHeight: number;
  desktopHeadingFontSize: number;
  desktopDescriptionFontSize: number;
  desktopContentPosition: 'left' | 'center' | 'right';
  tabletHeight: number;
  tabletHeadingFontSize: number;
  tabletDescriptionFontSize: number;
  tabletContentPosition: 'left' | 'center' | 'right';
  mobileHeight: number;
  mobileHeadingFontSize: number;
  mobileDescriptionFontSize: number;
  mobileContentPosition: 'left' | 'center' | 'right';
}

export default function HeroBannerSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [settings, setSettings] = useState<SliderSettings>({
    autoPlay: true,
    autoPlayDelay: 5000,
    transitionSpeed: 500,
    animationDuration: 500,
    animationType: 'slide',
    infiniteLoop: true,
    pauseOnHover: true,
    pauseOnTabHidden: false,
    touchSwipe: true,
    keyboardNavigation: true,
    mouseWheelNavigation: false,
    showArrows: true,
    arrowBackgroundColor: 'rgba(255, 255, 255, 0.2)',
    arrowIconColor: '#ffffff',
    arrowHoverBackgroundColor: 'rgba(255, 255, 255, 0.4)',
    arrowHoverIconColor: '#ffffff',
    showDots: true,
    dotColor: 'rgba(255, 255, 255, 0.5)',
    activeDotColor: '#ffffff',
    dotSize: 12,
    showProgressBar: false,
    progressColor: '#10b981',
    desktopHeight: 750,
    desktopHeadingFontSize: 60,
    desktopDescriptionFontSize: 24,
    desktopContentPosition: 'left',
    tabletHeight: 650,
    tabletHeadingFontSize: 48,
    tabletDescriptionFontSize: 20,
    tabletContentPosition: 'left',
    mobileHeight: 550,
    mobileHeadingFontSize: 36,
    mobileDescriptionFontSize: 16,
    mobileContentPosition: 'left',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/hero-banner-settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SliderSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/hero-banner-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Settings saved successfully');
      } else {
        showNotification('error', data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
            <div className="text-center text-muted-foreground">Loading settings...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link href="/admin/hero-banners">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Banners
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Hero Slider Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure slider behavior, animations, and responsive settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auto Play & Animation */}
            <Card>
              <CardHeader>
                <CardTitle>Auto Play & Animation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoPlay"
                    checked={settings.autoPlay}
                    onChange={(e) => handleInputChange('autoPlay', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="autoPlay">Auto Play</Label>
                </div>

                <div>
                  <Label htmlFor="autoPlayDelay">Auto Play Delay: {settings.autoPlayDelay}ms</Label>
                  <Input
                    id="autoPlayDelay"
                    type="number"
                    min="1000"
                    max="30000"
                    value={settings.autoPlayDelay}
                    onChange={(e) => handleInputChange('autoPlayDelay', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="transitionSpeed">Transition Speed: {settings.transitionSpeed}ms</Label>
                  <Input
                    id="transitionSpeed"
                    type="number"
                    min="100"
                    max="2000"
                    value={settings.transitionSpeed}
                    onChange={(e) => handleInputChange('transitionSpeed', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="animationDuration">Animation Duration: {settings.animationDuration}ms</Label>
                  <Input
                    id="animationDuration"
                    type="number"
                    min="100"
                    max="2000"
                    value={settings.animationDuration}
                    onChange={(e) => handleInputChange('animationDuration', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="animationType">Animation Type</Label>
                  <Select
                    value={settings.animationType}
                    onValueChange={(value: any) => handleInputChange('animationType', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="flip">Flip</SelectItem>
                      <SelectItem value="cube">Cube</SelectItem>
                      <SelectItem value="coverflow">Coverflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="infiniteLoop"
                    checked={settings.infiniteLoop}
                    onChange={(e) => handleInputChange('infiniteLoop', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="infiniteLoop">Infinite Loop</Label>
                </div>
              </CardContent>
            </Card>

            {/* Loop & Pause */}
            <Card>
              <CardHeader>
                <CardTitle>Loop & Pause</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pauseOnHover"
                    checked={settings.pauseOnHover}
                    onChange={(e) => handleInputChange('pauseOnHover', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="pauseOnHover">Pause on Hover</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pauseOnTabHidden"
                    checked={settings.pauseOnTabHidden}
                    onChange={(e) => handleInputChange('pauseOnTabHidden', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="pauseOnTabHidden">Pause on Browser Tab Hidden</Label>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="touchSwipe"
                    checked={settings.touchSwipe}
                    onChange={(e) => handleInputChange('touchSwipe', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="touchSwipe">Touch Swipe</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="keyboardNavigation"
                    checked={settings.keyboardNavigation}
                    onChange={(e) => handleInputChange('keyboardNavigation', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="keyboardNavigation">Keyboard Navigation</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mouseWheelNavigation"
                    checked={settings.mouseWheelNavigation}
                    onChange={(e) => handleInputChange('mouseWheelNavigation', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="mouseWheelNavigation">Mouse Wheel Navigation</Label>
                </div>
              </CardContent>
            </Card>

            {/* Arrows */}
            <Card>
              <CardHeader>
                <CardTitle>Arrows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showArrows"
                    checked={settings.showArrows}
                    onChange={(e) => handleInputChange('showArrows', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="showArrows">Show Arrows</Label>
                </div>

                <div>
                  <Label htmlFor="arrowBackgroundColor">Arrow Background Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="arrowBackgroundColor"
                      type="color"
                      value={settings.arrowBackgroundColor}
                      onChange={(e) => handleInputChange('arrowBackgroundColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.arrowBackgroundColor}
                      onChange={(e) => handleInputChange('arrowBackgroundColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="arrowIconColor">Arrow Icon Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="arrowIconColor"
                      type="color"
                      value={settings.arrowIconColor}
                      onChange={(e) => handleInputChange('arrowIconColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.arrowIconColor}
                      onChange={(e) => handleInputChange('arrowIconColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="arrowHoverBackgroundColor">Arrow Hover Background</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="arrowHoverBackgroundColor"
                      type="color"
                      value={settings.arrowHoverBackgroundColor}
                      onChange={(e) => handleInputChange('arrowHoverBackgroundColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.arrowHoverBackgroundColor}
                      onChange={(e) => handleInputChange('arrowHoverBackgroundColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="arrowHoverIconColor">Arrow Hover Icon Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="arrowHoverIconColor"
                      type="color"
                      value={settings.arrowHoverIconColor}
                      onChange={(e) => handleInputChange('arrowHoverIconColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.arrowHoverIconColor}
                      onChange={(e) => handleInputChange('arrowHoverIconColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dots */}
            <Card>
              <CardHeader>
                <CardTitle>Dots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showDots"
                    checked={settings.showDots}
                    onChange={(e) => handleInputChange('showDots', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="showDots">Show Dots</Label>
                </div>

                <div>
                  <Label htmlFor="dotColor">Dot Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="dotColor"
                      type="color"
                      value={settings.dotColor}
                      onChange={(e) => handleInputChange('dotColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.dotColor}
                      onChange={(e) => handleInputChange('dotColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="activeDotColor">Active Dot Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="activeDotColor"
                      type="color"
                      value={settings.activeDotColor}
                      onChange={(e) => handleInputChange('activeDotColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.activeDotColor}
                      onChange={(e) => handleInputChange('activeDotColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dotSize">Dot Size: {settings.dotSize}px</Label>
                  <Input
                    id="dotSize"
                    type="number"
                    min="8"
                    max="24"
                    value={settings.dotSize}
                    onChange={(e) => handleInputChange('dotSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showProgressBar"
                    checked={settings.showProgressBar}
                    onChange={(e) => handleInputChange('showProgressBar', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="showProgressBar">Show Progress Bar</Label>
                </div>

                <div>
                  <Label htmlFor="progressColor">Progress Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="progressColor"
                      type="color"
                      value={settings.progressColor}
                      onChange={(e) => handleInputChange('progressColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.progressColor}
                      onChange={(e) => handleInputChange('progressColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Desktop Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="desktopHeight">Height: {settings.desktopHeight}px</Label>
                  <Input
                    id="desktopHeight"
                    type="number"
                    min="300"
                    max="1000"
                    value={settings.desktopHeight}
                    onChange={(e) => handleInputChange('desktopHeight', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="desktopHeadingFontSize">Heading Font Size: {settings.desktopHeadingFontSize}px</Label>
                  <Input
                    id="desktopHeadingFontSize"
                    type="number"
                    min="24"
                    max="120"
                    value={settings.desktopHeadingFontSize}
                    onChange={(e) => handleInputChange('desktopHeadingFontSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="desktopDescriptionFontSize">Description Font Size: {settings.desktopDescriptionFontSize}px</Label>
                  <Input
                    id="desktopDescriptionFontSize"
                    type="number"
                    min="12"
                    max="48"
                    value={settings.desktopDescriptionFontSize}
                    onChange={(e) => handleInputChange('desktopDescriptionFontSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="desktopContentPosition">Content Position</Label>
                  <Select
                    value={settings.desktopContentPosition}
                    onValueChange={(value: any) => handleInputChange('desktopContentPosition', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tablet Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Tablet Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tabletHeight">Height: {settings.tabletHeight}px</Label>
                  <Input
                    id="tabletHeight"
                    type="number"
                    min="300"
                    max="800"
                    value={settings.tabletHeight}
                    onChange={(e) => handleInputChange('tabletHeight', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="tabletHeadingFontSize">Heading Font Size: {settings.tabletHeadingFontSize}px</Label>
                  <Input
                    id="tabletHeadingFontSize"
                    type="number"
                    min="20"
                    max="96"
                    value={settings.tabletHeadingFontSize}
                    onChange={(e) => handleInputChange('tabletHeadingFontSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="tabletDescriptionFontSize">Description Font Size: {settings.tabletDescriptionFontSize}px</Label>
                  <Input
                    id="tabletDescriptionFontSize"
                    type="number"
                    min="10"
                    max="40"
                    value={settings.tabletDescriptionFontSize}
                    onChange={(e) => handleInputChange('tabletDescriptionFontSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="tabletContentPosition">Content Position</Label>
                  <Select
                    value={settings.tabletContentPosition}
                    onValueChange={(value: any) => handleInputChange('tabletContentPosition', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Mobile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mobileHeight">Height: {settings.mobileHeight}px</Label>
                  <Input
                    id="mobileHeight"
                    type="number"
                    min="200"
                    max="600"
                    value={settings.mobileHeight}
                    onChange={(e) => handleInputChange('mobileHeight', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="mobileHeadingFontSize">Heading Font Size: {settings.mobileHeadingFontSize}px</Label>
                  <Input
                    id="mobileHeadingFontSize"
                    type="number"
                    min="16"
                    max="72"
                    value={settings.mobileHeadingFontSize}
                    onChange={(e) => handleInputChange('mobileHeadingFontSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="mobileDescriptionFontSize">Description Font Size: {settings.mobileDescriptionFontSize}px</Label>
                  <Input
                    id="mobileDescriptionFontSize"
                    type="number"
                    min="10"
                    max="32"
                    value={settings.mobileDescriptionFontSize}
                    onChange={(e) => handleInputChange('mobileDescriptionFontSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="mobileContentPosition">Content Position</Label>
                  <Select
                    value={settings.mobileContentPosition}
                    onValueChange={(value: any) => handleInputChange('mobileContentPosition', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <Button
              onClick={handleSave}
              className="bg-emerald-600 text-black hover:bg-emerald-500"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Settings
            </Button>
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

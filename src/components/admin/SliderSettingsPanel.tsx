'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Save, RotateCcw, Eye, EyeOff, Settings, Layout, Navigation, Type, Zap, Monitor, Tablet, Smartphone, Layers, Palette } from 'lucide-react';

interface SliderSettings {
  // General
  enabled: boolean;
  
  // Auto Play
  autoPlay: boolean;
  autoPlayDelay: number;
  
  // Animation
  transitionSpeed: number;
  animationDuration: number;
  animationType: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow';
  animationEasing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
  // Loop & Pause
  infiniteLoop: boolean;
  pauseOnHover: boolean;
  pauseOnTabHidden: boolean;
  
  // Navigation
  touchSwipe: boolean;
  keyboardNavigation: boolean;
  mouseWheelNavigation: boolean;
  
  // Arrows
  showArrows: boolean;
  arrowSize: number;
  arrowBorderRadius: number;
  arrowBackgroundColor: string;
  arrowIconColor: string;
  arrowHoverBackgroundColor: string;
  arrowHoverIconColor: string;
  
  // Dots
  showDots: boolean;
  dotSize: number;
  dotColor: string;
  activeDotColor: string;
  dotSpacing: number;
  
  // Progress
  showProgressBar: boolean;
  progressColor: string;
  progressHeight: number;
  
  // Responsive - Desktop
  desktopHeight: number;
  desktopHeadingFontSize: number;
  desktopSubheadingFontSize: number;
  desktopDescriptionFontSize: number;
  desktopButtonFontSize: number;
  desktopContentPosition: 'left' | 'center' | 'right';
  desktopVerticalPosition: 'top' | 'center' | 'bottom';
  
  // Responsive - Tablet
  tabletHeight: number;
  tabletHeadingFontSize: number;
  tabletSubheadingFontSize: number;
  tabletDescriptionFontSize: number;
  tabletButtonFontSize: number;
  tabletContentPosition: 'left' | 'center' | 'right';
  tabletVerticalPosition: 'top' | 'center' | 'bottom';
  
  // Responsive - Mobile
  mobileHeight: number;
  mobileHeadingFontSize: number;
  mobileSubheadingFontSize: number;
  mobileDescriptionFontSize: number;
  mobileButtonFontSize: number;
  mobileContentPosition: 'left' | 'center' | 'right';
  mobileVerticalPosition: 'top' | 'center' | 'bottom';
  
  // Performance
  lazyLoadImages: boolean;
  imageQuality: number;
  preloadFirstSlide: boolean;
  enableImageOptimization: boolean;
  
  // Overlay Settings
  overlayColor: string;
  overlayOpacity: number;
  
  // Text Colors
  headingColor: string;
  subheadingColor: string;
  descriptionColor: string;
  
  // Primary Button Colors
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  buttonBorderColor: string;
  buttonBorderRadius: number;
  
  // Secondary Button Colors
  secondaryButtonBackgroundColor: string;
  secondaryButtonTextColor: string;
  secondaryButtonHoverBackgroundColor: string;
  secondaryButtonHoverTextColor: string;
  secondaryButtonBorderColor: string;
  secondaryButtonBorderRadius: number;
  
  // Slider Background
  sliderBackgroundColor: string;
}

interface SliderSettingsPanelProps {
  onSettingsChange?: (settings: SliderSettings) => void;
}

const defaultSettings: SliderSettings = {
  enabled: true,
  autoPlay: true,
  autoPlayDelay: 5000,
  transitionSpeed: 500,
  animationDuration: 500,
  animationType: 'slide',
  animationEasing: 'ease-in-out',
  infiniteLoop: true,
  pauseOnHover: true,
  pauseOnTabHidden: false,
  touchSwipe: true,
  keyboardNavigation: true,
  mouseWheelNavigation: false,
  showArrows: true,
  arrowSize: 40,
  arrowBorderRadius: 50,
  arrowBackgroundColor: 'rgba(255, 255, 255, 0.2)',
  arrowIconColor: '#ffffff',
  arrowHoverBackgroundColor: 'rgba(255, 255, 255, 0.4)',
  arrowHoverIconColor: '#ffffff',
  showDots: true,
  dotSize: 12,
  dotColor: 'rgba(255, 255, 255, 0.5)',
  activeDotColor: '#ffffff',
  dotSpacing: 8,
  showProgressBar: false,
  progressColor: '#10b981',
  progressHeight: 4,
  desktopHeight: 750,
  desktopHeadingFontSize: 60,
  desktopSubheadingFontSize: 32,
  desktopDescriptionFontSize: 24,
  desktopButtonFontSize: 18,
  desktopContentPosition: 'left',
  desktopVerticalPosition: 'center',
  tabletHeight: 650,
  tabletHeadingFontSize: 48,
  tabletSubheadingFontSize: 26,
  tabletDescriptionFontSize: 20,
  tabletButtonFontSize: 16,
  tabletContentPosition: 'left',
  tabletVerticalPosition: 'center',
  mobileHeight: 550,
  mobileHeadingFontSize: 36,
  mobileSubheadingFontSize: 20,
  mobileDescriptionFontSize: 16,
  mobileButtonFontSize: 14,
  mobileContentPosition: 'left',
  mobileVerticalPosition: 'center',
  lazyLoadImages: true,
  imageQuality: 85,
  preloadFirstSlide: true,
  enableImageOptimization: true,
  overlayColor: '#000000',
  overlayOpacity: 50,
  headingColor: '#ffffff',
  subheadingColor: '#ffffff',
  descriptionColor: '#ffffff',
  buttonBackgroundColor: '#10b981',
  buttonTextColor: '#ffffff',
  buttonHoverBackgroundColor: '#059669',
  buttonHoverTextColor: '#ffffff',
  buttonBorderColor: 'transparent',
  buttonBorderRadius: 8,
  secondaryButtonBackgroundColor: '#ffffff',
  secondaryButtonTextColor: '#000000',
  secondaryButtonHoverBackgroundColor: '#f3f4f6',
  secondaryButtonHoverTextColor: '#000000',
  secondaryButtonBorderColor: '#e5e7eb',
  secondaryButtonBorderRadius: 8,
  sliderBackgroundColor: '#f3f4f6',
};

export default function SliderSettingsPanel({ onSettingsChange }: SliderSettingsPanelProps) {
  const [settings, setSettings] = useState<SliderSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showPreview, setShowPreview] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SliderSettings, value: any) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setNotification(null);

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

  const handleReset = () => {
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
    showNotification('success', 'Settings reset to defaults');
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Slider Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure every aspect of your hero slider</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Live Preview
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 text-black hover:bg-emerald-500 w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <Card className="border border-emerald-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-emerald-700">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="relative w-full rounded-lg overflow-hidden"
              style={{ 
                height: `${Math.min(settings.desktopHeight, 400)}px`,
                backgroundColor: '#f0f0f0'
              }}
            >
              {/* Preview Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: settings.overlayColor,
                  opacity: settings.overlayOpacity / 100,
                }}
              />
              
              {/* Preview Content */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div 
                  className={`w-full ${settings.desktopContentPosition === 'center' ? 'text-center mx-auto' : settings.desktopContentPosition === 'right' ? 'text-right ml-auto' : 'text-left'}`}
                  style={{ maxWidth: '600px' }}
                >
                  <h1
                    className="text-3xl md:text-4xl font-bold mb-4"
                    style={{ 
                      color: settings.headingColor,
                      fontSize: `${Math.min(settings.desktopHeadingFontSize, 48)}px`,
                    }}
                  >
                    Sample Heading
                  </h1>
                  <p
                    className="text-lg md:text-xl mb-6"
                    style={{ 
                      color: settings.subheadingColor,
                      fontSize: `${Math.min(settings.desktopSubheadingFontSize, 24)}px`,
                    }}
                  >
                    Sample subheading text that demonstrates the typography settings
                  </p>
                  <button
                    className="px-6 py-3 font-semibold transition-all hover:scale-105"
                    style={{
                      backgroundColor: settings.buttonBackgroundColor,
                      color: settings.buttonTextColor,
                      borderRadius: `${settings.buttonBorderRadius}px`,
                      fontSize: `${Math.min(settings.desktopButtonFontSize, 16)}px`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = settings.buttonHoverBackgroundColor;
                      e.currentTarget.style.color = settings.buttonHoverTextColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = settings.buttonBackgroundColor;
                      e.currentTarget.style.color = settings.buttonTextColor;
                    }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>

              {/* Preview Navigation Arrows */}
              {settings.showArrows && (
                <>
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-sm p-2 rounded-full"
                    style={{
                      backgroundColor: settings.arrowBackgroundColor,
                      width: `${settings.arrowSize}px`,
                      height: `${settings.arrowSize}px`,
                      borderRadius: `${settings.arrowBorderRadius}%`,
                    }}
                  >
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ color: settings.arrowIconColor }}
                    >
                      ←
                    </div>
                  </div>
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-sm p-2 rounded-full"
                    style={{
                      backgroundColor: settings.arrowBackgroundColor,
                      width: `${settings.arrowSize}px`,
                      height: `${settings.arrowSize}px`,
                      borderRadius: `${settings.arrowBorderRadius}%`,
                    }}
                  >
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ color: settings.arrowIconColor }}
                    >
                      →
                    </div>
                  </div>
                </>
              )}

              {/* Preview Dots */}
              {settings.showDots && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="rounded-full transition-all"
                      style={{
                        backgroundColor: index === 0 ? settings.activeDotColor : settings.dotColor,
                        width: `${settings.dotSize}px`,
                        height: `${settings.dotSize}px`,
                        transform: index === 0 ? 'scale(1.25)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Preview Progress Bar */}
              {settings.showProgressBar && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/20">
                  <div
                    className="h-full transition-all"
                    style={{
                      backgroundColor: settings.progressColor,
                      height: `${settings.progressHeight}px`,
                      width: '33%',
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex gap-2 overflow-x-auto whitespace-nowrap w-full min-h-[40px] scrollbar-hide">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="animation">
            <Layout className="mr-2 h-4 w-4" />
            Animation
          </TabsTrigger>
          <TabsTrigger value="navigation">
            <Navigation className="mr-2 h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="responsive">
            <Monitor className="mr-2 h-4 w-4" />
            Responsive
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="mr-2 h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="mr-2 h-4 w-4" />
            Colors & Styling
          </TabsTrigger>
          <TabsTrigger value="overlay">
            <Layers className="mr-2 h-4 w-4" />
            Overlay
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleInputChange('enabled', checked as boolean)}
                />
                <Label htmlFor="enabled" className="cursor-pointer">
                  Enable Slider
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoPlay"
                  checked={settings.autoPlay}
                  onCheckedChange={(checked) => handleInputChange('autoPlay', checked as boolean)}
                />
                <Label htmlFor="autoPlay" className="cursor-pointer">
                  Auto Play
                </Label>
              </div>

              <div>
                <Label htmlFor="autoPlayDelay">Auto Play Delay: {settings.autoPlayDelay}ms</Label>
                <Input
                  id="autoPlayDelay"
                  type="number"
                  min="1000"
                  max="30000"
                  step="100"
                  value={settings.autoPlayDelay}
                  onChange={(e) => handleInputChange('autoPlayDelay', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="infiniteLoop"
                  checked={settings.infiniteLoop}
                  onCheckedChange={(checked) => handleInputChange('infiniteLoop', checked as boolean)}
                />
                <Label htmlFor="infiniteLoop" className="cursor-pointer">
                  Infinite Loop
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pauseOnHover"
                  checked={settings.pauseOnHover}
                  onCheckedChange={(checked) => handleInputChange('pauseOnHover', checked as boolean)}
                />
                <Label htmlFor="pauseOnHover" className="cursor-pointer">
                  Pause on Hover
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pauseOnTabHidden"
                  checked={settings.pauseOnTabHidden}
                  onCheckedChange={(checked) => handleInputChange('pauseOnTabHidden', checked as boolean)}
                />
                <Label htmlFor="pauseOnTabHidden" className="cursor-pointer">
                  Pause when Browser Tab is Hidden
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animation Settings Tab */}
        <TabsContent value="animation" className="space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Animation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
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

              <div>
                <Label htmlFor="animationEasing">Animation Easing</Label>
                <Select
                  value={settings.animationEasing}
                  onValueChange={(value: any) => handleInputChange('animationEasing', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="ease">Ease</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transitionSpeed">Transition Speed: {settings.transitionSpeed}ms</Label>
                <Input
                  id="transitionSpeed"
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
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
                  step="50"
                  value={settings.animationDuration}
                  onChange={(e) => handleInputChange('animationDuration', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Settings Tab */}
        <TabsContent value="navigation" className="space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Navigation Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="touchSwipe"
                  checked={settings.touchSwipe}
                  onCheckedChange={(checked) => handleInputChange('touchSwipe', checked as boolean)}
                />
                <Label htmlFor="touchSwipe" className="cursor-pointer">
                  Touch Swipe
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keyboardNavigation"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => handleInputChange('keyboardNavigation', checked as boolean)}
                />
                <Label htmlFor="keyboardNavigation" className="cursor-pointer">
                  Keyboard Navigation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mouseWheelNavigation"
                  checked={settings.mouseWheelNavigation}
                  onCheckedChange={(checked) => handleInputChange('mouseWheelNavigation', checked as boolean)}
                />
                <Label htmlFor="mouseWheelNavigation" className="cursor-pointer">
                  Mouse Wheel Navigation
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Arrows */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Arrow Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showArrows"
                  checked={settings.showArrows}
                  onCheckedChange={(checked) => handleInputChange('showArrows', checked as boolean)}
                />
                <Label htmlFor="showArrows" className="cursor-pointer">
                  Show Arrows
                </Label>
              </div>

              <div>
                <Label htmlFor="arrowSize">Arrow Size: {settings.arrowSize}px</Label>
                <Input
                  id="arrowSize"
                  type="number"
                  min="20"
                  max="80"
                  value={settings.arrowSize}
                  onChange={(e) => handleInputChange('arrowSize', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="arrowBorderRadius">Arrow Border Radius: {settings.arrowBorderRadius}%</Label>
                <Input
                  id="arrowBorderRadius"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.arrowBorderRadius}
                  onChange={(e) => handleInputChange('arrowBorderRadius', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="arrowBackgroundColor">Arrow Background Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowBackgroundColor"
                    type="color"
                    value={settings.arrowBackgroundColor.startsWith('#') ? settings.arrowBackgroundColor : '#ffffff'}
                    onChange={(e) => handleInputChange('arrowBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowBackgroundColor}
                    onChange={(e) => handleInputChange('arrowBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arrowIconColor">Arrow Icon Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowIconColor"
                    type="color"
                    value={settings.arrowIconColor}
                    onChange={(e) => handleInputChange('arrowIconColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowIconColor}
                    onChange={(e) => handleInputChange('arrowIconColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arrowHoverBackgroundColor">Arrow Hover Background</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowHoverBackgroundColor"
                    type="color"
                    value={settings.arrowHoverBackgroundColor.startsWith('#') ? settings.arrowHoverBackgroundColor : '#ffffff'}
                    onChange={(e) => handleInputChange('arrowHoverBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowHoverBackgroundColor}
                    onChange={(e) => handleInputChange('arrowHoverBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arrowHoverIconColor">Arrow Hover Icon Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowHoverIconColor"
                    type="color"
                    value={settings.arrowHoverIconColor}
                    onChange={(e) => handleInputChange('arrowHoverIconColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowHoverIconColor}
                    onChange={(e) => handleInputChange('arrowHoverIconColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dots */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Dot Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showDots"
                  checked={settings.showDots}
                  onCheckedChange={(checked) => handleInputChange('showDots', checked as boolean)}
                />
                <Label htmlFor="showDots" className="cursor-pointer">
                  Show Dots
                </Label>
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

              <div>
                <Label htmlFor="dotSpacing">Dot Spacing: {settings.dotSpacing}px</Label>
                <Input
                  id="dotSpacing"
                  type="number"
                  min="4"
                  max="20"
                  value={settings.dotSpacing}
                  onChange={(e) => handleInputChange('dotSpacing', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dotColor">Dot Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="dotColor"
                    type="color"
                    value={settings.dotColor.startsWith('#') ? settings.dotColor : '#ffffff'}
                    onChange={(e) => handleInputChange('dotColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.dotColor}
                    onChange={(e) => handleInputChange('dotColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activeDotColor">Active Dot Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="activeDotColor"
                    type="color"
                    value={settings.activeDotColor}
                    onChange={(e) => handleInputChange('activeDotColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.activeDotColor}
                    onChange={(e) => handleInputChange('activeDotColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Progress Bar Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showProgressBar"
                  checked={settings.showProgressBar}
                  onCheckedChange={(checked) => handleInputChange('showProgressBar', checked as boolean)}
                />
                <Label htmlFor="showProgressBar" className="cursor-pointer">
                  Enable Progress Bar
                </Label>
              </div>

              <div>
                <Label htmlFor="progressColor">Progress Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="progressColor"
                    type="color"
                    value={settings.progressColor}
                    onChange={(e) => handleInputChange('progressColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.progressColor}
                    onChange={(e) => handleInputChange('progressColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="progressHeight">Progress Height: {settings.progressHeight}px</Label>
                <Input
                  id="progressHeight"
                  type="number"
                  min="2"
                  max="10"
                  value={settings.progressHeight}
                  onChange={(e) => handleInputChange('progressHeight', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responsive Settings Tab */}
        <TabsContent value="responsive" className="space-y-6">
          {/* Desktop */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                Desktop Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="desktopHeight">Slider Height: {settings.desktopHeight}px</Label>
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
                <Label htmlFor="desktopContentPosition">Horizontal Content Position</Label>
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

              <div>
                <Label htmlFor="desktopVerticalPosition">Vertical Content Position</Label>
                <Select
                  value={settings.desktopVerticalPosition}
                  onValueChange={(value: any) => handleInputChange('desktopVerticalPosition', value)}
                >
                  <SelectTrigger className="mt-2">
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

          {/* Tablet */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center">
                <Tablet className="mr-2 h-5 w-5" />
                Tablet Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="tabletHeight">Slider Height: {settings.tabletHeight}px</Label>
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
                <Label htmlFor="tabletContentPosition">Horizontal Content Position</Label>
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

              <div>
                <Label htmlFor="tabletVerticalPosition">Vertical Content Position</Label>
                <Select
                  value={settings.tabletVerticalPosition}
                  onValueChange={(value: any) => handleInputChange('tabletVerticalPosition', value)}
                >
                  <SelectTrigger className="mt-2">
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

          {/* Mobile */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5" />
                Mobile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="mobileHeight">Slider Height: {settings.mobileHeight}px</Label>
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
                <Label htmlFor="mobileContentPosition">Horizontal Content Position</Label>
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

              <div>
                <Label htmlFor="mobileVerticalPosition">Vertical Content Position</Label>
                <Select
                  value={settings.mobileVerticalPosition}
                  onValueChange={(value: any) => handleInputChange('mobileVerticalPosition', value)}
                >
                  <SelectTrigger className="mt-2">
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
        </TabsContent>

        {/* Typography Settings Tab */}
        <TabsContent value="typography" className="space-y-6">
          {/* Desktop Typography */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                Desktop Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="desktopHeadingFontSize">Heading Size: {settings.desktopHeadingFontSize}px</Label>
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
                <Label htmlFor="desktopSubheadingFontSize">Subheading Size: {settings.desktopSubheadingFontSize}px</Label>
                <Input
                  id="desktopSubheadingFontSize"
                  type="number"
                  min="16"
                  max="64"
                  value={settings.desktopSubheadingFontSize}
                  onChange={(e) => handleInputChange('desktopSubheadingFontSize', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="desktopDescriptionFontSize">Description Size: {settings.desktopDescriptionFontSize}px</Label>
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
                <Label htmlFor="desktopButtonFontSize">Button Font Size: {settings.desktopButtonFontSize}px</Label>
                <Input
                  id="desktopButtonFontSize"
                  type="number"
                  min="12"
                  max="32"
                  value={settings.desktopButtonFontSize}
                  onChange={(e) => handleInputChange('desktopButtonFontSize', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tablet Typography */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center">
                <Tablet className="mr-2 h-5 w-5" />
                Tablet Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="tabletHeadingFontSize">Heading Size: {settings.tabletHeadingFontSize}px</Label>
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
                <Label htmlFor="tabletSubheadingFontSize">Subheading Size: {settings.tabletSubheadingFontSize}px</Label>
                <Input
                  id="tabletSubheadingFontSize"
                  type="number"
                  min="14"
                  max="52"
                  value={settings.tabletSubheadingFontSize}
                  onChange={(e) => handleInputChange('tabletSubheadingFontSize', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tabletDescriptionFontSize">Description Size: {settings.tabletDescriptionFontSize}px</Label>
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
                <Label htmlFor="tabletButtonFontSize">Button Font Size: {settings.tabletButtonFontSize}px</Label>
                <Input
                  id="tabletButtonFontSize"
                  type="number"
                  min="12"
                  max="28"
                  value={settings.tabletButtonFontSize}
                  onChange={(e) => handleInputChange('tabletButtonFontSize', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mobile Typography */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5" />
                Mobile Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="mobileHeadingFontSize">Heading Size: {settings.mobileHeadingFontSize}px</Label>
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
                <Label htmlFor="mobileSubheadingFontSize">Subheading Size: {settings.mobileSubheadingFontSize}px</Label>
                <Input
                  id="mobileSubheadingFontSize"
                  type="number"
                  min="12"
                  max="40"
                  value={settings.mobileSubheadingFontSize}
                  onChange={(e) => handleInputChange('mobileSubheadingFontSize', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="mobileDescriptionFontSize">Description Size: {settings.mobileDescriptionFontSize}px</Label>
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
                <Label htmlFor="mobileButtonFontSize">Button Font Size: {settings.mobileButtonFontSize}px</Label>
                <Input
                  id="mobileButtonFontSize"
                  type="number"
                  min="10"
                  max="24"
                  value={settings.mobileButtonFontSize}
                  onChange={(e) => handleInputChange('mobileButtonFontSize', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors & Styling Settings Tab */}
        <TabsContent value="colors" className="space-y-6">
          {/* Text Colors */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Text Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="headingColor">Heading Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="headingColor"
                    type="color"
                    value={settings.headingColor}
                    onChange={(e) => handleInputChange('headingColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.headingColor}
                    onChange={(e) => handleInputChange('headingColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subheadingColor">Subheading Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="subheadingColor"
                    type="color"
                    value={settings.subheadingColor}
                    onChange={(e) => handleInputChange('subheadingColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.subheadingColor}
                    onChange={(e) => handleInputChange('subheadingColor', e.target.value)}
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
                    value={settings.descriptionColor}
                    onChange={(e) => handleInputChange('descriptionColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.descriptionColor}
                    onChange={(e) => handleInputChange('descriptionColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Button Colors */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Primary Button Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="buttonBackgroundColor">Button Background Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="buttonBackgroundColor"
                    type="color"
                    value={settings.buttonBackgroundColor}
                    onChange={(e) => handleInputChange('buttonBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.buttonBackgroundColor}
                    onChange={(e) => handleInputChange('buttonBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buttonTextColor">Button Text Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="buttonTextColor"
                    type="color"
                    value={settings.buttonTextColor}
                    onChange={(e) => handleInputChange('buttonTextColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.buttonTextColor}
                    onChange={(e) => handleInputChange('buttonTextColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buttonHoverBackgroundColor">Button Hover Background</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="buttonHoverBackgroundColor"
                    type="color"
                    value={settings.buttonHoverBackgroundColor}
                    onChange={(e) => handleInputChange('buttonHoverBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.buttonHoverBackgroundColor}
                    onChange={(e) => handleInputChange('buttonHoverBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buttonHoverTextColor">Button Hover Text Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="buttonHoverTextColor"
                    type="color"
                    value={settings.buttonHoverTextColor}
                    onChange={(e) => handleInputChange('buttonHoverTextColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.buttonHoverTextColor}
                    onChange={(e) => handleInputChange('buttonHoverTextColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buttonBorderColor">Button Border Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="buttonBorderColor"
                    type="color"
                    value={settings.buttonBorderColor}
                    onChange={(e) => handleInputChange('buttonBorderColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.buttonBorderColor}
                    onChange={(e) => handleInputChange('buttonBorderColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buttonBorderRadius">Button Border Radius: {settings.buttonBorderRadius}px</Label>
                <Input
                  id="buttonBorderRadius"
                  type="number"
                  min="0"
                  max="50"
                  value={settings.buttonBorderRadius}
                  onChange={(e) => handleInputChange('buttonBorderRadius', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Secondary Button Colors */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Secondary Button Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="secondaryButtonBackgroundColor">Button Background Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="secondaryButtonBackgroundColor"
                    type="color"
                    value={settings.secondaryButtonBackgroundColor}
                    onChange={(e) => handleInputChange('secondaryButtonBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.secondaryButtonBackgroundColor}
                    onChange={(e) => handleInputChange('secondaryButtonBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryButtonTextColor">Button Text Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="secondaryButtonTextColor"
                    type="color"
                    value={settings.secondaryButtonTextColor}
                    onChange={(e) => handleInputChange('secondaryButtonTextColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.secondaryButtonTextColor}
                    onChange={(e) => handleInputChange('secondaryButtonTextColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryButtonHoverBackgroundColor">Button Hover Background</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="secondaryButtonHoverBackgroundColor"
                    type="color"
                    value={settings.secondaryButtonHoverBackgroundColor}
                    onChange={(e) => handleInputChange('secondaryButtonHoverBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.secondaryButtonHoverBackgroundColor}
                    onChange={(e) => handleInputChange('secondaryButtonHoverBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryButtonHoverTextColor">Button Hover Text Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="secondaryButtonHoverTextColor"
                    type="color"
                    value={settings.secondaryButtonHoverTextColor}
                    onChange={(e) => handleInputChange('secondaryButtonHoverTextColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.secondaryButtonHoverTextColor}
                    onChange={(e) => handleInputChange('secondaryButtonHoverTextColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryButtonBorderColor">Button Border Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="secondaryButtonBorderColor"
                    type="color"
                    value={settings.secondaryButtonBorderColor}
                    onChange={(e) => handleInputChange('secondaryButtonBorderColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.secondaryButtonBorderColor}
                    onChange={(e) => handleInputChange('secondaryButtonBorderColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryButtonBorderRadius">Button Border Radius: {settings.secondaryButtonBorderRadius}px</Label>
                <Input
                  id="secondaryButtonBorderRadius"
                  type="number"
                  min="0"
                  max="50"
                  value={settings.secondaryButtonBorderRadius}
                  onChange={(e) => handleInputChange('secondaryButtonBorderRadius', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Slider Colors */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Slider Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="sliderBackgroundColor">Slider Background Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="sliderBackgroundColor"
                    type="color"
                    value={settings.sliderBackgroundColor}
                    onChange={(e) => handleInputChange('sliderBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.sliderBackgroundColor}
                    onChange={(e) => handleInputChange('sliderBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arrowBackgroundColor">Arrow Background Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowBackgroundColor"
                    type="color"
                    value={settings.arrowBackgroundColor.startsWith('#') ? settings.arrowBackgroundColor : '#ffffff'}
                    onChange={(e) => handleInputChange('arrowBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowBackgroundColor}
                    onChange={(e) => handleInputChange('arrowBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arrowIconColor">Arrow Icon Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowIconColor"
                    type="color"
                    value={settings.arrowIconColor}
                    onChange={(e) => handleInputChange('arrowIconColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowIconColor}
                    onChange={(e) => handleInputChange('arrowIconColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arrowHoverBackgroundColor">Arrow Hover Background</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowHoverBackgroundColor"
                    type="color"
                    value={settings.arrowHoverBackgroundColor.startsWith('#') ? settings.arrowHoverBackgroundColor : '#ffffff'}
                    onChange={(e) => handleInputChange('arrowHoverBackgroundColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowHoverBackgroundColor}
                    onChange={(e) => handleInputChange('arrowHoverBackgroundColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arrowHoverIconColor">Arrow Hover Icon Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="arrowHoverIconColor"
                    type="color"
                    value={settings.arrowHoverIconColor}
                    onChange={(e) => handleInputChange('arrowHoverIconColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.arrowHoverIconColor}
                    onChange={(e) => handleInputChange('arrowHoverIconColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dotColor">Dot Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="dotColor"
                    type="color"
                    value={settings.dotColor.startsWith('#') ? settings.dotColor : '#ffffff'}
                    onChange={(e) => handleInputChange('dotColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.dotColor}
                    onChange={(e) => handleInputChange('dotColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activeDotColor">Active Dot Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="activeDotColor"
                    type="color"
                    value={settings.activeDotColor}
                    onChange={(e) => handleInputChange('activeDotColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.activeDotColor}
                    onChange={(e) => handleInputChange('activeDotColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="progressColor">Progress Bar Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="progressColor"
                    type="color"
                    value={settings.progressColor}
                    onChange={(e) => handleInputChange('progressColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.progressColor}
                    onChange={(e) => handleInputChange('progressColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overlay Settings Tab */}
        <TabsContent value="overlay" className="space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Overlay Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div>
                <Label htmlFor="overlayColor">Overlay Color</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Input
                    id="overlayColor"
                    type="color"
                    value={settings.overlayColor.startsWith('#') ? settings.overlayColor : '#000000'}
                    onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                    className="w-full sm:w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.overlayColor}
                    onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="overlayOpacity">Overlay Opacity: {settings.overlayOpacity}%</Label>
                <div className="mt-2">
                  <Slider
                    value={[settings.overlayOpacity]}
                    onValueChange={(value) => handleInputChange('overlayOpacity', value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lazyLoadImages"
                  checked={settings.lazyLoadImages}
                  onCheckedChange={(checked) => handleInputChange('lazyLoadImages', checked as boolean)}
                />
                <Label htmlFor="lazyLoadImages" className="cursor-pointer">
                  Lazy Load Images
                </Label>
              </div>

              <div>
                <Label htmlFor="imageQuality">Image Quality: {settings.imageQuality}</Label>
                <div className="mt-2">
                  <Slider
                    value={[settings.imageQuality]}
                    onValueChange={(value) => handleInputChange('imageQuality', value[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher quality = larger file size. Recommended: 75-90
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preloadFirstSlide"
                  checked={settings.preloadFirstSlide}
                  onCheckedChange={(checked) => handleInputChange('preloadFirstSlide', checked as boolean)}
                />
                <Label htmlFor="preloadFirstSlide" className="cursor-pointer">
                  Preload First Slide
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableImageOptimization"
                  checked={settings.enableImageOptimization}
                  onCheckedChange={(checked) => handleInputChange('enableImageOptimization', checked as boolean)}
                />
                <Label htmlFor="enableImageOptimization" className="cursor-pointer">
                  Enable Image Optimization
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
  );
}

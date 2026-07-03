'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface HeroSliderSettings {
  _id?: string;
  enabled: boolean;
  autoPlay: boolean;
  autoPlayDelay: number;
  infiniteLoop: boolean;
  pauseOnHover: boolean;
  keyboardNavigation: boolean;
  touchSwipe: boolean;
  animationType: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow';
  showArrows: boolean;
  arrowColor: string;
  arrowBackground: string;
  showDots: boolean;
  dotColor: string;
  activeDotColor: string;
  desktopHeight: number;
  tabletHeight: number;
  mobileHeight: number;
  headingSize: number;
  subheadingSize: number;
  descriptionSize: number;
  buttonSize: number;
  headingColor: string;
  subheadingColor: string;
  descriptionColor: string;
  buttonBackground: string;
  buttonTextColor: string;
  overlayColor: string;
  overlayOpacity: number;
}

export default function HeroSliderSettingsPage() {
  const [settings, setSettings] = useState<HeroSliderSettings>({
    enabled: true,
    autoPlay: true,
    autoPlayDelay: 5000,
    infiniteLoop: true,
    pauseOnHover: true,
    keyboardNavigation: true,
    touchSwipe: true,
    animationType: 'slide',
    showArrows: true,
    arrowColor: '#ffffff',
    arrowBackground: 'rgba(0, 0, 0, 0.3)',
    showDots: true,
    dotColor: 'rgba(255, 255, 255, 0.5)',
    activeDotColor: '#ffffff',
    desktopHeight: 750,
    tabletHeight: 650,
    mobileHeight: 550,
    headingSize: 60,
    subheadingSize: 32,
    descriptionSize: 24,
    buttonSize: 18,
    headingColor: '#ffffff',
    subheadingColor: '#ffffff',
    descriptionColor: '#ffffff',
    buttonBackground: '#10b981',
    buttonTextColor: '#ffffff',
    overlayColor: '#000000',
    overlayOpacity: 50,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/hero-settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/hero-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hero Slider Settings</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`px-4 py-2 rounded ${
          saveMessage.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Slider</label>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Play</label>
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => setSettings({ ...settings, autoPlay: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auto Play Delay (ms)</label>
              <input
                type="number"
                value={settings.autoPlayDelay}
                onChange={(e) => setSettings({ ...settings, autoPlayDelay: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="1000"
                max="30000"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Infinite Loop</label>
              <input
                type="checkbox"
                checked={settings.infiniteLoop}
                onChange={(e) => setSettings({ ...settings, infiniteLoop: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pause on Hover</label>
              <input
                type="checkbox"
                checked={settings.pauseOnHover}
                onChange={(e) => setSettings({ ...settings, pauseOnHover: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Keyboard Navigation</label>
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => setSettings({ ...settings, keyboardNavigation: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Touch Swipe</label>
              <input
                type="checkbox"
                checked={settings.touchSwipe}
                onChange={(e) => setSettings({ ...settings, touchSwipe: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Animation Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Animation Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Animation Type</label>
              <select
                value={settings.animationType}
                onChange={(e) => setSettings({ ...settings, animationType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="slide">Slide</option>
                <option value="fade">Fade</option>
                <option value="zoom">Zoom</option>
                <option value="flip">Flip</option>
                <option value="cube">Cube</option>
                <option value="coverflow">Coverflow</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Navigation Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Arrows</label>
              <input
                type="checkbox"
                checked={settings.showArrows}
                onChange={(e) => setSettings({ ...settings, showArrows: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Arrow Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.arrowColor}
                  onChange={(e) => setSettings({ ...settings, arrowColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.arrowColor}
                  onChange={(e) => setSettings({ ...settings, arrowColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Arrow Background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.arrowBackground.startsWith('#') ? settings.arrowBackground : '#000000'}
                  onChange={(e) => setSettings({ ...settings, arrowBackground: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.arrowBackground}
                  onChange={(e) => setSettings({ ...settings, arrowBackground: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Dots</label>
              <input
                type="checkbox"
                checked={settings.showDots}
                onChange={(e) => setSettings({ ...settings, showDots: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dot Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.dotColor.startsWith('#') ? settings.dotColor : '#ffffff'}
                  onChange={(e) => setSettings({ ...settings, dotColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.dotColor}
                  onChange={(e) => setSettings({ ...settings, dotColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Active Dot Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.activeDotColor}
                  onChange={(e) => setSettings({ ...settings, activeDotColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.activeDotColor}
                  onChange={(e) => setSettings({ ...settings, activeDotColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Responsive Heights</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Desktop Height (px)</label>
              <input
                type="number"
                value={settings.desktopHeight}
                onChange={(e) => setSettings({ ...settings, desktopHeight: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="300"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tablet Height (px)</label>
              <input
                type="number"
                value={settings.tabletHeight}
                onChange={(e) => setSettings({ ...settings, tabletHeight: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="300"
                max="800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Height (px)</label>
              <input
                type="number"
                value={settings.mobileHeight}
                onChange={(e) => setSettings({ ...settings, mobileHeight: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="200"
                max="600"
              />
            </div>
          </div>
        </div>

        {/* Typography Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Typography</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heading Size (px)</label>
              <input
                type="number"
                value={settings.headingSize}
                onChange={(e) => setSettings({ ...settings, headingSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="24"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subheading Size (px)</label>
              <input
                type="number"
                value={settings.subheadingSize}
                onChange={(e) => setSettings({ ...settings, subheadingSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="16"
                max="64"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description Size (px)</label>
              <input
                type="number"
                value={settings.descriptionSize}
                onChange={(e) => setSettings({ ...settings, descriptionSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="12"
                max="48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Size (px)</label>
              <input
                type="number"
                value={settings.buttonSize}
                onChange={(e) => setSettings({ ...settings, buttonSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="12"
                max="32"
              />
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Colors</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heading Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.headingColor}
                  onChange={(e) => setSettings({ ...settings, headingColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.headingColor}
                  onChange={(e) => setSettings({ ...settings, headingColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subheading Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.subheadingColor}
                  onChange={(e) => setSettings({ ...settings, subheadingColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.subheadingColor}
                  onChange={(e) => setSettings({ ...settings, subheadingColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.descriptionColor}
                  onChange={(e) => setSettings({ ...settings, descriptionColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.descriptionColor}
                  onChange={(e) => setSettings({ ...settings, descriptionColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.buttonBackground}
                  onChange={(e) => setSettings({ ...settings, buttonBackground: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.buttonBackground}
                  onChange={(e) => setSettings({ ...settings, buttonBackground: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.buttonTextColor}
                  onChange={(e) => setSettings({ ...settings, buttonTextColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.buttonTextColor}
                  onChange={(e) => setSettings({ ...settings, buttonTextColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Overlay Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.overlayColor}
                  onChange={(e) => setSettings({ ...settings, overlayColor: e.target.value })}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.overlayColor}
                  onChange={(e) => setSettings({ ...settings, overlayColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Overlay Opacity (%)</label>
              <input
                type="number"
                value={settings.overlayOpacity}
                onChange={(e) => setSettings({ ...settings, overlayOpacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

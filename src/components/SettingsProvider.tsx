'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const setSettings = useSettingsStore(state => state.setSettings);
  const refreshSettings = useSettingsStore(state => state.refreshSettings);

  useEffect(() => {
    // Load settings from API on mount
    const loadSettings = async () => {
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
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();

    // Set up interval to refresh settings every 30 seconds
    const interval = setInterval(() => {
      refreshSettings();
    }, 30000);

    return () => clearInterval(interval);
  }, [setSettings, refreshSettings]);

  return <>{children}</>;
}

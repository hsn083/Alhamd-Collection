'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const setSettings = useSettingsStore(state => state.setSettings);

  useEffect(() => {
    // Load settings from API on mount
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
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
  }, [setSettings]);

  return <>{children}</>;
}

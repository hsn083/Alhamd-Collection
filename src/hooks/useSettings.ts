import { useSettingsStore } from '@/store/settingsStore';

// Helper hooks to access specific settings
export const useGeneralSettings = () => {
  return useSettingsStore(state => state.settings.general);
};

export const useSEOSettings = () => {
  return useSettingsStore(state => state.settings.seo);
};

export const useShippingSettings = () => {
  return useSettingsStore(state => state.settings.shipping);
};

export const useProvinceSettings = () => {
  return useSettingsStore(state => state.settings.provinces);
};

export const usePaymentSettings = () => {
  return useSettingsStore(state => state.settings.payments);
};

export const useSocialMediaSettings = () => {
  return useSettingsStore(state => state.settings.socialMedia);
};

export const useEnabledPaymentMethods = () => {
  const payments = useSettingsStore(state => state.settings.payments);
  return Object.entries(payments)
    .filter(([_, method]) => method.enabled)
    .sort(([_, a], [__, b]) => a.order - b.order);
};

export const useEnabledSocialMedia = () => {
  const socialMedia = useSettingsStore(state => state.settings.socialMedia);
  return Object.entries(socialMedia)
    .filter(([_, platform]) => platform.enabled);
};

import { create } from 'zustand';

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

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
  createdAt?: Date;
  updatedAt?: Date;
}

interface HeroSliderStore {
  slides: HeroSlide[];
  settings: HeroSliderSettings;
  isLoading: boolean;
  loadHeroSlides: () => Promise<void>;
  loadHeroSettings: () => Promise<void>;
  updateHeroSettings: (settings: Partial<HeroSliderSettings>) => Promise<void>;
  setSlides: (slides: HeroSlide[]) => void;
  setSettings: (settings: HeroSliderSettings) => void;
}

const defaultSettings: HeroSliderSettings = {
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
};

export const useHeroSliderStore = create<HeroSliderStore>((set, get) => ({
  slides: [],
  settings: defaultSettings,
  isLoading: false,

  loadHeroSlides: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/hero-slides?activeOnly=true');
      const data = await response.json();
      if (data.success) {
        set({ slides: data.slides });
      }
    } catch (error) {
      console.error('Error loading hero slides:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadHeroSettings: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/hero-settings');
      const data = await response.json();
      if (data.success) {
        set({ settings: data.settings });
      }
    } catch (error) {
      console.error('Error loading hero settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateHeroSettings: async (newSettings) => {
    try {
      const response = await fetch('/api/hero-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await response.json();
      if (data.success) {
        set({ settings: data.settings });
      }
    } catch (error) {
      console.error('Error updating hero settings:', error);
    }
  },

  setSlides: (slides) => set({ slides }),
  setSettings: (settings) => set({ settings }),
}));

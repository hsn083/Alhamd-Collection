import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HeroBanner } from '@/types';

interface HeroBannerStore {
  heroBanner: HeroBanner | null;
  setHeroBanner: (banner: HeroBanner) => void;
  updateHeroBanner: (banner: Partial<HeroBanner>) => void;
  resetHeroBanner: () => void;
}

const defaultHeroBanner: HeroBanner = {
  id: '1',
  image: '/images/hero-banner-default.jpg',
  heading: 'Premium Clothing & Shoes Collection',
  subheading: 'Discover the latest fashion trends, stylish clothing, and premium footwear crafted for comfort and elegance.',
  buttonText: 'Shop Now',
  buttonLink: '/shop',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const useHeroBannerStore = create<HeroBannerStore>()(
  persist(
    (set) => ({
      heroBanner: defaultHeroBanner,

      setHeroBanner: (banner) => {
        set({ heroBanner: banner });
      },

      updateHeroBanner: (bannerData) => {
        set((state) => ({
          heroBanner: state.heroBanner
            ? {
                ...state.heroBanner,
                ...bannerData,
                updatedAt: new Date(),
              }
            : null,
        }));
      },

      resetHeroBanner: () => {
        set({ heroBanner: defaultHeroBanner });
      },
    }),
    {
      name: 'hero-banner-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '@/types';

interface CategoryStore {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getActiveCategories: () => Category[];
  reorderCategories: (categories: Category[]) => void;
  bulkDeleteCategories: (ids: string[]) => void;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [], // Start with empty array - fetch from API

      setCategories: (categories) => set({ categories }),

      addCategory: (categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
          slug: categoryData.slug || generateSlug(categoryData.name),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, categoryData) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id
              ? {
                  ...cat,
                  ...categoryData,
                  slug: categoryData.slug || (categoryData.name ? generateSlug(categoryData.name) : cat.slug),
                  updatedAt: new Date(),
                }
              : cat
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id);
      },

      getCategoryBySlug: (slug) => {
        return get().categories.find((cat) => cat.slug === slug);
      },

      getActiveCategories: () => {
        return get()
          .categories.filter((cat) => cat.status === 'active')
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },

      reorderCategories: (categories) => {
        set({ categories });
      },

      bulkDeleteCategories: (ids) => {
        set((state) => ({
          categories: state.categories.filter((cat) => !ids.includes(cat.id)),
        }));
      },
    }),
    {
      name: 'category-storage',
    }
  )
);

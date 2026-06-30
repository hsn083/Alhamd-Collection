import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  updateSingleProduct: (updatedProduct: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (categoryId: string | undefined, categoryName: string | undefined) => Product[];
  refetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],

      setProducts: (products) => set({ products }),

      addProduct: (product) => {
        set((state) => ({
          products: [...state.products, product],
        }));
      },

      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map((prod) =>
            prod.id === id
              ? {
                  ...prod,
                  ...productData,
                  updatedAt: new Date().toISOString(),
                }
              : prod
          ),
        }));
      },

      // Method to update a single product in the store (useful for rating updates)
      updateSingleProduct: (updatedProduct: Product) => {
        set((state) => ({
          products: state.products.map((prod) =>
            prod.id === updatedProduct.id ? updatedProduct : prod
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((prod) => prod.id !== id),
        }));
      },

      getProductById: (id) => {
        return get().products.find((prod) => prod.id === id);
      },

      getProductBySlug: (slug) => {
        return get().products.find((prod) => prod.slug === slug);
      },

      getProductsByCategory: (categoryId, categorySlug) => {
        const products = get().products;
        return products.filter(
          (p) => p.categoryId === categoryId || p.category === categorySlug
        );
      },

      refetchProducts: async () => {
        try {
          const response = await fetch('/api/products', {
            cache: 'no-store',
          });
          const result = await response.json();
          
          if (result.success && Array.isArray(result.products)) {
            set({ products: result.products });
          }
        } catch (error) {
          console.error('Error refetching products:', error);
        }
      },
    }),
    {
      name: 'product-storage',
    }
  )
);

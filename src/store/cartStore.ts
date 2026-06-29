import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product } from '@/types';

interface CartStore extends Cart {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

const calculateTotals = (items: CartItem[], discount: number, shipping: number) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  const total = subtotal - discount + shipping;
  return { subtotal, total };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      couponCode: undefined,

      addItem: (product: Product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.product.id === product.id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...items, { product, quantity }];
        }

        const { subtotal, total } = calculateTotals(newItems, get().discount, get().shipping);
        set({ items: newItems, subtotal, total });
      },

      removeItem: (productId: string) => {
        const items = get().items.filter(item => item.product.id !== productId);
        const { subtotal, total } = calculateTotals(items, get().discount, get().shipping);
        set({ items, subtotal, total });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const items = get().items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        const { subtotal, total } = calculateTotals(items, get().discount, get().shipping);
        set({ items, subtotal, total });
      },

      clearCart: () => {
        set({ items: [], subtotal: 0, discount: 0, shipping: 0, total: 0, couponCode: undefined });
      },

      applyCoupon: (code: string, discount: number) => {
        const { subtotal, shipping } = get();
        const total = subtotal - discount + shipping;
        set({ couponCode: code, discount, total });
      },

      removeCoupon: () => {
        const { subtotal, shipping } = get();
        const total = subtotal + shipping;
        set({ couponCode: undefined, discount: 0, total });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

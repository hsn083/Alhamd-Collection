// Dynamic import utilities for code splitting
export const dynamicImports = {
  // Admin components
  AdminDashboard: () => import('@/app/admin/dashboard/page'),
  AdminProducts: () => import('@/app/admin/products/page'),
  AdminOrders: () => import('@/app/admin/orders/page'),
  AdminCustomers: () => import('@/app/admin/customers/page'),
  
  // Customer components
  Checkout: () => import('@/app/checkout/page'),
  Cart: () => import('@/app/cart/page'),
  Wishlist: () => import('@/app/wishlist/page'),
  
  // Heavy components
  ProductImageGallery: () => import('@/components/ProductImageGallery'),
  ProductRecommendations: () => import('@/components/ProductRecommendations'),
  HeroSlider: () => import('@/components/HeroSlider'),
};

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(callback, options);
  
  if (elementRef.current) {
    observer.observe(elementRef.current);
  }
  
  return () => observer.disconnect();
}

// Image lazy loading with placeholder
export function getLazyLoadProps(src: string, alt: string) {
  return {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization helper
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map();
  
  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

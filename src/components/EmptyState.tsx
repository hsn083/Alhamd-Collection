import { Package, Search, Heart, ShoppingCart, FileText, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  type?: 'products' | 'search' | 'wishlist' | 'cart' | 'orders' | 'reviews' | 'generic';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  type = 'generic', 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const config = {
    products: {
      icon: Package,
      defaultTitle: 'No products found',
      defaultDescription: 'We couldn\'t find any products. Check back later or browse our categories.',
    },
    search: {
      icon: Search,
      defaultTitle: 'No results found',
      defaultDescription: 'We couldn\'t find anything matching your search. Try different keywords.',
    },
    wishlist: {
      icon: Heart,
      defaultTitle: 'Your wishlist is empty',
      defaultDescription: 'Save items you love by clicking the heart icon on any product.',
    },
    cart: {
      icon: ShoppingCart,
      defaultTitle: 'Your cart is empty',
      defaultDescription: 'Add some items to your cart to get started with your order.',
    },
    orders: {
      icon: FileText,
      defaultTitle: 'No orders yet',
      defaultDescription: 'You haven\'t placed any orders. Start shopping to see your orders here.',
    },
    reviews: {
      icon: FileText,
      defaultTitle: 'No reviews yet',
      defaultDescription: 'Be the first to review this product and share your experience.',
    },
    generic: {
      icon: AlertCircle,
      defaultTitle: 'Nothing here',
      defaultDescription: 'There\'s nothing to show at the moment.',
    },
  };

  const { icon: Icon, defaultTitle, defaultDescription } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || defaultTitle}
      </h3>
      
      <p className="text-gray-500 max-w-md mb-6">
        {description || defaultDescription}
      </p>
      
      {action && <div>{action}</div>}
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, Heart, X, Truck, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Notifications from './Notifications';
import BrandLogo from './BrandLogo';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const router = useRouter();
  const cartItems = useCartStore(state => state.items);
  const wishlistItems = useWishlistStore(state => state.items);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const general = useSettingsStore(state => state.settings.general);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions(null);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveRecentSearch(query);
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleDesktopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(mobileSearchQuery);
  };

  const handleSuggestionClick = (type: string, value: string) => {
    if (type === 'product') {
      router.push(`/product/${value}`);
    } else if (type === 'category') {
      router.push(`/category/${value}`);
    } else if (type === 'brand') {
      handleSearch(value);
    } else if (type === 'recent') {
      handleSearch(value);
    }
    setShowSuggestions(false);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-24'
        }`}>
          {/* Logo */}
          <div className="pl-2">
            <BrandLogo 
              variant="light"
              size={isScrolled ? "sm" : "md"}
            />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 lg:mx-12" ref={searchRef}>
            <form onSubmit={handleDesktopSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search clothing, shoes, accessories..."
                className="pl-10 w-full border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (searchQuery || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {isLoadingSuggestions ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <>
                      {/* Recent Searches */}
                      {!searchQuery && recentSearches.length > 0 && (
                        <div className="p-3 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Recent Searches</span>
                            <button
                              onClick={clearRecentSearches}
                              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Clear
                            </button>
                          </div>
                          {recentSearches.map((search, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick('recent', search)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-md flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4 text-gray-400" />
                              {search}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Products */}
                      {suggestions?.products && suggestions.products.length > 0 && (
                        <div className="p-3 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Products</span>
                          {suggestions.products.map((product: any) => (
                            <button
                              key={product.id}
                              onClick={() => handleSuggestionClick('product', product.slug)}
                              className="w-full text-left px-3 py-2 hover:bg-emerald-50 rounded-md flex items-center gap-3"
                            >
                              {product.images?.[0] && (
                                <div className="relative w-10 h-10">
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">PKR {(product.discountPrice || product.price).toLocaleString()}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Categories */}
                      {suggestions?.categories && suggestions.categories.length > 0 && (
                        <div className="p-3 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Categories</span>
                          {suggestions.categories.map((category: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick('category', category)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-md"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Brands */}
                      {suggestions?.brands && suggestions.brands.length > 0 && (
                        <div className="p-3">
                          <span className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Brands</span>
                          {suggestions.brands.map((brand: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick('brand', brand)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-md"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* View All Results */}
                      {searchQuery && (
                        <div className="p-3 border-t border-gray-100">
                          <button
                            onClick={() => handleSearch(searchQuery)}
                            className="w-full text-center py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors duration-200 relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/category/mens-clothing" className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors duration-200 relative group">
              Men
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/category/womens-clothing" className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors duration-200 relative group">
              Women
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/category/womens-shoes" className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors duration-200 relative group">
              Shoes
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors duration-200 relative group">
              New Arrivals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/track-order" className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors duration-200 relative group flex items-center gap-1">
              <Truck className="h-4 w-4" />
              Track Order
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors duration-200 relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1 lg:space-x-2">
            <Notifications />
            <Link href="/wishlist" aria-label="Wishlist">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/cart" aria-label="Shopping Cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/account" aria-label="Account">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleMobileSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="Search fashion..."
              className="pl-10 w-full border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {['/', '/category/mens-clothing', '/category/womens-clothing', '/category/shoes', '/shop', '/track-order', '/contact'].map((href, i) => (
              <Link
                key={href}
                href={href}
                className="block text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 py-2 px-3 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {href === '/track-order' ? (
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Track Order
                  </span>
                ) : (
                  ['Home', 'Men', 'Women', 'Shoes', 'New Arrivals', 'Contact'][i]
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

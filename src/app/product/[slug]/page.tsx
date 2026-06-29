'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Shield, 
  Truck, 
  RotateCcw,
  Check,
  Minus,
  Plus,
  Loader2,
  X,
  MessageCircle,
  Copy,
  Facebook,
  Twitter,
  Mail as MailIcon
} from 'lucide-react';
import { Product } from '@/types';
import { useProductStore } from '@/store/productStore';
import { useReviewStore } from '@/store/reviewStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import RatingSummary from '@/components/reviews/RatingSummary';
import ReviewCard from '@/components/reviews/ReviewCard';
import WriteReviewForm from '@/components/reviews/WriteReviewForm';
import ReviewFilters from '@/components/reviews/ReviewFilters';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;
  
  // Filter state - moved from ReviewFilters to parent to avoid circular dependency
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterWithPhotos, setFilterWithPhotos] = useState(false);
  const [filterWithVideos, setFilterWithVideos] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);
  const { success: toastSuccess, error: toastError } = useToast();
  
  const { products, refetchProducts } = useProductStore();
  const { reviews, addReview, getApprovedReviewsByProduct, refetchReviews } = useReviewStore();
  const { addItem } = useCartStore();

  const product = products.find(p => p.slug === slug);

  // Calculate dynamic review count and rating from actual reviews
  const productReviews = useMemo(() => {
    return product ? getApprovedReviewsByProduct(product.id) : [];
  }, [product, getApprovedReviewsByProduct]);
  
  const actualReviewCount = productReviews.length;
  const actualAverageRating = actualReviewCount > 0
    ? (productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / actualReviewCount).toFixed(1)
    : '0.0';

  // Compute filtered reviews from filter state (derived state, no circular dependency)
  const filteredReviews = useMemo(() => {
    let filtered = [...productReviews];

    // Apply rating filter
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(review => selectedRatings.includes(review.rating));
    }

    // Apply verified purchase filter
    if (filterVerified) {
      filtered = filtered.filter(review => review.isVerifiedPurchase);
    }

    // Apply photos filter
    if (filterWithPhotos) {
      filtered = filtered.filter(review => review.images && review.images.length > 0);
    }

    // Apply videos filter
    if (filterWithVideos) {
      filtered = filtered.filter(review => review.video);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    return filtered;
  }, [productReviews, sortBy, selectedRatings, filterVerified, filterWithPhotos, filterWithVideos]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, selectedRatings, filterVerified, filterWithPhotos, filterWithVideos]);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('guest_session_id');
    if (!storedSessionId) {
      storedSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);

    const fetchData = async () => {
      try {
        await refetchProducts();
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refetchProducts]);

  useEffect(() => {
    if (product && sessionId) {
      // Check if product is in wishlist
      checkWishlistStatus();
      // Fetch reviews
      fetchReviews();
      // Check if user has already rated
      checkUserRating();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, sessionId]);

  const checkWishlistStatus = async () => {
    if (!product) return;
    try {
      const response = await fetch(`/api/wishlist?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        const isInWishlist = data.wishlist.some((item: any) => item.productId === product.id);
        setIsWishlisted(isInWishlist);
        setWishlistCount(data.wishlist.length);
      }
    } catch (err) {
      console.error('Error checking wishlist:', err);
    }
  };

  const fetchReviews = async () => {
    if (!product) return;
    try {
      await refetchReviews(product.id);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const checkUserRating = async () => {
    if (!product) return;
    try {
      const response = await fetch(`/api/ratings?productId=${product.id}`);
      const data = await response.json();
      if (data.success) {
        const userRating = data.ratings.find((r: any) => r.sessionId === sessionId);
        if (userRating) {
          setUserRating(userRating.rating);
          setRatingSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error checking user rating:', err);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => window.location.href = '/shop'}>Back to Shop</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const discount = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleRatingSubmit = async () => {
    if (!userRating) {
      toastError('Please select a rating');
      return;
    }

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          rating: userRating,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toastSuccess('Thank you for your rating!');
        setRatingSubmitted(true);
        // Refresh products to get updated rating
        await refetchProducts();
      } else {
        toastError(data.error || 'Failed to submit rating');
      }
    } catch (error) {
      toastError('Failed to submit rating. Please try again.');
    }
  };

  const handleWishlistToggle = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsWishlisted(data.action === 'added');
        setWishlistCount(data.action === 'added' ? wishlistCount + 1 : wishlistCount - 1);
        toastSuccess(data.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
      } else {
        toastError(data.error || 'Failed to update wishlist');
      }
    } catch (error) {
      toastError('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    const productUrl = window.location.href;

    // Check if native share API is available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on AlhamdCollection Store!`,
          url: productUrl,
        });
        toastSuccess('Shared successfully');
        return;
      } catch (error) {
        console.log('Native share failed, falling back to clipboard');
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(productUrl);
      toastSuccess('Link copied to clipboard');
    } catch (error) {
      toastError('Failed to copy link');
    }
  };

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (data.success) {
        toastSuccess('Review submitted successfully');
        setShowReviewForm(false);
        // Refresh reviews to update the UI
        await fetchReviews();
      } else {
        toastError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toastError('Something went wrong, please try again');
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await useReviewStore.getState().markHelpful(reviewId, sessionId);
      toastSuccess('Marked as helpful');
    } catch (error) {
      toastError('Failed to mark as helpful');
    }
  };

  const handleReport = async (reviewId: string) => {
    const reason = prompt('Please provide a reason for reporting this review:');
    if (reason) {
      try {
        await useReviewStore.getState().reportReview(reviewId, sessionId, reason);
        toastSuccess('Review reported successfully');
      } catch (error) {
        toastError('Failed to report review');
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate stock
    if (product.stock === 0) {
      toastError('This product is out of stock');
      return;
    }

    // Validate quantity
    if (quantity < 1) {
      toastError('Please select a valid quantity');
      return;
    }

    if (quantity > product.stock) {
      toastError(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsAddingToCart(true);

    try {
      // Add product to cart using Zustand store
      addItem(product, quantity);
      
      toastSuccess('Product added to cart successfully');
    } catch (error) {
      console.error('Add to cart error:', error);
      toastError('Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Validate stock
    if (product.stock === 0) {
      toastError('This product is out of stock');
      return;
    }

    // Validate quantity
    if (quantity < 1) {
      toastError('Please select a valid quantity');
      return;
    }

    if (quantity > product.stock) {
      toastError(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsBuyingNow(true);

    try {
      // Add product to cart using Zustand store
      addItem(product, quantity);
      
      // Redirect to checkout page
      router.push('/checkout');
    } catch (error) {
      console.error('Buy now error:', error);
      toastError('Failed to proceed to checkout. Please try again.');
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-primary">Home</a>
              <span>/</span>
              <a href="/shop" className="hover:text-primary">Shop</a>
              <span>/</span>
              <a href={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary">
                {product.category}
              </a>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative flex items-center justify-center bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={`${product.name} - Image ${selectedImage + 1}`}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    🎮
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 relative flex items-center justify-center bg-gray-100 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="100px"
                      />
                    </button>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🎮
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  {product.isNew && (
                    <Badge className="mb-2 bg-green-500">New</Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="mb-2 ml-2 bg-orange-500">Best Seller</Badge>
                  )}
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleWishlistToggle}
                    className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(parseFloat(actualAverageRating))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{actualAverageRating}</span>
                  <span className="text-muted-foreground">({actualReviewCount} reviews)</span>
                </div>
                
                {/* Guest Rating Input */}
                {!ratingSubmitted && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-2">Rate this product:</p>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(i + 1)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              i < (hoverRating || userRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {userRating > 0 && (
                      <Button
                        onClick={handleRatingSubmit}
                        className="mt-3"
                        size="sm"
                      >
                        Submit Rating
                      </Button>
                    )}
                  </div>
                )}
                
                {ratingSubmitted && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">Thank you for your rating!</p>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-primary">
                    PKR {(product.discountPrice || product.price).toLocaleString()}
                  </span>
                  {product.discountPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        PKR {product.price.toLocaleString()}
                      </span>
                      <Badge className="bg-destructive">-{discount}%</Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <X className="h-5 w-5" />
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-16 text-center font-medium">{quantity}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mb-8">
                <Button 
                  className="flex-1" 
                  size="lg" 
                  disabled={product.stock === 0 || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  disabled={product.stock === 0 || isBuyingNow}
                  onClick={handleBuyNow}
                >
                  {isBuyingNow ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Fast Delivery</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">{product.warranty} Warranty</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">7 Days Return</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mb-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">{product.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <RatingSummary reviews={productReviews} />

                  {/* Write Review Button/Form */}
                  {!showReviewForm ? (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        size="lg"
                        className="w-full md:w-auto"
                      >
                        Write a Review
                      </Button>
                    </div>
                  ) : (
                    <WriteReviewForm
                      productId={product.id}
                      sessionId={sessionId}
                      onSubmit={handleReviewSubmit}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  )}

                  {/* Review Filters */}
                  {productReviews.length > 0 && (
                    <ReviewFilters
                      reviews={productReviews}
                      sortBy={sortBy}
                      selectedRatings={selectedRatings}
                      filterVerified={filterVerified}
                      filterWithPhotos={filterWithPhotos}
                      filterWithVideos={filterWithVideos}
                      onSortByChange={setSortBy}
                      onSelectedRatingsChange={setSelectedRatings}
                      onFilterVerifiedChange={setFilterVerified}
                      onFilterWithPhotosChange={setFilterWithPhotos}
                      onFilterWithVideosChange={setFilterWithVideos}
                      onClearFilters={() => {
                        setSortBy('newest');
                        setSelectedRatings([]);
                        setFilterVerified(false);
                        setFilterWithPhotos(false);
                        setFilterWithVideos(false);
                      }}
                    />
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {filteredReviews.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Reviews Found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters to see more reviews.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold">
                            Customer Reviews ({filteredReviews.length})
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * REVIEWS_PER_PAGE) + 1}-{Math.min(currentPage * REVIEWS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length}
                          </span>
                        </div>
                        {filteredReviews
                          .slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE)
                          .map((review: any) => (
                            <ReviewCard
                              key={review.id}
                              review={review}
                              onHelpful={handleHelpful}
                              onReport={handleReport}
                              sessionId={sessionId}
                            />
                          ))}
                        
                        {/* Pagination */}
                        {filteredReviews.length > REVIEWS_PER_PAGE && (
                          <div className="flex items-center justify-center space-x-2 pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            {Array.from({ length: Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE), prev + 1))}
                              disabled={currentPage === Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

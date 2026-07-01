import { create } from 'zustand';
import { Review } from '@/types';

interface ReviewStore {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  getReviewsByProduct: (productId: string, status?: 'pending' | 'approved' | 'rejected') => Review[];
  getApprovedReviewsByProduct: (productId: string) => Review[];
  refetchReviews: (productId?: string, status?: string) => Promise<void>;
  markHelpful: (reviewId: string, sessionId: string) => Promise<void>;
  reportReview: (reviewId: string, sessionId: string, reason: string) => Promise<void>;
  addSellerReply: (reviewId: string, reply: string, sellerName: string) => Promise<void>;
  clearError: () => void;
}

export const useReviewStore = create<ReviewStore>()(
  (set, get) => ({
    reviews: [],
    isLoading: false,
    error: null,

      setReviews: (reviews) => set({ reviews }),

      addReview: (review) => {
        set((state) => ({
          reviews: [...state.reviews, review],
        }));
      },

      updateReview: (id, data) => {
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id ? { ...review, ...data, updatedAt: new Date().toISOString() } : review
          ),
        }));
      },

      deleteReview: (id) => {
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== id),
        }));
      },

      getReviewsByProduct: (productId, status) => {
        const reviews = get().reviews;
        let filtered = reviews.filter((r) => r.productId === productId);
        
        if (status) {
          filtered = filtered.filter((r) => r.status === status);
        }
        
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getApprovedReviewsByProduct: (productId) => {
        return get().getReviewsByProduct(productId, 'approved');
      },

      refetchReviews: async (productId, status) => {
        try {
          set({ isLoading: true, error: null });
          const params = new URLSearchParams();
          if (productId) params.append('productId', productId);
          if (status) params.append('status', status);

          const url = `/api/reviews${params.toString() ? '?' + params.toString() : ''}`;
          console.log('[DEBUG REVIEW STORE] Fetching reviews from:', url);
          console.log('[DEBUG REVIEW STORE] Product ID:', productId);
          console.log('[DEBUG REVIEW STORE] Status:', status);

          const response = await fetch(url, {
            cache: 'no-store',
          });
          const result = await response.json();

          console.log('[DEBUG REVIEW STORE] API response:', result);

          if (result.success && Array.isArray(result.reviews)) {
            console.log('[DEBUG REVIEW STORE] Reviews count:', result.reviews.length);
            console.log('[DEBUG REVIEW STORE] Reviews:', result.reviews);

            // If fetching specific product reviews, replace only those reviews
            if (productId) {
              set((state) => {
                // Remove existing reviews for this product
                const otherReviews = state.reviews.filter(r => r.productId !== productId);
                // Add the new reviews for this product
                const newReviews = [...otherReviews, ...result.reviews];
                console.log('[DEBUG REVIEW STORE] Updated store reviews count:', newReviews.length);
                return { reviews: newReviews, isLoading: false, error: null };
              });
            } else {
              // If fetching all reviews, replace the entire store
              console.log('[DEBUG REVIEW STORE] Replacing all reviews in store');
              set({ reviews: result.reviews, isLoading: false, error: null });
            }
          } else {
            console.log('[DEBUG REVIEW STORE] API returned error:', result.error);
            set({ isLoading: false, error: result.error || 'Failed to fetch reviews' });
          }
        } catch (error) {
          console.error('[DEBUG REVIEW STORE] Error refetching reviews:', error);
          set({ isLoading: false, error: 'Failed to fetch reviews. Please try again.' });
        }
      },

      markHelpful: async (reviewId, sessionId) => {
        try {
          const response = await fetch('/api/reviews/helpful', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewId, sessionId }),
          });
          const result = await response.json();
          if (result.success) {
            set((state) => ({
              reviews: state.reviews.map((review) =>
                review.id === reviewId
                  ? { ...review, helpful: result.helpfulCount, likes: result.likesCount }
                  : review
              ),
            }));
          }
        } catch (error) {
          console.error('Error marking helpful:', error);
        }
      },

      reportReview: async (reviewId, sessionId, reason) => {
        try {
          const response = await fetch('/api/reviews/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewId, sessionId, reason }),
          });
          const result = await response.json();
          if (result.success) {
            set((state) => ({
              reviews: state.reviews.map((review) =>
                review.id === reviewId
                  ? { ...review, reports: result.reports }
                  : review
              ),
            }));
          }
        } catch (error) {
          console.error('Error reporting review:', error);
        }
      },

      addSellerReply: async (reviewId, reply, sellerName) => {
        try {
          const response = await fetch('/api/reviews/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewId, reply, sellerName }),
          });
          const result = await response.json();
          if (result.success) {
            set((state) => ({
              reviews: state.reviews.map((review) =>
                review.id === reviewId
                  ? { ...review, sellerReply: result.sellerReply, updatedAt: new Date().toISOString() }
                  : review
              ),
            }));
          }
        } catch (error) {
          console.error('Error adding seller reply:', error);
        }
      },

      clearError: () => set({ error: null }),
    })
);

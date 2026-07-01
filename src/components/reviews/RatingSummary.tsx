'use client';

import { Star } from 'lucide-react';
import { Review } from '@/types';

interface RatingSummaryProps {
  reviews: Review[];
}

export default function RatingSummary({ reviews }: RatingSummaryProps) {
  // Calculate rating statistics dynamically
  const totalReviews = reviews.length;
  const totalRatings = reviews.length; // Each review has a rating
  
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // Calculate star distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  // Show skeleton if reviews is undefined/null (loading state)
  if (!reviews) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Rating Display */}
        <div className="flex flex-col items-center justify-center text-center md:items-start md:text-left">
          <div className="relative">
            <div className="text-6xl font-bold text-primary mb-2">
              {averageRating}
            </div>
            <div className="text-sm text-muted-foreground mb-3">out of 5</div>
          </div>
          
          {/* Star Display */}
          <div className="flex items-center justify-center md:justify-start mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${
                  i < Math.floor(parseFloat(averageRating))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Total Counts */}
          <div className="flex items-center justify-center md:justify-start space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-foreground">{totalRatings}</span>
              <span className="text-muted-foreground">ratings</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-foreground">{totalReviews}</span>
              <span className="text-muted-foreground">reviews</span>
            </div>
          </div>
        </div>

        {/* Rating Breakdown with Progress Bars */}
        <div className="space-y-3">
          {ratingDistribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm font-medium text-foreground">{stars}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
              
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex items-center space-x-2 w-20 justify-end">
                <span className="text-sm font-medium text-foreground">{count}</span>
                <span className="text-xs text-muted-foreground">
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

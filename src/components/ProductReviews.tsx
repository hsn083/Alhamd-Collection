'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Image as ImageIcon, Filter, ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
  verified: boolean;
  createdAt: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  productId: string;
}

type SortOption = 'recent' | 'highest' | 'lowest' | 'helpful';

export function ProductReviews({ reviews, averageRating, totalReviews, productId }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'withPhotos' | 'verified'>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'recent' as SortOption, label: 'Most Recent' },
    { value: 'highest' as SortOption, label: 'Highest Rated' },
    { value: 'lowest' as SortOption, label: 'Lowest Rated' },
    { value: 'helpful' as SortOption, label: 'Most Helpful' },
  ];

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterBy === 'withPhotos') return review.images && review.images.length > 0;
      if (filterBy === 'verified') return review.verified;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const handleHelpfulVote = async (reviewId: string, helpful: boolean) => {
    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, helpful }),
      });

      if (response.ok) {
        // Refresh reviews or update local state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center gap-1 my-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-sm text-gray-500">{totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filterBy === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterBy('all')}
          >
            All Reviews
          </Button>
          <Button
            variant={filterBy === 'withPhotos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterBy('withPhotos')}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            With Photos
          </Button>
          <Button
            variant={filterBy === 'verified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterBy('verified')}
          >
            Verified
          </Button>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {sortOptions.find(opt => opt.value === sortBy)?.label}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>

          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortMenu(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No reviews found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatar} />
                    <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.user.name}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-semibold mb-2">{review.title}</h4>
                    )}

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border"
                          >
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulVote(review._id, true)}
                        className="text-gray-600 hover:text-green-600"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulVote(review._id, false)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Not Helpful ({review.notHelpful})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Write Review Button */}
      <Button className="w-full" size="lg">
        Write a Review
      </Button>
    </div>
  );
}

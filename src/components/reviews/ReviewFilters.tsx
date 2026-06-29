'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, X, Image as ImageIcon, Video, CheckCircle } from 'lucide-react';
import { Review } from '@/types';

interface ReviewFiltersProps {
  reviews: Review[];
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  selectedRatings: number[];
  filterVerified: boolean;
  filterWithPhotos: boolean;
  filterWithVideos: boolean;
  onSortByChange: (value: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful') => void;
  onSelectedRatingsChange: (ratings: number[]) => void;
  onFilterVerifiedChange: (value: boolean) => void;
  onFilterWithPhotosChange: (value: boolean) => void;
  onFilterWithVideosChange: (value: boolean) => void;
  onClearFilters: () => void;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';

export default function ReviewFilters({
  reviews,
  sortBy,
  selectedRatings,
  filterVerified,
  filterWithPhotos,
  filterWithVideos,
  onSortByChange,
  onSelectedRatingsChange,
  onFilterVerifiedChange,
  onFilterWithPhotosChange,
  onFilterWithVideosChange,
  onClearFilters
}: ReviewFiltersProps) {
  const toggleRating = useCallback((rating: number) => {
    onSelectedRatingsChange(
      selectedRatings.includes(rating)
        ? selectedRatings.filter(r => r !== rating)
        : [...selectedRatings, rating]
    );
  }, [selectedRatings, onSelectedRatingsChange]);

  const hasActiveFilters = selectedRatings.length > 0 || filterVerified || filterWithPhotos || filterWithVideos || sortBy !== 'newest';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sort */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rating Filters */}
          <div className="flex items-center space-x-1">
            {[5, 4, 3, 2, 1].map(rating => (
              <Button
                key={rating}
                variant={selectedRatings.includes(rating) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRating(rating)}
                className="min-w-8"
              >
                <Star className={`h-4 w-4 ${selectedRatings.includes(rating) ? 'fill-white text-white' : ''}`} />
              </Button>
            ))}
          </div>

          {/* Verified Purchase Filter */}
          <Button
            variant={filterVerified ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterVerifiedChange(!filterVerified)}
            className={filterVerified ? "bg-green-500 hover:bg-green-600" : ""}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Verified
          </Button>

          {/* Photos Filter */}
          <Button
            variant={filterWithPhotos ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterWithPhotosChange(!filterWithPhotos)}
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Photos
          </Button>

          {/* Videos Filter */}
          <Button
            variant={filterWithVideos ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterWithVideosChange(!filterWithVideos)}
          >
            <Video className="h-4 w-4 mr-1" />
            Videos
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedRatings.map(rating => (
            <Badge key={rating} variant="secondary" className="cursor-pointer" onClick={() => toggleRating(rating)}>
              {rating} <Star className="h-3 w-3 ml-1 fill-current" />
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filterVerified && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => onFilterVerifiedChange(false)}>
              Verified <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filterWithPhotos && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => onFilterWithPhotosChange(false)}>
              Photos <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filterWithVideos && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => onFilterWithVideosChange(false)}>
              Videos <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

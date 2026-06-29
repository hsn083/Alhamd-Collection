'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, Flag, Calendar, CheckCircle, Video, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  sessionId?: string;
}

export default function ReviewCard({ review, onHelpful, onReport, sessionId }: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);

  const handleHelpful = useCallback(() => {
    if (onHelpful && !isHelpful) {
      onHelpful(review.id);
      setIsHelpful(true);
    }
  }, [onHelpful, isHelpful, review.id]);

  const handleReport = useCallback(() => {
    if (onReport) {
      onReport(review.id);
    }
  }, [onReport, review.id]);

  const formatDate = useMemo(() => {
    return (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      {/* Customer Info Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            {review.avatar ? (
              <Image
                src={review.avatar}
                alt={review.customerName}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-lg">
                {review.customerName.charAt(0).toUpperCase()}
              </div>
            )}
            {review.isVerifiedPurchase && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Customer Name & Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">{review.customerName}</h3>
              {review.isVerifiedPurchase && (
                <Badge className="bg-green-500 text-xs">Verified Purchase</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Report Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReport}
          className="text-muted-foreground hover:text-destructive"
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>

      {/* Review Title */}
      {review.title && (
        <h4 className="font-medium text-lg mb-2 text-foreground">{review.title}</h4>
      )}

      {/* Review Content */}
      <p className="text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>

      {/* Product Variant */}
      {review.variant && (review.variant.color || review.variant.size || review.variant.material) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.variant.color && (
            <Badge variant="outline" className="text-xs">
              Color: {review.variant.color}
            </Badge>
          )}
          {review.variant.size && (
            <Badge variant="outline" className="text-xs">
              Size: {review.variant.size}
            </Badge>
          )}
          {review.variant.material && (
            <Badge variant="outline" className="text-xs">
              Material: {review.variant.material}
            </Badge>
          )}
        </div>
      )}

      {/* Review Images Gallery */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>{review.images.length} photo{review.images.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.images.map((image, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-primary transition-colors">
                    <Image
                      src={image}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="relative w-full h-[600px]">
                    <Image
                      src={image}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      )}

      {/* Review Video */}
      {review.video && (
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>Video</span>
          </div>
          <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-gray-200">
            <video
              src={review.video}
              controls
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Seller Reply */}
      {review.sellerReply && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
              {review.sellerReply.sellerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm text-foreground">
                  {review.sellerReply.sellerName}
                </span>
                <Badge className="bg-primary text-xs">Seller</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{review.sellerReply.reply}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDate(review.sellerReply.date)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button
          variant={isHelpful ? "default" : "outline"}
          size="sm"
          onClick={handleHelpful}
          disabled={isHelpful}
          className={isHelpful ? "bg-green-500 hover:bg-green-600" : ""}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Helpful ({review.helpful})
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Star, Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface WriteReviewFormProps {
  productId: string;
  sessionId: string;
  onSubmit: (reviewData: any) => Promise<void>;
  onCancel?: () => void;
  variants?: {
    colors?: string[];
    sizes?: string[];
    materials?: string[];
  };
}

export default function WriteReviewForm({
  productId,
  sessionId,
  onSubmit,
  onCancel,
  variants,
}: WriteReviewFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const MAX_IMAGES = 5;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('files', file));
      formData.append('isVideo', 'false');

      const response = await fetch('/api/upload/review-images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImages([...images, ...result.files]);
        success('Images uploaded successfully');
      } else {
        error(result.error || 'Failed to upload images');
      }
    } catch (err) {
      error('Failed to upload images');
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (video) {
      error('Only one video allowed per review');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('isVideo', 'true');

      const response = await fetch('/api/upload/review-images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setVideo(result.files[0]);
        success('Video uploaded successfully');
      } else {
        error(result.error || 'Failed to upload video');
      }
    } catch (err) {
      error('Failed to upload video');
    } finally {
      setIsUploading(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || name.trim().length < 2) {
      error('Please enter your name (at least 2 characters)');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error('Please enter a valid email address');
      return;
    }

    if (rating === 0) {
      error('Please select a rating');
      return;
    }

    if (!comment || comment.trim().length < 10) {
      error('Please write a review (at least 10 characters)');
      return;
    }

    if (comment.trim().length > 1000) {
      error('Review must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        productId,
        customerName: name.trim(),
        customerEmail: email.trim(),
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
        video,
        variant: {
          color: selectedColor || undefined,
          size: selectedSize || undefined,
          material: selectedMaterial || undefined,
        },
        sessionId,
      };

      await onSubmit(reviewData);

      // Reset form
      setName('');
      setEmail('');
      setRating(0);
      setHoverRating(0);
      setTitle('');
      setComment('');
      setSelectedColor('');
      setSelectedSize('');
      setSelectedMaterial('');
      setImages([]);
      setVideo(null);

      success('Review submitted successfully!');
    } catch (err) {
      error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold mb-6 text-foreground">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Your Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label>Rating *</Label>
          <div className="flex items-center space-x-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    i < (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              You rated this product {rating} star{rating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <Label htmlFor="title">Review Title (Optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review"
            maxLength={100}
            className="mt-1"
          />
        </div>

        {/* Review Comment */}
        <div>
          <Label htmlFor="comment">Your Review *</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={5}
            required
            minLength={10}
            maxLength={1000}
            className="mt-1 resize-none"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              Minimum 10 characters
            </span>
            <span className="text-xs text-muted-foreground">
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Product Variants */}
        {(variants?.colors || variants?.sizes || variants?.materials) && (
          <div className="space-y-4">
            {variants?.colors && variants.colors.length > 0 && (
              <div>
                <Label>Color (Optional)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variants.colors.map((color) => (
                    <Badge
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {variants?.sizes && variants.sizes.length > 0 && (
              <div>
                <Label>Size (Optional)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variants.sizes.map((size) => (
                    <Badge
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {variants?.materials && variants.materials.length > 0 && (
              <div>
                <Label>Material (Optional)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variants.materials.map((material) => (
                    <Badge
                      key={material}
                      variant={selectedMaterial === material ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedMaterial(selectedMaterial === material ? '' : material)}
                    >
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <Label>Upload Images (Optional - Max {MAX_IMAGES})</Label>
          <div className="mt-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading || images.length >= MAX_IMAGES}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading || images.length >= MAX_IMAGES}
                asChild
              >
                <span className="cursor-pointer">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add Images
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((image, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={image}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <Label>Upload Video (Optional - Max 1)</Label>
          <div className="mt-2">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={isUploading || !!video}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading || !!video}
                asChild
              >
                <span className="cursor-pointer">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Add Video
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>

          {/* Video Preview */}
          {video && (
            <div className="mt-3 relative max-w-md">
              <video
                src={video}
                controls
                className="w-full rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

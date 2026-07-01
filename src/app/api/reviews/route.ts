import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Validate and sanitize review data
function validateReviewData(data: any): { isValid: boolean; error?: string; sanitized?: any } {
  const { productId, customerName, customerEmail, rating, title, comment, images, video, variant } = data;

  // Validate productId is a valid ObjectId or string
  if (!productId || (typeof productId === 'string' && !productId.trim())) {
    return { isValid: false, error: 'Product ID is required' };
  }

  // Don't sanitize productId - keep it as-is for ObjectId conversion
  const sanitized: any = {
    productId: productId, // Keep original for ObjectId conversion
    customerName: sanitizeInput(String(customerName || '')),
    customerEmail: sanitizeInput(String(customerEmail || '')),
    rating: parseInt(rating, 10),
    comment: sanitizeInput(String(comment || '')),
    images: Array.isArray(images) ? images.map((img: string) => sanitizeInput(String(img))) : [],
  };

  // Optional fields
  if (title) {
    sanitized.title = sanitizeInput(String(title));
    if (sanitized.title.length > 100) {
      return { isValid: false, error: 'Title must be less than 100 characters' };
    }
  }

  if (video) {
    sanitized.video = sanitizeInput(String(video));
  }

  if (variant) {
    sanitized.variant = {
      color: variant.color ? sanitizeInput(String(variant.color)) : undefined,
      size: variant.size ? sanitizeInput(String(variant.size)) : undefined,
      material: variant.material ? sanitizeInput(String(variant.material)) : undefined,
    };
  }

  // Validate required fields (productId already validated above)

  if (!sanitized.customerName || sanitized.customerName.length < 2 || sanitized.customerName.length > 100) {
    return { isValid: false, error: 'Name must be between 2 and 100 characters' };
  }

  if (!sanitized.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.customerEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (!sanitized.rating || isNaN(sanitized.rating) || sanitized.rating < 1 || sanitized.rating > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5' };
  }

  if (!sanitized.comment || sanitized.comment.length < 10 || sanitized.comment.length > 1000) {
    return { isValid: false, error: 'Comment must be between 10 and 1000 characters' };
  }

  return { isValid: true, sanitized };
}

// POST - Submit a review
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { sessionId, userId } = body;

    console.log('[DEBUG POST REVIEW] Received body:', body);

    // Validate and sanitize review data
    const validation = validateReviewData(body);
    if (!validation.isValid) {
      console.log('[DEBUG POST REVIEW] Validation failed:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { productId, customerName, customerEmail, rating, title, comment, images, video, variant } = validation.sanitized!;

    console.log('[DEBUG POST REVIEW] Sanitized data:', { productId, customerName, customerEmail, rating, comment });

    // Convert productId to ObjectId
    let productObjectId;
    try {
      productObjectId = new mongoose.Types.ObjectId(productId);
    } catch (err) {
      console.log('[DEBUG POST REVIEW] Invalid productId format:', productId);
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productObjectId);
    if (!product) {
      console.log('[DEBUG POST REVIEW] Product not found:', productId);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('[DEBUG POST REVIEW] Product found:', product.name);

    // Check if user already reviewed (1-hour cooldown for guests, 1 review per user)
    if (userId) {
      const existingReview = await Review.findOne({ product: productObjectId, user: userId });
      if (existingReview) {
        console.log('[DEBUG POST REVIEW] User already reviewed');
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    } else if (sessionId) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentReview = await Review.findOne({
        product: productObjectId,
        sessionId,
        createdAt: { $gte: oneHourAgo }
      });
      if (recentReview) {
        console.log('[DEBUG POST REVIEW] Recent review found for session');
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product. Please wait before reviewing again.' },
          { status: 429 }
        );
      }
    }

    // Create new review
    const newReview = await Review.create({
      product: productObjectId,
      user: userId,
      customerName,
      customerEmail,
      rating,
      comment,
      images,
      variant,
      isVerifiedPurchase: false,
      likes: 0,
      helpful: 0,
      helpfulUsers: [],
      status: 'approved',
      sessionId,
    });

    console.log('[DEBUG POST REVIEW] Review created:', JSON.stringify(newReview, null, 2));

    // Update product rating and review count
    const allReviews = await Review.find({ product: productObjectId, status: 'approved' });
    const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    console.log('[DEBUG POST REVIEW] All approved reviews count:', allReviews.length);
    console.log('[DEBUG POST REVIEW] Average rating:', averageRating);

    const updatedProduct = await Product.findByIdAndUpdate(
      productObjectId,
      {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length,
      },
      { new: true }
    );

    console.log('[DEBUG POST REVIEW] Updated product:', JSON.stringify(updatedProduct, null, 2));

    // Transform review to match frontend type expectations
    const reviewObj = newReview.toObject();
    const transformedReview = {
      ...reviewObj,
      id: newReview._id.toString(),
      productId: productObjectId.toString(), // Use the ObjectId as string
    };

    // Transform product to match frontend type expectations
    if (!updatedProduct) {
      return NextResponse.json({
        success: true,
        message: 'Review submitted successfully',
        review: transformedReview,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    const productObj = updatedProduct.toObject();
    const transformedProduct = {
      ...productObj,
      id: updatedProduct._id.toString(),
      reviewCount: productObj.reviewCount || 0,
    };

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: transformedReview,
      product: transformedProduct,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET - Get reviews for a product or all reviews (for admin)
// This endpoint is PUBLIC - no authentication required
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const allReviews = searchParams.get('all') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('[DEBUG GET REVIEWS] Request params:', { productId, status, allReviews, page, limit });

    const query: any = {};

    // Convert productId to ObjectId if provided
    if (productId && !allReviews) {
      try {
        query.product = new mongoose.Types.ObjectId(productId);
      } catch (err) {
        console.log('[DEBUG GET REVIEWS] Invalid productId format:', productId);
        return NextResponse.json(
          { success: false, error: 'Invalid product ID format' },
          { status: 400 }
        );
      }
    }

    if (status) {
      query.status = status;
    } else if (!allReviews) {
      query.status = 'approved';
    }

    console.log('[DEBUG GET REVIEWS] Query:', query);

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate('product', '_id name slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('[DEBUG GET REVIEWS] Found reviews count:', reviews.length);
    console.log('[DEBUG GET REVIEWS] Reviews:', JSON.stringify(reviews, null, 2));

    const total = await Review.countDocuments(query);
    console.log('[DEBUG GET REVIEWS] Total reviews in DB:', total);

    // Transform reviews to match frontend type expectations
    const transformedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      return {
        ...reviewObj,
        id: review._id.toString(),
        productId: reviewObj.product?._id?.toString() || reviewObj.product?.toString() || '',
        // Keep the product object for display purposes
        product: reviewObj.product,
      };
    });

    console.log('[DEBUG GET REVIEWS] Transformed reviews count:', transformedReviews.length);
    console.log('[DEBUG GET REVIEWS] Transformed reviews:', JSON.stringify(transformedReviews, null, 2));

    // Calculate rating statistics if fetching for a specific product
    let ratingStats = null;
    if (productId && !allReviews) {
      try {
        const productObjectId = new mongoose.Types.ObjectId(productId);
        const approvedReviews = await Review.find({ product: productObjectId, status: 'approved' });
        const totalReviews = approvedReviews.length;

        console.log('[DEBUG GET REVIEWS] Approved reviews for rating stats:', totalReviews);

        if (totalReviews > 0) {
          const totalRating = approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
          const averageRating = totalRating / totalReviews;

          // Calculate rating distribution
          const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
            stars,
            count: approvedReviews.filter((r: any) => r.rating === stars).length,
            percentage: (approvedReviews.filter((r: any) => r.rating === stars).length / totalReviews) * 100
          }));

          ratingStats = {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews,
            ratingDistribution
          };
        } else {
          ratingStats = {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: [5, 4, 3, 2, 1].map(stars => ({
              stars,
              count: 0,
              percentage: 0
            }))
          };
        }
      } catch (err) {
        console.log('[DEBUG GET REVIEWS] Error calculating rating stats:', err);
        ratingStats = {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [5, 4, 3, 2, 1].map(stars => ({
            stars,
            count: 0,
            percentage: 0
          }))
        };
      }
    }

    console.log('[DEBUG GET REVIEWS] Rating stats:', ratingStats);
    console.log('[DEBUG GET REVIEWS] Final response:', JSON.stringify({
      success: true,
      reviews: transformedReviews,
      count: transformedReviews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      ratingStats,
    }, null, 2));

    return NextResponse.json({
      success: true,
      reviews: transformedReviews,
      count: transformedReviews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      ratingStats,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// PUT - Update a review (admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, status, isVerifiedPurchase, adminReply } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (isVerifiedPurchase !== undefined) updateData.isVerifiedPurchase = isVerifiedPurchase;
    if (adminReply) {
      updateData.adminReply = {
        comment: adminReply.comment,
        repliedAt: new Date(),
        repliedBy: adminReply.repliedBy,
      };
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('product', '_id name slug');

    if (!updatedReview) {
      return NextResponse.json(
        { success: false, error: 'Failed to update review' },
        { status: 500 }
      );
    }

    // Update product rating if status changed
    if (status) {
      const allReviews = await Review.find({ product: review.product, status: 'approved' });
      const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

      const updatedProduct = await Product.findByIdAndUpdate(review.product, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length,
      }, { new: true });

      // Transform review to match frontend type expectations
      const reviewObj = updatedReview.toObject();
      const transformedReview = {
        ...reviewObj,
        id: updatedReview._id.toString(),
        productId: reviewObj.product?._id?.toString() || reviewObj.product?.toString() || '',
      };

      // Transform product to match frontend type expectations
      if (updatedProduct) {
        const productObj = updatedProduct.toObject();
        const transformedProduct = {
          ...productObj,
          id: updatedProduct._id.toString(),
          reviewCount: productObj.reviewCount || 0,
        };

        return NextResponse.json({
          success: true,
          message: 'Review updated successfully',
          review: transformedReview,
          product: transformedProduct,
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Review updated successfully',
        review: transformedReview,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    // Transform review to match frontend type expectations
    const reviewObj = updatedReview.toObject();
    const transformedReview = {
      ...reviewObj,
      id: updatedReview._id.toString(),
      productId: reviewObj.product?._id?.toString() || reviewObj.product?.toString() || '',
    };

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: transformedReview,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    await Review.findByIdAndDelete(id);

    // Update product rating
    const allReviews = await Review.find({ product: review.product, status: 'approved' });
    const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

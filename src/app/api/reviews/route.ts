import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';

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

  // Sanitize string inputs
  const sanitized: any = {
    productId: sanitizeInput(String(productId || '')),
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

  // Validate required fields
  if (!sanitized.productId || sanitized.productId.length === 0) {
    return { isValid: false, error: 'Product ID is required' };
  }

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

    // Validate and sanitize review data
    const validation = validateReviewData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { productId, customerName, customerEmail, rating, title, comment, images, video, variant } = validation.sanitized!;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed (1-hour cooldown for guests, 1 review per user)
    if (userId) {
      const existingReview = await Review.findOne({ product: productId, user: userId });
      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    } else if (sessionId) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentReview = await Review.findOne({
        product: productId,
        sessionId,
        createdAt: { $gte: oneHourAgo }
      });
      if (recentReview) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product. Please wait before reviewing again.' },
          { status: 429 }
        );
      }
    }

    // Create new review
    const newReview = await Review.create({
      product: productId,
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

    // Update product rating and review count
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length,
      },
      { new: true }
    );

    // Transform review to match frontend type expectations
    const reviewObj = newReview.toObject();
    const transformedReview = {
      ...reviewObj,
      id: newReview._id.toString(),
      productId: reviewObj.product?.toString() || productId,
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
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const allReviews = searchParams.get('all') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    
    if (productId && !allReviews) {
      query.product = productId;
    }

    if (status) {
      query.status = status;
    } else if (!allReviews) {
      query.status = 'approved';
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate('product', 'name slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

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

    return NextResponse.json({
      success: true,
      reviews: transformedReviews,
      count: transformedReviews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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
    ).populate('product', 'name slug');

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

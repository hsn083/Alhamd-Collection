import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication via cookie
    const authCookie = request.cookies.get('adminAuth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Hero Banner Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageType = (formData.get('imageType') as 'desktop' | 'mobile') || 'desktop';

    console.log('File received:', file?.name, file?.size, file?.type);
    console.log('Image type:', imageType);

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary is not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.name, file.type);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for hero banners)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File size exceeds limit:', file.size);
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    console.log('Converting file to buffer...');
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Buffer created, size:', buffer.length);
    console.log('Uploading to Cloudinary...');

    // Set transformations - optimize quality but don't force crop
    let transformations: any[] = [];
    
    // Only optimize quality, preserve original dimensions
    transformations = [
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ];

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'hero-banners',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          max_file_size: maxSize,
          transformation: transformations,
          format: 'webp', // Always convert to WebP
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    console.log('Upload successful:', uploadResult.secure_url);
    console.log('[DEBUG] Hero banner image uploaded to Cloudinary:', uploadResult.public_id);
    console.log('[DEBUG] File size:', uploadResult.bytes);
    
    // Calculate aspect ratio from original dimensions
    const aspectRatio = `${uploadResult.width}/${uploadResult.height}`;
    
    // Check aspect ratio against recommended sizes
    const recommendedAspectRatio = imageType === 'desktop' ? '1920/800' : '768/960';
    const recommendedRatio = imageType === 'desktop' ? 2.4 : 0.8; // 12:5 = 2.4, 4:5 = 0.8
    const actualRatio = uploadResult.width / uploadResult.height;
    
    // Allow 10% tolerance for aspect ratio differences
    const tolerance = 0.1;
    const ratioDiff = Math.abs(actualRatio - recommendedRatio) / recommendedRatio;
    const aspectRatioWarning = ratioDiff > tolerance;
    
    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        originalSize: file.size,
        optimizedSize: uploadResult.bytes,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        aspectRatio: aspectRatio,
        format: uploadResult.format,
        aspectRatioWarning: aspectRatioWarning,
        recommendedSize: imageType === 'desktop' ? '1920×800px' : '768×960px',
        recommendedAspectRatio: recommendedAspectRatio,
      },
    });
  } catch (error) {
    console.error('Error uploading hero banner image:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload hero banner image' },
      { status: 500 }
    );
  }
}

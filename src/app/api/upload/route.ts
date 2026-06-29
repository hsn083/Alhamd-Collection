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
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = (formData.get('uploadType') as 'products' | 'categories') || 'products';

    console.log('File received:', file?.name, file?.size, file?.type);
    console.log('Upload type:', uploadType);

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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.name, file.type);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('File size exceeds limit:', file.size);
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    console.log('Converting file to buffer...');
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Buffer created, size:', buffer.length);
    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const folder = uploadType === 'products' ? 'products' : 'categories';
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          max_file_size: maxSize,
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Generate thumbnail URL for products
    let thumbnailUrl: string | undefined;
    if (uploadType === 'products') {
      thumbnailUrl = cloudinary.url(uploadResult.public_id, {
        transformation: [
          { width: 300, height: 300, crop: 'fill', quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });
    }

    console.log('Upload successful:', uploadResult.secure_url);
    console.log('[DEBUG] Image uploaded to Cloudinary:', uploadResult.public_id);
    console.log('[DEBUG] Thumbnail URL:', thumbnailUrl);
    console.log('[DEBUG] File size:', uploadResult.bytes);
    
    return NextResponse.json({
      success: true,
      data: {
        optimizedPath: uploadResult.secure_url,
        thumbnailPath: thumbnailUrl,
        originalSize: file.size,
        optimizedSize: uploadResult.bytes,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}

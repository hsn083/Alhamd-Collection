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

const MAX_IMAGES = 5;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary is not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const isVideo = formData.get('isVideo') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate number of images
    if (!isVideo && files.length > MAX_IMAGES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Validate video (only one video allowed)
    if (isVideo && files.length > 1) {
      return NextResponse.json(
        { success: false, error: 'Only one video allowed per review' },
        { status: 400 }
      );
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      // Validate file type
      if (isVideo) {
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid video type. Only MP4, WebM, and OGG are allowed.' },
            { status: 400 }
          );
        }
        // Validate video size
        if (file.size > MAX_VIDEO_SIZE) {
          return NextResponse.json(
            { success: false, error: 'Video size exceeds 50MB limit' },
            { status: 400 }
          );
        }
      } else {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed.' },
            { status: 400 }
          );
        }
        // Validate image size
        if (file.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { success: false, error: 'Image size exceeds 10MB limit' },
            { status: 400 }
          );
        }
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'reviews',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: isVideo ? ['mp4', 'webm', 'ogg'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            max_file_size: isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE,
            transformation: isVideo ? [] : [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      uploadedFiles.push(uploadResult.secure_url);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: isVideo ? 'Video uploaded successfully' : `${uploadedFiles.length} image(s) uploaded successfully`,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error('Error uploading review files:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}

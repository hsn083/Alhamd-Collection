import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_IMAGES = 5;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Generate unique filename
function generateFilename(originalName: string, isVideo: boolean = false) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = isVideo ? '.mp4' : originalName.split('.').pop();
  return `review-${timestamp}-${random}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
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

    const uploadDir = await ensureUploadDir();
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

      // Generate filename and save
      const filename = generateFilename(file.name, isVideo);
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // Return public URL
      const publicUrl = `/uploads/reviews/${filename}`;
      uploadedFiles.push(publicUrl);
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

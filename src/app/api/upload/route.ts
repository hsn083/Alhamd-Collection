import { NextRequest, NextResponse } from 'next/server';
import { processImage, isValidImageFile } from '@/lib/image-processor';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = (formData.get('uploadType') as 'products' | 'categories') || 'products';

    console.log('File received:', file?.name, file?.size, file?.type);
    console.log('Upload type:', uploadType);

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageFile(file.name, file.type)) {
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
    console.log('Processing image...');

    // Process image with compression and resizing
    const result = await processImage(buffer, file.name, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 85,
      generateThumbnail: uploadType === 'products',
      thumbnailSize: 300,
      uploadType,
    });

    console.log('Image processing result:', result);

    if (!result.success) {
      console.error('Image processing failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process image' },
        { status: 500 }
      );
    }

    console.log('Upload successful:', result.optimizedPath);
    console.log('[DEBUG] Image saved to:', result.optimizedPath);
    console.log('[DEBUG] Thumbnail saved to:', result.thumbnailPath);
    console.log('[DEBUG] File size reduced from:', result.originalSize, 'to:', result.optimizedSize);
    return NextResponse.json({
      success: true,
      data: {
        optimizedPath: result.optimizedPath,
        thumbnailPath: result.thumbnailPath,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        thumbnailSize: result.thumbnailSize,
        compressionRatio: result.originalSize && result.optimizedSize 
          ? ((1 - result.optimizedSize / result.originalSize) * 100).toFixed(2) + '%'
          : undefined,
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

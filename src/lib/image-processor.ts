import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface ProcessedImageResult {
  success: boolean;
  originalPath?: string;
  optimizedPath?: string;
  thumbnailPath?: string;
  error?: string;
  originalSize?: number;
  optimizedSize?: number;
  thumbnailSize?: number;
}

const PUBLIC_DIR = join(process.cwd(), 'public');
const UPLOADS_DIR = join(PUBLIC_DIR, 'uploads');
const PRODUCTS_DIR = join(UPLOADS_DIR, 'products');
const CATEGORIES_DIR = join(UPLOADS_DIR, 'categories');
const THUMBNAILS_DIR = join(PRODUCTS_DIR, 'thumbnails');

// Ensure directories exist
async function ensureDirectories(uploadType: 'products' | 'categories' = 'products') {
  const dirs = [UPLOADS_DIR];
  if (uploadType === 'products') {
    dirs.push(PRODUCTS_DIR, THUMBNAILS_DIR);
  } else if (uploadType === 'categories') {
    dirs.push(CATEGORIES_DIR);
  }
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Process an uploaded image with compression, resizing, and WebP conversion
 */
export async function processImage(
  buffer: Buffer,
  filename: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    generateThumbnail?: boolean;
    thumbnailSize?: number;
    uploadType?: 'products' | 'categories';
  } = {}
): Promise<ProcessedImageResult> {
  try {
    console.log('processImage called with:', filename, 'buffer size:', buffer.length);
    const uploadType = options.uploadType || 'products';
    await ensureDirectories(uploadType);
    console.log('Directories ensured for:', uploadType);

    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 85,
      generateThumbnail = true,
      thumbnailSize = 300,
    } = options;

    const originalSize = buffer.length;
    // Sanitize filename to remove spaces and special characters
    const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();

    // Determine target directory based on upload type
    const targetDir = uploadType === 'categories' ? CATEGORIES_DIR : PRODUCTS_DIR;
    const urlPrefix = uploadType === 'categories' ? '/uploads/categories' : '/uploads/products';

    console.log('Processing main image...');
    // Process main image
    const optimizedImage = sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    const optimizedBuffer = await optimizedImage;
    console.log('Main image processed, size:', optimizedBuffer.length);
    const optimizedFilename = `${baseName}-${timestamp}.webp`;
    const optimizedPath = join(targetDir, optimizedFilename);
    console.log('Writing optimized image to:', optimizedPath);
    await writeFile(optimizedPath, optimizedBuffer);
    console.log('Optimized image written successfully');

    let thumbnailPath: string | undefined;
    let thumbnailFileSize: number | undefined;

    // Generate thumbnail if requested (only for products)
    if (generateThumbnail && uploadType === 'products') {
      console.log('Generating thumbnail...');
      const thumbnailImage = sharp(buffer)
        .resize(thumbnailSize, thumbnailSize, {
          fit: 'cover',
          withoutEnlargement: true,
        })
        .webp({ quality: quality - 10 })
        .toBuffer();

      const thumbnailBuffer = await thumbnailImage;
      console.log('Thumbnail processed, size:', thumbnailBuffer.length);
      const thumbnailFilename = `${baseName}-${timestamp}-thumb.webp`;
      thumbnailPath = join(THUMBNAILS_DIR, thumbnailFilename);
      console.log('Writing thumbnail to:', thumbnailPath);
      await writeFile(thumbnailPath, thumbnailBuffer);
      console.log('Thumbnail written successfully');
      thumbnailFileSize = thumbnailBuffer.length;
    }

    const result = {
      success: true,
      optimizedPath: `${urlPrefix}/${optimizedFilename}`,
      thumbnailPath: thumbnailPath ? `/uploads/products/thumbnails/${optimizedFilename.replace('.webp', '-thumb.webp')}` : undefined,
      originalSize,
      optimizedSize: optimizedBuffer.length,
      thumbnailSize: thumbnailFileSize,
    };
    console.log('Process image completed successfully:', result);
    return result;
  } catch (error) {
    console.error('Error processing image:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process multiple images
 */
export async function processMultipleImages(
  files: { buffer: Buffer; filename: string }[],
  options?: Parameters<typeof processImage>[2]
): Promise<ProcessedImageResult[]> {
  return Promise.all(files.map(file => processImage(file.buffer, file.filename, options)));
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

/**
 * Validate image file
 */
export function isValidImageFile(filename: string, mimeType: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension) && validMimeTypes.includes(mimeType);
}

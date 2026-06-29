import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Security configurations
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

// Rate limiting (simple in-memory)
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_UPLOADS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = uploadAttempts.get(ip);

  if (!attempts || now > attempts.resetTime) {
    uploadAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (attempts.count >= MAX_UPLOADS_PER_MINUTE) {
    return false;
  }

  attempts.count++;
  return true;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function validateFileExtension(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? ALLOWED_EXTENSIONS.includes(extension) : false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many upload attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed types: JPG, JPEG, PNG, WEBP, PDF' },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!validateFileExtension(file.name)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file extension. Allowed extensions: jpg, jpeg, png, webp, pdf' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate file content (basic check for empty files)
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'File is empty' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-screenshots');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename with sanitized components
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedOrderId = orderId ? sanitizeFilename(orderId) : 'temp';
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${sanitizedOrderId}-${timestamp}-${randomString}.${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Additional content validation for images (check for valid image signatures)
    if (file.type.startsWith('image/')) {
      const validImageSignatures = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/webp': [0x52, 0x49, 0x46, 0x46]
      };

      const signature = validImageSignatures[file.type as keyof typeof validImageSignatures];
      if (signature) {
        const fileSignature = Array.from(buffer.slice(0, signature.length));
        const isValidSignature = signature.every((byte, index) => fileSignature[index] === byte);
        
        if (!isValidSignature) {
          return NextResponse.json(
            { success: false, error: 'Invalid file content. File does not match its declared type.' },
            { status: 400 }
          );
        }
      }
    }

    // Write file to disk
    await writeFile(filepath, buffer);

    // Return the URL
    const url = `/uploads/payment-screenshots/${filename}`;

    console.log(`Payment screenshot uploaded: ${filename} for order: ${orderId}`);

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename
    });
  } catch (error: any) {
    console.error('Error uploading payment screenshot:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

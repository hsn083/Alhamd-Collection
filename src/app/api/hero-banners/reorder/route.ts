import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroBanner from '@/models/HeroBanner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST reorder hero banners (admin only)
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

    await connectDB();

    const body = await request.json();
    const { bannerIds } = body;

    if (!Array.isArray(bannerIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner IDs format' },
        { status: 400 }
      );
    }

    // Update display order for all banners
    const updatePromises = bannerIds.map((bannerId: string, index: number) => {
      return HeroBanner.findByIdAndUpdate(bannerId, { displayOrder: index });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Hero banners reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering hero banners:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder hero banners',
      },
      { status: 500 }
    );
  }
}

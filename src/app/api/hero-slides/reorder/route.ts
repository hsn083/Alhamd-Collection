import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroSlide from '@/models/HeroSlide';

// POST /api/hero-slides/reorder - Reorder hero slides
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { slides } = body;
    
    if (!Array.isArray(slides)) {
      return NextResponse.json(
        {
          success: false,
          error: 'slides must be an array',
        },
        { status: 400 }
      );
    }
    
    // Update each slide's order
    const updatePromises = slides.map((slide: { id: string; order: number }) =>
      HeroSlide.findByIdAndUpdate(slide.id, { order: slide.order })
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      success: true,
      message: 'Slides reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering hero slides:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reorder hero slides',
      },
      { status: 500 }
    );
  }
}

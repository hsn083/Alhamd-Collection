import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroSlide from '@/models/HeroSlide';

// GET /api/hero-slides - Get all hero slides
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    let query = {};
    if (activeOnly) {
      query = { isActive: true };
    }
    
    const slides = await HeroSlide.find(query).sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      slides,
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hero slides',
      },
      { status: 500 }
    );
  }
}

// POST /api/hero-slides - Create a new hero slide
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'subtitle', 'imageDesktop', 'imageMobile', 'buttonText', 'buttonLink'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`,
          },
          { status: 400 }
        );
      }
    }
    
    // Get the highest order value
    const lastSlide = await HeroSlide.findOne().sort({ order: -1 });
    const nextOrder = lastSlide ? lastSlide.order + 1 : 0;
    
    const slide = await HeroSlide.create({
      ...body,
      order: body.order !== undefined ? body.order : nextOrder,
    });
    
    return NextResponse.json({
      success: true,
      slide,
    });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create hero slide',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroSlide from '@/models/HeroSlide';

// PUT /api/hero-slides/:id - Update a hero slide
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id } = params;
    
    const slide = await HeroSlide.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hero slide not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      slide,
    });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update hero slide',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/hero-slides/:id - Delete a hero slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const slide = await HeroSlide.findByIdAndDelete(id);
    
    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hero slide not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Hero slide deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete hero slide',
      },
      { status: 500 }
    );
  }
}

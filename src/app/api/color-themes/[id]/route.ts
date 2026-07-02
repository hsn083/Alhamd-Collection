import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ColorTheme from '@/models/ColorTheme';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch single color theme
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const theme = await ColorTheme.findById(params.id);
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Color theme not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error('Error fetching color theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch color theme' },
      { status: 500 }
    );
  }
}

// PUT - Update color theme
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description, ...colors } = body;
    
    const theme = await ColorTheme.findByIdAndUpdate(
      params.id,
      { name, description, ...colors },
      { new: true, runValidators: true }
    );
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Color theme not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error('Error updating color theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update color theme' },
      { status: 500 }
    );
  }
}

// DELETE - Delete color theme
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const theme = await ColorTheme.findById(params.id);
    
    if (!theme) {
      return NextResponse.json(
        { success: false, error: 'Color theme not found' },
        { status: 404 }
      );
    }
    
    if (theme.isDefault) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete default theme' },
        { status: 400 }
      );
    }
    
    await ColorTheme.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Color theme deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting color theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete color theme' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ColorTheme from '@/models/ColorTheme';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all color themes
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeDefault = searchParams.get('includeDefault') === 'true';
    
    let query = {};
    if (!includeDefault) {
      query = { isDefault: false };
    }
    
    const themes = await ColorTheme.find(query).sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      themes,
    });
  } catch (error) {
    console.error('Error fetching color themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch color themes' },
      { status: 500 }
    );
  }
}

// POST - Create new color theme
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description, ...colors } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Theme name is required' },
        { status: 400 }
      );
    }
    
    // Check if theme with same name exists
    const existingTheme = await ColorTheme.findOne({ name });
    if (existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme with this name already exists' },
        { status: 400 }
      );
    }
    
    const theme = await ColorTheme.create({
      name,
      description,
      ...colors,
    });
    
    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error('Error creating color theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create color theme' },
      { status: 500 }
    );
  }
}

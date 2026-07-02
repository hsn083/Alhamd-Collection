import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ColorTheme from '@/models/ColorTheme';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get default theme
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    let defaultTheme = await ColorTheme.getDefaultTheme();
    
    // If no default theme exists, create one
    if (!defaultTheme) {
      defaultTheme = await ColorTheme.create({
        name: 'Default',
        description: 'Default color theme',
        isDefault: true,
      });
    }
    
    return NextResponse.json({
      success: true,
      theme: defaultTheme,
    });
  } catch (error) {
    console.error('Error fetching default theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch default theme' },
      { status: 500 }
    );
  }
}

// PUT - Set default theme
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { themeId } = body;
    
    if (!themeId) {
      return NextResponse.json(
        { success: false, error: 'Theme ID is required' },
        { status: 400 }
      );
    }
    
    const theme = await ColorTheme.setDefaultTheme(themeId);
    
    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error('Error setting default theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set default theme' },
      { status: 500 }
    );
  }
}

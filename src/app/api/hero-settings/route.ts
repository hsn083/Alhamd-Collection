import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroSliderSettings from '@/models/HeroSliderSettings';

// GET /api/hero-settings - Get hero slider settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const settings = await (HeroSliderSettings as any).getSettings();
    
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching hero settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hero settings',
      },
      { status: 500 }
    );
  }
}

// POST /api/hero-settings - Update hero slider settings
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const settings = await (HeroSliderSettings as any).getSettings();
    
    Object.assign(settings, body);
    await settings.save();
    
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error updating hero settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update hero settings',
      },
      { status: 500 }
    );
  }
}

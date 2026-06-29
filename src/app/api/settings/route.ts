import { NextRequest, NextResponse } from 'next/server';
import { readSettings, writeSettings, initializeSettings, AllSettings } from '@/lib/server-settings';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all settings
export async function GET(request: NextRequest) {
  try {
    // Initialize settings if file doesn't exist
    await initializeSettings();
    
    const settings = await readSettings();
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('[SETTINGS] Error fetching settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings'
      },
      { status: 500 }
    );
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Initialize settings if file doesn't exist
    await initializeSettings();
    
    const currentSettings = await readSettings();
    
    // Merge updates with current settings
    const updatedSettings: AllSettings = {
      ...currentSettings,
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    // Deep merge nested objects
    if (body.general) {
      updatedSettings.general = { ...currentSettings.general, ...body.general };
    }
    if (body.seo) {
      updatedSettings.seo = { ...currentSettings.seo, ...body.seo };
    }
    if (body.shipping) {
      updatedSettings.shipping = { ...currentSettings.shipping, ...body.shipping };
    }
    if (body.provinces) {
      updatedSettings.provinces = { ...currentSettings.provinces, ...body.provinces };
    }
    if (body.payments) {
      updatedSettings.payments = { ...currentSettings.payments, ...body.payments };
    }
    if (body.socialMedia) {
      updatedSettings.socialMedia = { ...currentSettings.socialMedia, ...body.socialMedia };
    }
    
    await writeSettings(updatedSettings);
    
    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('[SETTINGS] Error updating settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings'
      },
      { status: 500 }
    );
  }
}

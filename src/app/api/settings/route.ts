import { NextRequest, NextResponse } from 'next/server';
import { readSettings, writeSettings, initializeSettings, AllSettings } from '@/lib/server-settings';
import { revalidatePath } from 'next/cache';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all settings
export async function GET(request: NextRequest) {
  try {
    // Initialize settings if file doesn't exist
    await initializeSettings();
    
    const settings = await readSettings();
    
    const response = NextResponse.json({
      success: true,
      settings
    });
    
    // Add cache control headers to prevent caching (including Vercel CDN)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    
    return response;
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
    
    // Deep merge nested objects
    const updatedSettings: AllSettings = {
      ...currentSettings,
      ...body,
      updatedAt: new Date().toISOString()
    };
    
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
    
    // Revalidate all paths that use settings
    revalidatePath('/');
    revalidatePath('/checkout');
    revalidatePath('/contact');
    revalidatePath('/products');
    revalidatePath('/shop');
    revalidatePath('/category');
    revalidatePath('/product');
    
    const response = NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    
    return response;
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

// PATCH - Partial update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Initialize settings if file doesn't exist
    await initializeSettings();
    
    const currentSettings = await readSettings();
    
    // Deep merge nested objects for partial updates
    const updatedSettings: AllSettings = {
      ...currentSettings,
      updatedAt: new Date().toISOString()
    };
    
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
      // Handle nested payment method updates
      if (body.payments.jazzcash) {
        updatedSettings.payments.jazzcash = { ...currentSettings.payments.jazzcash, ...body.payments.jazzcash };
      }
      if (body.payments.easypaisa) {
        updatedSettings.payments.easypaisa = { ...currentSettings.payments.easypaisa, ...body.payments.easypaisa };
      }
      if (body.payments.bankTransfer) {
        updatedSettings.payments.bankTransfer = { ...currentSettings.payments.bankTransfer, ...body.payments.bankTransfer };
      }
      if (body.payments.cashOnDelivery) {
        updatedSettings.payments.cashOnDelivery = { ...currentSettings.payments.cashOnDelivery, ...body.payments.cashOnDelivery };
      }
      if (body.payments.stripe) {
        updatedSettings.payments.stripe = { ...currentSettings.payments.stripe, ...body.payments.stripe };
      }
      if (body.payments.paypal) {
        updatedSettings.payments.paypal = { ...currentSettings.payments.paypal, ...body.payments.paypal };
      }
    }
    if (body.socialMedia) {
      updatedSettings.socialMedia = { ...currentSettings.socialMedia, ...body.socialMedia };
    }
    
    await writeSettings(updatedSettings);
    
    // Revalidate all paths that use settings
    revalidatePath('/');
    revalidatePath('/checkout');
    revalidatePath('/contact');
    revalidatePath('/products');
    revalidatePath('/shop');
    revalidatePath('/category');
    revalidatePath('/product');
    
    const response = NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    
    return response;
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

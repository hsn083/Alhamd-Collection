import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch maintenance mode status only (lightweight for middleware)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const settings = await Settings.findOne({}, { 'general.maintenanceMode': 1, 'general.maintenanceMessage': 1, 'general.siteName': 1, 'general.siteLogo': 1, 'general.contactEmail': 1, 'general.phoneNumber': 1 }).lean();
    
    const response = NextResponse.json({
      success: true,
      maintenanceMode: settings?.general?.maintenanceMode || false,
      maintenanceMessage: settings?.general?.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
      siteName: settings?.general?.siteName || 'AlhamdCollection',
      siteLogo: settings?.general?.siteLogo || '/Logo.jpeg',
      contactEmail: settings?.general?.contactEmail || 'info@alhamdcollection.pk',
      phoneNumber: settings?.general?.phoneNumber || '+92 300 1234567',
    });
    
    // Add cache control headers to prevent caching (including Vercel CDN)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('[MAINTENANCE-STATUS] Error fetching maintenance status:', error);
    // On error, return maintenance mode as false to allow site to function
    const response = NextResponse.json({
      success: false,
      maintenanceMode: false,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    return response;
  }
}

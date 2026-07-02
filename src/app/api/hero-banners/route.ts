import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroBanner from '@/models/HeroBanner';

// GET all hero banners (public endpoint for homepage)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query: any = {};
    
    // If activeOnly is true, filter for active banners only
    if (activeOnly) {
      query.isActive = true;
    }

    const banners = await HeroBanner.find(query).sort({ displayOrder: 1, createdAt: -1 });

    // Validate that we have banners with required fields
    const validBanners = banners.filter(banner => {
      return banner.desktopImage && banner.mobileImage && banner.heading && banner.subHeading && banner.buttonText && banner.buttonUrl;
    });

    return NextResponse.json({
      success: true,
      banners: validBanners,
    });
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch hero banners',
      },
      { status: 500 }
    );
  }
}

// POST create new hero banner (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication via cookie
    const authCookie = request.cookies.get('adminAuth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    
    const {
      desktopImage,
      mobileImage,
      heading,
      subHeading,
      description,
      buttonText,
      buttonUrl,
      textAlignment,
      verticalAlignment,
      overlayColor,
      overlayOpacity,
      headingColor,
      subHeadingColor,
      descriptionColor,
      badgeColor,
      badgeTextColor,
      buttonBackgroundColor,
      buttonTextColor,
      buttonBorderColor,
      buttonHoverBackgroundColor,
      buttonHoverTextColor,
      buttonHoverBorderColor,
      buttonBorderRadius,
      buttonShadow,
      buttonHoverShadow,
      bannerBackgroundColor,
      contentBoxBackgroundColor,
      contentBoxOpacity,
      useGradientOverlay,
      gradientColors,
      fontFamily,
      headingFontSize,
      subHeadingFontSize,
      descriptionFontSize,
      buttonFontSize,
      fontWeight,
      letterSpacing,
      lineHeight,
      textShadow,
      textTransform,
      contentBoxWidth,
      contentBoxPadding,
      contentBoxBorderRadius,
      contentBoxBlur,
      contentBoxShadow,
      contentBoxMaxWidth,
      isActive,
      displayOrder,
    } = body;

    // Validation
    if (!desktopImage || !mobileImage || !heading || !subHeading || !buttonText || !buttonUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the highest display order if not provided
    let finalDisplayOrder = displayOrder || 0;
    if (displayOrder === undefined || displayOrder === null) {
      const lastBanner = await HeroBanner.findOne().sort({ displayOrder: -1 });
      finalDisplayOrder = lastBanner ? lastBanner.displayOrder + 1 : 0;
    }

    const banner = await HeroBanner.create({
      desktopImage,
      mobileImage,
      heading,
      subHeading,
      description,
      buttonText,
      buttonUrl,
      textAlignment: textAlignment || 'left',
      verticalAlignment: verticalAlignment || 'center',
      overlayColor: overlayColor || '#000000',
      overlayOpacity: overlayOpacity || 50,
      headingColor: headingColor || '#ffffff',
      subHeadingColor: subHeadingColor || '#ffffff',
      descriptionColor: descriptionColor || '#ffffff',
      badgeColor,
      badgeTextColor,
      buttonBackgroundColor: buttonBackgroundColor || '#10b981',
      buttonTextColor: buttonTextColor || '#ffffff',
      buttonBorderColor,
      buttonHoverBackgroundColor: buttonHoverBackgroundColor || '#059669',
      buttonHoverTextColor: buttonHoverTextColor || '#ffffff',
      buttonHoverBorderColor,
      buttonBorderRadius: buttonBorderRadius || 8,
      buttonShadow,
      buttonHoverShadow,
      bannerBackgroundColor: bannerBackgroundColor || '#f3f4f6',
      contentBoxBackgroundColor,
      contentBoxOpacity,
      useGradientOverlay: useGradientOverlay || false,
      gradientColors: gradientColors || ['#000000', '#000000'],
      fontFamily,
      headingFontSize,
      subHeadingFontSize,
      descriptionFontSize,
      buttonFontSize,
      fontWeight,
      letterSpacing,
      lineHeight,
      textShadow,
      textTransform: textTransform || 'none',
      contentBoxWidth,
      contentBoxPadding,
      contentBoxBorderRadius,
      contentBoxBlur,
      contentBoxShadow,
      contentBoxMaxWidth,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: finalDisplayOrder,
    });

    return NextResponse.json({
      success: true,
      banner,
      message: 'Hero banner created successfully',
    });
  } catch (error) {
    console.error('Error creating hero banner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create hero banner',
      },
      { status: 500 }
    );
  }
}

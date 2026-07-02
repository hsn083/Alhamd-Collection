import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroBanner from '@/models/HeroBanner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET single hero banner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const banner = await HeroBanner.findById(params.id);

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Hero banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error('Error fetching hero banner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch hero banner',
      },
      { status: 500 }
    );
  }
}

// PUT update hero banner (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const banner = await HeroBanner.findById(params.id);

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Hero banner not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (desktopImage !== undefined) banner.desktopImage = desktopImage;
    if (mobileImage !== undefined) banner.mobileImage = mobileImage;
    if (heading !== undefined) banner.heading = heading;
    if (subHeading !== undefined) banner.subHeading = subHeading;
    if (description !== undefined) banner.description = description;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (buttonUrl !== undefined) banner.buttonUrl = buttonUrl;
    if (textAlignment !== undefined) banner.textAlignment = textAlignment;
    if (verticalAlignment !== undefined) banner.verticalAlignment = verticalAlignment;
    if (overlayColor !== undefined) banner.overlayColor = overlayColor;
    if (overlayOpacity !== undefined) banner.overlayOpacity = overlayOpacity;
    if (headingColor !== undefined) banner.headingColor = headingColor;
    if (subHeadingColor !== undefined) banner.subHeadingColor = subHeadingColor;
    if (descriptionColor !== undefined) banner.descriptionColor = descriptionColor;
    if (badgeColor !== undefined) banner.badgeColor = badgeColor;
    if (badgeTextColor !== undefined) banner.badgeTextColor = badgeTextColor;
    if (buttonBackgroundColor !== undefined) banner.buttonBackgroundColor = buttonBackgroundColor;
    if (buttonTextColor !== undefined) banner.buttonTextColor = buttonTextColor;
    if (buttonBorderColor !== undefined) banner.buttonBorderColor = buttonBorderColor;
    if (buttonHoverBackgroundColor !== undefined) banner.buttonHoverBackgroundColor = buttonHoverBackgroundColor;
    if (buttonHoverTextColor !== undefined) banner.buttonHoverTextColor = buttonHoverTextColor;
    if (buttonHoverBorderColor !== undefined) banner.buttonHoverBorderColor = buttonHoverBorderColor;
    if (buttonBorderRadius !== undefined) banner.buttonBorderRadius = buttonBorderRadius;
    if (buttonShadow !== undefined) banner.buttonShadow = buttonShadow;
    if (buttonHoverShadow !== undefined) banner.buttonHoverShadow = buttonHoverShadow;
    if (bannerBackgroundColor !== undefined) banner.bannerBackgroundColor = bannerBackgroundColor;
    if (contentBoxBackgroundColor !== undefined) banner.contentBoxBackgroundColor = contentBoxBackgroundColor;
    if (contentBoxOpacity !== undefined) banner.contentBoxOpacity = contentBoxOpacity;
    if (useGradientOverlay !== undefined) banner.useGradientOverlay = useGradientOverlay;
    if (gradientColors !== undefined) banner.gradientColors = gradientColors;
    if (fontFamily !== undefined) banner.fontFamily = fontFamily;
    if (headingFontSize !== undefined) banner.headingFontSize = headingFontSize;
    if (subHeadingFontSize !== undefined) banner.subHeadingFontSize = subHeadingFontSize;
    if (descriptionFontSize !== undefined) banner.descriptionFontSize = descriptionFontSize;
    if (buttonFontSize !== undefined) banner.buttonFontSize = buttonFontSize;
    if (fontWeight !== undefined) banner.fontWeight = fontWeight;
    if (letterSpacing !== undefined) banner.letterSpacing = letterSpacing;
    if (lineHeight !== undefined) banner.lineHeight = lineHeight;
    if (textShadow !== undefined) banner.textShadow = textShadow;
    if (textTransform !== undefined) banner.textTransform = textTransform;
    if (contentBoxWidth !== undefined) banner.contentBoxWidth = contentBoxWidth;
    if (contentBoxPadding !== undefined) banner.contentBoxPadding = contentBoxPadding;
    if (contentBoxBorderRadius !== undefined) banner.contentBoxBorderRadius = contentBoxBorderRadius;
    if (contentBoxBlur !== undefined) banner.contentBoxBlur = contentBoxBlur;
    if (contentBoxShadow !== undefined) banner.contentBoxShadow = contentBoxShadow;
    if (contentBoxMaxWidth !== undefined) banner.contentBoxMaxWidth = contentBoxMaxWidth;
    if (isActive !== undefined) banner.isActive = isActive;
    if (displayOrder !== undefined) banner.displayOrder = displayOrder;

    await banner.save();

    return NextResponse.json({
      success: true,
      banner,
      message: 'Hero banner updated successfully',
    });
  } catch (error) {
    console.error('Error updating hero banner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update hero banner',
      },
      { status: 500 }
    );
  }
}

// DELETE hero banner (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const banner = await HeroBanner.findByIdAndDelete(params.id);

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Hero banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hero banner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete hero banner',
      },
      { status: 500 }
    );
  }
}

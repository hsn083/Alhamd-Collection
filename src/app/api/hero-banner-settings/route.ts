import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroBannerSettings from '@/models/HeroBannerSettings';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET hero banner settings (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await HeroBannerSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await HeroBannerSettings.create({});
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching hero banner settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch hero banner settings',
      },
      { status: 500 }
    );
  }
}

// PUT update hero banner settings (admin only)
export async function PUT(request: NextRequest) {
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
      autoPlay,
      autoPlayDelay,
      transitionSpeed,
      animationDuration,
      animationType,
      infiniteLoop,
      pauseOnHover,
      pauseOnTabHidden,
      touchSwipe,
      keyboardNavigation,
      mouseWheelNavigation,
      showArrows,
      arrowBackgroundColor,
      arrowIconColor,
      arrowHoverBackgroundColor,
      arrowHoverIconColor,
      showDots,
      dotColor,
      activeDotColor,
      dotSize,
      showProgressBar,
      progressColor,
      desktopHeight,
      desktopHeadingFontSize,
      desktopDescriptionFontSize,
      desktopContentPosition,
      tabletHeight,
      tabletHeadingFontSize,
      tabletDescriptionFontSize,
      tabletContentPosition,
      mobileHeight,
      mobileHeadingFontSize,
      mobileDescriptionFontSize,
      mobileContentPosition,
    } = body;

    let settings = await HeroBannerSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await HeroBannerSettings.create({});
    }

    // Update fields
    if (autoPlay !== undefined) settings.autoPlay = autoPlay;
    if (autoPlayDelay !== undefined) settings.autoPlayDelay = autoPlayDelay;
    if (transitionSpeed !== undefined) settings.transitionSpeed = transitionSpeed;
    if (animationDuration !== undefined) settings.animationDuration = animationDuration;
    if (animationType !== undefined) settings.animationType = animationType;
    if (infiniteLoop !== undefined) settings.infiniteLoop = infiniteLoop;
    if (pauseOnHover !== undefined) settings.pauseOnHover = pauseOnHover;
    if (pauseOnTabHidden !== undefined) settings.pauseOnTabHidden = pauseOnTabHidden;
    if (touchSwipe !== undefined) settings.touchSwipe = touchSwipe;
    if (keyboardNavigation !== undefined) settings.keyboardNavigation = keyboardNavigation;
    if (mouseWheelNavigation !== undefined) settings.mouseWheelNavigation = mouseWheelNavigation;
    if (showArrows !== undefined) settings.showArrows = showArrows;
    if (arrowBackgroundColor !== undefined) settings.arrowBackgroundColor = arrowBackgroundColor;
    if (arrowIconColor !== undefined) settings.arrowIconColor = arrowIconColor;
    if (arrowHoverBackgroundColor !== undefined) settings.arrowHoverBackgroundColor = arrowHoverBackgroundColor;
    if (arrowHoverIconColor !== undefined) settings.arrowHoverIconColor = arrowHoverIconColor;
    if (showDots !== undefined) settings.showDots = showDots;
    if (dotColor !== undefined) settings.dotColor = dotColor;
    if (activeDotColor !== undefined) settings.activeDotColor = activeDotColor;
    if (dotSize !== undefined) settings.dotSize = dotSize;
    if (showProgressBar !== undefined) settings.showProgressBar = showProgressBar;
    if (progressColor !== undefined) settings.progressColor = progressColor;
    if (desktopHeight !== undefined) settings.desktopHeight = desktopHeight;
    if (desktopHeadingFontSize !== undefined) settings.desktopHeadingFontSize = desktopHeadingFontSize;
    if (desktopDescriptionFontSize !== undefined) settings.desktopDescriptionFontSize = desktopDescriptionFontSize;
    if (desktopContentPosition !== undefined) settings.desktopContentPosition = desktopContentPosition;
    if (tabletHeight !== undefined) settings.tabletHeight = tabletHeight;
    if (tabletHeadingFontSize !== undefined) settings.tabletHeadingFontSize = tabletHeadingFontSize;
    if (tabletDescriptionFontSize !== undefined) settings.tabletDescriptionFontSize = tabletDescriptionFontSize;
    if (tabletContentPosition !== undefined) settings.tabletContentPosition = tabletContentPosition;
    if (mobileHeight !== undefined) settings.mobileHeight = mobileHeight;
    if (mobileHeadingFontSize !== undefined) settings.mobileHeadingFontSize = mobileHeadingFontSize;
    if (mobileDescriptionFontSize !== undefined) settings.mobileDescriptionFontSize = mobileDescriptionFontSize;
    if (mobileContentPosition !== undefined) settings.mobileContentPosition = mobileContentPosition;

    await settings.save();

    return NextResponse.json({
      success: true,
      settings,
      message: 'Hero banner settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating hero banner settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update hero banner settings',
      },
      { status: 500 }
    );
  }
}

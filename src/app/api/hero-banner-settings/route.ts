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
      enabled,
      autoPlay,
      autoPlayDelay,
      transitionSpeed,
      animationDuration,
      animationType,
      animationEasing,
      infiniteLoop,
      pauseOnHover,
      pauseOnTabHidden,
      touchSwipe,
      keyboardNavigation,
      mouseWheelNavigation,
      showArrows,
      arrowSize,
      arrowBorderRadius,
      arrowBackgroundColor,
      arrowIconColor,
      arrowHoverBackgroundColor,
      arrowHoverIconColor,
      showDots,
      dotSize,
      dotColor,
      activeDotColor,
      dotSpacing,
      showProgressBar,
      progressColor,
      progressHeight,
      desktopHeight,
      desktopHeadingFontSize,
      desktopSubheadingFontSize,
      desktopDescriptionFontSize,
      desktopButtonFontSize,
      desktopContentPosition,
      desktopVerticalPosition,
      tabletHeight,
      tabletHeadingFontSize,
      tabletSubheadingFontSize,
      tabletDescriptionFontSize,
      tabletButtonFontSize,
      tabletContentPosition,
      tabletVerticalPosition,
      mobileHeight,
      mobileHeadingFontSize,
      mobileSubheadingFontSize,
      mobileDescriptionFontSize,
      mobileButtonFontSize,
      mobileContentPosition,
      mobileVerticalPosition,
      lazyLoadImages,
      imageQuality,
      preloadFirstSlide,
      enableImageOptimization,
      overlayColor,
      overlayOpacity,
      headingColor,
      subheadingColor,
      descriptionColor,
      buttonBackgroundColor,
      buttonTextColor,
      buttonHoverBackgroundColor,
      buttonHoverTextColor,
      buttonBorderColor,
      buttonBorderRadius,
      secondaryButtonBackgroundColor,
      secondaryButtonTextColor,
      secondaryButtonHoverBackgroundColor,
      secondaryButtonHoverTextColor,
      secondaryButtonBorderColor,
      secondaryButtonBorderRadius,
      sliderBackgroundColor,
    } = body;

    let settings = await HeroBannerSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await HeroBannerSettings.create({});
    }

    // Update fields
    if (enabled !== undefined) settings.enabled = enabled;
    if (autoPlay !== undefined) settings.autoPlay = autoPlay;
    if (autoPlayDelay !== undefined) settings.autoPlayDelay = autoPlayDelay;
    if (transitionSpeed !== undefined) settings.transitionSpeed = transitionSpeed;
    if (animationDuration !== undefined) settings.animationDuration = animationDuration;
    if (animationType !== undefined) settings.animationType = animationType;
    if (animationEasing !== undefined) settings.animationEasing = animationEasing;
    if (infiniteLoop !== undefined) settings.infiniteLoop = infiniteLoop;
    if (pauseOnHover !== undefined) settings.pauseOnHover = pauseOnHover;
    if (pauseOnTabHidden !== undefined) settings.pauseOnTabHidden = pauseOnTabHidden;
    if (touchSwipe !== undefined) settings.touchSwipe = touchSwipe;
    if (keyboardNavigation !== undefined) settings.keyboardNavigation = keyboardNavigation;
    if (mouseWheelNavigation !== undefined) settings.mouseWheelNavigation = mouseWheelNavigation;
    if (showArrows !== undefined) settings.showArrows = showArrows;
    if (arrowSize !== undefined) settings.arrowSize = arrowSize;
    if (arrowBorderRadius !== undefined) settings.arrowBorderRadius = arrowBorderRadius;
    if (arrowBackgroundColor !== undefined) settings.arrowBackgroundColor = arrowBackgroundColor;
    if (arrowIconColor !== undefined) settings.arrowIconColor = arrowIconColor;
    if (arrowHoverBackgroundColor !== undefined) settings.arrowHoverBackgroundColor = arrowHoverBackgroundColor;
    if (arrowHoverIconColor !== undefined) settings.arrowHoverIconColor = arrowHoverIconColor;
    if (showDots !== undefined) settings.showDots = showDots;
    if (dotSize !== undefined) settings.dotSize = dotSize;
    if (dotColor !== undefined) settings.dotColor = dotColor;
    if (activeDotColor !== undefined) settings.activeDotColor = activeDotColor;
    if (dotSpacing !== undefined) settings.dotSpacing = dotSpacing;
    if (showProgressBar !== undefined) settings.showProgressBar = showProgressBar;
    if (progressColor !== undefined) settings.progressColor = progressColor;
    if (progressHeight !== undefined) settings.progressHeight = progressHeight;
    if (desktopHeight !== undefined) settings.desktopHeight = desktopHeight;
    if (desktopHeadingFontSize !== undefined) settings.desktopHeadingFontSize = desktopHeadingFontSize;
    if (desktopSubheadingFontSize !== undefined) settings.desktopSubheadingFontSize = desktopSubheadingFontSize;
    if (desktopDescriptionFontSize !== undefined) settings.desktopDescriptionFontSize = desktopDescriptionFontSize;
    if (desktopButtonFontSize !== undefined) settings.desktopButtonFontSize = desktopButtonFontSize;
    if (desktopContentPosition !== undefined) settings.desktopContentPosition = desktopContentPosition;
    if (desktopVerticalPosition !== undefined) settings.desktopVerticalPosition = desktopVerticalPosition;
    if (tabletHeight !== undefined) settings.tabletHeight = tabletHeight;
    if (tabletHeadingFontSize !== undefined) settings.tabletHeadingFontSize = tabletHeadingFontSize;
    if (tabletSubheadingFontSize !== undefined) settings.tabletSubheadingFontSize = tabletSubheadingFontSize;
    if (tabletDescriptionFontSize !== undefined) settings.tabletDescriptionFontSize = tabletDescriptionFontSize;
    if (tabletButtonFontSize !== undefined) settings.tabletButtonFontSize = tabletButtonFontSize;
    if (tabletContentPosition !== undefined) settings.tabletContentPosition = tabletContentPosition;
    if (tabletVerticalPosition !== undefined) settings.tabletVerticalPosition = tabletVerticalPosition;
    if (mobileHeight !== undefined) settings.mobileHeight = mobileHeight;
    if (mobileHeadingFontSize !== undefined) settings.mobileHeadingFontSize = mobileHeadingFontSize;
    if (mobileSubheadingFontSize !== undefined) settings.mobileSubheadingFontSize = mobileSubheadingFontSize;
    if (mobileDescriptionFontSize !== undefined) settings.mobileDescriptionFontSize = mobileDescriptionFontSize;
    if (mobileButtonFontSize !== undefined) settings.mobileButtonFontSize = mobileButtonFontSize;
    if (mobileContentPosition !== undefined) settings.mobileContentPosition = mobileContentPosition;
    if (mobileVerticalPosition !== undefined) settings.mobileVerticalPosition = mobileVerticalPosition;
    if (lazyLoadImages !== undefined) settings.lazyLoadImages = lazyLoadImages;
    if (imageQuality !== undefined) settings.imageQuality = imageQuality;
    if (preloadFirstSlide !== undefined) settings.preloadFirstSlide = preloadFirstSlide;
    if (enableImageOptimization !== undefined) settings.enableImageOptimization = enableImageOptimization;
    if (overlayColor !== undefined) settings.overlayColor = overlayColor;
    if (overlayOpacity !== undefined) settings.overlayOpacity = overlayOpacity;
    if (headingColor !== undefined) settings.headingColor = headingColor;
    if (subheadingColor !== undefined) settings.subheadingColor = subheadingColor;
    if (descriptionColor !== undefined) settings.descriptionColor = descriptionColor;
    if (buttonBackgroundColor !== undefined) settings.buttonBackgroundColor = buttonBackgroundColor;
    if (buttonTextColor !== undefined) settings.buttonTextColor = buttonTextColor;
    if (buttonHoverBackgroundColor !== undefined) settings.buttonHoverBackgroundColor = buttonHoverBackgroundColor;
    if (buttonHoverTextColor !== undefined) settings.buttonHoverTextColor = buttonHoverTextColor;
    if (buttonBorderColor !== undefined) settings.buttonBorderColor = buttonBorderColor;
    if (buttonBorderRadius !== undefined) settings.buttonBorderRadius = buttonBorderRadius;
    if (secondaryButtonBackgroundColor !== undefined) settings.secondaryButtonBackgroundColor = secondaryButtonBackgroundColor;
    if (secondaryButtonTextColor !== undefined) settings.secondaryButtonTextColor = secondaryButtonTextColor;
    if (secondaryButtonHoverBackgroundColor !== undefined) settings.secondaryButtonHoverBackgroundColor = secondaryButtonHoverBackgroundColor;
    if (secondaryButtonHoverTextColor !== undefined) settings.secondaryButtonHoverTextColor = secondaryButtonHoverTextColor;
    if (secondaryButtonBorderColor !== undefined) settings.secondaryButtonBorderColor = secondaryButtonBorderColor;
    if (secondaryButtonBorderRadius !== undefined) settings.secondaryButtonBorderRadius = secondaryButtonBorderRadius;
    if (sliderBackgroundColor !== undefined) settings.sliderBackgroundColor = sliderBackgroundColor;

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

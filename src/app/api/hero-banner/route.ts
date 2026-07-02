import { NextRequest, NextResponse } from 'next/server';
import { HeroBanner } from '@/types';

// In-memory storage for hero banner (in production, use a database)
let heroBanner: HeroBanner = {
  _id: '1',
  desktopImage: '/images/hero-banner-default.jpg',
  mobileImage: '/images/hero-banner-default.jpg',
  heading: 'Level Up Your Gaming Experience',
  subHeading: 'Discover the latest fashion trends, stylish clothing, and premium footwear crafted for comfort and elegance.',
  buttonText: 'Shop Now',
  buttonUrl: '/shop',
  textPosition: 'left',
  overlayOpacity: 50,
  overlayColor: '#000000',
  textColor: '#ffffff',
  buttonStyle: 'primary',
  displayOrder: 1,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// GET hero banner
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      heroBanner,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch hero banner',
      },
      { status: 500 }
    );
  }
}

// POST/PUT update hero banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, heading, subheading, buttonText, buttonLink, isActive } = body;

    const updatedBanner: HeroBanner = {
      ...heroBanner,
      desktopImage: image || heroBanner.desktopImage,
      mobileImage: image || heroBanner.mobileImage,
      heading: heading || heroBanner.heading,
      subHeading: subheading || heroBanner.subHeading,
      buttonText: buttonText || heroBanner.buttonText,
      buttonUrl: buttonLink || heroBanner.buttonUrl,
      isActive: isActive !== undefined ? isActive : heroBanner.isActive,
      updatedAt: new Date(),
    };

    heroBanner = updatedBanner;

    return NextResponse.json({
      success: true,
      heroBanner: updatedBanner,
      message: 'Hero banner updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update hero banner',
      },
      { status: 500 }
    );
  }
}

// PUT update hero banner (alias for POST)
export async function PUT(request: NextRequest) {
  return POST(request);
}

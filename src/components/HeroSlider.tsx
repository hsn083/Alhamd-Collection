'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Dot } from 'lucide-react';

interface HeroBanner {
  _id: string;
  desktopImage: string;
  mobileImage: string;
  heading: string;
  subHeading: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  textAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
  overlayColor: string;
  overlayOpacity: number;
  useGradientOverlay?: boolean;
  gradientColors?: string[];
  headingColor: string;
  subHeadingColor: string;
  descriptionColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonBorderColor?: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  buttonHoverBorderColor?: string;
  buttonBorderRadius: number;
  buttonShadow?: string;
  buttonHoverShadow?: string;
  fontFamily?: string;
  headingFontSize?: number;
  subHeadingFontSize?: number;
  descriptionFontSize?: number;
  buttonFontSize?: number;
  fontWeight?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  contentBoxBackgroundColor?: string;
  contentBoxOpacity?: number;
  contentBoxWidth?: number;
  contentBoxPadding?: number;
  contentBoxBorderRadius?: number;
  contentBoxBlur?: number;
  contentBoxShadow?: string;
  contentBoxMaxWidth?: number;
}

interface SliderSettings {
  autoPlay: boolean;
  autoPlayDelay: number;
  transitionSpeed: number;
  animationDuration: number;
  animationType: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'coverflow';
  infiniteLoop: boolean;
  pauseOnHover: boolean;
  pauseOnTabHidden: boolean;
  touchSwipe: boolean;
  keyboardNavigation: boolean;
  mouseWheelNavigation: boolean;
  showArrows: boolean;
  arrowBackgroundColor: string;
  arrowIconColor: string;
  arrowHoverBackgroundColor: string;
  arrowHoverIconColor: string;
  showDots: boolean;
  dotColor: string;
  activeDotColor: string;
  dotSize: number;
  showProgressBar: boolean;
  progressColor: string;
  desktopHeight: number;
  desktopHeadingFontSize: number;
  desktopDescriptionFontSize: number;
  desktopContentPosition: 'left' | 'center' | 'right';
  tabletHeight: number;
  tabletHeadingFontSize: number;
  tabletDescriptionFontSize: number;
  tabletContentPosition: 'left' | 'center' | 'right';
  mobileHeight: number;
  mobileHeadingFontSize: number;
  mobileDescriptionFontSize: number;
  mobileContentPosition: 'left' | 'center' | 'right';
}

export default function HeroSlider() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [settings, setSettings] = useState<SliderSettings>({
    autoPlay: true,
    autoPlayDelay: 5000,
    transitionSpeed: 500,
    animationDuration: 500,
    animationType: 'slide',
    infiniteLoop: true,
    pauseOnHover: true,
    pauseOnTabHidden: false,
    touchSwipe: true,
    keyboardNavigation: true,
    mouseWheelNavigation: false,
    showArrows: true,
    arrowBackgroundColor: 'rgba(255, 255, 255, 0.2)',
    arrowIconColor: '#ffffff',
    arrowHoverBackgroundColor: 'rgba(255, 255, 255, 0.4)',
    arrowHoverIconColor: '#ffffff',
    showDots: true,
    dotColor: 'rgba(255, 255, 255, 0.5)',
    activeDotColor: '#ffffff',
    dotSize: 12,
    showProgressBar: false,
    progressColor: '#10b981',
    desktopHeight: 650,
    desktopHeadingFontSize: 60,
    desktopDescriptionFontSize: 24,
    desktopContentPosition: 'left',
    tabletHeight: 560,
    tabletHeadingFontSize: 48,
    tabletDescriptionFontSize: 20,
    tabletContentPosition: 'left',
    mobileHeight: 480,
    mobileHeadingFontSize: 36,
    mobileDescriptionFontSize: 16,
    mobileContentPosition: 'left',
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number>(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch banners and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersResponse, settingsResponse] = await Promise.all([
          fetch('/api/hero-banners?activeOnly=true'),
          fetch('/api/hero-banner-settings'),
        ]);

        const bannersData = await bannersResponse.json();
        const settingsData = await settingsResponse.json();

        if (bannersData.success && bannersData.banners.length > 0) {
          setBanners(bannersData.banners);
        } else {
          // Use fallback banner if no banners exist
          setBanners([getFallbackBanner()]);
        }

        if (settingsData.success) {
          setSettings(settingsData.settings);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setBanners([getFallbackBanner()]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!settings.autoPlay || banners.length <= 1 || isPaused) {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setTimeout(() => {
      goToNext();
    }, settings.autoPlayDelay);

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentIndex, banners.length, isPaused, settings.autoPlay, settings.autoPlayDelay]);

  // Keyboard navigation
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, banners.length, settings.keyboardNavigation]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || banners.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), settings.transitionSpeed);
  }, [banners.length, isTransitioning, settings.transitionSpeed]);

  const goToNext = useCallback(() => {
    if (isTransitioning || banners.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), settings.transitionSpeed);
  }, [banners.length, isTransitioning, settings.transitionSpeed]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || banners.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), settings.transitionSpeed);
  }, [isTransitioning, banners.length, settings.transitionSpeed]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  // Get fallback banner
  const getFallbackBanner = (): HeroBanner => ({
    _id: 'fallback',
    desktopImage: '/fallback-banner.svg',
    mobileImage: '/fallback-banner.svg',
    heading: 'Welcome to AlhamdCollection',
    subHeading: 'Premium Clothing & Shoes',
    description: 'Discover the latest fashion trends with nationwide delivery across Pakistan.',
    buttonText: 'Shop Now',
    buttonUrl: '/products',
    textAlignment: 'center',
    verticalAlignment: 'center',
    overlayColor: '#000000',
    overlayOpacity: 50,
    headingColor: '#ffffff',
    subHeadingColor: '#ffffff',
    descriptionColor: '#ffffff',
    buttonBackgroundColor: '#10b981',
    buttonTextColor: '#ffffff',
    buttonHoverBackgroundColor: '#059669',
    buttonHoverTextColor: '#ffffff',
    buttonBorderRadius: 8,
  });

  // Get text position classes
  const getTextPositionClasses = (position: string) => {
    switch (position) {
      case 'center':
        return 'text-center mx-auto';
      case 'right':
        return 'text-right ml-auto';
      default:
        return 'text-left';
    }
  };

  // Get vertical position classes
  const getVerticalPositionClasses = (position: string) => {
    switch (position) {
      case 'top':
        return 'items-start';
      case 'bottom':
        return 'items-end';
      default:
        return 'items-center';
    }
  };

  // Get safe image URL with fallback
  const getSafeImageUrl = (url: string | undefined, bannerId: string, isMobile: boolean): string => {
    if (!url || url.trim() === '') {
      return '/fallback-banner.svg';
    }
    const errorKey = `${bannerId}-${isMobile ? 'mobile' : 'desktop'}`;
    if (imageErrors[errorKey]) {
      return '/fallback-banner.svg';
    }
    return url;
  };

  if (isLoading) {
    return (
      <section className="relative bg-gray-100 animate-pulse">
        <div className="relative w-full" style={{ aspectRatio: '1920/800' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400">Loading banners...</div>
          </div>
        </div>
      </section>
    );
  }

  if (!banners.length) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
   <section
  ref={sliderRef}
  className="relative overflow-hidden h-[550px] md:h-[650px] lg:h-[750px]"
      onMouseEnter={() => settings.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => settings.pauseOnHover && setIsPaused(false)}
      onTouchStart={settings.touchSwipe ? handleTouchStart : undefined}
      onTouchEnd={settings.touchSwipe ? handleTouchEnd : undefined}
    >
      
      <div className="relative w-full h-full">
        {/* Slides */}
        <div
  className="flex h-full transition-transform ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transitionDuration: `${settings.transitionSpeed}ms`,
          }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className="flex-shrink-0 w-full h-full relative"
            >
              {/* Background Image */}
              <div className="relative w-full h-full">
                {/* Desktop Image (hidden on mobile) */}
                <div className="hidden md:block absolute inset-0 z-0">
                  <Image
                    src={getSafeImageUrl(banner.desktopImage, banner._id, false)}
                    alt={banner.heading || 'Banner image'}
                    fill
                    priority={index === 0}
                    quality={95}
                    className="object-cover"
                    sizes="(max-width: 1024px) 1024px, 1920px"
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [`${banner._id}-desktop`]: true }));
                    }}
                  />
                </div>
                {/* Mobile Image (shown on mobile only) */}
                <div className="block md:hidden absolute inset-0 z-0">
                  <Image
                    src={getSafeImageUrl(banner.mobileImage, banner._id, true)}
                    alt={banner.heading || 'Banner image'}
                    fill
                    priority={index === 0}
                    quality={95}
                    className="object-cover"
                    sizes="768px"
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [`${banner._id}-mobile`]: true }));
                    }}
                  />
                </div>
              </div>

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: banner.overlayColor || '#000000',
                  opacity: (banner.overlayOpacity || 50) / 100,
                }}
              />

              {/* Content */}
              <div className={`absolute inset-0 flex ${getVerticalPositionClasses(banner.verticalAlignment)} p-6 md:p-12 lg:p-16`}>
                <div
                  className={`w-full ${getTextPositionClasses(banner.textAlignment)}`}
                  style={{ maxWidth: '800px' }}
                >
                  <h1
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6"
                    style={{ 
                      color: banner.headingColor || '#ffffff',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {banner.heading || 'Banner Heading'}
                  </h1>
                  <p
                    className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8"
                    style={{ 
                      color: banner.subHeadingColor || '#ffffff',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {banner.subHeading || 'Banner Sub Heading'}
                  </p>
                  {banner.description && (
                    <p
                      className="text-base md:text-lg mb-6 md:mb-8 opacity-90"
                      style={{ 
                        color: banner.descriptionColor || '#ffffff',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {banner.description}
                    </p>
                  )}
                  {banner.buttonText && banner.buttonUrl && (
                    <Link href={banner.buttonUrl}>
                      <button
                        className="px-6 md:px-8 py-3 md:py-4 font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: banner.buttonBackgroundColor || '#10b981',
                          color: banner.buttonTextColor || '#ffffff',
                          borderRadius: `${banner.buttonBorderRadius || 8}px`,
                          border: banner.buttonBorderColor ? `2px solid ${banner.buttonBorderColor}` : 'none',
                          boxShadow: banner.buttonShadow || 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = banner.buttonHoverBackgroundColor || '#059669';
                          e.currentTarget.style.color = banner.buttonHoverTextColor || '#ffffff';
                          if (banner.buttonHoverBorderColor) {
                            e.currentTarget.style.borderColor = banner.buttonHoverBorderColor;
                          }
                          if (banner.buttonHoverShadow) {
                            e.currentTarget.style.boxShadow = banner.buttonHoverShadow;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = banner.buttonBackgroundColor || '#10b981';
                          e.currentTarget.style.color = banner.buttonTextColor || '#ffffff';
                          if (banner.buttonBorderColor) {
                            e.currentTarget.style.borderColor = banner.buttonBorderColor;
                          }
                          if (banner.buttonShadow) {
                            e.currentTarget.style.boxShadow = banner.buttonShadow;
                          }
                        }}
                      >
                        {banner.buttonText}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && settings.showArrows && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all z-10"
              style={{
                backgroundColor: settings.arrowBackgroundColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = settings.arrowHoverBackgroundColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = settings.arrowBackgroundColor;
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft 
                className="w-6 h-6 md:w-8 md:h-8" 
                style={{ color: settings.arrowIconColor }}
              />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all z-10"
              style={{
                backgroundColor: settings.arrowBackgroundColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = settings.arrowHoverBackgroundColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = settings.arrowBackgroundColor;
              }}
              aria-label="Next slide"
            >
              <ChevronRight 
                className="w-6 h-6 md:w-8 md:h-8" 
                style={{ color: settings.arrowIconColor }}
              />
            </button>
          </>
        )}

        {/* Navigation Dots */}
        {banners.length > 1 && settings.showDots && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all rounded-full"
                style={{
                  backgroundColor: index === currentIndex 
                    ? settings.activeDotColor
                    : settings.dotColor,
                  transform: index === currentIndex ? 'scale(1.25)' : 'scale(1)',
                  width: `${settings.dotSize}px`,
                  height: `${settings.dotSize}px`,
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {banners.length > 1 && settings.showProgressBar && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
            <div
              className="h-full transition-all duration-100 ease-linear"
              style={{
                backgroundColor: settings.progressColor,
                width: `${((currentIndex + 1) / banners.length) * 100}%`,
              }}
            />
          </div>
        )}

        {/* SEO structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: banners.map((banner, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: banner.buttonUrl,
                name: banner.heading,
                description: banner.subHeading,
                image: banner.desktopImage,
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}

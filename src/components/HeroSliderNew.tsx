'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroSliderStore } from '@/store/heroSliderStore';

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
}

export default function HeroSliderNew() {
  const { slides, settings, isLoading, loadHeroSlides, loadHeroSettings } = useHeroSliderStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number>(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadHeroSlides();
    loadHeroSettings();
  }, [loadHeroSlides, loadHeroSettings]);

  // Auto-play functionality
  useEffect(() => {
    if (!settings.enabled || !settings.autoPlay || slides.length <= 1 || isPaused) {
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
  }, [currentIndex, slides.length, isPaused, settings.enabled, settings.autoPlay, settings.autoPlayDelay]);

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
  }, [currentIndex, slides.length, settings.keyboardNavigation]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning || slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || slides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, slides.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!settings.touchSwipe) return;
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

  // Get safe image URL with fallback
  const getSafeImageUrl = (url: string | undefined, slideId: string, isMobile: boolean): string => {
    if (!url || url.trim() === '') {
      return '/fallback-banner.svg';
    }
    const errorKey = `${slideId}-${isMobile ? 'mobile' : 'desktop'}`;
    if (imageErrors[errorKey]) {
      return '/fallback-banner.svg';
    }
    return url;
  };

  // Get responsive height
  const getHeight = () => {
    if (typeof window === 'undefined') return settings.desktopHeight;
    const width = window.innerWidth;
    if (width < 768) return settings.mobileHeight;
    if (width < 1024) return settings.tabletHeight;
    return settings.desktopHeight;
  };

  if (isLoading) {
    return (
      <div 
        className="relative w-full animate-pulse"
        style={{ height: `${settings.desktopHeight}px`, backgroundColor: '#f3f4f6' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!settings.enabled || !slides.length) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  // Get animation styles based on animation type
  const getAnimationStyles = (index: number) => {
    const isActive = index === currentIndex;
    const transition = 'all 500ms ease-in-out';

    switch (settings.animationType) {
      case 'fade':
        return {
          opacity: isActive ? 1 : 0,
          zIndex: isActive ? 1 : 0,
          transition,
        };
      case 'zoom':
        return {
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scale(1)' : 'scale(1.1)',
          zIndex: isActive ? 1 : 0,
          transition,
        };
      case 'flip':
        const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        const isPrevious = index === prevIndex;
        return {
          opacity: isActive || isPrevious ? 1 : 0,
          transform: isActive ? 'rotateY(0deg)' : isPrevious ? 'rotateY(-180deg)' : 'rotateY(180deg)',
          backfaceVisibility: 'hidden' as const,
          zIndex: isActive ? 2 : isPrevious ? 1 : 0,
          transition,
        };
      case 'cube':
        const cubePrev = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        const isCubePrev = index === cubePrev;
        return {
          opacity: isActive || isCubePrev ? 1 : 0,
          transform: isActive ? 'rotateY(0deg) translateZ(0)' : isCubePrev ? 'rotateY(-90deg) translateZ(50%)' : 'rotateY(90deg) translateZ(-50%)',
          backfaceVisibility: 'hidden' as const,
          zIndex: isActive ? 2 : isCubePrev ? 1 : 0,
          transition,
        };
      case 'coverflow':
        const offset = index - currentIndex;
        const absOffset = Math.abs(offset);
        return {
          opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.3,
          transform: `translateX(${offset * 60}px) scale(${1 - absOffset * 0.15}) rotateY(${offset * -30}deg)`,
          zIndex: slides.length - absOffset,
          transition,
        };
      case 'slide':
      default:
        return {
          transform: `translateX(-${currentIndex * 100}%)`,
          transition,
        };
    }
  };

  // Render slide content
  const renderSlideContent = (slide: HeroSlide, index: number) => (
    <div className="relative w-full h-full">
      {/* Desktop Image */}
      <div className="hidden md:block absolute inset-0">
        <Image
          src={getSafeImageUrl(slide.imageDesktop, slide._id, false)}
          alt={slide.title}
          fill
          priority={index === 0}
          quality={95}
          className="object-cover"
          sizes="(max-width: 1024px) 1024px, 1920px"
          onError={() => {
            setImageErrors(prev => ({ ...prev, [`${slide._id}-desktop`]: true }));
          }}
        />
      </div>
      {/* Mobile Image */}
      <div className="block md:hidden absolute inset-0">
        <Image
          src={getSafeImageUrl(slide.imageMobile, slide._id, true)}
          alt={slide.title}
          fill
          priority={index === 0}
          quality={95}
          className="object-cover"
          sizes="768px"
          onError={() => {
            setImageErrors(prev => ({ ...prev, [`${slide._id}-mobile`]: true }));
          }}
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: settings.overlayColor,
          opacity: settings.overlayOpacity / 100,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1
            className="font-bold mb-4 md:mb-6"
            style={{ 
              color: settings.headingColor,
              fontSize: `${settings.headingSize}px`,
              lineHeight: 1.2,
            }}
          >
            {slide.title}
          </h1>
          <p
            className="mb-6 md:mb-8"
            style={{ 
              color: settings.subheadingColor,
              fontSize: `${settings.subheadingSize}px`,
              lineHeight: 1.4,
            }}
          >
            {slide.subtitle}
          </p>
          {slide.description && (
            <p
              className="mb-6 md:mb-8 opacity-90"
              style={{ 
                color: settings.descriptionColor,
                fontSize: `${settings.descriptionSize}px`,
                lineHeight: 1.5,
              }}
            >
              {slide.description}
            </p>
          )}
          {slide.buttonText && slide.buttonLink && (
            <Link href={slide.buttonLink}>
              <button
                className="px-6 md:px-8 py-3 md:py-4 font-semibold transition-transform hover:scale-105"
                style={{
                  backgroundColor: settings.buttonBackground,
                  color: settings.buttonTextColor,
                  fontSize: `${settings.buttonSize}px`,
                  borderRadius: '8px',
                }}
              >
                {slide.buttonText}
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={sliderRef}
      className="relative overflow-hidden w-full"
      style={{ height: `${getHeight()}px` }}
      onMouseEnter={() => settings.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => settings.pauseOnHover && setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        {settings.animationType === 'slide' ? (
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 500ms ease-in-out',
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className="flex-shrink-0 w-full h-full relative"
              >
                {renderSlideContent(slide, index)}
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className="absolute inset-0"
                style={getAnimationStyles(index)}
              >
                {renderSlideContent(slide, index)}
              </div>
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {slides.length > 1 && settings.showArrows && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full transition-all z-10"
              style={{
                backgroundColor: settings.arrowBackground,
                color: settings.arrowColor,
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full transition-all z-10"
              style={{
                backgroundColor: settings.arrowBackground,
                color: settings.arrowColor,
              }}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </>
        )}

        {/* Navigation Dots */}
        {slides.length > 1 && settings.showDots && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all rounded-full"
                style={{
                  backgroundColor: index === currentIndex 
                    ? settings.activeDotColor
                    : settings.dotColor,
                  transform: index === currentIndex ? 'scale(1.25)' : 'scale(1)',
                  width: '12px',
                  height: '12px',
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

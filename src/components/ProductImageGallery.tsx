'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Slider */}
      <div className="relative bg-white rounded-lg overflow-hidden">
        <Swiper
          spaceBetween={10}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Navigation, Thumbs, Zoom]}
          zoom={true}
          className="product-image-swiper"
          onSlideChange={(swiper) => setCurrentImage(swiper.activeIndex)}
          onZoomChange={(swiper, scale) => setIsZoomed(scale > 1)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container aspect-square">
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <button
          className="swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <button
          className="swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => {
              const swiper = document.querySelector('.product-image-swiper') as any;
              if (swiper?.swiper) {
                if (isZoomed) {
                  swiper.swiper.zoom.out();
                } else {
                  swiper.swiper.zoom.in();
                }
              }
            }}
            className="w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
            aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
          >
            <ZoomIn className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Slider */}
      {images.length > 1 && (
        <div className="relative">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Thumbs]}
            className="product-thumb-swiper"
            breakpoints={{
              320: { slidesPerView: 3 },
              640: { slidesPerView: 4 },
              768: { slidesPerView: 5 },
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-colors">
                  <Image
                    src={image}
                    alt={`${productName} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 20vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}

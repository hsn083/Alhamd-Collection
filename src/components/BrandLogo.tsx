'use client';

import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ 
  variant = 'light', 
  size = 'md'
}: BrandLogoProps) {
  const sizeClasses = {
    sm: {
      alhamd: 'text-[18px]',
      collection: 'text-[8px]'
    },
    md: {
      alhamd: 'text-[22px]',
      collection: 'text-[9px]'
    },
    lg: {
      alhamd: 'text-[26px]',
      collection: 'text-[10px]'
    }
  };

  const currentSize = sizeClasses[size];
  const isDark = variant === 'dark';

  return (
    <Link 
      href="/"
      className="flex flex-col leading-none"
      aria-label="ALHAMD COLLECTION - Home"
    >
      {/* ALHAMD - Modern Sans-Serif Bold */}
      <h1 
        className={`font-['Arial Black'] font-extrabold uppercase tracking-wide ${
          currentSize.alhamd
        } ${isDark ? 'text-[#0F766E]' : 'text-[#0F766E]'}`}
        style={{ 
          fontWeight: 800,
          letterSpacing: '0.05em'
        }}
      >
        ALHAMD
      </h1>

      {/* Collection - Small, Centered, Medium Weight */}
      <span 
        className={`font-['Arial Black'] font-medium uppercase tracking-[0.3em] text-center mt-0.5 ${
          currentSize.collection
        } ${isDark ? 'text-[#E8A300]' : 'text-[#E8A300]'}`}
        style={{ 
          fontWeight: 500,
          letterSpacing: '0.3em'
        }}
      >
        Collection
      </span>
    </Link>
  );
}

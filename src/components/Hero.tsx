'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80')",
        }}
      />

      {/* Elegant Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      {/* Gold Glow Effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-300 text-sm mb-6">
            <Sparkles size={14} />
            New Season Collection — Style Meets Comfort
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            PREMIUM CLOTHING
            <span className="block bg-gradient-to-r from-yellow-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              & SHOES COLLECTION
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
            Discover the latest fashion trends, stylish clothing, and premium
            footwear crafted for comfort and elegance.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/category/mens-clothing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ShoppingBag size={20} />
              Shop Men
            </Link>

            <Link
              href="/category/womens-clothing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 rounded-xl text-black font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ShoppingBag size={20} />
              Shop Women
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              New Arrivals
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-xl">
            <div>
              <h3 className="text-3xl font-bold text-yellow-400">500+</h3>
              <p className="text-gray-400">Fashion Styles</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-yellow-400">1000+</h3>
              <p className="text-gray-400">Happy Customers</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-yellow-400">24/7</h3>
              <p className="text-gray-400">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

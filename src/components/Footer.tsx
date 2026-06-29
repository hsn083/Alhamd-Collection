'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

// TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z"/>
    </svg>
  );
}

// Pinterest icon
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );
}

export default function Footer() {
  const settings = useSettingsStore(state => state.settings);
  const general = settings.general;
  const socialMedia = settings.socialMedia;
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 border-t border-emerald-800/40 mt-20 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
                ALHAMD
              </span>
              <span className="ml-1 text-sm font-semibold text-yellow-400 tracking-widest uppercase">
                Collection
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              {general.siteTagline}
            </p>
            <div className="flex space-x-3">
              {socialMedia.facebook.enabled && socialMedia.facebook.url && (
                <Link href={socialMedia.facebook.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {socialMedia.instagram.enabled && socialMedia.instagram.url && (
                <Link href={socialMedia.instagram.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {socialMedia.tiktok.enabled && socialMedia.tiktok.url && (
                <Link href={socialMedia.tiktok.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <TikTokIcon className="h-5 w-5" />
                </Link>
              )}
              {socialMedia.youtube.enabled && socialMedia.youtube.url && (
                <Link href={socialMedia.youtube.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <PinterestIcon className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-emerald-400 transition-colors">Shop</Link></li>
              <li><Link href="/category/mens-clothing" className="text-gray-400 hover:text-emerald-400 transition-colors">Men's Collection</Link></li>
              <li><Link href="/category/womens-clothing" className="text-gray-400 hover:text-emerald-400 transition-colors">Women's Collection</Link></li>
              <li><Link href="/category/shoes" className="text-gray-400 hover:text-emerald-400 transition-colors">Shoes</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account" className="text-gray-400 hover:text-emerald-400 transition-colors">My Account</Link></li>
              <li><Link href="/orders" className="text-gray-400 hover:text-emerald-400 transition-colors">Order Tracking</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-emerald-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-emerald-400 transition-colors">Shipping Info</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-emerald-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4 text-emerald-400" />
                <a href={`tel:${general.phoneNumber}`} className="hover:text-emerald-400 transition-colors">{general.phoneNumber}</a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4 text-emerald-400" />
                <a href={`mailto:${general.contactEmail}`} className="hover:text-emerald-400 transition-colors">{general.contactEmail}</a>
              </li>
              <li className="flex items-start space-x-2 text-gray-400">
                <MapPin className="h-4 w-4 mt-1 text-emerald-400" />
                <span className="whitespace-pre-line">{general.companyAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            {general.footerInfo}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms-conditions" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms & Conditions</Link>
            <Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

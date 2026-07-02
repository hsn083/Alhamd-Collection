'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import BrandLogo from './BrandLogo';

// WhatsApp icon (not in lucide-react)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

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
            <div className="mb-6">
              <BrandLogo 
                variant="dark"
                size="lg"
              />
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
              {socialMedia.whatsapp.enabled && socialMedia.whatsapp.url && (
                <Link href={socialMedia.whatsapp.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <WhatsAppIcon className="h-5 w-5" />
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
              <li><Link href="/category/womens-shoes" className="text-gray-400 hover:text-emerald-400 transition-colors">Shoes</Link></li>
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

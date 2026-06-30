import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data');
const PRODUCTS_FILE = join(DATA_DIR, 'products.json');

const SEED_PRODUCTS = [
  {
    id: '1',
    name: 'Razer DeathAdder V2 Gaming Mouse',
    slug: 'razer-deathadder-v2-gaming-mouse',
    description: 'The Razer DeathAdder V2 features the fastest optical sensor on the market, designed for gaming precision.',
    price: 8999,
    discountPrice: 7999,
    category: "Men's Clothing",
    brand: 'Razer',
    stock: 25,
    images: ['/images/products/razer-mouse-1.jpg', '/images/products/razer-mouse-2.jpg', '/images/products/razer-mouse-3.jpg'],
    specifications: { 'Sensor': 'Razer Focus+ Optical Sensor', 'DPI': '20,000', 'Buttons': '8 Programmable', 'Weight': '82g', 'Connection': 'Wired USB' },
    features: ['20,000 DPI Optical Sensor', '8 Programmable Buttons', 'Chroma RGB Lighting', 'Ergonomic Design', 'Speedflex Cable'],
    warranty: '2 Years',
    rating: 4.8,
    reviews: 234,
    isNew: false,
    isFeatured: true,
    isBestSeller: true,
    tags: ['gaming', 'mouse', 'razer', 'rgb'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-05-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Logitech G Pro X Mechanical Keyboard',
    slug: 'logitech-g-pro-x-mechanical-keyboard',
    description: 'Pro-grade mechanical gaming keyboard with swappable switches for complete customization.',
    price: 15999,
    discountPrice: 13999,
    category: "Men's Clothing",
    brand: 'Logitech',
    stock: 18,
    images: ['/images/products/logitech-keyboard-1.jpg', '/images/products/logitech-keyboard-2.jpg'],
    specifications: { 'Switch Type': 'GX Blue Clicky', 'Layout': 'TKL (Tenkeyless)', 'Backlight': 'RGB', 'Connection': 'Wired USB', 'N-Key Rollover': 'Full' },
    features: ['Swappable Switches', 'RGB Backlighting', 'Compact TKL Design', 'USB-C Detachable Cable', 'Onboard Memory'],
    warranty: '2 Years',
    rating: 4.9,
    reviews: 189,
    isNew: false,
    isFeatured: true,
    isBestSeller: true,
    tags: ['gaming', 'keyboard', 'logitech', 'mechanical'],
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-05-18T00:00:00Z',
  },
  {
    id: '3',
    name: 'Corsair K70 RGB MK.2 Mechanical Keyboard',
    slug: 'corsair-k70-rgb-mk2-mechanical-keyboard',
    description: 'High-performance mechanical gaming keyboard with per-key RGB backlighting and aircraft-grade aluminum frame.',
    price: 18999,
    category: "Men's Clothing",
    brand: 'Corsair',
    stock: 12,
    images: ['/images/products/corsair-keyboard-1.jpg', '/images/products/corsair-keyboard-2.jpg'],
    specifications: { 'Switch Type': 'Cherry MX Red', 'Layout': 'Full Size', 'Backlight': 'Per-Key RGB', 'Frame': 'Aircraft Aluminum', 'Media Keys': 'Dedicated' },
    features: ['Per-Key RGB Lighting', 'Cherry MX Switches', 'Aircraft Aluminum Frame', 'USB Pass-Through', 'Dedicated Media Controls'],
    warranty: '2 Years',
    rating: 4.7,
    reviews: 156,
    isNew: false,
    isFeatured: true,
    isBestSeller: false,
    tags: ['gaming', 'keyboard', 'corsair', 'rgb'],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
  },
  {
    id: '4',
    name: 'SteelSeries Arctis 7 Gaming Headset',
    slug: 'steelseries-arctis-7-gaming-headset',
    description: 'Wireless gaming headset with premium sound, ClearCast microphone, and 24-hour battery life.',
    price: 14999,
    discountPrice: 12999,
    category: "Men's Clothing",
    brand: 'SteelSeries',
    stock: 20,
    images: ['/images/products/steelseries-headset-1.jpg', '/images/products/steelseries-headset-2.jpg'],
    specifications: { 'Driver Size': '40mm Neodymium', 'Frequency Response': '20-20,000 Hz', 'Connection': 'Wireless 2.4G', 'Battery Life': '24 Hours', 'Microphone': 'ClearCast' },
    features: ['Wireless 2.4G Connection', '24-Hour Battery', 'ClearCast Microphone', 'DTS Headphone:X', 'Comfortable Design'],
    warranty: '2 Years',
    rating: 4.6,
    reviews: 198,
    isNew: false,
    isFeatured: true,
    isBestSeller: true,
    tags: ['gaming', 'headset', 'steelseries', 'wireless'],
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-05-22T00:00:00Z',
  },
];

async function ensureDataDirectory() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
    console.log('Data directory created:', DATA_DIR);
  }
}

async function initializeProductsFile() {
  try {
    await ensureDataDirectory();
    if (existsSync(PRODUCTS_FILE)) {
      return;
    }
    console.log('Initializing products.json with seed data...');
    const data = { products: SEED_PRODUCTS };
    await writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Products file initialized successfully');
  } catch (error) {
    console.error('Error initializing products file:', error);
  }
}

export async function GET() {
  try {
    console.log('GET /api/admin/initialize called');
    await initializeProductsFile();
    return NextResponse.json({
      success: true,
      message: 'Initialization completed',
    });
  } catch (error) {
    console.error('Error initializing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize' },
      { status: 500 }
    );
  }
}

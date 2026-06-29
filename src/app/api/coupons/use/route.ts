import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_FILE = join(process.cwd(), 'data', 'coupons.json');

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to read coupons from JSON file
async function readCoupons(): Promise<Coupon[]> {
  try {
    if (!existsSync(DATA_FILE)) {
      return [];
    }
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading coupons:', error);
    return [];
  }
}

// Helper function to write coupons to JSON file
async function writeCoupons(coupons: Coupon[]): Promise<void> {
  try {
    await writeFile(DATA_FILE, JSON.stringify(coupons, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing coupons:', error);
    throw error;
  }
}

// POST - Increment coupon usage count
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Coupon code is required' 
        },
        { status: 400 }
      );
    }

    const coupons = await readCoupons();

    // Find coupon by code (case-insensitive)
    const couponIndex = coupons.findIndex((c: Coupon) => c.code.toLowerCase() === code.toLowerCase());

    if (couponIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Coupon not found'
      }, { status: 404 });
    }

    // Increment usage count
    coupons[couponIndex].usedCount += 1;
    coupons[couponIndex].updatedAt = new Date().toISOString();

    await writeCoupons(coupons);

    return NextResponse.json({
      success: true,
      message: 'Coupon usage recorded successfully',
      coupon: coupons[couponIndex]
    });
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to record coupon usage' 
      },
      { status: 500 }
    );
  }
}

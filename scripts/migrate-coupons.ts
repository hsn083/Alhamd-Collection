import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from parent directory
import connectDB from '../src/lib/db';
import Coupon from '../src/models/Coupon';

interface JsonCoupon {
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

async function migrateCoupons() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully');

    // Read JSON file
    const jsonPath = join(process.cwd(), 'data', 'coupons.json');
    const jsonData = await readFile(jsonPath, 'utf-8');
    const jsonCoupons: JsonCoupon[] = JSON.parse(jsonData);

    console.log(`Found ${jsonCoupons.length} coupons in JSON file`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const jsonCoupon of jsonCoupons) {
      try {
        // Check if coupon already exists by code
        const existing = await Coupon.findOne({ code: jsonCoupon.code });
        if (existing) {
          console.log(`Skipping coupon ${jsonCoupon.code} - already exists`);
          skipped++;
          continue;
        }

        // Create new coupon in MongoDB
        await Coupon.create({
          code: jsonCoupon.code,
          type: jsonCoupon.type,
          value: jsonCoupon.value,
          minPurchase: jsonCoupon.minPurchase,
          maxDiscount: jsonCoupon.maxDiscount,
          usageLimit: jsonCoupon.usageLimit,
          usedCount: jsonCoupon.usedCount,
          expiryDate: new Date(jsonCoupon.expiryDate),
          isActive: jsonCoupon.isActive,
          createdAt: new Date(jsonCoupon.createdAt),
          updatedAt: new Date(jsonCoupon.updatedAt),
        });

        console.log(`Migrated coupon: ${jsonCoupon.code}`);
        migrated++;
      } catch (error) {
        console.error(`Error migrating coupon ${jsonCoupon.code}:`, error);
        errors++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total coupons in JSON: ${jsonCoupons.length}`);
    console.log(`Successfully migrated: ${migrated}`);
    console.log(`Skipped (already exists): ${skipped}`);
    console.log(`Errors: ${errors}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCoupons();

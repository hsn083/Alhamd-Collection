import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alhamd-collection';

// Data directory
const DATA_DIR = path.join(process.cwd(), 'data');

// Helper function to read JSON file
function readJsonFile(filename: string): any[] {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filename}`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Helper function to convert string ID to ObjectId
function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId();
}

// Migration functions
async function migrateCategories() {
  console.log('Migrating categories...');
  const categories = readJsonFile('categories.json');
  
  for (const cat of categories) {
    try {
      const existing = await Category.findOne({ slug: cat.slug });
      if (existing) {
        console.log(`Category already exists: ${cat.name}`);
        continue;
      }

      await Category.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image: cat.image || '',
        status: cat.status || 'active',
        displayOrder: cat.displayOrder || 0,
        metaTitle: cat.metaTitle || '',
        metaDescription: cat.metaDescription || '',
        productCount: cat.productCount || 0,
      });
      console.log(`Created category: ${cat.name}`);
    } catch (error) {
      console.error(`Error migrating category ${cat.name}:`, error);
    }
  }
  
  console.log(`Migrated ${categories.length} categories`);
}

async function migrateBrands() {
  console.log('Migrating brands...');
  const brands = readJsonFile('brands.json');
  
  for (const brand of brands) {
    try {
      const existing = await Brand.findOne({ slug: brand.slug });
      if (existing) {
        console.log(`Brand already exists: ${brand.name}`);
        continue;
      }

      await Brand.create({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        status: brand.status || 'active',
      });
      console.log(`Created brand: ${brand.name}`);
    } catch (error) {
      console.error(`Error migrating brand ${brand.name}:`, error);
    }
  }
  
  console.log(`Migrated ${brands.length} brands`);
}

async function migrateProducts() {
  console.log('Migrating products...');
  const products = readJsonFile('products.json');
  
  for (const product of products) {
    try {
      const existing = await Product.findOne({ sku: product.sku });
      if (existing) {
        console.log(`Product already exists: ${product.name}`);
        continue;
      }

      // Find category
      const category = await Category.findOne({ slug: product.category });
      const categoryId = category?._id;

      // Find brand
      const brand = await Brand.findOne({ slug: product.brand });
      const brandId = brand?._id;

      await Product.create({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description || '',
        price: product.price,
        discountPrice: product.discountPrice,
        category: categoryId,
        brand: brandId,
        images: product.images || [],
        gallery: product.gallery || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock || 0,
        status: product.status || 'active',
        featured: product.featured || false,
        new: product.new || false,
        rating: product.rating || 0,
        reviewCount: product.reviews || 0,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      });

      // Create inventory record
      if (categoryId) {
        await Inventory.create({
          product: (await Product.findOne({ sku: product.sku }))._id,
          category: categoryId,
          quantity: product.stock || 0,
          available: product.stock || 0,
          lowStockThreshold: 10,
          status: (product.stock || 0) > 10 ? 'in_stock' : 'low_stock',
        });
      }

      console.log(`Created product: ${product.name}`);
    } catch (error) {
      console.error(`Error migrating product ${product.name}:`, error);
    }
  }
  
  console.log(`Migrated ${products.length} products`);
}

async function migrateOrders() {
  console.log('Migrating orders...');
  const orders = readJsonFile('orders.json');
  
  for (const order of orders) {
    try {
      const existing = await Order.findOne({ orderNumber: order.orderNumber });
      if (existing) {
        console.log(`Order already exists: ${order.orderNumber}`);
        continue;
      }

      // Find customer
      const customer = await User.findOne({ email: order.customerEmail });
      const customerId = customer?._id;

      const newOrder = await Order.create({
        orderNumber: order.orderNumber,
        customer: customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        items: order.items || [],
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        discount: order.discount,
        total: order.total,
        status: order.status || 'pending',
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus || 'pending',
        notes: order.notes,
        statusHistory: order.statusHistory || [],
      });

      // Create payment record
      if (order.transactionId) {
        await Payment.create({
          order: newOrder._id,
          amount: order.total,
          method: order.paymentMethod,
          status: order.paymentStatus === 'paid' ? 'completed' : 'pending',
          transactionId: order.transactionId,
          verificationStatus: 'approved',
        });
      }

      console.log(`Created order: ${order.orderNumber}`);
    } catch (error) {
      console.error(`Error migrating order ${order.orderNumber}:`, error);
    }
  }
  
  console.log(`Migrated ${orders.length} orders`);
}

async function migrateCoupons() {
  console.log('Migrating coupons...');
  const coupons = readJsonFile('coupons.json');
  
  for (const coupon of coupons) {
    try {
      const existing = await Coupon.findOne({ code: coupon.code });
      if (existing) {
        console.log(`Coupon already exists: ${coupon.code}`);
        continue;
      }

      await Coupon.create({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive !== false,
      });
      console.log(`Created coupon: ${coupon.code}`);
    } catch (error) {
      console.error(`Error migrating coupon ${coupon.code}:`, error);
    }
  }
  
  console.log(`Migrated ${coupons.length} coupons`);
}

async function migrateReviews() {
  console.log('Migrating reviews...');
  const reviews = readJsonFile('reviews.json');
  
  for (const review of reviews) {
    try {
      const existing = await Review.findOne({
        product: review.productId,
        customerEmail: review.customerEmail,
      });
      if (existing) {
        console.log(`Review already exists for product ${review.productId}`);
        continue;
      }

      // Find product
      const product = await Product.findOne({ sku: review.productId });
      if (!product) {
        console.log(`Product not found for review: ${review.productId}`);
        continue;
      }

      await Review.create({
        product: product._id,
        customerName: review.customerName,
        customerEmail: review.customerEmail,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        video: review.video,
        variant: review.variant,
        isVerifiedPurchase: review.isVerifiedPurchase,
        likes: review.likes,
        helpful: review.helpful,
        status: review.status || 'approved',
        sessionId: review.sessionId,
      });
      console.log(`Created review for product: ${review.productId}`);
    } catch (error) {
      console.error(`Error migrating review for product ${review.productId}:`, error);
    }
  }
  
  console.log(`Migrated ${reviews.length} reviews`);
}

async function migrateAdminUsers() {
  console.log('Migrating admin users...');
  const adminUsers = readJsonFile('admin-users.json');
  
  for (const admin of adminUsers) {
    try {
      const existing = await Admin.findOne({ email: admin.email });
      if (existing) {
        console.log(`Admin already exists: ${admin.email}`);
        continue;
      }

      await Admin.create({
        name: admin.name,
        email: admin.email,
        password: admin.password, // Should be hashed
        role: admin.role || 'admin',
        status: admin.status || 'active',
      });
      console.log(`Created admin: ${admin.email}`);
    } catch (error) {
      console.error(`Error migrating admin ${admin.email}:`, error);
    }
  }
  
  console.log(`Migrated ${adminUsers.length} admin users`);
}

async function migrateAuditLogs() {
  console.log('Migrating audit logs...');
  const auditLogs = readJsonFile('audit-logs.json');
  
  for (const log of auditLogs) {
    try {
      await AuditLog.create({
        user: log.userId,
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
      });
    } catch (error) {
      console.error(`Error migrating audit log:`, error);
    }
  }
  
  console.log(`Migrated ${auditLogs.length} audit logs`);
}

// Main migration function
async function migrateAll() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Run migrations in order
    await migrateCategories();
    await migrateBrands();
    await migrateProducts();
    await migrateOrders();
    await migrateCoupons();
    await migrateReviews();
    await migrateAdminUsers();
    await migrateAuditLogs();

    console.log('\n=== Migration completed successfully ===');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateAll().catch(console.error);

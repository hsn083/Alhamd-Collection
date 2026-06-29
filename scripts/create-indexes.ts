import mongoose from 'mongoose';
import path from 'path';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alhamd-collection';

// Import models
import Product from '../src/models/Product';
import Category from '../src/models/Category';
import Brand from '../src/models/Brand';
import User from '../src/models/User';
import Admin from '../src/models/Admin';
import Order from '../src/models/Order';
import Payment from '../src/models/Payment';
import Coupon from '../src/models/Coupon';
import Review from '../src/models/Review';
import Rating from '../src/models/Rating';
import Cart from '../src/models/Cart';
import Wishlist from '../src/models/Wishlist';
import Inventory from '../src/models/Inventory';
import StockHistory from '../src/models/StockHistory';
import Notification from '../src/models/Notification';
import ContactMessage from '../src/models/ContactMessage';
import NewsletterSubscriber from '../src/models/NewsletterSubscriber';

async function createIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== Creating MongoDB Indexes ===\n');

    // Product indexes
    console.log('Creating Product indexes...');
    await Product.createIndexes();
    console.log('Product indexes created');

    // Category indexes
    console.log('Creating Category indexes...');
    await Category.createIndexes();
    console.log('Category indexes created');

    // Brand indexes
    console.log('Creating Brand indexes...');
    await Brand.createIndexes();
    console.log('Brand indexes created');

    // User indexes
    console.log('Creating User indexes...');
    await User.createIndexes();
    console.log('User indexes created');

    // Admin indexes
    console.log('Creating Admin indexes...');
    await Admin.createIndexes();
    console.log('Admin indexes created');

    // Order indexes
    console.log('Creating Order indexes...');
    await Order.createIndexes();
    console.log('Order indexes created');

    // Payment indexes
    console.log('Creating Payment indexes...');
    await Payment.createIndexes();
    console.log('Payment indexes created');

    // Coupon indexes
    console.log('Creating Coupon indexes...');
    await Coupon.createIndexes();
    console.log('Coupon indexes created');

    // Review indexes
    console.log('Creating Review indexes...');
    await Review.createIndexes();
    console.log('Review indexes created');

    // Rating indexes
    console.log('Creating Rating indexes...');
    await Rating.createIndexes();
    console.log('Rating indexes created');

    // Cart indexes
    console.log('Creating Cart indexes...');
    await Cart.createIndexes();
    console.log('Cart indexes created');

    // Wishlist indexes
    console.log('Creating Wishlist indexes...');
    await Wishlist.createIndexes();
    console.log('Wishlist indexes created');

    // Inventory indexes
    console.log('Creating Inventory indexes...');
    await Inventory.createIndexes();
    console.log('Inventory indexes created');

    // StockHistory indexes
    console.log('Creating StockHistory indexes...');
    await StockHistory.createIndexes();
    console.log('StockHistory indexes created');

    // Notification indexes
    console.log('Creating Notification indexes...');
    await Notification.createIndexes();
    console.log('Notification indexes created');

    // ContactMessage indexes
    console.log('Creating ContactMessage indexes...');
    await ContactMessage.createIndexes();
    console.log('ContactMessage indexes created');

    // NewsletterSubscriber indexes
    console.log('Creating NewsletterSubscriber indexes...');
    await NewsletterSubscriber.createIndexes();
    console.log('NewsletterSubscriber indexes created');

    console.log('\n=== All indexes created successfully ===\n');

    // List all indexes for verification
    console.log('\n=== Index Summary ===\n');
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        const indexes = await db.collection(collection.name).listIndexes().toArray();
        console.log(`\n${collection.name}:`);
        indexes.forEach(index => {
          console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
      }
    }

  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run index creation
createIndexes().catch(console.error);

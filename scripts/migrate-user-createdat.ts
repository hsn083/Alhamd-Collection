import mongoose from 'mongoose';
import connectDB from '../src/lib/db';
import User from '../src/models/User';

/**
 * Migration script to fix missing createdAt fields for existing users
 * 
 * This script:
 * 1. Finds users where createdAt is missing or null
 * 2. Sets createdAt using ObjectId timestamp (most accurate fallback)
 * 3. Does not modify users that already have a valid createdAt
 * 
 * Run with: npx ts-node scripts/migrate-user-createdat.ts
 */

async function migrateUserCreatedAt() {
  try {
    console.log('Starting migration for user createdAt fields...');
    
    // Connect to database
    await connectDB();
    console.log('Connected to database');
    
    // Find users without createdAt
    const usersWithoutCreatedAt = await User.find({ createdAt: { $exists: false } });
    const usersWithNullCreatedAt = await User.find({ createdAt: null });
    
    const totalUsersToMigrate = usersWithoutCreatedAt.length + usersWithNullCreatedAt.length;
    
    console.log(`Found ${usersWithoutCreatedAt.length} users without createdAt field`);
    console.log(`Found ${usersWithNullCreatedAt.length} users with null createdAt`);
    console.log(`Total users to migrate: ${totalUsersToMigrate}`);
    
    if (totalUsersToMigrate === 0) {
      console.log('No users need migration. Exiting.');
      process.exit(0);
    }
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // Migrate users without createdAt field
    for (const user of usersWithoutCreatedAt) {
      try {
        // Use ObjectId timestamp as the most accurate fallback
        const objectIdTimestamp = user._id.getTimestamp();
        
        await User.findByIdAndUpdate(user._id, {
          $set: { createdAt: objectIdTimestamp }
        });
        
        migratedCount++;
        console.log(`✓ Migrated user ${user.email} (ID: ${user._id}) - createdAt set to ${objectIdTimestamp.toISOString()}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to migrate user ${user.email} (ID: ${user._id}):`, error);
      }
    }
    
    // Migrate users with null createdAt
    for (const user of usersWithNullCreatedAt) {
      try {
        // Use ObjectId timestamp as the most accurate fallback
        const objectIdTimestamp = user._id.getTimestamp();
        
        await User.findByIdAndUpdate(user._id, {
          $set: { createdAt: objectIdTimestamp }
        });
        
        migratedCount++;
        console.log(`✓ Migrated user ${user.email} (ID: ${user._id}) - createdAt set to ${objectIdTimestamp.toISOString()}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to migrate user ${user.email} (ID: ${user._id}):`, error);
      }
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total users to migrate: ${totalUsersToMigrate}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Failed: ${errorCount}`);
    
    if (errorCount === 0 && migratedCount === totalUsersToMigrate) {
      console.log('\n✓ Migration completed successfully!');
    } else {
      console.log('\n⚠ Migration completed with some errors. Please review the logs above.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateUserCreatedAt();

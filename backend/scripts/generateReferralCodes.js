// scripts/generateReferralCodes.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../.env');
console.log('📁 Looking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  dotenv.config({ path: envPath });
  console.log('📋 Environment variables loaded');
} else {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

// Import User model
import User from '../src/models/UserModel.js';

const generateReferralCode = (firstName) => {
  const prefix = firstName?.slice(0, 3).toUpperCase() || 'USER';
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${random}`;
};

const generateReferralCodesForExistingUsers = async () => {
  try {
    // Check for MONGO_URI (your .env uses this)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('\n❌ No MongoDB URI found in environment variables!');
      console.log('\nPlease add MONGO_URI to your .env file');
      console.log('Current .env variables found:', Object.keys(process.env).filter(k => 
        k.includes('MONGO') || k.includes('DB')
      ));
      process.exit(1);
    }

    console.log('\n📡 Connecting to MongoDB...');
    console.log('🔗 Using URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    // Find all users without referral codes
    const usersWithoutCode = await User.find({ 
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: '' }
      ]
    });

    console.log(`📊 Found ${usersWithoutCode.length} users without referral codes\n`);

    if (usersWithoutCode.length === 0) {
      console.log('✨ All users already have referral codes!');
      await mongoose.disconnect();
      process.exit(0);
    }

    let updated = 0;
    let failed = 0;

    for (const user of usersWithoutCode) {
      try {
        let referralCode = generateReferralCode(user.firstName);
        
        // Ensure uniqueness
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
          const existing = await User.findOne({ referralCode });
          if (!existing) {
            isUnique = true;
          } else {
            referralCode = generateReferralCode(user.firstName);
            attempts++;
          }
        }

        user.referralCode = referralCode;
        await user.save({ validateBeforeSave: false });
        updated++;
        console.log(`✓ [${updated}] ${user.email} -> ${referralCode} (${user.firstName} ${user.lastName})`);
      } catch (err) {
        failed++;
        console.error(`✗ Failed for ${user.email}:`, err.message);
      }
    }

    console.log(`\n🎉 Complete! Updated: ${updated}, Failed: ${failed}`);
    
    // Show summary
    const allUsers = await User.find({});
    const withCodes = allUsers.filter(u => u.referralCode).length;
    console.log(`📈 Summary: ${withCodes}/${allUsers.length} users now have referral codes`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Script failed:', err.message);
    if (err.stack) console.error(err.stack);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

// Run the script
generateReferralCodesForExistingUsers();
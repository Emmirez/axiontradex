// backend/src/config/createIndexes.js
// Run once with: node src/config/createIndexes.js
// This fixes slow queries by adding indexes to all collections

import 'dotenv/config'
import mongoose from 'mongoose'

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db

    console.log('\n📦 Creating indexes...\n')

    // ── Notifications ─────────────────────────────────────────────────────────
    await db.collection('notifications').createIndexes([
      { key: { user: 1, createdAt: -1 } },
      { key: { user: 1, isRead: 1 } },
      { key: { createdAt: -1 } },
    ])
    console.log('✅ notifications')

    // ── Transactions ──────────────────────────────────────────────────────────
    await db.collection('transactions').createIndexes([
      { key: { user: 1, createdAt: -1 } },
      { key: { user: 1, type: 1, status: 1 } },
      { key: { status: 1, createdAt: -1 } },
      { key: { type: 1, status: 1, createdAt: -1 } },
    ])
    console.log('✅ transactions')

    // ── Users ─────────────────────────────────────────────────────────────────
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { 'kyc.status': 1 } },
      { key: { createdAt: -1 } },
      { key: { firstName: 'text', lastName: 'text', email: 'text' } },
    ])
    console.log('✅ users')

    // ── Announcements ─────────────────────────────────────────────────────────
    await db.collection('announcements').createIndexes([
      { key: { isActive: 1, startDate: 1, endDate: 1 } },
      { key: { dismissedBy: 1 } },
      { key: { createdAt: -1 } },
    ])
    console.log('✅ announcements')

    // ── Trades ────────────────────────────────────────────────────────────────
    await db.collection('trades').createIndexes([
      { key: { user: 1, createdAt: -1 } },
      { key: { user: 1, status: 1 } },
      { key: { status: 1, createdAt: -1 } },
      { key: { symbol: 1, createdAt: -1 } },
    ])
    console.log('✅ trades')

    // ── Copy trading ──────────────────────────────────────────────────────────
    await db.collection('copytraders').createIndexes([
      { key: { isActive: 1, 'stats.totalFollowers': -1 } },
      { key: { user: 1 }, unique: true },
    ])
    console.log('✅ copytraders')

    await db.collection('copytrades').createIndexes([
      { key: { follower: 1, status: 1 } },
      { key: { trader: 1, status: 1 } },
      { key: { follower: 1, trader: 1, status: 1 } },
    ])
    console.log('✅ copytrades')

    await db.collection('copiedtrades').createIndexes([
      { key: { follower: 1, createdAt: -1 } },
      { key: { trader: 1, createdAt: -1 } },
    ])
    console.log('✅ copiedtrades')

    // ── Support tickets ───────────────────────────────────────────────────────
    await db.collection('tickets').createIndexes([
      { key: { user: 1, createdAt: -1 } },
      { key: { status: 1, createdAt: -1 } },
    ])
    console.log('✅ tickets')

    // ── Investments ───────────────────────────────────────────────────────────
    await db.collection('investments').createIndexes([
      { key: { user: 1, status: 1 } },
      { key: { status: 1, createdAt: -1 } },
    ])
    console.log('✅ investments')

    // ── Admin notifications ───────────────────────────────────────────────────
    await db.collection('adminnotifications').createIndexes([
      { key: { createdAt: -1 } },
      { key: { isRead: 1, createdAt: -1 } },
    ])
    console.log('✅ adminnotifications')

    console.log('\n🎉 All indexes created successfully!\n')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error creating indexes:', err.message)
    process.exit(1)
  }
}

createIndexes()
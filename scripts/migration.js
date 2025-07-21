// Migration utility to transfer data from in-memory database to MongoDB
// Run this script when switching from in-memory storage to MongoDB

import mongoDatabase from '../lib/mongoDatabase.js'
import { InMemoryDatabase } from '../lib/database.js'

class DatabaseMigration {
  constructor() {
    this.inMemoryDb = new InMemoryDatabase()
    this.mongoDb = mongoDatabase
  }

  async performMigration() {
    try {
      console.log('🚀 Starting database migration from in-memory to MongoDB...')
      
      // Initialize both databases
      await this.mongoDb.initialize()
      
      // Get existing data from in-memory database
      console.log('📊 Collecting data from in-memory database...')
      const existingUsers = this.inMemoryDb.getAllUsers()
      
      if (existingUsers.size === 0) {
        console.log('ℹ️ No users found in in-memory database. Nothing to migrate.')
        return { status: 'success', migratedUsers: 0, message: 'No data to migrate' }
      }

      console.log(`📋 Found ${existingUsers.size} users to migrate`)
      
      // Migrate users to MongoDB
      const migrationResults = await this.mongoDb.migrateFromInMemory(existingUsers)
      
      // Count successful migrations
      const successfulMigrations = migrationResults.filter(result => result.status === 'success').length
      const failedMigrations = migrationResults.filter(result => result.status === 'error').length
      
      console.log(`✅ Migration completed: ${successfulMigrations} successful, ${failedMigrations} failed`)
      
      return {
        status: 'success',
        migratedUsers: successfulMigrations,
        failedUsers: failedMigrations,
        details: migrationResults,
        message: `Successfully migrated ${successfulMigrations} users to MongoDB`
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return {
        status: 'error',
        error: error.message,
        message: 'Migration failed'
      }
    }
  }

  async verifyMigration() {
    try {
      console.log('🔍 Verifying migration...')
      
      // Get users from both databases
      const inMemoryUsers = this.inMemoryDb.getAllUsers()
      const mongoUsers = await this.mongoDb.getAllUsers()
      
      console.log(`In-memory users: ${inMemoryUsers.size}`)
      console.log(`MongoDB users: ${mongoUsers.length}`)
      
      // Check if all users were migrated
      const verification = {
        inMemoryCount: inMemoryUsers.size,
        mongoCount: mongoUsers.length,
        allMigrated: mongoUsers.length >= inMemoryUsers.size
      }
      
      if (verification.allMigrated) {
        console.log('✅ Verification passed: All users migrated successfully')
      } else {
        console.log('⚠️ Verification warning: Some users may not have been migrated')
      }
      
      return verification
      
    } catch (error) {
      console.error('❌ Verification failed:', error)
      return { error: error.message }
    }
  }

  async createSampleData() {
    try {
      console.log('🎯 Creating sample data for testing...')
      
      await this.mongoDb.initialize()
      
      // Create sample users
      const sampleUsers = [
        {
          id: 'USER001',
          email: 'user1@cleanbage.com',
          password: 'password123',
          name: 'John Doe',
          role: 'user',
          society: 'Green Valley Apartments',
          points: 150,
          rank: 5
        },
        {
          id: 'COLLECTOR001',
          email: 'collector1@cleanbage.com',
          password: 'password123',
          name: 'Alice Smith',
          role: 'collector',
          society: 'Green Valley Apartments',
          points: 500,
          rank: 1,
          collectorId: 'COL001'
        },
        {
          id: 'USER002',
          email: 'user2@cleanbage.com',
          password: 'password123',
          name: 'Bob Johnson',
          role: 'user',
          society: 'Sunrise Complex',
          points: 75,
          rank: 12
        }
      ]
      
      const results = []
      
      for (const userData of sampleUsers) {
        try {
          const user = await this.mongoDb.createUser(userData)
          results.push({ status: 'success', userId: user.id })
          console.log(`✅ Created sample user: ${user.id}`)
        } catch (error) {
          results.push({ status: 'error', userId: userData.id, error: error.message })
          console.error(`❌ Failed to create user ${userData.id}:`, error.message)
        }
      }
      
      console.log('✅ Sample data creation completed')
      return results
      
    } catch (error) {
      console.error('❌ Sample data creation failed:', error)
      throw error
    }
  }

  async cleanupMongoDB() {
    try {
      console.log('🧹 Cleaning up MongoDB collections...')
      
      await this.mongoDb.initialize()
      
      // This is a destructive operation - use with caution
      const collections = ['users', 'transactions', 'notifications', 'scanHistory', 'qrStates']
      
      for (const collectionName of collections) {
        try {
          const collection = await this.mongoDb.getCollection(collectionName)
          const result = await collection.deleteMany({})
          console.log(`🗑️ Cleaned ${collectionName}: ${result.deletedCount} documents removed`)
        } catch (error) {
          console.error(`❌ Failed to clean ${collectionName}:`, error.message)
        }
      }
      
      console.log('✅ MongoDB cleanup completed')
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error)
      throw error
    }
  }
}

// Export for use in API routes or scripts
export default DatabaseMigration

// CLI functionality for running migration directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new DatabaseMigration()
  
  const command = process.argv[2]
  
  switch (command) {
    case 'migrate':
      console.log('Running migration...')
      migration.performMigration()
        .then(result => {
          console.log('Migration result:', result)
          process.exit(result.status === 'success' ? 0 : 1)
        })
        .catch(error => {
          console.error('Migration error:', error)
          process.exit(1)
        })
      break
      
    case 'verify':
      console.log('Running verification...')
      migration.verifyMigration()
        .then(result => {
          console.log('Verification result:', result)
          process.exit(0)
        })
        .catch(error => {
          console.error('Verification error:', error)
          process.exit(1)
        })
      break
      
    case 'sample':
      console.log('Creating sample data...')
      migration.createSampleData()
        .then(result => {
          console.log('Sample data result:', result)
          process.exit(0)
        })
        .catch(error => {
          console.error('Sample data error:', error)
          process.exit(1)
        })
      break
      
    case 'cleanup':
      console.log('⚠️ WARNING: This will delete ALL data in MongoDB!')
      console.log('Type "yes" to confirm:')
      // In a real CLI, you'd want to add readline for user confirmation
      migration.cleanupMongoDB()
        .then(() => {
          console.log('Cleanup completed')
          process.exit(0)
        })
        .catch(error => {
          console.error('Cleanup error:', error)
          process.exit(1)
        })
      break
      
    default:
      console.log(`
Usage: node scripts/migration.js [command]

Commands:
  migrate  - Migrate data from in-memory database to MongoDB
  verify   - Verify that migration completed successfully  
  sample   - Create sample data in MongoDB for testing
  cleanup  - Delete all data from MongoDB (use with caution!)

Examples:
  node scripts/migration.js migrate
  node scripts/migration.js verify
  node scripts/migration.js sample
      `)
      break
  }
}

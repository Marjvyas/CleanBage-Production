import bcrypt from 'bcryptjs'
import { connectToDatabase, getCollection } from './mongodb.js'
import { UserModel, TransactionModel, NotificationModel, ScanHistoryModel, QRStateModel } from './models.js'

class MongoDatabase {
  constructor() {
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return
    
    try {
      // Try to connect to MongoDB
      await connectToDatabase()
      this.isInitialized = true
      console.log('✅ MongoDB Database Service initialized')
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message)
      console.log('🔄 Falling back to in-memory database with MongoDB interface...')
      
      // Fallback to in-memory storage that mimics MongoDB
      this.fallbackMode = true
      this.isInitialized = true
      
      // Initialize fallback storage
      if (!global.fallbackUsers) {
        global.fallbackUsers = new Map()
        global.fallbackTransactions = new Map()
        global.fallbackNotifications = new Map()
        global.fallbackScanHistory = new Map()
        global.fallbackQRStates = new Map()
        
        // Import existing users from the old database
        await this.importExistingUsers()
      }
    }
  }

  // Import existing users from the old in-memory database
  async importExistingUsers() {
    try {
      // Dynamically import the old database to get existing users
      const { getAllUsers } = await import('./database.js')
      const existingUsers = getAllUsers()
      
      console.log(`🔄 Importing ${existingUsers.length} existing users to fallback database...`)
      
      for (const user of existingUsers) {
        const userData = {
          id: user.id || user.userId,
          email: user.email,
          password: 'migrated123', // Default password for migrated users
          name: user.name,
          role: user.role || 'user',
          society: user.society || 'Default Society',
          points: user.points || 0,
          rank: user.rank || 999,
          isAuthorized: user.isAuthorized !== undefined ? user.isAuthorized : true,
          collectorId: user.collectorId,
          lastScanTime: user.lastScanTime,
          createdAt: user.createdAt || new Date(),
          updatedAt: new Date()
        }
        
        global.fallbackUsers.set(userData.id, userData)
        console.log(`✅ Imported user: ${userData.name} (${userData.id})`)
      }
      
    } catch (error) {
      console.error('Error importing existing users:', error.message)
    }
  }
  async createUser(userData) {
    await this.initialize()
    
    try {
      // Validate user data
      const validation = UserModel.validate(userData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      // Create user document
      const userDoc = UserModel.create({
        ...userData,
        password: hashedPassword
      })

      const users = await getCollection('users')
      const result = await users.insertOne(userDoc)
      
      console.log(`✅ User created: ${userDoc.id}`)
      return { ...userDoc, _id: result.insertedId }
      
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('User with this email or ID already exists')
      }
      throw error
    }
  }

  async getUser(identifier) {
    await this.initialize()
    
    try {
      const users = await getCollection('users')
      
      // Try to find by ID first, then by email
      let user = await users.findOne({ id: identifier })
      if (!user) {
        user = await users.findOne({ email: identifier })
      }
      
      return user
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  async updateUser(userId, updates) {
    await this.initialize()
    
    try {
      const users = await getCollection('users')
      const updateDoc = {
        ...updates,
        updatedAt: new Date()
      }

      // Hash password if it's being updated
      if (updates.password) {
        updateDoc.password = await bcrypt.hash(updates.password, 12)
      }

      const result = await users.updateOne(
        { id: userId },
        { $set: updateDoc }
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }

  async getAllUsers() {
    await this.initialize()
    
    try {
      const users = await getCollection('users')
      return await users.find({}).toArray()
    } catch (error) {
      console.error('Error getting all users:', error)
      return []
    }
  }

  async authenticateUser(email, password) {
    await this.initialize()
    
    try {
      const user = await this.getUser(email)
      if (!user) return null

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) return null

      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      console.error('Error authenticating user:', error)
      return null
    }
  }

  // Transaction Management
  async addTransaction(transactionData) {
    await this.initialize()
    
    try {
      const transactionDoc = TransactionModel.create(transactionData)
      const transactions = await getCollection('transactions')
      const result = await transactions.insertOne(transactionDoc)
      
      console.log(`✅ Transaction added: ${transactionDoc.id}`)
      return { ...transactionDoc, _id: result.insertedId }
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  async getUserTransactions(userId, limit = 50) {
    await this.initialize()
    
    try {
      const transactions = await getCollection('transactions')
      return await transactions.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Error getting user transactions:', error)
      return []
    }
  }

  // Notification Management
  async addNotification(notificationData) {
    await this.initialize()
    
    try {
      const notificationDoc = NotificationModel.create(notificationData)
      const notifications = await getCollection('notifications')
      const result = await notifications.insertOne(notificationDoc)
      
      return { ...notificationDoc, _id: result.insertedId }
    } catch (error) {
      console.error('Error adding notification:', error)
      throw error
    }
  }

  async getUserNotifications(userId, limit = 20) {
    await this.initialize()
    
    try {
      const notifications = await getCollection('notifications')
      return await notifications.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Error getting notifications:', error)
      return []
    }
  }

  async markNotificationAsRead(notificationId) {
    await this.initialize()
    
    try {
      const notifications = await getCollection('notifications')
      const result = await notifications.updateOne(
        { id: notificationId },
        { $set: { read: true } }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Scan History Management
  async addScanHistory(scanData) {
    await this.initialize()
    
    try {
      const scanDoc = ScanHistoryModel.create(scanData)
      const scanHistory = await getCollection('scanHistory')
      const result = await scanHistory.insertOne(scanDoc)
      
      console.log(`✅ Scan history added: ${scanDoc.id}`)
      return { ...scanDoc, _id: result.insertedId }
    } catch (error) {
      console.error('Error adding scan history:', error)
      throw error
    }
  }

  async getUserScanHistory(userId, limit = 50) {
    await this.initialize()
    
    try {
      const scanHistory = await getCollection('scanHistory')
      return await scanHistory.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Error getting scan history:', error)
      return []
    }
  }

  // QR State Management
  async updateQRState(userId, stateData) {
    await this.initialize()
    
    try {
      const qrStates = await getCollection('qrStates')
      const stateDoc = QRStateModel.create({
        userId,
        ...stateData,
        updatedAt: new Date()
      })

      const result = await qrStates.replaceOne(
        { userId },
        stateDoc,
        { upsert: true }
      )

      return result.acknowledged
    } catch (error) {
      console.error('Error updating QR state:', error)
      return false
    }
  }

  async getQRState(userId) {
    await this.initialize()
    
    try {
      const qrStates = await getCollection('qrStates')
      return await qrStates.findOne({ userId })
    } catch (error) {
      console.error('Error getting QR state:', error)
      return null
    }
  }

  // Utility Methods
  async updateUserPoints(userId, newPoints, transaction = null) {
    await this.initialize()
    
    try {
      // Update user points
      const updateResult = await this.updateUser(userId, { points: newPoints })
      
      // Add transaction if provided
      if (transaction && updateResult) {
        await this.addTransaction({
          ...transaction,
          userId,
          balance: newPoints
        })
      }

      return updateResult
    } catch (error) {
      console.error('Error updating user points:', error)
      return false
    }
  }

  async getLeaderboard(limit = 10) {
    await this.initialize()
    
    try {
      const users = await getCollection('users')
      return await users.find({ role: { $in: ['user', 'collector'] } })
        .sort({ points: -1 })
        .limit(limit)
        .project({ id: 1, name: 1, points: 1, society: 1 })
        .toArray()
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  async getUserStats(userId) {
    await this.initialize()
    
    try {
      const [user, transactionCount, scanCount, notificationCount] = await Promise.all([
        this.getUser(userId),
        (await getCollection('transactions')).countDocuments({ userId }),
        (await getCollection('scanHistory')).countDocuments({ userId }),
        (await getCollection('notifications')).countDocuments({ userId, read: false })
      ])

      if (!user) return null

      return {
        user: { id: user.id, name: user.name, points: user.points, society: user.society },
        stats: {
          totalTransactions: transactionCount,
          totalScans: scanCount,
          unreadNotifications: notificationCount
        }
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return null
    }
  }

  // Migration helper - to move data from localStorage/in-memory to MongoDB
  async migrateFromInMemory(inMemoryUsers) {
    await this.initialize()
    
    try {
      console.log('🔄 Starting data migration from in-memory database...')
      
      const users = await getCollection('users')
      const migrationResults = []

      for (const [userId, userData] of inMemoryUsers) {
        try {
          // Check if user already exists in MongoDB
          const existingUser = await users.findOne({ id: userId })
          if (existingUser) {
            console.log(`⚠️ User ${userId} already exists in MongoDB, skipping...`)
            continue
          }

          // Create user document (password will be hashed)
          const userDoc = UserModel.create({
            ...userData,
            password: userData.password || 'default123' // Fallback password
          })
          userDoc.password = await bcrypt.hash(userDoc.password, 12)

          await users.insertOne(userDoc)
          migrationResults.push({ userId, status: 'success' })
          console.log(`✅ Migrated user: ${userId}`)
          
        } catch (error) {
          migrationResults.push({ userId, status: 'error', error: error.message })
          console.error(`❌ Failed to migrate user ${userId}:`, error.message)
        }
      }

      console.log('✅ Migration completed:', migrationResults)
      return migrationResults
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
  }
}

// Export singleton instance
const mongoDatabase = new MongoDatabase()
export default mongoDatabase

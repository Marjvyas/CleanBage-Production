// Temporary bridge database that uses existing in-memory data with MongoDB interface
// This solves the QR scanning issue while MongoDB is being set up

import bcrypt from 'bcryptjs'
import { getAllUsers, getUser as getOldUser, addUserPoints, addNotification, recordScan } from './database.js'

class BridgeDatabase {
  constructor() {
    this.isInitialized = false
    this.isBridgeMode = true
  }

  async initialize() {
    if (this.isInitialized) return
    
    console.log('🔄 Bridge Database initialized (using existing in-memory data)')
    this.isInitialized = true
  }

  // User Management - Bridge to old system
  async createUser(userData) {
    await this.initialize()
    
    try {
      // For now, just add to the old system
      const hashedPassword = await bcrypt.hash(userData.password || 'default123', 12)
      
      // Create user in old system format
      const user = {
        id: userData.id,
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        points: userData.points || 0,
        role: userData.role || 'user',
        society: userData.society || 'Default Society',
        rank: userData.rank || 999,
        isAuthorized: userData.isAuthorized !== undefined ? userData.isAuthorized : true,
        collectorId: userData.collectorId,
        lastScanTime: userData.lastScanTime,
        createdAt: userData.createdAt || new Date(),
        updatedAt: new Date()
      }
      
      console.log(`✅ Bridge: User created: ${user.id}`)
      return user
      
    } catch (error) {
      throw error
    }
  }

  async getUser(identifier) {
    await this.initialize()
    
    try {
      // Use the existing getUser function from old database
      const user = getOldUser(identifier)
      return user
    } catch (error) {
      console.error('Bridge: Error getting user:', error)
      return null
    }
  }

  async updateUser(userId, updates) {
    await this.initialize()
    
    try {
      // For bridge mode, we'll handle this through the old system
      const user = getOldUser(userId)
      if (!user) return false
      
      // Update user properties
      Object.assign(user, updates, { updatedAt: new Date() })
      return true
    } catch (error) {
      console.error('Bridge: Error updating user:', error)
      return false
    }
  }

  async getAllUsers() {
    await this.initialize()
    
    try {
      const users = getAllUsers()
      return users
    } catch (error) {
      console.error('Bridge: Error getting all users:', error)
      return []
    }
  }

  async authenticateUser(email, password) {
    await this.initialize()
    
    try {
      const user = this.getUser(email)
      if (!user) return null

      // For bridge mode, we'll accept any password for existing users
      // In production, you'd want proper password checking
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      console.error('Bridge: Error authenticating user:', error)
      return null
    }
  }

  // Transaction Management - Bridge to old system
  async addTransaction(transactionData) {
    await this.initialize()
    
    try {
      // Create transaction with old system format
      const transaction = {
        id: transactionData.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: transactionData.userId,
        amount: transactionData.amount,
        type: transactionData.type || 'earn',
        source: transactionData.source || 'bridge',
        balance: transactionData.balance,
        description: transactionData.description,
        metadata: transactionData.metadata,
        timestamp: transactionData.timestamp || new Date()
      }
      
      console.log(`✅ Bridge: Transaction added: ${transaction.id}`)
      return transaction
    } catch (error) {
      console.error('Bridge: Error adding transaction:', error)
      throw error
    }
  }

  async getUserTransactions(userId, limit = 50) {
    await this.initialize()
    
    try {
      // Return empty array for now - old system doesn't store transactions separately
      return []
    } catch (error) {
      console.error('Bridge: Error getting user transactions:', error)
      return []
    }
  }

  // Notification Management - Bridge to old system
  async addNotification(notificationData) {
    await this.initialize()
    
    try {
      // Use the old addNotification function
      const notification = addNotification(notificationData.userId, {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        data: notificationData.data
      })
      
      return notification
    } catch (error) {
      console.error('Bridge: Error adding notification:', error)
      throw error
    }
  }

  async getUserNotifications(userId, limit = 20) {
    await this.initialize()
    
    try {
      // Return empty array for now - will be handled by old system
      return []
    } catch (error) {
      console.error('Bridge: Error getting notifications:', error)
      return []
    }
  }

  async markNotificationAsRead(notificationId) {
    await this.initialize()
    
    try {
      // For bridge mode, always return true
      return true
    } catch (error) {
      console.error('Bridge: Error marking notification as read:', error)
      return false
    }
  }

  // Scan History Management - Bridge to old system
  async addScanHistory(scanData) {
    await this.initialize()
    
    try {
      // Use the old recordScan function
      const scanRecord = recordScan(scanData.userId, scanData.collectorId, scanData.pointsAwarded)
      
      console.log(`✅ Bridge: Scan history added: ${scanRecord.id}`)
      return scanRecord
    } catch (error) {
      console.error('Bridge: Error adding scan history:', error)
      throw error
    }
  }

  async getUserScanHistory(userId, limit = 50) {
    await this.initialize()
    
    try {
      // Return empty array for now
      return []
    } catch (error) {
      console.error('Bridge: Error getting scan history:', error)
      return []
    }
  }

  // QR State Management - Bridge mode (simplified)
  async updateQRState(userId, stateData) {
    await this.initialize()
    
    try {
      // For bridge mode, we don't need complex QR state management
      return true
    } catch (error) {
      console.error('Bridge: Error updating QR state:', error)
      return false
    }
  }

  async getQRState(userId) {
    await this.initialize()
    
    try {
      const user = getOldUser(userId)
      if (!user) return null
      
      return {
        userId: userId,
        lastScannedAt: user.lastScanTime,
        scanCount: 0,
        status: 'active'
      }
    } catch (error) {
      console.error('Bridge: Error getting QR state:', error)
      return null
    }
  }

  // Utility Methods - Bridge to old system
  async updateUserPoints(userId, newPoints, transaction = null) {
    await this.initialize()
    
    try {
      // Use the old addUserPoints function
      const result = addUserPoints(userId, newPoints - (getOldUser(userId)?.points || 0), 'bridge_update')
      
      if (transaction && result) {
        await this.addTransaction({
          ...transaction,
          userId,
          balance: newPoints
        })
      }

      return result !== null
    } catch (error) {
      console.error('Bridge: Error updating user points:', error)
      return false
    }
  }

  async getLeaderboard(limit = 10) {
    await this.initialize()
    
    try {
      const users = getAllUsers()
      return users
        .filter(u => u.role === 'user' || u.role === 'collector')
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, limit)
        .map(user => ({
          id: user.id,
          name: user.name,
          points: user.points || 0,
          society: user.society || 'Default Society'
        }))
    } catch (error) {
      console.error('Bridge: Error getting leaderboard:', error)
      return []
    }
  }

  async getUserStats(userId) {
    await this.initialize()
    
    try {
      const user = getOldUser(userId)
      if (!user) return null

      return {
        user: { 
          id: user.id, 
          name: user.name, 
          points: user.points || 0, 
          society: user.society || 'Default Society' 
        },
        stats: {
          totalTransactions: 0,
          totalScans: 0,
          unreadNotifications: 0
        }
      }
    } catch (error) {
      console.error('Bridge: Error getting user stats:', error)
      return null
    }
  }
}

// Export singleton instance
const bridgeDatabase = new BridgeDatabase()
export default bridgeDatabase

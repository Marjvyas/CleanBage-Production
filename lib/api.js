// API service for backend communication

const API_BASE = '/api'

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// User API
export const userAPI = {
  // Get user balance and recent transactions
  getBalance: async (userId) => {
    return apiCall(`/users/balance?userId=${userId}`)
  }
}

// Scan API
export const scanAPI = {
  // Process QR code scan and award points
  processQRScan: async (userId, collectorId, pointsAwarded = 3, bypassCooldown = false) => {
    return apiCall('/scan/qr', {
      method: 'POST',
      body: JSON.stringify({ userId, collectorId, pointsAwarded, bypassCooldown })
    })
  }
}

// Notifications API
export const notificationAPI = {
  // Get user notifications
  getNotifications: async (userId, unreadOnly = false) => {
    return apiCall(`/notifications?userId=${userId}&unreadOnly=${unreadOnly}`)
  },

  // Mark notification as read
  markRead: async (userId, notificationId) => {
    return apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify({ userId, notificationId })
    })
  }
}

// Real-time polling service for notifications and balance updates
export class RealtimeService {
  constructor(userId, onUpdate) {
    this.userId = userId
    this.onUpdate = onUpdate
    this.isPolling = false
    this.pollInterval = null
    this.lastKnownBalance = null
    this.lastNotificationCheck = null
  }

  startPolling(intervalMs = 3000) {
    if (this.isPolling) return

    console.log(`Starting real-time polling for user ${this.userId}`)
    this.isPolling = true
    
    // Initial check
    this.checkForUpdates()

    // Set up polling
    this.pollInterval = setInterval(() => {
      this.checkForUpdates()
    }, intervalMs)
  }

  stopPolling() {
    console.log(`Stopping real-time polling for user ${this.userId}`)
    this.isPolling = false
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  async checkForUpdates() {
    if (!this.userId || !this.isPolling) return

    try {
      // Check for balance updates
      const balanceResponse = await userAPI.getBalance(this.userId)
      if (balanceResponse.success) {
        const currentBalance = balanceResponse.data.user.points
        
        if (this.lastKnownBalance !== null && currentBalance > this.lastKnownBalance) {
          const pointsAdded = currentBalance - this.lastKnownBalance
          console.log(`Balance increase detected: +${pointsAdded} points`)
          
          this.onUpdate({
            type: 'balance_update',
            data: {
              newBalance: currentBalance,
              pointsAdded,
              user: balanceResponse.data.user,
              transactions: balanceResponse.data.transactions
            }
          })
        }
        
        this.lastKnownBalance = currentBalance
      }

      // Check for new notifications
      const notificationResponse = await notificationAPI.getNotifications(this.userId, true) // unread only
      if (notificationResponse.success && notificationResponse.data.notifications.length > 0) {
        const newNotifications = notificationResponse.data.notifications
        
        // Filter notifications newer than our last check
        const now = Date.now()
        const recentNotifications = newNotifications.filter(notification => {
          const notificationTime = new Date(notification.timestamp).getTime()
          return !this.lastNotificationCheck || notificationTime > this.lastNotificationCheck
        })

        if (recentNotifications.length > 0) {
          console.log(`New notifications detected: ${recentNotifications.length}`)
          
          this.onUpdate({
            type: 'notifications',
            data: {
              notifications: recentNotifications,
              unreadCount: notificationResponse.data.unreadCount
            }
          })
        }
        
        this.lastNotificationCheck = now
      }

    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }
}

export default {
  userAPI,
  scanAPI,
  notificationAPI,
  RealtimeService
}

// Simple in-memory database for demo purposes
// In production, replace with proper database (PostgreSQL, MongoDB, etc.)

const fs = require('fs');
const path = require('path');

// File paths for persistent storage
const DEMO_DATA_PATH = path.join(process.cwd(), 'demo-data.json');

// Helper function to load demo data from file synchronously
const loadDemoDataFromFile = () => {
  try {
    const data = fs.readFileSync(DEMO_DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return default demo data
    return {
      users: {},
      transactions: {},
      notifications: {},
      scanHistory: {}
    };
  }
}

// Helper function to save demo data to file synchronously
const saveDemoDataToFile = (data) => {
  try {
    fs.writeFileSync(DEMO_DATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving demo data to file:", error);
  }
}

// Helper function to get registered users from localStorage (if available)
const getRegisteredUsersFromStorage = () => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage !== 'undefined') {
      const users = localStorage.getItem('registeredUsers')
      return users ? JSON.parse(users) : []
    }
  } catch (error) {
    console.error("Error reading registered users from localStorage:", error)
  }
  return []
}

// In-memory storage
const users = new Map()
const transactions = new Map()
const notifications = new Map()
const scanHistory = new Map()

// Initialize demo users
const initializeDemoUsers = () => {
  // First try to load existing demo data
  const demoData = loadDemoDataFromFile();
  
  // Restore existing data if available
  if (Object.keys(demoData.users).length > 0) {
    Object.entries(demoData.users).forEach(([id, user]) => {
      users.set(id, user);
    });
    
    Object.entries(demoData.transactions).forEach(([id, userTransactions]) => {
      transactions.set(id, userTransactions);
    });
    
    Object.entries(demoData.notifications).forEach(([id, userNotifications]) => {
      notifications.set(id, userNotifications);
    });
    
    Object.entries(demoData.scanHistory).forEach(([id, userScanHistory]) => {
      scanHistory.set(id, userScanHistory);
    });
    
    console.log(`Database loaded from file with ${users.size} users`);
    return;
  }

  // If no existing data, create default demo users
  const defaultDemoUsers = [
    {
      id: 'USER001',
      userId: 'USER001',
      name: 'Demo User',
      email: 'demo@cleanbage.com',
      points: 250,
      role: 'user',
      lastScanTime: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user123',
      userId: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      points: 150,
      role: 'user',
      lastScanTime: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'collector456',
      userId: 'collector456',
      name: 'Jane Smith',
      email: 'jane@example.com',
      points: 100,
      role: 'collector',
      lastScanTime: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'COLLECTOR001',
      userId: 'COLLECTOR001',
      name: 'Demo Collector',
      email: 'collector@cleanbage.com',
      points: 75,
      role: 'collector',
      lastScanTime: null,
      createdAt: new Date().toISOString()
    }
  ]

  defaultDemoUsers.forEach(user => {
    users.set(user.id, user)
  })
  
  // Also load any registered users from localStorage into memory
  const registeredUsers = getRegisteredUsersFromStorage()
  registeredUsers.forEach(user => {
    // Ensure user has the required structure
    const normalizedUser = {
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      points: user.points || 0,
      role: user.role,
      society: user.society,
      phone: user.phone,
      lastScanTime: user.lastScanTime || null,
      createdAt: user.createdAt || new Date().toISOString(),
      ...user
    }
    users.set(user.id, normalizedUser)
  })
  
  console.log(`Database initialized with ${users.size} users`)
  persistDemoData()
}

// Function to persist current demo data to file
const persistDemoData = () => {
  const data = {
    users: Object.fromEntries(users),
    transactions: Object.fromEntries(transactions),
    notifications: Object.fromEntries(notifications),
    scanHistory: Object.fromEntries(scanHistory)
  };
  saveDemoDataToFile(data);
}

// Initialize database on module load
let isInitialized = false;

// Function to refresh database with localStorage users
export const refreshDatabaseUsers = () => {
  const registeredUsers = getRegisteredUsersFromStorage()
  let newUsersAdded = 0
  
  registeredUsers.forEach(user => {
    const normalizedUser = {
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      points: user.points || 0,
      role: user.role,
      society: user.society,
      phone: user.phone,
      lastScanTime: user.lastScanTime || null,
      createdAt: user.createdAt || new Date().toISOString(),
      ...user
    }
    
    if (!users.has(user.id)) {
      newUsersAdded++
    }
    users.set(user.id, normalizedUser)
  })
  
  console.log(`Database refreshed: ${newUsersAdded} new users added, ${users.size} total users`)
  
  return {
    totalUsers: users.size,
    newUsersAdded,
    registeredUsersFromStorage: registeredUsers.length
  }
}

// Debug function to get all users
export const getAllUsers = () => {
  const allUsers = Array.from(users.values())
  return allUsers
}

// Initialize if not already done
if (users.size === 0) {
  initializeDemoUsers()
} else {
  // Refresh database to pick up any new localStorage users
  refreshDatabaseUsers()
}

// User operations
export const getUser = (userId) => {
  // First check in-memory users
  let user = users.get(userId)
  
  // If not found, check localStorage registered users
  if (!user) {
    const registeredUsers = getRegisteredUsersFromStorage()
    user = registeredUsers.find(u => u.id === userId || u.userId === userId)
    
    // If found in localStorage but not in memory, add to memory for future access
    if (user) {
      // Ensure user has the required structure
      const normalizedUser = {
        id: user.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        points: user.points || 0,
        role: user.role,
        society: user.society,
        phone: user.phone,
        lastScanTime: user.lastScanTime || null,
        createdAt: user.createdAt || new Date().toISOString(),
        ...user
      }
      users.set(userId, normalizedUser)
      return normalizedUser
    }
  }
  
  return user || null
}

export const updateUser = (userId, updates) => {
  // First try to get the user (this will now check both memory and localStorage)
  let user = getUser(userId)
  
  if (user) {
    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() }
    
    // Always update in memory
    users.set(userId, updatedUser)
    
    // Persist demo data changes
    persistDemoData()
    
    // Also update in localStorage if user was originally from there
    try {
      if (typeof localStorage !== 'undefined') {
        const registeredUsers = getRegisteredUsersFromStorage()
        const userIndex = registeredUsers.findIndex(u => u.id === userId || u.userId === userId)
        if (userIndex !== -1) {
          registeredUsers[userIndex] = updatedUser
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
        }
      }
    } catch (error) {
      console.error("Error updating user in localStorage:", error)
    }
    
    return updatedUser
  }
  return null
}

// Create new user
export const createUser = async (userData) => {
  const { name, email, password, role, society } = userData
  
  // Validate required fields
  if (!name || !email || !password) {
    throw new Error('Missing required fields: name, email, password')
  }
  
  // Check if user already exists
  const existingUsers = getAllUsers()
  const existingUser = existingUsers.find(u => u.email === email)
  
  if (existingUser) {
    throw new Error('User with this email already exists')
  }
  
  // Create new user ID
  const userId = `USER${Date.now()}`
  
  // Create user object
  const newUser = {
    id: userId,
    userId: userId,
    name,
    email,
    password, // In production, hash this password
    role: role || 'user',
    society: society || 'Default Society',
    points: 0,
    lastScanTime: null,
    qrReactivateTime: null,
    qrIsActive: true,
    createdAt: new Date().toISOString()
  }
  
  // Add user to database
  users.set(userId, newUser)
  persistDemoData()
  
  return newUser
}

export const addUserPoints = (userId, points, source = 'scan') => {
  const user = users.get(userId)
  if (user) {
    const newPoints = user.points + points
    const updatedUser = updateUser(userId, { points: newPoints })
    
    // Record transaction
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transaction = {
      id: transactionId,
      userId,
      amount: points,
      type: 'earn',
      source,
      balance: newPoints,
      timestamp: new Date().toISOString()
    }
    
    const userTransactions = transactions.get(userId) || []
    userTransactions.unshift(transaction)
    transactions.set(userId, userTransactions.slice(0, 100))
    
    return { user: updatedUser, transaction }
  }
  return null
}

// Transaction operations
export const getUserTransactions = (userId, limit = 20) => {
  const userTransactions = transactions.get(userId) || []
  return userTransactions.slice(0, limit)
}

// Notification operations
export const addNotification = (userId, notification) => {
  const userNotifications = notifications.get(userId) || []
  const newNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...notification,
    timestamp: new Date().toISOString(),
    read: false
  }
  
  userNotifications.unshift(newNotification)
  notifications.set(userId, userNotifications.slice(0, 50))
  
  // Persist changes
  persistDemoData()
  
  return newNotification
}

export const getUserNotifications = (userId, unreadOnly = false) => {
  const userNotifications = notifications.get(userId) || []
  if (unreadOnly) {
    return userNotifications.filter(n => !n.read)
  }
  return userNotifications
}

export const markNotificationRead = (userId, notificationId) => {
  const userNotifications = notifications.get(userId) || []
  const updated = userNotifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  )
  notifications.set(userId, updated)
  return true
}

// Scan operations
export const canUserBeScanedByCollector = (userId, collectorId) => {
  const user = users.get(userId)
  if (!user) return { canScan: false, reason: 'User not found' }
  
  if (!user.lastScanTime) return { canScan: true }
  
  const cooldownHours = 1 // Reduced to 1 hour for testing
  const lastScan = new Date(user.lastScanTime)
  const now = new Date()
  const hoursSinceLastScan = (now - lastScan) / (1000 * 60 * 60)
  
  if (hoursSinceLastScan < cooldownHours) {
    const nextScanTime = new Date(lastScan.getTime() + (cooldownHours * 60 * 60 * 1000))
    return {
      canScan: false,
      reason: `Cooldown active. Next scan available in ${Math.ceil(cooldownHours - hoursSinceLastScan)} hours.`,
      nextScanTime: nextScanTime.toISOString(),
      hoursRemaining: cooldownHours - hoursSinceLastScan
    }
  }
  
  return { canScan: true }
}

export const recordScan = (userId, collectorId, pointsAwarded) => {
  const scanRecord = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    collectorId,
    pointsAwarded,
    timestamp: new Date().toISOString(),
    location: 'Unknown' // Could be enhanced with GPS coordinates
  }
  
  const userScans = scanHistory.get(userId) || []
  userScans.unshift(scanRecord)
  scanHistory.set(userId, userScans.slice(0, 50))
  
  // Update user's last scan time
  updateUser(userId, { lastScanTime: scanRecord.timestamp })
  
  return scanRecord
}

export const getUserScanHistory = (userId, limit = 10) => {
  return scanHistory.get(userId)?.slice(0, limit) || []
}

// QR Code Management - 20-hour deactivation system
export const deactivateUserQR = (userId, hours = 20) => {
  const user = users.get(userId)
  if (user) {
    const reactivateTime = Date.now() + (hours * 60 * 60 * 1000) // hours to milliseconds
    const updatedUser = updateUser(userId, { 
      qrReactivateTime: reactivateTime,
      qrIsActive: false,
      lastScanTime: new Date().toISOString()
    })
    console.log(`🔒 QR deactivated for user ${userId} until ${new Date(reactivateTime).toLocaleString()}`)
    return updatedUser
  }
  return null
}

export const isUserQRActive = (userId) => {
  const user = users.get(userId)
  if (!user) return false
  
  // If no reactivate time is set, QR is active
  if (!user.qrReactivateTime) return true
  
  // If current time is past reactivate time, QR is active
  const isActive = Date.now() >= user.qrReactivateTime
  
  // If QR is now active but was previously inactive, update the user
  if (isActive && user.qrIsActive === false) {
    updateUser(userId, { 
      qrIsActive: true,
      qrReactivateTime: null 
    })
    console.log(`✅ QR reactivated for user ${userId}`)
  }
  
  return isActive
}

export const getUserQRStatus = (userId) => {
  const user = users.get(userId)
  if (!user) return null
  
  const isActive = isUserQRActive(userId)
  
  return {
    userId: userId,
    isActive: isActive,
    reactivateTime: user.qrReactivateTime ? new Date(user.qrReactivateTime).toISOString() : null,
    hoursUntilReactivation: user.qrReactivateTime ? 
      Math.ceil((user.qrReactivateTime - Date.now()) / (1000 * 60 * 60)) : 0
  }
}

// Reset cooldown for testing
export const resetUserCooldown = (userId) => {
  const user = users.get(userId)
  if (user) {
    updateUser(userId, { 
      lastScanTime: null,
      qrReactivateTime: null,
      qrIsActive: true
    })
    return true
  }
  return false
}

// Debug function to get system stats
export const getSystemStats = () => {
  return {
    totalUsers: users.size,
    totalTransactions: Array.from(transactions.values()).reduce((sum, userTxns) => sum + userTxns.length, 0),
    totalNotifications: Array.from(notifications.values()).reduce((sum, userNotifs) => sum + userNotifs.length, 0),
    totalScans: Array.from(scanHistory.values()).reduce((sum, userScans) => sum + userScans.length, 0)
  }
}
// Placeholder function
export function clearUserQRCooldown(userId) {
  // TODO: Add logic later
  return true; // or false, depending on what your API expects
}

// Placeholder class
export class InMemoryDatabase {
  // TODO: Add properties/methods later
}

// Add these at the very end of the file:
export {
  resetUserCooldown as resetQRCooldowns,
  getAllUsers as getAllData 
}

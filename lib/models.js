// MongoDB Models for CleanBage Application
// These define the structure and validation for our collections

export const UserModel = {
  // Collection name
  collection: 'users',
  
  // Schema definition
  schema: {
    id: { type: 'string', required: true, unique: true }, // USER001, USER1737369800000, etc.
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true }, // Will be hashed
    name: { type: 'string', required: true },
    role: { type: 'string', enum: ['user', 'collector', 'admin'], default: 'user' },
    society: { type: 'string', required: true },
    phone: { type: 'string', required: false },
    points: { type: 'number', default: 0 },
    rank: { type: 'number', default: 999 },
    isAuthorized: { type: 'boolean', default: true },
    collectorId: { type: 'string', required: false }, // Only for collectors
    authorizedBy: { type: 'string', required: false },
    authorizedDate: { type: 'date', required: false },
    lastScanTime: { type: 'date', required: false },
    createdAt: { type: 'date', default: () => new Date() },
    updatedAt: { type: 'date', default: () => new Date() }
  },

  // Create a new user document
  create: (userData) => {
    const now = new Date()
    return {
      ...userData,
      points: userData.points || 0,
      rank: userData.rank || 999,
      isAuthorized: userData.isAuthorized !== undefined ? userData.isAuthorized : true,
      createdAt: userData.createdAt || now,
      updatedAt: now
    }
  },

  // Validation function
  validate: (userData) => {
    const errors = []
    if (!userData.id) errors.push('User ID is required')
    if (!userData.email) errors.push('Email is required')
    if (!userData.password) errors.push('Password is required')
    if (!userData.name) errors.push('Name is required')
    if (!userData.society) errors.push('Society is required')
    
    if (userData.role && !['user', 'collector', 'admin'].includes(userData.role)) {
      errors.push('Invalid role')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export const TransactionModel = {
  collection: 'transactions',
  
  schema: {
    id: { type: 'string', required: true, unique: true },
    userId: { type: 'string', required: true },
    amount: { type: 'number', required: true },
    type: { type: 'string', enum: ['earn', 'spend', 'adjustment'], default: 'earn' },
    source: { type: 'string', required: true }, // 'waste_collection', 'reward_redemption', etc.
    balance: { type: 'number', required: true }, // Balance after this transaction
    description: { type: 'string', required: false },
    metadata: { type: 'object', required: false }, // Additional data like collector info
    timestamp: { type: 'date', default: () => new Date() }
  },

  create: (transactionData) => {
    return {
      id: transactionData.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...transactionData,
      timestamp: transactionData.timestamp || new Date()
    }
  }
}

export const NotificationModel = {
  collection: 'notifications',
  
  schema: {
    id: { type: 'string', required: true, unique: true },
    userId: { type: 'string', required: true },
    title: { type: 'string', required: true },
    message: { type: 'string', required: true },
    type: { type: 'string', enum: ['reward', 'info', 'warning', 'achievement'], default: 'info' },
    read: { type: 'boolean', default: false },
    data: { type: 'object', required: false }, // Additional notification data
    timestamp: { type: 'date', default: () => new Date() },
    expiresAt: { type: 'date', required: false } // For auto-cleanup
  },

  create: (notificationData) => {
    return {
      id: notificationData.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      read: false,
      timestamp: notificationData.timestamp || new Date()
    }
  }
}

export const ScanHistoryModel = {
  collection: 'scanHistory',
  
  schema: {
    id: { type: 'string', required: true, unique: true },
    userId: { type: 'string', required: true },
    collectorId: { type: 'string', required: true },
    pointsAwarded: { type: 'number', required: true },
    location: { type: 'string', required: false },
    coordinates: {
      latitude: { type: 'number', required: false },
      longitude: { type: 'number', required: false }
    },
    qrData: { type: 'object', required: false }, // Store the original QR data
    status: { type: 'string', enum: ['completed', 'failed', 'disputed'], default: 'completed' },
    timestamp: { type: 'date', default: () => new Date() }
  },

  create: (scanData) => {
    return {
      id: scanData.id || `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...scanData,
      status: scanData.status || 'completed',
      location: scanData.location || 'Unknown',
      timestamp: scanData.timestamp || new Date()
    }
  }
}

export const QRStateModel = {
  collection: 'qrStates',
  
  schema: {
    userId: { type: 'string', required: true, unique: true },
    lastScannedAt: { type: 'date', required: false },
    lastScannedBy: { type: 'string', required: false },
    pointsAwarded: { type: 'number', required: false },
    scanCount: { type: 'number', default: 0 },
    reactivatesAt: { type: 'date', required: false },
    status: { type: 'string', enum: ['active', 'deactivated'], default: 'active' },
    reactivatedAt: { type: 'date', required: false },
    createdAt: { type: 'date', default: () => new Date() },
    updatedAt: { type: 'date', default: () => new Date() }
  },

  create: (qrStateData) => {
    const now = new Date()
    return {
      ...qrStateData,
      scanCount: qrStateData.scanCount || 0,
      status: qrStateData.status || 'active',
      createdAt: qrStateData.createdAt || now,
      updatedAt: now
    }
  }
}

// Helper function to validate data against a model
export function validateModelData(model, data) {
  if (model.validate) {
    return model.validate(data)
  }
  return { isValid: true, errors: [] }
}

// Helper function to create document with model
export function createModelDocument(model, data) {
  if (model.create) {
    return model.create(data)
  }
  return data
}

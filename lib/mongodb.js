import { MongoClient, ServerApiVersion } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Database connection helper
export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DATABASE_NAME || 'cleanbage')
    
    // Ensure indexes exist
    await createIndexes(db)
    
    return { client, db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Create necessary indexes for optimal performance
async function createIndexes(db) {
  try {
    const indexPromises = [
      // Users collection indexes
      db.collection('users').createIndex({ email: 1 }, { unique: true, background: true }),
      db.collection('users').createIndex({ id: 1 }, { unique: true, background: true }),
      db.collection('users').createIndex({ role: 1 }, { background: true }),
      db.collection('users').createIndex({ society: 1 }, { background: true }),
      db.collection('users').createIndex({ points: -1 }, { background: true }),
      db.collection('users').createIndex({ createdAt: 1 }, { background: true }),

      // Transactions collection indexes  
      db.collection('transactions').createIndex({ userId: 1 }, { background: true }),
      db.collection('transactions').createIndex({ timestamp: -1 }, { background: true }),
      db.collection('transactions').createIndex({ userId: 1, timestamp: -1 }, { background: true }),

      // Notifications collection indexes
      db.collection('notifications').createIndex({ userId: 1 }, { background: true }),
      db.collection('notifications').createIndex({ userId: 1, read: 1 }, { background: true }),
      db.collection('notifications').createIndex({ timestamp: -1 }, { background: true }),

      // Scan history collection indexes
      db.collection('scanHistory').createIndex({ userId: 1 }, { background: true }),
      db.collection('scanHistory').createIndex({ collectorId: 1 }, { background: true }),
      db.collection('scanHistory').createIndex({ timestamp: -1 }, { background: true }),
      db.collection('scanHistory').createIndex({ userId: 1, timestamp: -1 }, { background: true }),

      // QR states collection indexes
      db.collection('qrStates').createIndex({ userId: 1 }, { unique: true, background: true }),
      db.collection('qrStates').createIndex({ status: 1 }, { background: true }),
      db.collection('qrStates').createIndex({ lastScannedAt: -1 }, { background: true })
    ]

    await Promise.all(indexPromises)
    console.log('✅ Database indexes created successfully')
  } catch (error) {
    console.error('⚠️ Index creation warning:', error.message)
    // Don't throw error as indexes might already exist or fail in development
  }
}

// Helper function to get a specific collection
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}

// Helper function to close the connection (useful for serverless cleanup)
export async function closeConnection() {
  try {
    if (client) {
      await client.close()
      console.log('MongoDB connection closed')
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error)
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    const { db } = await connectToDatabase()
    const result = await db.admin().ping()
    return { status: 'healthy', result, timestamp: new Date() }
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date() }
  }
}

// Export the MongoClient promise
export default clientPromise

import { NextResponse } from 'next/server'
import DatabaseMigration from '../../../scripts/migration.js'
import { checkDatabaseHealth } from '../../../lib/mongodb.js'
import mongoDatabase from '../../../lib/mongoDatabase.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'health':
        const health = await checkDatabaseHealth()
        return NextResponse.json({
          success: true,
          action: 'health',
          result: health
        })
        
      case 'users':
        await mongoDatabase.initialize()
        const users = await mongoDatabase.getAllUsers()
        return NextResponse.json({
          success: true,
          action: 'users',
          count: users.length,
          users: users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            society: user.society,
            points: user.points,
            createdAt: user.createdAt
          }))
        })
        
      case 'stats':
        await mongoDatabase.initialize()
        const allUsers = await mongoDatabase.getAllUsers()
        const userCount = allUsers.length
        const collectorCount = allUsers.filter(u => u.role === 'collector').length
        const totalPoints = allUsers.reduce((sum, user) => sum + (user.points || 0), 0)
        
        return NextResponse.json({
          success: true,
          action: 'stats',
          statistics: {
            totalUsers: userCount,
            totalCollectors: collectorCount,
            totalPoints,
            avgPointsPerUser: userCount > 0 ? Math.round(totalPoints / userCount) : 0
          }
        })
        
      case 'verify':
        const migration = new DatabaseMigration()
        const verification = await migration.verifyMigration()
        return NextResponse.json({
          success: true,
          action: 'verify',
          result: verification
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['health', 'users', 'stats', 'verify']
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Database API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { action, data } = await request.json()
    const migration = new DatabaseMigration()
    
    switch (action) {
      case 'migrate':
        const migrationResult = await migration.performMigration()
        return NextResponse.json({
          success: true,
          action: 'migrate',
          result: migrationResult
        })
        
      case 'sample':
        const sampleResult = await migration.createSampleData()
        return NextResponse.json({
          success: true,
          action: 'sample',
          result: sampleResult
        })
        
      case 'cleanup':
        // Only allow cleanup in development
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({
            success: false,
            error: 'Cleanup not allowed in production'
          }, { status: 403 })
        }
        
        await migration.cleanupMongoDB()
        return NextResponse.json({
          success: true,
          action: 'cleanup',
          message: 'Database cleaned successfully'
        })
        
      case 'create-user':
        if (!data) {
          return NextResponse.json({
            success: false,
            error: 'User data is required'
          }, { status: 400 })
        }
        
        await mongoDatabase.initialize()
        const user = await mongoDatabase.createUser(data)
        
        return NextResponse.json({
          success: true,
          action: 'create-user',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            society: user.society,
            points: user.points
          }
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['migrate', 'sample', 'cleanup', 'create-user']
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Database API POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

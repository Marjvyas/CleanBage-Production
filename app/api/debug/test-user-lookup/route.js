import { NextResponse } from 'next/server'
import { getUser, addUserPoints, refreshDatabaseUsers } from '../../../../lib/database.js'

export async function POST(request) {
  try {
    const { action, userId } = await request.json()

    if (action === 'test-user-lookup') {
      console.log(`Testing user lookup for ID: ${userId}`)
      
      // First try direct lookup
      let user = getUser(userId)
      console.log('Direct lookup result:', user ? 'FOUND' : 'NOT FOUND')
      
      // If not found, refresh database and try again
      if (!user) {
        console.log('User not found, refreshing database...')
        const refreshResult = refreshDatabaseUsers()
        console.log('Refresh result:', refreshResult)
        
        user = getUser(userId)
        console.log('Lookup after refresh:', user ? 'FOUND' : 'NOT FOUND')
      }
      
      return NextResponse.json({
        success: true,
        data: {
          userId,
          userFound: !!user,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points,
            role: user.role
          } : null
        }
      })
    }

    if (action === 'simulate-qr-scan') {
      console.log(`Simulating QR scan for user: ${userId}`)
      
      // Try the exact same logic as the scan QR endpoint
      const user = getUser(userId)
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'User not found during QR scan simulation',
            debug: { requestedUserId: userId }
          },
          { status: 404 }
        )
      }
      
      // Simulate adding points
      const result = addUserPoints(userId, 3, 'test_scan')
      
      return NextResponse.json({
        success: true,
        data: {
          message: 'QR scan simulation successful',
          user: result.user,
          transaction: result.transaction
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

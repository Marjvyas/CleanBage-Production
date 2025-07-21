import { NextResponse } from 'next/server'
import { getAllData, resetQRCooldowns, clearUserQRCooldown } from '../../../lib/database.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    if (action === 'reset-cooldowns') {
      resetQRCooldowns()
      return NextResponse.json({
        success: true,
        message: 'All QR cooldowns reset'
      })
    }

    if (action === 'clear-cooldown' && userId) {
      const result = clearUserQRCooldown(userId)
      return NextResponse.json({
        success: result,
        message: result ? `QR cooldown cleared for user ${userId}` : `User ${userId} not found`
      })
    }

    console.log('Debug API: Testing database connection...')
    
    const data = getAllData()
    console.log('Debug API: Database data retrieved:', {
      userCount: data.users.length,
      users: data.users.map(u => ({ id: u.id, name: u.name, points: u.points, lastScanTime: u.lastScanTime }))
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      data: {
        timestamp: new Date().toISOString(),
        userCount: data.users.length,
        users: data.users
      }
    })

  } catch (error) {
    console.error('Debug API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

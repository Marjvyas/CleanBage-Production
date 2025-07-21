import { NextResponse } from 'next/server'
import { getUser, addUserPoints, addNotification, recordScan, deactivateUserQR, isUserQRActive } from '../../../../lib/database.js'

export async function POST(request) {
  console.log('🔍 QR Scan API called')
  
  try {
    const requestBody = await request.json()
    console.log('📨 Request body:', JSON.stringify(requestBody, null, 2))
    
    const { userId, collectorId, pointsAwarded = 3, bypassCooldown = false } = requestBody

    if (!userId || !collectorId) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing userId or collectorId' },
        { status: 400 }
      )
    }

    console.log(`🔍 Looking up user: ${userId}`)
    console.log(`🔍 Looking up collector: ${collectorId}`)

    // Check if user exists
    const user = getUser(userId)
    console.log('👤 User found:', user ? `${user.name} (${user.id})` : 'null')
    
    if (!user) {
      console.error(`QR Scan Error: User not found. UserID: ${userId}`)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid QR code or user not found in system',
          debug: {
            requestedUserId: userId,
            message: 'The scanned QR code contains a user ID that is not registered in the system.'
          }
        },
        { status: 404 }
      )
    }

    // Check if collector exists
    const collector = getUser(collectorId)
    console.log('👤 Collector found:', collector ? `${collector.name} (${collector.id})` : 'null')
    
    if (!collector || collector.role !== 'collector') {
      return NextResponse.json(
        { success: false, error: 'Invalid collector ID' },
        { status: 400 }
      )
    }

    // Check if user's QR is active (20-hour deactivation system)
    if (!bypassCooldown && !isUserQRActive(userId)) {
      const timeUntilReactivation = Math.ceil((user.qrReactivateTime - Date.now()) / (1000 * 60 * 60))
      
      return NextResponse.json({
        success: false,
        error: `QR code is deactivated. Reactivates in ${timeUntilReactivation} hours.`,
        reactivateTime: new Date(user.qrReactivateTime).toISOString(),
        hoursRemaining: timeUntilReactivation
      }, { status: 400 })
    }

    console.log(`💰 Current user balance: ${user.points}`)
    console.log(`💰 Points to award: ${pointsAwarded}`)

    // Award points to user
    const result = addUserPoints(userId, pointsAwarded, 'waste_collection')
    console.log('💰 Points update result:', result ? 'Success' : 'Failed')
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user balance' },
        { status: 500 }
      )
    }

    console.log(`💰 New user balance: ${result.user.points}`)

    // Deactivate user's QR for 20 hours
    deactivateUserQR(userId, 20) // 20 hours deactivation
    console.log('🔒 User QR deactivated for 20 hours')

    // Record the scan
    const scanRecord = recordScan(userId, collectorId, pointsAwarded)
    console.log('📝 Scan recorded:', scanRecord ? 'Success' : 'Failed')

    // Add notification for user (this was missing!)
    const notification = addNotification(userId, {
      title: 'EcoCoins Earned! 🎉',
      message: `You received ${pointsAwarded} EcoCoins for waste collection by ${collector.name}!`,
      type: 'reward',
      data: {
        points: pointsAwarded,
        newBalance: result.user.points,
        source: 'waste_collection',
        collectorId: collectorId,
        collectorName: collector.name
      }
    })
    console.log('🔔 Notification added:', notification ? 'Success' : 'Failed')

    // Add success notification for collector
    const collectorNotification = addNotification(collectorId, {
      title: 'Scan Completed! ✅',
      message: `Successfully awarded ${pointsAwarded} EcoCoins to ${user.name}`,
      type: 'info',
      data: {
        points: pointsAwarded,
        userName: user.name,
        userId: userId
      }
    })

    console.log('✅ QR Scan completed successfully')

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          points: result.user.points,
          society: result.user.society || 'Default Society'
        },
        transaction: result.transaction,
        scanRecord: scanRecord,
        notification: notification,
        message: `Successfully awarded ${pointsAwarded} EcoCoins to ${result.user.name}!`,
        collectorInfo: {
          id: collector.id,
          name: collector.name
        },
        qrDeactivated: true,
        reactivateTime: result.user.qrReactivateTime ? new Date(result.user.qrReactivateTime).toISOString() : null
      }
    })

  } catch (error) {
    console.error('💥 QR Scan API Error:')
    console.error('   Message:', error.message)
    console.error('   Stack:', error.stack)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

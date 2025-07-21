import { NextResponse } from 'next/server'
import { getUserNotifications, markNotificationRead } from '../../../lib/database.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    let notifications = getUserNotifications(userId, false)
    
    // Filter unread only if requested
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read)
    }

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length
      }
    })

  } catch (error) {
    console.error('Get Notifications API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { userId, notificationId } = await request.json()

    if (!userId || !notificationId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or notificationId' },
        { status: 400 }
      )
    }

    const success = markNotificationRead(notificationId)

    return NextResponse.json({
      success,
      data: { message: 'Notification marked as read' }
    })

  } catch (error) {
    console.error('Mark Notification Read API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

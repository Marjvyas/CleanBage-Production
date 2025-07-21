import { NextResponse } from 'next/server'
import { getUser, getUserTransactions } from '../../../../lib/database.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const user = getUser(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const transactions = getUserTransactions(userId, 20)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          points: user.points || 0,
          role: user.role,
          society: user.society
        },
        transactions
      }
    })

  } catch (error) {
    console.error('Get User Balance API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

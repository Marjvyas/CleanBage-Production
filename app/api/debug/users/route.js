import { NextResponse } from 'next/server'
import { getAllUsers } from '../../../../lib/database.js'

export async function GET(request) {
  try {
    const allUsers = getAllUsers()
    
    return NextResponse.json({
      success: true,
      data: {
        users: allUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.points,
          role: user.role,
          society: user.society
        })),
        totalUsers: allUsers.length
      }
    })
  } catch (error) {
    console.error('Get all users error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get users' },
      { status: 500 }
    )
  }
}

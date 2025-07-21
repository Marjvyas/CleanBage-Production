import { NextResponse } from 'next/server'
import { getAllUsers, getUser, updateUser, createUser } from '../../../lib/database.js'

export async function GET(request) {
  try {
    // Get all users from the original database
    const users = getAllUsers()
    
    return NextResponse.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.points || 0,
          role: user.role,
          society: user.society,
          rank: user.rank,
          isAuthorized: user.isAuthorized,
          collectorId: user.collectorId,
          lastScanTime: user.lastScanTime,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      },
      count: users.length
    })

  } catch (error) {
    console.error('Get All Users API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const userData = await request.json()
    
    // Create new user
    const user = await createUser(userData)
    
    // Return user without password
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        message: `User ${user.name} created successfully`
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create User API Error:', error)
    
    // Handle validation errors
    if (error.message.includes('Missing required fields') || error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

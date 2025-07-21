import { NextResponse } from 'next/server'
import { getAllUsers } from '../../../../lib/database.js'

export async function POST(request) {
  try {
    const { email, password, role = "user" } = await request.json()
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Get all users from the unified database (includes passwords)
    const users = getAllUsers()
    
    // Find user by email
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check password (in production, this should be hashed comparison)
    if (user.password && user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Enhanced security: Check role authorization
    if (role === "collector") {
      if (user.role !== "collector") {
        return NextResponse.json(
          { success: false, error: 'Access denied: You are not authorized as a collector for this community. Please contact your community administrator.' },
          { status: 403 }
        )
      }
    } else if (role === "user") {
      // Even regular users need to be verified community members
      if (!user.society && !user.email.includes('@cleanbage.com')) {
        return NextResponse.json(
          { success: false, error: 'Access denied: You must be a verified community member to access this application.' },
          { status: 403 }
        )
      }
    }
    
    // Return user with selected role (without password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          selectedRole: role,
          // Only allow role switching for actual collectors, not regular users
          canSwitchRoles: user.role === "collector" && role === "collector"
        }
      }
    })

  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

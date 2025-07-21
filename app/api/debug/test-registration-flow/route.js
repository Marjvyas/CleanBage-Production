import { NextResponse } from 'next/server'
import { getUser, getAllUsers, refreshDatabaseUsers } from '../../../../lib/database.js'

export async function POST(request) {
  try {
    const { action, userId, userName, email, society, phone } = await request.json()

    if (action === 'simulate-full-registration-flow') {
      console.log('\n=== SIMULATING FULL REGISTRATION FLOW ===')
      
      // Step 1: Simulate user registration (what happens on frontend)
      const newUserId = `USER${Date.now()}`
      const newUser = {
        id: newUserId,
        name: userName || 'Test User',
        email: email || 'test@example.com',
        password: 'test123',
        role: 'user',
        society: society || 'Test Community',
        phone: phone || '1234567890',
        points: 0,
        createdAt: new Date().toISOString()
      }
      
      console.log('Step 1 - New user created:', newUser)
      
      // Step 2: Check if backend can find this user initially
      let user = getUser(newUserId)
      console.log('Step 2 - User found in backend initially:', user ? 'YES' : 'NO')
      
      // Step 3: Simulate QR code data that would be generated
      const qrData = {
        type: "user_waste_collection",
        qrId: `QR_${newUserId}_${email?.replace(/[^a-zA-Z0-9]/g, '_') || 'test_example_com'}`,
        userId: newUserId,
        userName: newUser.name,
        userEmail: newUser.email,
        society: newUser.society,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
        version: "1.0"
      }
      
      console.log('Step 3 - QR data that would be generated:', qrData)
      
      // Step 4: Simulate what happens when collector scans this QR
      console.log('Step 4 - Simulating collector scan...')
      
      // Extract user ID from QR data (same as collector dashboard does)
      const scannedUserId = qrData.userId || qrData.id
      console.log('Extracted user ID from QR:', scannedUserId)
      
      // Try to find user in database (same as scan API does)
      user = getUser(scannedUserId)
      console.log('User found in database during scan:', user ? 'YES' : 'NO')
      
      if (!user) {
        console.log('User not found, refreshing database...')
        const refreshResult = refreshDatabaseUsers()
        console.log('Refresh result:', refreshResult)
        
        user = getUser(scannedUserId)
        console.log('User found after refresh:', user ? 'YES' : 'NO')
      }
      
      return NextResponse.json({
        success: true,
        data: {
          simulatedUser: newUser,
          qrData: qrData,
          backendCanFindUser: !!user,
          foundUser: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points
          } : null,
          allUsers: getAllUsers().length,
          message: user ? 
            'SUCCESS: Backend can find the user after registration' : 
            'FAILURE: Backend cannot find the user - this is the problem!'
        }
      })
    }

    if (action === 'test-specific-user') {
      console.log(`\n=== TESTING SPECIFIC USER: ${userId} ===`)
      
      // Direct lookup
      let user = getUser(userId)
      console.log('Direct lookup result:', user ? 'FOUND' : 'NOT FOUND')
      
      if (user) {
        console.log('Found user:', {
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.points
        })
      }
      
      // Check all users
      const allUsers = getAllUsers()
      console.log('Total users in database:', allUsers.length)
      console.log('User IDs:', allUsers.map(u => u.id))
      
      return NextResponse.json({
        success: true,
        data: {
          userFound: !!user,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            points: user.points
          } : null,
          totalUsers: allUsers.length,
          allUserIds: allUsers.map(u => u.id)
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Registration flow test error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { refreshDatabaseUsers } from '../../../../lib/database.js'

export async function POST(request) {
  try {
    const result = refreshDatabaseUsers()
    
    return NextResponse.json({
      success: true,
      message: `Database refreshed. Total users: ${result.totalUsers}`,
      data: result
    })
  } catch (error) {
    console.error('Database refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh database' },
      { status: 500 }
    )
  }
}

// Quick QR test script to debug the scanning issue
// Run this to test QR scanning: node qr-test.js

const API_BASE = 'http://localhost:3001'

async function testQRScan() {
  console.log('🧪 Testing QR Scan Functionality...\n')
  
  try {
    // 1. Get users to find valid IDs
    console.log('1. 👥 Getting users...')
    const usersResponse = await fetch(`${API_BASE}/api/users`)
    
    if (!usersResponse.ok) {
      console.log('❌ Failed to fetch users:', usersResponse.status)
      return
    }
    
    const usersData = await usersResponse.json()
    
    if (!usersData.success) {
      console.log('❌ Users API error:', usersData.error)
      return
    }
    
    const users = usersData.data.users
    console.log(`✅ Found ${users.length} users`)
    
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.id}) - ${user.role} - ${user.points} points`)
    })
    
    // 2. Find collector and regular user
    const collectors = users.filter(u => u.role === 'collector')
    const regularUsers = users.filter(u => u.role === 'user')
    
    if (collectors.length === 0) {
      console.log('❌ No collectors found!')
      return
    }
    
    if (regularUsers.length === 0) {
      console.log('❌ No regular users found!')
      return
    }
    
    const testUser = regularUsers[0]
    const testCollector = collectors[0]
    
    console.log(`\n2. 📱 Testing QR scan:`)
    console.log(`   User: ${testUser.name} (${testUser.id}) - ${testUser.points} points`)
    console.log(`   Collector: ${testCollector.name} (${testCollector.id})`)
    
    // 3. Perform QR scan
    const scanResponse = await fetch(`${API_BASE}/api/scan/qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUser.id,
        collectorId: testCollector.id,
        pointsAwarded: 15,
        bypassCooldown: true
      })
    })
    
    const scanResult = await scanResponse.json()
    
    console.log('\n3. 🎯 QR Scan Result:')
    console.log(`   Status: ${scanResponse.status}`)
    console.log(`   Success: ${scanResult.success}`)
    
    if (scanResult.success) {
      console.log('✅ QR Scan successful!')
      console.log(`   Points awarded: ${scanResult.data.transaction.amount}`)
      console.log(`   New balance: ${scanResult.data.user.points}`)
      console.log(`   Message: ${scanResult.data.message}`)
    } else {
      console.log('❌ QR Scan failed!')
      console.log(`   Error: ${scanResult.error}`)
      if (scanResult.debug) {
        console.log(`   Debug info: ${JSON.stringify(scanResult.debug, null, 2)}`)
      }
      if (scanResult.details) {
        console.log(`   Details: ${scanResult.details}`)
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.error('\nCheck that:')
    console.error('1. Development server is running (npm run dev)')
    console.error('2. Server is accessible at http://localhost:3001')
    console.error('3. Users exist in the system')
  }
}

// Check if we have node-fetch available
try {
  const fetch = globalThis.fetch || require('node-fetch')
  testQRScan()
} catch (error) {
  console.error('Error: node-fetch not available. Install with: npm install node-fetch')
  console.log('\nAlternatively, test manually by:')
  console.log('1. Go to http://localhost:3001')
  console.log('2. Login as collector')
  console.log('3. Try scanning a QR code')
}

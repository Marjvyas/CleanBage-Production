import { useEffect, useState } from 'react'

export default function DatabaseTestPage() {
  const [status, setStatus] = useState({ loading: true, error: null, data: null })
  const [users, setUsers] = useState([])
  const [health, setHealth] = useState(null)

  // Test MongoDB connection health
  const testHealth = async () => {
    try {
      const response = await fetch('/api/database?action=health')
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error('Health check failed:', error)
      setHealth({ success: false, error: error.message })
    }
  }

  // Fetch users from MongoDB
  const fetchUsers = async () => {
    try {
      setStatus({ loading: true, error: null, data: null })
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
        setStatus({ loading: false, error: null, data: data })
      } else {
        setStatus({ loading: false, error: data.error, data: null })
      }
    } catch (error) {
      setStatus({ loading: false, error: error.message, data: null })
    }
  }

  // Create sample users
  const createSampleData = async () => {
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sample' })
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Sample data created successfully!')
        fetchUsers() // Refresh users list
      } else {
        alert('Error creating sample data: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  // Create a new test user
  const createTestUser = async () => {
    const userData = {
      id: `TEST${Date.now()}`,
      email: `testuser${Date.now()}@cleanbage.com`,
      password: 'password123',
      name: `Test User ${Date.now()}`,
      role: 'user',
      society: 'Test Society',
      points: Math.floor(Math.random() * 100)
    }

    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-user', data: userData })
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`User created: ${data.user.name}`)
        fetchUsers() // Refresh users list
      } else {
        alert('Error creating user: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  // Simulate QR scan
  const simulateQRScan = async () => {
    if (users.length === 0) {
      alert('No users available for testing. Create some users first.')
      return
    }

    // Get a random user and collector
    const randomUser = users[Math.floor(Math.random() * users.length)]
    const collectors = users.filter(u => u.role === 'collector')
    
    if (collectors.length === 0) {
      alert('No collectors available for testing. Create sample data first.')
      return
    }

    const randomCollector = collectors[Math.floor(Math.random() * collectors.length)]

    try {
      const response = await fetch('/api/scan/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: randomUser.id,
          collectorId: randomCollector.id,
          pointsAwarded: 10,
          bypassCooldown: true
        })
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`QR Scan Success! ${data.data.user.name} earned ${data.data.transaction.amount} points!`)
        fetchUsers() // Refresh users list to see updated points
      } else {
        alert('QR Scan Failed: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  useEffect(() => {
    testHealth()
    fetchUsers()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 CleanBage MongoDB Database Test</h1>
      
      {/* Health Check */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Database Health</h2>
        {health ? (
          <div>
            <p><strong>Status:</strong> <span style={{ color: health.success ? 'green' : 'red' }}>
              {health.success ? '✅ Healthy' : '❌ Unhealthy'}
            </span></p>
            {health.result && (
              <p><strong>Details:</strong> {JSON.stringify(health.result)}</p>
            )}
            {health.error && <p style={{ color: 'red' }}><strong>Error:</strong> {health.error}</p>}
          </div>
        ) : (
          <p>Loading health check...</p>
        )}
        <button onClick={testHealth} style={{ marginTop: '10px', padding: '8px 16px' }}>
          🔄 Refresh Health Check
        </button>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Database Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={createSampleData} style={{ padding: '10px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
            🎯 Create Sample Data
          </button>
          <button onClick={createTestUser} style={{ padding: '10px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
            👤 Create Test User
          </button>
          <button onClick={simulateQRScan} style={{ padding: '10px 16px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px' }}>
            📱 Simulate QR Scan
          </button>
          <button onClick={fetchUsers} style={{ padding: '10px 16px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px' }}>
            🔄 Refresh Users
          </button>
        </div>
      </div>

      {/* Users List */}
      <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Users in MongoDB ({users.length})</h2>
        
        {status.loading && <p>Loading users...</p>}
        {status.error && <p style={{ color: 'red' }}>Error: {status.error}</p>}
        
        {users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Role</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Society</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Points</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}>{user.id}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        backgroundColor: user.role === 'collector' ? '#4CAF50' : user.role === 'admin' ? '#f44336' : '#2196F3',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.society}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{user.points || 0}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !status.loading && <p>No users found in database. Create some sample data to get started!</p>
        )}
      </div>
    </div>
  )
}

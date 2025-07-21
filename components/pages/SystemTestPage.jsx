"use client"

import { useState, useEffect } from 'react'
import { QrCode, Users, Database, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'

export default function SystemTestPage({ onPageChange }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState([])

  // Load all users from backend
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
        toast.success(`Loaded ${data.data.users.length} users from backend`)
      } else {
        toast.error('Failed to load users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Network error loading users')
    } finally {
      setIsLoading(false)
    }
  }

  // Test QR scan for a specific user
  const testQRScan = async (userId, userName) => {
    try {
      const collectorId = 'test-collector'
      const pointsAwarded = 25

      const response = await fetch('/api/scan/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, collectorId, pointsAwarded })
      })

      const data = await response.json()
      
      const result = {
        userId,
        userName,
        timestamp: new Date().toISOString(),
        success: data.success,
        message: data.success ? `Awarded ${pointsAwarded} points` : data.error,
        newBalance: data.success ? data.data.user.points : null
      }

      setTestResults(prev => [result, ...prev.slice(0, 9)])

      if (data.success) {
        toast.success(`✅ Test Success: ${userName}`, {
          description: `New balance: ${data.data.user.points} coins`
        })
        // Reload users to show updated balances
        loadUsers()
      } else {
        toast.error(`❌ Test Failed: ${userName}`, {
          description: data.error
        })
      }

    } catch (error) {
      console.error('Test error:', error)
      const result = {
        userId,
        userName,
        timestamp: new Date().toISOString(),
        success: false,
        message: `Network error: ${error.message}`,
        newBalance: null
      }
      setTestResults(prev => [result, ...prev.slice(0, 9)])
      
      toast.error(`❌ Network Error: ${userName}`)
    }
  }

  // Generate QR code data for a user
  const generateQRData = (user) => {
    return JSON.stringify({
      userId: user.id,
      userName: user.name,
      email: user.email,
      timestamp: Date.now()
    })
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Backend System Test
            </CardTitle>
            <p className="text-gray-600">Test QR scanning, notifications, and balance updates</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={loadUsers} 
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Reload Users
              </Button>
              <Button 
                onClick={() => setTestResults([])} 
                variant="outline"
              >
                Clear Results
              </Button>
              <Button 
                onClick={() => onPageChange && onPageChange('database-test')}
                className="bg-green-500 hover:bg-green-600"
              >
                <Database className="w-4 h-4 mr-2" />
                MongoDB Test
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                System Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <Badge variant={user.role === 'collector' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {user.points} coins
                      </div>
                      {user.lastScanTime && (
                        <p className="text-xs text-gray-500">
                          Last scan: {new Date(user.lastScanTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* QR Code Data */}
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                    {generateQRData(user)}
                  </div>
                  
                  <Button 
                    onClick={() => testQRScan(user.id, user.name)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    size="sm"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Test QR Scan (+25 coins)
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                Test Results ({testResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No tests run yet</p>
                  <p className="text-sm text-gray-400">Click "Test QR Scan" on any user</p>
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-l-4 ${
                      result.success 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{result.userName}</h4>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'SUCCESS' : 'FAILED'}
                      </Badge>
                    </div>
                    <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                    {result.newBalance && (
                      <p className="text-sm font-medium text-green-600">
                        New balance: {result.newBalance} coins
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

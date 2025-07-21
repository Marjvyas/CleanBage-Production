"use client"

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { toast } from 'sonner'
import { scanAPI } from '../../lib/api.js'
import { useUser } from '../../context/UserContext'
import { ErrorHandler } from '../../lib/errorHandler'
import UserBalance from '../UserBalance'
import { QrCode, TestTube } from 'lucide-react'

export default function TestQRScanPage({ user }) {
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bypassCooldown, setBypassCooldown] = useState(true) // Default to true for testing
  const { refreshUserData, userBalance } = useUser()

  const resetCooldowns = async () => {
    try {
      const response = await fetch('/api/debug?action=reset-cooldowns')
      const data = await response.json()
      
      if (data.success) {
        toast.success('QR cooldowns reset!', {
          description: 'All users can now be scanned again'
        })
      } else {
        toast.error('Failed to reset cooldowns')
      }
    } catch (error) {
      console.error('Reset cooldowns error:', error)
      toast.error('Error resetting cooldowns')
    }
  }

  const clearUserCooldown = async (userId) => {
    try {
      const response = await fetch(`/api/debug?action=clear-cooldown&userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Cooldown cleared for ${userId}`)
      } else {
        toast.error(data.message || 'Failed to clear cooldown')
      }
    } catch (error) {
      console.error('Clear cooldown error:', error)
      toast.error('Error clearing cooldown')
    }
  }

  const testQRScan = async (targetUserId = null) => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      const userId = targetUserId || user.id || user.userId || 'USER001'
      const collectorId = 'COLLECTOR001' // Test collector
      
      console.log(`Testing QR scan for user: ${userId}`)
      
      const response = await scanAPI.processQRScan(userId, collectorId, 3, bypassCooldown)
      
      if (response.success) {
        setTestResult({
          success: true,
          message: response.data.message,
          newBalance: response.data.user.points,
          transaction: response.data.transaction,
          notification: response.data.notification
        })
        
        toast.success('Test scan successful!', {
          description: `User now has ${response.data.user.points} coins`
        })
        
        // Refresh user data to see changes
        setTimeout(() => {
          refreshUserData()
        }, 1000)
        
      } else {
        setTestResult({
          success: false,
          message: response.error
        })
        
        toast.error('Test scan failed', {
          description: response.error
        })
      }
    } catch (error) {
      console.error('Test scan error:', error)
      
      const userMessage = ErrorHandler.formatUserError(error, 'scan')
      
      // If it's a cooldown error, offer to reset it
      if (error.message && (error.message.includes('deactivated') || error.message.includes('Available in'))) {
        setTestResult({
          success: false,
          message: userMessage,
          isDeactivated: true
        })
        
        toast.error('QR Code Deactivated', {
          description: 'Click "Reset All QR Cooldowns" below to continue testing',
          duration: 8000
        })
      } else {
        setTestResult({
          success: false,
          message: userMessage
        })
        
        toast.error('Test Failed', {
          description: userMessage
        })
      }
      
      ErrorHandler.logError(error, 'QR scan test', userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              QR Scan Test Page
            </CardTitle>
            <p className="text-gray-600">Test the QR scanning and balance update system</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Current User</p>
                  <p className="text-sm text-gray-600">{user.name} ({user.id || user.userId})</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <UserBalance />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Checkbox 
                id="bypass-cooldown"
                checked={bypassCooldown}
                onCheckedChange={setBypassCooldown}
              />
              <label htmlFor="bypass-cooldown" className="text-sm font-medium">
                Bypass QR Cooldown (Testing Mode)
              </label>
            </div>
            
            <Button 
              onClick={() => testQRScan()} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test QR Scan (Current User)'}
            </Button>
            
            <Button 
              onClick={() => testQRScan('USER001')} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Test QR Scan (Demo User - USER001)
            </Button>
            
            <Button 
              onClick={() => testQRScan('user123')} 
              disabled={isLoading}
              variant="outline"  
              className="w-full"
            >
              Test QR Scan (Demo User - user123)
            </Button>

            <Button 
              onClick={() => refreshUserData()} 
              variant="secondary"
              className="w-full"
            >
              Refresh User Data
            </Button>
            
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Cooldown Reset (Testing)</p>
              <Button 
                onClick={() => resetCooldowns()} 
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Reset All QR Cooldowns
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={() => clearUserCooldown('USER001')} 
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Clear USER001
                </Button>
                <Button 
                  onClick={() => clearUserCooldown('user123')} 
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Clear user123
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                {testResult.success ? '✅ Test Successful' : '❌ Test Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Message:</p>
                  <p className="text-sm">{testResult.message}</p>
                </div>
                
                {testResult.isDeactivated && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 font-semibold">⚠️ QR Code Deactivated</p>
                    <p className="text-orange-600 text-sm mt-1">
                      This user's QR code was scanned recently and is in cooldown period.
                    </p>
                    <p className="text-orange-600 text-sm">
                      Use the "Reset All QR Cooldowns" button below to continue testing.
                    </p>
                  </div>
                )}
                
                {testResult.success && (
                  <>
                    <div>
                      <p className="font-semibold">New Balance:</p>
                      <p className="text-sm">{testResult.newBalance} coins</p>
                    </div>
                    
                    {testResult.transaction && (
                      <div>
                        <p className="font-semibold">Transaction:</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(testResult.transaction, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {testResult.notification && (
                      <div>
                        <p className="font-semibold">Notification:</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(testResult.notification, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {user.id || user.userId || 'Not set'}</p>
              <p><strong>User Name:</strong> {user.name || 'Not set'}</p>
              <p><strong>User Points:</strong> {user.points || user.coins || 0}</p>
              <p><strong>Context Balance:</strong> {userBalance}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

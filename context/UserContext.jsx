"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { userAPI } from '../lib/api'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

class RealtimeService {
  constructor(userId, updateCallback) {
    this.userId = userId
    this.updateCallback = updateCallback
    this.pollingInterval = null
    this.lastBalance = undefined
    this.isVisible = true
    
    // Listen for visibility changes to pause polling when tab is not active
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isVisible = !document.hidden
        if (this.isVisible && this.pollingInterval === null) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Tab active again, resuming polling')
          }
          this.startPolling()
        } else if (!this.isVisible) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏸️ Tab hidden, pausing polling')
          }
          this.stopPolling()
        }
      })
    }
  }

  startPolling() {
    // Optimized polling: Start with 30 seconds, increase to 2 minutes for inactive periods
    let currentInterval = 30000 // 30 seconds initially
    let inactiveCount = 0
    
          const poll = async () => {
      // Don't poll if tab is not visible
      if (!this.isVisible) {
        this.pollingInterval = setTimeout(poll, 60000) // Check again in 1 minute
        return
      }
      
      try {
        const response = await userAPI.getBalance(this.userId)
        if (response.success) {
          const newBalance = response.data.user.points
          this.updateCallback(newBalance)
          
          // If balance changed, reset to fast polling
          if (this.lastBalance !== undefined && this.lastBalance !== newBalance) {
            if (process.env.NODE_ENV === 'development') {
              console.log('💰 Balance change detected, resuming active polling')
            }
            currentInterval = 30000 // Reset to 30 seconds
            inactiveCount = 0
          } else {
            // No change, increase interval gradually
            inactiveCount++
            if (inactiveCount > 2) { // After 2 minutes of no change
              currentInterval = Math.min(120000, currentInterval * 1.5) // Max 2 minutes
              if (process.env.NODE_ENV === 'development') {
                console.log(`📊 No activity, polling interval increased to ${currentInterval/1000}s`)
              }
            }
          }
          
          this.lastBalance = newBalance
        }
      } catch (error) {
        console.error('Realtime polling error:', error)
        // On error, slow down polling
        currentInterval = Math.min(120000, currentInterval * 2)
      }
      
      // Schedule next poll with current interval
      this.pollingInterval = setTimeout(poll, currentInterval)
    }    // Start initial poll
    poll()
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval) // Changed from clearInterval
      this.pollingInterval = null
    }
  }

  // Manual refresh for immediate updates (e.g., after QR scan)
  async forceRefresh() {
    try {
      console.log('🔄 Force refreshing balance...')
      const response = await userAPI.getBalance(this.userId)
      if (response.success) {
        this.updateCallback(response.data.user.points)
        this.lastBalance = response.data.user.points
        return response.data.user.points
      }
    } catch (error) {
      console.error('Force refresh error:', error)
    }
  }
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [realtimeService, setRealtimeService] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data from localStorage on mount and sync with server
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem("wasteManagementUser")
          if (storedUser) {
            const userData = JSON.parse(storedUser)
            
            const userId = userData.id || userData.userId
            
            // Check if this is an invalid user ID or test user
            if (!userId || !userData.email || !userData.name) {
              console.log("❌ Invalid user data detected, clearing localStorage")
              localStorage.removeItem("wasteManagementUser")
              setUser(null)
              setUserBalance(0)
              setIsLoading(false)
              return
            }

            // Additional validation to prevent collector test users from loading
            if (userData.email === 'collector@cleanbage.com' || userData.id === 'COLLECTOR001') {
              console.log("❌ Test collector user detected, clearing localStorage")
              localStorage.removeItem("wasteManagementUser")
              setUser(null)
              setUserBalance(0)
              setIsLoading(false)
              return
            }

            // Fetch latest balance and transactions from backend
            try {
              const response = await userAPI.getBalance(userId)
              if (response.success) {
                const serverData = response.data
                
                // Update user with server data, but preserve the selectedRole from login
                const updatedUser = {
                  ...userData,
                  // Update with fresh server data
                  ...serverData.user,
                  // But ensure login-specific properties are preserved
                  selectedRole: userData.selectedRole || "user",
                  canSwitchRoles: userData.canSwitchRoles || false
                }

                setUser(updatedUser)
                setUserBalance(serverData.user.points)
                setRecentTransactions(serverData.transactions || [])
                
                // Update localStorage with latest balance
                localStorage.setItem("wasteManagementUser", JSON.stringify(updatedUser))
                
                console.log(`✅ User ${userId} balance loaded from server: ${serverData.user.points}`)
                
                // Start real-time service
                const rtService = new RealtimeService(userId, handleRealtimeUpdate)
                setRealtimeService(rtService)
                rtService.startPolling()
                
              } else {
                console.log(`❌ User ${userId} not found in backend, clearing localStorage`)
                localStorage.removeItem("wasteManagementUser")
                setUser(null)
                setUserBalance(0)
              }
            } catch (error) {
              console.error("❌ Error fetching server data:", error)
              // If user not found, clear localStorage
              if (error.message.includes('404') || error.message.includes('not found')) {
                localStorage.removeItem("wasteManagementUser")
                setUser(null)
                setUserBalance(0)
              }
            }
          }
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()

    // Cleanup realtime service on unmount
    return () => {
      if (realtimeService) {
        realtimeService.stopPolling()
      }
    }
  }, [])

  const handleRealtimeUpdate = (newBalance) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Realtime balance update: ${userBalance} -> ${newBalance}`)
    }
    if (newBalance > userBalance) {
      setUserBalance(newBalance)
      // Update user object
      if (user) {
        const updatedUser = { ...user, points: newBalance }
        setUser(updatedUser)
        localStorage.setItem("wasteManagementUser", JSON.stringify(updatedUser))
      }
    }
  }

  const refreshUserData = async () => {
    if (!user) return
    
    try {
      const userId = user.id || user.userId
      const response = await userAPI.getBalance(userId)
      
      if (response.success) {
        const serverData = response.data
        
        // Update user with fresh server data, preserving login properties
        const updatedUser = {
          ...user,
          ...serverData.user,
          selectedRole: user.selectedRole || "user",
          canSwitchRoles: user.canSwitchRoles || false
        }
        
        setUser(updatedUser)
        setUserBalance(serverData.user.points)
        setRecentTransactions(serverData.transactions || [])
        
        localStorage.setItem("wasteManagementUser", JSON.stringify(updatedUser))
        
        console.log(`🔄 User data refreshed for ${userId}`)
      }
    } catch (error) {
      console.error("❌ Error refreshing user data:", error)
    }
  }

  const updateUserData = (updatedUser) => {
    setUser(updatedUser)
    setUserBalance(updatedUser.points || 0)
    if (typeof window !== 'undefined') {
      localStorage.setItem("wasteManagementUser", JSON.stringify(updatedUser))
    }
    console.log("✅ User data updated:", updatedUser)
  }

  const logout = () => {
    if (realtimeService) {
      realtimeService.stopPolling()
      setRealtimeService(null)
    }
    
    setUser(null)
    setUserBalance(0)
    setRecentTransactions([])
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem("wasteManagementUser")
    }
    
    console.log("👋 User logged out")
  }

  const value = {
    user,
    userBalance,
    recentTransactions,
    isLoading,
    updateUserData,
    refreshUserData,
    logout
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { userAPI, RealtimeService } from '../lib/api.js'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [realtimeService, setRealtimeService] = useState(null)

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem("wasteManagementUser")
          if (storedUser) {
            const userData = JSON.parse(storedUser)
            console.log("Loading user data:", userData)
            
            const userId = userData.id || userData.userId
            
            // Fetch latest balance and transactions from backend
            try {
              const response = await userAPI.getBalance(userId)
              if (response.success) {
                const serverData = response.data
                
                // Update user with server data
                const updatedUser = {
                  ...userData,
                  points: serverData.user.points
                }
                
                setUser(updatedUser)
                setUserBalance(serverData.user.points)
                setRecentTransactions(serverData.transactions || [])
                
                // Update localStorage with latest balance
                localStorage.setItem("wasteManagementUser", JSON.stringify(updatedUser))
                
                console.log(`User ${userId} balance loaded from server: ${serverData.user.points}`)
                
                // Start real-time service
                const rtService = new RealtimeService(userId, handleRealtimeUpdate)
                setRealtimeService(rtService)
                rtService.startPolling()
                
              } else {
                // Fallback to localStorage data
                setUser(userData)
                setUserBalance(userData.points || 0)
              }
            } catch (error) {
              console.error("Error fetching server data:", error)
              // Fallback to localStorage data
              setUser(userData)
              setUserBalance(userData.points || 0)
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()

    // Cleanup real-time service on unmount
    return () => {
      if (realtimeService) {
        realtimeService.stopPolling()
      }
    }
  }, [])

  // Handle real-time updates from server
  const handleRealtimeUpdate = (update) => {
    console.log("Received real-time update:", update)
    
    if (update.type === 'balance_update') {
      const { newBalance, pointsAdded, user: updatedUser, transactions } = update.data
      
      // Update state
      setUserBalance(newBalance)
      setRecentTransactions(transactions || [])
      
      // Update user object
      if (user) {
        const newUserData = { ...user, points: newBalance }
        setUser(newUserData)
        localStorage.setItem("wasteManagementUser", JSON.stringify(newUserData))
      }
      
      // Show notification
      toast.success(`🎉 You received ${pointsAdded} EcoCoins!`, {
        description: `Your new balance is ${newBalance} coins`,
        duration: 5000
      })
      
      // Trigger custom event for components listening
      window.dispatchEvent(new CustomEvent('balanceUpdate', {
        detail: { 
          points: newBalance, 
          user: newUserData, 
          pointsAdded,
          transactions 
        }
      }))
    }
    
    if (update.type === 'notifications') {
      const { notifications: newNotifications } = update.data
      
      // Update notifications state
      setNotifications(prev => {
        const combined = [...newNotifications, ...prev]
        // Remove duplicates by id
        const unique = combined.filter((notification, index, self) => 
          self.findIndex(n => n.id === notification.id) === index
        )
        return unique.slice(0, 50) // Keep only latest 50
      })
      
      // Show toast for each new notification
      newNotifications.forEach(notification => {
        if (notification.type === 'reward') {
          const pointsAwarded = notification.data?.points || 0
          toast.success(notification.title, {
            description: notification.message,
            duration: 5000
          })
        } else {
          toast.info(notification.title, {
            description: notification.message,
            duration: 4000
          })
        }
      })
    }
  }

  // Manual refresh function
  const refreshUserData = async () => {
    if (!user) return
    
    const userId = user.id || user.userId
    try {
      const response = await userAPI.getBalance(userId)
      if (response.success) {
        const serverData = response.data
        
        const updatedUser = {
          ...user,
          points: serverData.user.points
        }
        
        setUser(updatedUser)
        setUserBalance(serverData.user.points)
        setRecentTransactions(serverData.transactions || [])
        localStorage.setItem("wasteManagementUser", JSON.stringify(updatedUser))
        
        return updatedUser
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
    
    return user
  }

  // Login function
  const login = (userData) => {
    setUser(userData)
    setUserBalance(userData.points || 0)
    localStorage.setItem("wasteManagementUser", JSON.stringify(userData))
    
    // Start real-time service for new user
    const userId = userData.id || userData.userId
    if (userId && !realtimeService) {
      const rtService = new RealtimeService(userId, handleRealtimeUpdate)
      setRealtimeService(rtService)
      rtService.startPolling()
    }
  }

  // Logout function
  const logout = () => {
    // Stop real-time service
    if (realtimeService) {
      realtimeService.stopPolling()
      setRealtimeService(null)
    }
    
    setUser(null)
    setUserBalance(0)
    setRecentTransactions([])
    setNotifications([])
    localStorage.removeItem("wasteManagementUser")
  }

  // Update balance function (for backward compatibility)
  const updateUserBalance = (points) => {
    if (user) {
      const newBalance = userBalance + points
      setUserBalance(newBalance)
      const updatedUser = { ...user, points: newBalance }
      setUser(updatedUser)
      localStorage.setItem("wasteManagementUser", JSON.stringify(updatedUser))
    }
  }

  const contextValue = {
    user,
    userBalance,
    isLoading,
    recentTransactions,
    notifications,
    login,
    logout,
    updateUserBalance,
    refreshUserData,
    setUser,
    setUserBalance
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

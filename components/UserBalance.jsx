"use client"

import { useUser } from '../context/UserContext'
import { Badge } from './ui/badge'
import { Coins, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function UserBalance({ showAnimation = false, compact = false }) {
  const { userBalance, isLoading, refreshUserData } = useUser()
  const [prevBalance, setPrevBalance] = useState(userBalance)
  const [showGainAnimation, setShowGainAnimation] = useState(false)

  useEffect(() => {
    // Refresh user data when component mounts
    refreshUserData()
    
    // Listen for balance updates
    const handleBalanceUpdate = (event) => {
      console.log("UserBalance: Received balance update", event.detail)
      // The balance will be updated via UserContext, so we just need to trigger refresh
      setTimeout(() => {
        refreshUserData()
      }, 100)
    }

    // Listen for storage changes (cross-tab updates)  
    const handleStorageChange = (event) => {
      if (event.key === 'wasteManagementUser') {
        console.log("UserBalance: Storage changed, refreshing balance")
        setTimeout(() => {
          refreshUserData()
        }, 200)
      }
    }

    window.addEventListener('balanceUpdate', handleBalanceUpdate)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('balanceUpdate', handleBalanceUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (userBalance > prevBalance && showAnimation) {
      setShowGainAnimation(true)
      setTimeout(() => setShowGainAnimation(false), 2000)
    }
    setPrevBalance(userBalance)
  }, [userBalance, prevBalance, showAnimation])

  if (isLoading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        <Coins className="h-3 w-3 mr-1" />
        Loading...
      </Badge>
    )
  }

  const gainAmount = userBalance - prevBalance

  if (isLoading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        <Coins className="h-3 w-3 mr-1" />
        Loading...
      </Badge>
    )
  }

  if (compact) {
    return (
      <Badge 
        variant="secondary" 
        className={`bg-emerald-100 text-emerald-800 relative text-xs md:text-sm ${
          showGainAnimation ? 'animate-bounce' : ''
        }`}
      >
        <Coins className="h-3 w-3 mr-1" />
        {userBalance}
        {showGainAnimation && gainAmount > 0 && (
          <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded animate-fade-in-up">
            +{gainAmount}
          </div>
        )}
      </Badge>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${showGainAnimation ? 'animate-pulse' : ''}`}>
      <Badge 
        variant="secondary" 
        className="bg-emerald-100 text-emerald-800 text-xs md:text-sm relative px-2 md:px-3 py-1 md:py-1.5"
      >
        <Coins className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        <span className="hidden md:inline">{userBalance} Coins</span>
        <span className="md:hidden">{userBalance}</span>
        {showGainAnimation && gainAmount > 0 && (
          <div className="absolute -top-8 md:-top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 md:px-3 py-1 rounded-full animate-bounce flex items-center whitespace-nowrap">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="hidden md:inline">+{gainAmount} coins earned!</span>
            <span className="md:hidden">+{gainAmount}</span>
          </div>
        )}
      </Badge>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { User, Wallet, History, Settings, LogOut, Award, Calendar, Recycle, TrendingUp, Star, QrCode } from "lucide-react"
import UserBalance from "../UserBalance"
import { useUser } from "../../context/UserContext"

export default function ProfilePage({ user, onLogout, onPageChange }) {
  const [activities, setActivities] = useState([])
  const [achievements, setAchievements] = useState([])
  const [userStats, setUserStats] = useState({})
  const [recentRewards, setRecentRewards] = useState([])
  const { refreshUserData, recentTransactions, notifications } = useUser()

  useEffect(() => {
    // Refresh user data when profile loads
    refreshUserData()
    
    // Use transactions from UserContext instead of localStorage
    if (recentTransactions && recentTransactions.length > 0) {
      // Map transactions to rewards format
      const rewards = recentTransactions.map(transaction => ({
        id: transaction.id,
        userId: transaction.userId,
        source: transaction.source,
        pointsAwarded: transaction.amount,
        timestamp: transaction.timestamp,
        collectorId: transaction.collectorId
      }))
      setRecentRewards(rewards.slice(0, 10))
    }

    // Listen for real-time balance updates
    const handleBalanceUpdate = (event) => {
      const { transactions, pointsAdded, user: updatedUser } = event.detail
      console.log("ProfilePage: Received balance update", event.detail)
      
      if (transactions) {
        const rewards = transactions.map(transaction => ({
          id: transaction.id,
          userId: transaction.userId,
          source: transaction.source,
          pointsAwarded: transaction.amount,
          timestamp: transaction.timestamp,
          collectorId: transaction.collectorId
        }))
        setRecentRewards(rewards.slice(0, 10))
      }
      
      // Refresh user data to get latest balance
      setTimeout(() => {
        refreshUserData()
      }, 1000)
    }

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (event) => {
      if (event.key === 'wasteManagementUser') {
        console.log("ProfilePage: Storage changed, refreshing data")
        setTimeout(() => {
          refreshUserData()
        }, 500)
      }
    }

    window.addEventListener('balanceUpdate', handleBalanceUpdate)
    window.addEventListener('storage', handleStorageChange)

    // Initialize mock data
    const mockActivities = [
      {
        id: 1,
        type: "Organic Waste Collection",
        points: 15,
        date: "2024-01-15",
        status: "completed",
      },
      {
        id: 2,
        type: "Plastic Recycling",
        points: 25,
        date: "2024-01-14",
        status: "completed",
      },
      {
        id: 3,
        type: "Community Clean-up",
        points: 50,
        date: "2024-01-12",
        status: "completed",
      },
      {
        id: 4,
        type: "E-waste Submission",
        points: 30,
        date: "2024-01-10",
        status: "completed",
      },
    ]

    const mockAchievements = [
      { name: "Eco Warrior", description: "Completed 50 waste collection tasks", earned: true },
      { name: "Green Champion", description: "Earned 1000 EcoCoins", earned: true },
      { name: "Community Leader", description: "Organized 5 community events", earned: false },
      { name: "Recycling Master", description: "Recycled 100kg of waste", earned: true },
    ]

    const mockUserStats = {
      currentBalance: user.coins,
      earnedThisMonth: 120,
      totalRedeemed: 45,
      totalEarned: user.coins * 3,
    }

    setActivities(mockActivities)
    setAchievements(mockAchievements)
    setUserStats(mockUserStats)

    // Cleanup function - this should be at the end of useEffect
    return () => {
      window.removeEventListener('balanceUpdate', handleBalanceUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user.coins, user.id, user.userId, refreshUserData, recentTransactions])

  return (
    <div className="min-h-screen min-h-[100dvh] w-full pb-20">
      <div className="w-full px-0 md:max-w-6xl md:mx-auto md:p-6 space-y-4 md:space-y-6">
        <div className="page-enhanced-blur rounded-2xl md:rounded-xl p-3 md:p-4 space-y-4 md:space-y-6">
        {/* Profile Header */}
        <Card className="rounded-2xl md:rounded-xl shadow-sm">
          <CardContent className="p-4 md:p-8">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-3xl font-bold text-black truncate">{user.name}</h1>
                <p className="text-black text-sm md:text-base truncate">{user.email}</p>
                <p className="text-black text-sm md:text-base truncate">{user.society}</p>
                <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                  {user.selectedRole === "collector" && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      Authorized Collector
                    </Badge>
                  )}
                  {user.canSwitchRoles && (
                    <Badge variant="secondary" className="text-xs">
                      Multi-Role Access
                    </Badge>
                  )}
                  {user.collectorId && (
                    <Badge variant="outline" className="text-xs">
                      ID: {user.collectorId}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center space-x-1 md:space-x-2 mb-2">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                  <span className="text-lg md:text-xl font-bold text-gray-900">Rank #{user.rank}</span>
                </div>
                <p className="text-gray-600 text-xs md:text-sm">Society Ranking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Section */}
        <Card className="rounded-2xl md:rounded-xl shadow-sm">
          <CardHeader className="px-4 md:px-6 py-4 md:py-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              EcoCoin Wallet
              <UserBalance compact={true} />
            </CardTitle>
            <p className="text-gray-600 text-sm md:text-base">Track your earnings and spending</p>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <UserBalance />
                <div className="text-gray-600 text-xs md:text-sm mt-2">Current Balance</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-lg md:text-2xl font-bold text-green-600 mb-1">{recentRewards.length}</div>
                <div className="text-gray-600 text-xs md:text-sm">Collections This Month</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-lg md:text-2xl font-bold text-blue-600 mb-1">{userStats.totalRedeemed || 0}</div>
                <div className="text-gray-600 text-xs md:text-sm">Total Redeemed</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-teal-50 rounded-xl border border-teal-200">
                <div className="text-lg md:text-2xl font-bold text-teal-600 mb-1">{userStats.totalEarned || 0}</div>
                <div className="text-gray-600 text-xs md:text-sm">Total Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card className="rounded-2xl md:rounded-xl shadow-sm">
          <CardHeader className="px-4 md:px-6 py-4 md:py-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <History className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              Recent Activities
            </CardTitle>
            <p className="text-gray-600 text-xs md:text-sm">Your latest waste management activities</p>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6 pb-4 md:pb-6">
            {recentRewards.length > 0 ? (
              recentRewards.map((reward, index) => (
                <div
                  key={`reward-${reward.id || index}`}
                  className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                        {reward.source === 'waste_collection' ? 'Waste Collection Reward' : 'EcoCoin Reward'}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden md:inline">{new Date(reward.timestamp).toLocaleDateString()}</span>
                        <span className="md:hidden">{new Date(reward.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="hidden md:inline">{new Date(reward.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="flex items-center space-x-1 text-emerald-600 mb-1">
                      <span className="font-bold text-sm md:text-base">+{reward.pointsAwarded || reward.amount}</span>
                      <span className="text-xs md:text-sm">coins</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Collected</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No rewards yet. Get your QR code scanned by collectors to earn coins!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legacy Activities for backwards compatibility */}
        {activities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Legacy Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Recycle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.type}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-blue-600 mb-1">
                      <span className="font-bold">+{activity.points}</span>
                      <span className="text-sm">coins</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{activity.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card className="rounded-2xl md:rounded-xl shadow-sm">
          <CardHeader className="px-4 md:px-6 py-4 md:py-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              Achievements
            </CardTitle>
            <p className="text-gray-600 text-xs md:text-sm">Your eco-warrior badges and accomplishments</p>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-3 md:p-4 rounded-lg border ${
                    achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        achievement.earned ? "bg-yellow-100" : "bg-gray-200"
                      }`}
                    >
                      <Award className={`w-5 h-5 md:w-6 md:h-6 ${achievement.earned ? "text-yellow-600" : "text-gray-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm md:text-base ${achievement.earned ? "text-gray-900" : "text-gray-500"}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-xs md:text-sm ${achievement.earned ? "text-gray-600" : "text-gray-400"} line-clamp-2`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <div className="ml-auto">
                        <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <Card className="rounded-2xl md:rounded-xl shadow-sm">
          <CardHeader className="px-4 md:px-6 py-4 md:py-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              Account Settings
            </CardTitle>
            <p className="text-gray-600 text-xs md:text-sm">Manage your account and preferences</p>
          </CardHeader>
          <CardContent className="space-y-3 px-4 md:px-6 pb-4 md:pb-6">
            <Button
              variant="outline"
              onClick={() => onPageChange && onPageChange("user-qr")}
              className="w-full justify-start border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent text-sm md:text-base py-2 md:py-3 rounded-xl"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Show My QR Code
            </Button>
            <Button
              variant="outline"
              onClick={() => onPageChange && onPageChange("test-qr")}
              className="w-full justify-start border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent text-sm md:text-base py-2 md:py-3 rounded-xl"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Test QR Scan System
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent text-sm md:text-base py-2 md:py-3 rounded-xl"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent text-sm md:text-base py-2 md:py-3 rounded-xl"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Transaction History
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50 bg-transparent text-sm md:text-base py-2 md:py-3 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* About & Impact */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Your Environmental Impact</CardTitle>
            <p className="text-gray-600">See how you're making a difference with CLEANBAGE</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Our Impact</h4>
                <p className="text-green-600 font-bold text-lg mb-1">1M+ kg</p>
                <p className="text-gray-600 text-sm">Waste properly managed</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Community</h4>
                <p className="text-blue-600 font-bold text-lg mb-1">50,000+</p>
                <p className="text-gray-600 text-sm">Active eco-warriors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useScrollToTopOnChange } from "../hooks/useScrollToTop"
import SchedulePage from "./pages/SchedulePage"
import LeaderboardPage from "./pages/LeaderboardPage"
import CommunityActivityPage from "./pages/CommunityActivityPage"
import RewardsPage from "./pages/RewardsPage"
import RequestPage from "./pages/RequestPage"
import ProfilePage from "./pages/ProfilePage"
import SimplifiedCollectorDashboard from "./pages/SimplifiedCollectorDashboard"
import QRCodeGenerator from "./pages/QRCodeGenerator"
import UserQRDisplay from "./pages/UserQRDisplay"
import SystemTestPage from "./pages/SystemTestPage"
import TestQRScanPage from "./pages/TestQRScanPage"
import DatabaseTestPage from "./pages/DatabaseTestPage"
import BottomNavigation from "./BottomNavigation"
import UserBalance from "./UserBalance"

export default function Dashboard({ user, onLogout }) {
  console.log("🔍 Dashboard: User data received:", user)
  console.log("🔍 Dashboard: User role:", user.role)
  console.log("🔍 Dashboard: Selected role:", user.selectedRole)
  console.log("🔍 Dashboard: Can switch roles:", user.canSwitchRoles)
  
  const [currentPage, setCurrentPage] = useState(() => {
    // Only default to collector dashboard if user is actually a collector by role
    // AND they selected collector during login - not just because they have collector permissions
    console.log("🔍 Dashboard: Determining initial page...")
    console.log("🔍 Dashboard: user.role === 'collector':", user.role === "collector")
    console.log("🔍 Dashboard: user.selectedRole === 'collector':", user.selectedRole === "collector")
    
    if (user.role === "collector" && user.selectedRole === "collector") {
      console.log("🔍 Dashboard: Setting collector dashboard as default")
      return "collector-dashboard"
    }
    // For all other cases (including regular users), default to schedule page
    console.log("🔍 Dashboard: Setting schedule page as default")
    return "schedule"
  })
  
  const [selectedActivity, setSelectedActivity] = useState(null)
  
  // Use the actual selected role, but default to "user" for regular users
  const userRole = user.selectedRole === "collector" && user.role === "collector" ? "collector" : "user"
  console.log("Dashboard: Final userRole determined:", userRole)

  // Scroll to top whenever page changes
  useScrollToTopOnChange([currentPage])

  const handleNavigateToActivity = (activityId) => {
    setSelectedActivity(activityId)
    setCurrentPage("community-activity")
  }

  const handleBackFromActivity = () => {
    setSelectedActivity(null)
    setCurrentPage("leaderboard")
  }

  const renderPage = () => {
    switch (currentPage) {
      case "schedule":
        return <SchedulePage user={user} onPageChange={setCurrentPage} />
      case "leaderboard":
        return <LeaderboardPage user={user} onNavigateToActivity={handleNavigateToActivity} />
      case "community-activity":
        return <CommunityActivityPage activity={selectedActivity} onBack={handleBackFromActivity} />
      case "rewards":
        return <RewardsPage user={user} />
      case "requests":
        return <RequestPage user={user} />
      case "profile":
        return <ProfilePage user={user} onLogout={onLogout} onPageChange={setCurrentPage} />
      case "user-qr":
        return <UserQRDisplay user={user} />
      case "collector-dashboard":
        return <SimplifiedCollectorDashboard user={user} />
      case "qr-generator":
        return <QRCodeGenerator user={user} />
      case "system-test":
        return <SystemTestPage onPageChange={setCurrentPage} />
      case "test-qr":
        return <TestQRScanPage user={user} />
      case "database-test":
        return <DatabaseTestPage />
      default:
        return <SchedulePage user={user} onPageChange={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full">
      {/* Global User Balance - Show only for regular users, not collectors */}
      {userRole !== "collector" && (
        <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50">
          <UserBalance showAnimation={true} />
        </div>
      )}
      
      {/* Mobile: Full screen content, Desktop: Container with padding */}
      <div className="w-full min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-5rem)] pb-20 md:pb-24">
        <div className="w-full md:max-w-7xl md:mx-auto md:px-4">
          {renderPage()}
        </div>
      </div>
      
      <BottomNavigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        userRole={userRole}
      />
    </div>
  )
}

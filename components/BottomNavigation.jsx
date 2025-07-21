"use client"

import { Home, Trophy, Gift, FileText, User, Truck, QrCode, Database } from "lucide-react"

export default function BottomNavigation({ currentPage, onPageChange, userRole = "user" }) {
  const userNavItems = [
    { id: "schedule", icon: Home, label: "Home" },
    { id: "leaderboard", icon: Trophy, label: "Board" },
    { id: "rewards", icon: Gift, label: "Rewards" },
    { id: "requests", icon: FileText, label: "Requests" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  const collectorNavItems = [
    { id: "collector-dashboard", icon: Truck, label: "Scanner" },
    { id: "system-test", icon: Database, label: "Test" },
    { id: "schedule", icon: Home, label: "Home" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  const navItems = userRole === "collector" ? collectorNavItems : userNavItems

  return (
    <nav 
      className="nav-white-blur w-full"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        padding: '8px 12px 8px 12px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        width: '100vw',
        margin: 0
      }}
    >
      <div 
        className="w-full max-w-none md:max-w-2xl"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className="flex-1 max-w-none md:max-w-[120px]"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                color: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: isActive ? 'blur(10px)' : 'none',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                minHeight: '48px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <Icon size={18} className="mb-1" />
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '500',
                lineHeight: '1',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

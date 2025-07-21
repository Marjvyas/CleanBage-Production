"use client"

import { useIsMobile } from "@/hooks/use-mobile"

export default function ResponsiveContainer({ 
  children, 
  mobileClass = "", 
  desktopClass = "", 
  className = "",
  fullMobileWidth = false
}) {
  const isMobile = useIsMobile()
  
  // Mobile-first approach with full width utilization
  const mobileClasses = fullMobileWidth && isMobile 
    ? "w-full min-w-full mx-0 px-0 mobile-edge-to-edge" 
    : "w-full px-3 md:px-6"
    
  const combinedClass = `${className} ${isMobile ? `${mobileClasses} ${mobileClass}` : `max-w-7xl mx-auto ${desktopClass}`}`
  
  return (
    <div className={combinedClass}>
      {children}
    </div>
  )
}

export function ResponsiveGrid({ 
  children, 
  mobileColumns = 1, 
  tabletColumns = 2, 
  desktopColumns = 3,
  className = "",
  gap = "3",
  fullMobileWidth = false
}) {
  const isMobile = useIsMobile()
  
  // Optimize mobile grid spacing
  const mobileGap = isMobile ? "2" : gap
  const mobileClass = fullMobileWidth && isMobile ? "px-2" : "px-3 md:px-0"
  
  const gridClass = `grid grid-cols-${mobileColumns} sm:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns} gap-${mobileGap} ${mobileClass} ${className}`
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  )
}

export function ResponsiveText({ 
  children, 
  mobileSize = "sm", 
  desktopSize = "base",
  className = "",
  weight = "normal"
}) {
  const textClass = `text-${mobileSize} lg:text-${desktopSize} font-${weight} ${className}`
  
  return (
    <span className={textClass}>
      {children}
    </span>
  )
}

export function ResponsiveSection({
  children,
  className = "",
  padding = true,
  fullMobileWidth = false
}) {
  const isMobile = useIsMobile()
  
  const mobileClass = fullMobileWidth && isMobile 
    ? "w-full mobile-edge-to-edge" 
    : padding 
      ? "px-3 md:px-6 py-2 md:py-4"
      : ""
  
  const desktopClass = padding 
    ? "max-w-7xl mx-auto px-6 py-4" 
    : "max-w-7xl mx-auto"
  
  const combinedClass = `${className} ${isMobile ? mobileClass : desktopClass}`
  
  return (
    <section className={combinedClass}>
      {children}
    </section>
  )
}

import type { Metadata, Viewport } from 'next'
import '@/app/globals.css'
import { Inter } from "next/font/google"
import { UserProvider } from '../context/UserContext'
import { ToasterProvider } from '../components/ToasterProvider'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'CLEANBAGE',
  description: 'CLEANBAGE: Smart Waste Management App', // Fixed viewport warning
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen min-h-[100dvh] animate-gradient-background overflow-x-hidden hide-notification-buttons`}>
        <UserProvider>
          <div className="min-h-screen min-h-[100dvh] max-w-none mx-0 px-3 pt-4 md:max-w-7xl md:mx-auto md:px-4 md:pt-0">
            {children}
          </div>
          <ToasterProvider />
        </UserProvider>
      </body>
    </html>
  )
}

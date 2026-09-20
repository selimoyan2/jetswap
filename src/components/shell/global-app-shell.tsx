'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

interface GlobalAppShellProps {
  children: React.ReactNode
}

/**
 * Global App Shell provides consistent layout architecture across JetSwap.
 *
 * It embeds:
 * 1. Navbar (Global Header with language switcher, auth state, search, navigation)
 * 2. Main Content (<main className="flex-1 w-full">{children}</main>)
 * 3. Footer (Global Footer with brand manifesto, guides, trust center, network status)
 * 4. MobileBottomNav (Fixed mobile quick-navigation bar)
 *
 * Isolated Routes:
 * - Any route starting with `/admin` manages its own dedicated shell and is excluded.
 */
export function GlobalAppShell({ children }: GlobalAppShellProps) {
  const pathname = usePathname() || '/'

  // Isolated administration area
  const isAdminRoute = pathname.startsWith('/admin')
  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}

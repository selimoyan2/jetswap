import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Yönetim Paneli | JetSwap Süperadmin',
  description: 'JetSwap İçerik, Kullanıcı, Google Ads ve Moderasyon Yönetim Konsolu',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-portal-root min-h-screen bg-zinc-100 text-zinc-900 selection:bg-red-600 selection:text-white">
      {children}
    </div>
  )
}

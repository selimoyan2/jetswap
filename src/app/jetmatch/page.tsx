import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/require-user'
import { JetMatchDashboard } from '@/components/jetmatch/jetmatch-dashboard'
import { JetMatchLoading } from '@/components/jetmatch/jetmatch-loading'

export const metadata: Metadata = {
  title: 'JetMatch — Akıllı Takas Eşleştirme | JetSwap',
  description: 'Eşyaların için en uygun sıfır nakit takas fırsatlarını keşfet.',
}

export default async function JetMatchPage() {
  // Authentication check: Must be logged in
  const user = await getAuthUser()
  if (!user) {
    redirect('/login?callbackUrl=/jetmatch')
  }

  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <JetMatchLoading />
        </div>
      }
    >
      <JetMatchDashboard />
    </Suspense>
  )
}

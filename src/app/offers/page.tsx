import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/require-user'
import { OffersListClient } from './offers-list-client'

export const metadata: Metadata = {
  title: 'Takas Tekliflerim | JetSwap',
  description: 'Gelen ve gönderdiğiniz tüm sıfır nakit takas tekliflerini yönetin.',
}

export default async function OffersPage() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/login?callbackUrl=/offers')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Suspense
          fallback={
            <div className="py-20 text-center text-zinc-500 text-sm">
              Teklifler yükleniyor...
            </div>
          }
        >
          <OffersListClient />
        </Suspense>
      </div>
    </div>
  )
}

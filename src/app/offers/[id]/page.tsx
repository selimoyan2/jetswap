import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/require-user'
import { OfferDetailClient } from './offer-detail-client'

export const metadata: Metadata = {
  title: 'Takas Teklifi Detayı | JetSwap',
  description: 'Takas teklifi detaylarını görüntüleyin ve yönetin.',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OfferDetailPage({ params }: PageProps) {
  const user = await getAuthUser()
  const { id } = await params

  if (!user) {
    redirect(`/login?callbackUrl=/offers/${id}`)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <OfferDetailClient offerId={id} />
      </div>
    </div>
  )
}

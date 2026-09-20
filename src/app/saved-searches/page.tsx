import React from 'react'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/require-user'
import { getUserSavedSearches } from '@/lib/saved-searches'
import { SavedSearchesClient } from './saved-searches-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kayıtlı Aramalarım | JetSwap',
  description: 'Sık kullandığınız takas arama ve filtre kriterleri.',
}

export default async function SavedSearchesPage() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/login?callbackUrl=/saved-searches')
  }

  const searches = await getUserSavedSearches(user.id)

  return (
    <SavedSearchesClient
      initialSearches={searches}
      userName={user.name || 'Kullanıcı'}
    />
  )
}

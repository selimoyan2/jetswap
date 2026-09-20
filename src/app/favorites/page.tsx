import React from 'react'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/require-user'
import { getUserFavorites } from '@/lib/favorites'
import { FavoritesClient } from './favorites-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Favorilerim | JetSwap',
  description: 'Favoriye eklediğiniz takas ilanları.',
}

export default async function FavoritesPage() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/login?callbackUrl=/favorites')
  }

  const favorites = await getUserFavorites(user.id)

  return (
    <FavoritesClient
      initialFavorites={favorites}
      userName={user.name || 'Kullanıcı'}
    />
  )
}

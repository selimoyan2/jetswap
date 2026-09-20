'use client'

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

interface ItemDetailFavoriteButtonProps {
  itemId: string
  initialIsFavorite?: boolean
}

export function ItemDetailFavoriteButton({
  itemId,
  initialIsFavorite = false,
}: ItemDetailFavoriteButtonProps) {
  const [isFav, setIsFav] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  // On mount, check if favorited if initialIsFavorite was not known server-side
  useEffect(() => {
    let isMounted = true
    fetch(`/api/favorites/${itemId}`)
      .then(res => res.json())
      .then(res => {
        if (isMounted && res.success && res.data) {
          setIsFav(res.data.isFavorite)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [itemId])

  const toggleFavorite = async () => {
    if (isLoading) return
    const nextState = !isFav
    setIsFav(nextState)
    setIsLoading(true)

    try {
      const method = nextState ? 'POST' : 'DELETE'
      const res = await fetch(`/api/favorites/${itemId}`, { method })

      if (res.status === 401) {
        setIsFav(!nextState)
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
        return
      }

      if (!res.ok) {
        setIsFav(!nextState)
      }
    } catch {
      setIsFav(!nextState)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
      aria-pressed={isFav}
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
        isFav
          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-2xs'
      } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
    >
      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : 'text-zinc-500'}`} />
      <span>{isFav ? 'Favorilerimde' : 'Favoriye Ekle'}</span>
    </button>
  )
}

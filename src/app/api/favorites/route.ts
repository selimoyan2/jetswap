import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { getUserFavorites } from '@/lib/favorites'

export async function GET() {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  try {
    const favorites = await getUserFavorites(user.id)
    return NextResponse.json({
      success: true,
      data: favorites,
    })
  } catch (error) {
    console.error('Failed to get favorites:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Favoriler yüklenirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

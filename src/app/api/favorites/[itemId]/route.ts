import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { addFavorite, removeFavorite, isItemFavorited } from '@/lib/favorites'

interface RouteParams {
  params: Promise<{ itemId: string }>
}

export async function GET(request: Request, props: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  const { itemId } = await props.params
  if (!itemId) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ITEM_ID', message: 'Geçersiz ürün kimliği.' } },
      { status: 400 }
    )
  }

  try {
    const isFav = await isItemFavorited(user.id, itemId)
    return NextResponse.json({
      success: true,
      data: { isFavorite: isFav },
    })
  } catch (error) {
    console.error('Failed to check favorite status:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Favori durumu kontrol edilirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, props: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  const { itemId } = await props.params
  if (!itemId) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ITEM_ID', message: 'Geçersiz ürün kimliği.' } },
      { status: 400 }
    )
  }

  try {
    const result = await addFavorite(user.id, itemId)
    if (!result.success) {
      if (result.error === 'ITEM_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: { code: 'ITEM_NOT_FOUND', message: 'Favoriye eklenmek istenen ürün bulunamadı.' } },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: { code: result.error, message: 'İşlem başarısız oldu.' } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          isFavorite: true,
          alreadyExisted: result.alreadyExisted,
        },
      },
      { status: result.alreadyExisted ? 200 : 201 }
    )
  } catch (error) {
    console.error('Failed to add favorite:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Ürün favorilere eklenirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  const { itemId } = await props.params
  if (!itemId) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ITEM_ID', message: 'Geçersiz ürün kimliği.' } },
      { status: 400 }
    )
  }

  try {
    const result = await removeFavorite(user.id, itemId)
    return NextResponse.json({
      success: true,
      data: { isFavorite: result.isFavorite },
    })
  } catch (error) {
    console.error('Failed to remove favorite:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Ürün favorilerden çıkarılırken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

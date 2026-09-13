import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/require-user'

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/items/[id]/reactivate - Reactivate an archived item
export async function PATCH(request: Request, segmentData: Params) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await segmentData.params
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ID', message: 'Geçersiz ilan ID.' } },
      { status: 400 }
    )
  }

  try {
    const existing = await prisma.item.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'ITEM_NOT_FOUND', message: 'İlan bulunamadı.' } },
        { status: 404 }
      )
    }

    if (existing.userId !== user!.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu ilanı yeniden yayına alma yetkiniz bulunmuyor.' } },
        { status: 403 }
      )
    }

    if (existing.status !== 'ARCHIVED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Yalnızca arşivlenmiş ilanlar yeniden yayına alınabilir.'
          }
        },
        { status: 400 }
      )
    }

    const updated = await prisma.item.update({
      where: { id },
      data: { status: 'AVAILABLE' }
    })

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Error reactivating item:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'İlan yeniden yayına alınırken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

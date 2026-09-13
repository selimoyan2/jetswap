import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/require-user'

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/items/[id]/archive - Archive an item
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu ilanı arşivleme yetkiniz bulunmuyor.' } },
        { status: 403 }
      )
    }

    const updated = await prisma.item.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    })

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Error archiving item:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'İlan arşivlenirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

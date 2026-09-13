import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/items/[id]/wants - Fetch structured exchange preferences for an item
export async function GET(request: Request, segmentData: Params) {
  const { id } = await segmentData.params

  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ID', message: 'Geçersiz ilan ID.' } },
      { status: 400 }
    )
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'ITEM_NOT_FOUND', message: 'İlan bulunamadı.' } },
        { status: 404 }
      )
    }

    const wants = await prisma.itemWant.findMany({
      where: { itemId: id },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            nameTr: true,
            nameEn: true,
            icon: true,
          }
        }
      },
      orderBy: { priority: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: wants
    })
  } catch (error) {
    console.error('Error fetching item wants:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Takas istekleri yüklenirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/require-user'

// GET /api/items/mine - Fetch authenticated user's portfolio items
export async function GET() {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  try {
    const items = await prisma.item.findMany({
      where: {
        userId: user!.id
      },
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
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: items
    })
  } catch (error) {
    console.error('Error fetching user items:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'İlanlarınız yüklenirken bir hata oluştu.' }
      },
      { status: 500 }
    )
  }
}

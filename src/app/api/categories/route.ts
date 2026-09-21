import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const dbCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            items: {
              where: { status: 'AVAILABLE' }
            }
          }
        }
      },
      orderBy: { nameTr: 'asc' }
    })

    const data = dbCategories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameTr: cat.nameTr,
      nameEn: cat.nameEn,
      icon: cat.icon || 'Layers',
      description: cat.description,
      count: cat._count.items,
      subCategories: []
    }))

    return NextResponse.json({
      success: true,
      source: 'database',
      data
    })
  } catch (err) {
    console.error('Database query error for categories:', err)
    return NextResponse.json(
      {
        success: false,
        source: 'database',
        error: {
          code: 'FETCH_ERROR',
          message: 'Kategoriler yüklenirken bir hata oluştu.'
        },
        data: []
      },
      { status: 500 }
    )
  }
}


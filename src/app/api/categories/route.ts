import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { categories as defaultCategories } from '@/data/mockData'

export async function GET() {
  try {
    // If database connection is active, fetch from PostgreSQL
    const dbCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      }
    })

    if (dbCategories && dbCategories.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: dbCategories
      })
    }
  } catch (err) {
    console.warn('Database query fallback to static categories:', err)
  }

  // Graceful fallback to rich structured mock data
  return NextResponse.json({
    success: true,
    source: 'static',
    data: defaultCategories
  })
}

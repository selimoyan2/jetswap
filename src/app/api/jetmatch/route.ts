import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/require-user'
import { findMatchesForItem, findMatchesForUser, SourceItemWithWants } from '@/lib/jetmatch'

// GET /api/jetmatch - Calculate intelligent swap candidates using JetMatch V1 engine
export async function GET(request: Request) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('itemId')
  const limitParam = parseInt(searchParams.get('limit') || '20', 10)
  const minScoreParam = parseInt(searchParams.get('minScore') || '0', 10)

  const limit = Math.min(50, Math.max(1, isNaN(limitParam) ? 20 : limitParam))
  const minScore = Math.max(0, isNaN(minScoreParam) ? 0 : minScoreParam)

  try {
    // Scenario 1: Specific Item Match Request
    if (itemId) {
      const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: {
          category: true,
          wants: {
            include: { category: true },
            orderBy: { priority: 'asc' },
          },
        },
      })

      if (!item) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ITEM_NOT_FOUND',
              message: 'Eşleşme aranan ilan bulunamadı.',
            },
          },
          { status: 404 }
        )
      }

      // Security Check: Authenticated user must own the item
      if (item.userId !== user!.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Yalnızca kendinize ait takas ilanları için JetMatch eşleşmesi alabilirsiniz.',
            },
          },
          { status: 403 }
        )
      }

      const sourceItemSummary = {
        id: item.id,
        title: item.title,
        categoryId: item.categoryId,
        category: item.category
          ? {
              id: item.category.id,
              slug: item.category.slug,
              nameTr: item.category.nameTr,
              nameEn: item.category.nameEn,
              icon: item.category.icon,
            }
          : null,
        images: item.images,
        status: item.status,
        city: item.city,
        country: item.country,
      }

      // If item is not AVAILABLE
      if (item.status !== 'AVAILABLE') {
        return NextResponse.json({
          success: true,
          data: {
            sourceItem: sourceItemSummary,
            matches: [],
            totalMatches: 0,
            code: 'ITEM_NOT_AVAILABLE',
          },
        })
      }

      // If item has no structured wants
      if (!item.wants || item.wants.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            sourceItem: sourceItemSummary,
            matches: [],
            totalMatches: 0,
            code: 'NO_WANTS',
          },
        })
      }

      const matches = await findMatchesForItem(item as unknown as SourceItemWithWants, {
        limit,
        minScore,
      })

      return NextResponse.json({
        success: true,
        data: {
          sourceItem: sourceItemSummary,
          matches,
          totalMatches: matches.length,
        },
      })
    }

    // Scenario 2: All AVAILABLE Items for the Authenticated User
    const userMatchResults = await findMatchesForUser(user!.id, {
      limit,
      minScore,
    })

    return NextResponse.json({
      success: true,
      data: {
        items: userMatchResults,
      },
    })
  } catch (error) {
    console.error('JetMatch engine error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Eşleşmeler hesaplanırken bir hata oluştu.',
        },
      },
      { status: 500 }
    )
  }
}

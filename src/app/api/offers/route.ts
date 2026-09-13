import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { createTradeOffer, listUserOffers, OfferListType } from '@/lib/offers'
import { TradeOfferStatus } from '@prisma/client'

// POST /api/offers - Create a new trade offer
export async function POST(request: Request) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  try {
    const body = await request.json()
    const { offeredItemIds, requestedItemIds, note } = body

    const result = await createTradeOffer({
      senderId: user.id, // Strictly derived from session
      offeredItemIds,
      requestedItemIds,
      note,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.error?.status || 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('API POST /api/offers error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Geçersiz istek gövdesi.',
        },
      },
      { status: 400 }
    )
  }
}

// GET /api/offers - List user's received/sent offers
export async function GET(request: Request) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { searchParams } = new URL(request.url)
  const typeParam = searchParams.get('type') as OfferListType | null
  const statusParam = searchParams.get('status') as TradeOfferStatus | null

  const validTypes: OfferListType[] = ['received', 'sent', 'all']
  const type: OfferListType = typeParam && validTypes.includes(typeParam) ? typeParam : 'all'

  const result = await listUserOffers({
    userId: user.id,
    type,
    status: statusParam || undefined,
  })

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: result.error?.status || 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  })
}

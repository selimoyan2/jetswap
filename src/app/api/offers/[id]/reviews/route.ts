import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { createOfferReview, listOfferReviews } from '@/lib/reviews'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/offers/[id]/reviews - List reviews for a completed trade offer
export async function GET(request: Request, { params }: RouteParams) {
  const { user } = await requireUser()
  const { id } = await params

  const result = await listOfferReviews(id, user?.id)

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: result.error?.status || 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  })
}

// POST /api/offers/[id]/reviews - Submit a review for a completed trade offer
export async function POST(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Geçersiz JSON verisi.',
        },
      },
      { status: 400 }
    )
  }

  const result = await createOfferReview(id, user.id, body)

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
}

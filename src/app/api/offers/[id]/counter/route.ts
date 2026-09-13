import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { createCounterOffer } from '@/lib/offers'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/offers/[id]/counter - Create a structured counter offer
export async function POST(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await params

  let body: {
    offeredItemIds?: string[]
    requestedItemIds?: string[]
    note?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Geçersiz istek gövdesi.',
        },
      },
      { status: 400 }
    )
  }

  const result = await createCounterOffer({
    parentOfferId: id,
    userId: user.id,
    offeredItemIds: body.offeredItemIds || [],
    requestedItemIds: body.requestedItemIds || [],
    note: body.note,
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
}

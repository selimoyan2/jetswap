import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { listOfferMessages, createOfferMessage } from '@/lib/messages'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/offers/[id]/messages - List messages for an offer
export async function GET(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await params

  const result = await listOfferMessages(id, user.id)

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

// POST /api/offers/[id]/messages - Send a new message for an offer
export async function POST(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await params

  let body: { content?: string }
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

  const result = await createOfferMessage({
    offerId: id,
    senderId: user.id,
    content: body.content || '',
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

  return NextResponse.json(
    {
      success: true,
      data: result.data,
    },
    { status: 201 }
  )
}

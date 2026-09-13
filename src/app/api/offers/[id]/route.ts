import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { getTradeOfferDetail } from '@/lib/offers'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/offers/[id] - Get trade offer detail
export async function GET(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await params

  const result = await getTradeOfferDetail(id, user.id)

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

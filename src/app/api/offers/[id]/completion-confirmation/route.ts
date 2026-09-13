import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { confirmTradeCompletion } from '@/lib/offers'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/offers/[id]/completion-confirmation - Confirm trade completion for an accepted trade offer
export async function POST(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await params

  const result = await confirmTradeCompletion(id, user.id)

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

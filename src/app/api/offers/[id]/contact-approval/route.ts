import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { approveContactReveal } from '@/lib/offers'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/offers/[id]/contact-approval - Approve contact sharing for an accepted trade offer
export async function POST(request: Request, { params }: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await params

  const result = await approveContactReveal(id, user.id)

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

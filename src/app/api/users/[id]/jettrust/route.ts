import { NextRequest, NextResponse } from 'next/server'
import { getJetTrustForUser } from '@/lib/jettrust'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Geçersiz kullanıcı kimliği.',
          },
        },
        { status: 400 }
      )
    }

    const jetTrust = await getJetTrustForUser(id)

    if (!jetTrust) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Kullanıcı bulunamadı.',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: jetTrust,
    })
  } catch (error: unknown) {
    console.error('Error fetching JetTrust score:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'JetTrust puanı hesaplanırken bir hata oluştu.',
        },
      },
      { status: 500 }
    )
  }
}

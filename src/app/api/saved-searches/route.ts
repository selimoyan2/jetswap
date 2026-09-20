import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import { getUserSavedSearches, createSavedSearch, CreateSavedSearchInput } from '@/lib/saved-searches'

export async function GET() {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  try {
    const savedSearches = await getUserSavedSearches(user.id)
    return NextResponse.json({
      success: true,
      data: savedSearches,
    })
  } catch (error) {
    console.error('Failed to list saved searches:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Kayıtlı aramalar listelenirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Geçersiz istek gövdesi.' } },
      { status: 400 }
    )
  }

  const input: CreateSavedSearchInput = {
    name: body.name,
    query: body.query,
    categoryId: body.categoryId,
    condition: body.condition,
    tradeMethod: body.tradeMethod,
    country: body.country,
    city: body.city,
  }

  try {
    const result = await createSavedSearch(user.id, input)
    if (!result.success) {
      const statusCode = result.error === 'DUPLICATE_SAVED_SEARCH' ? 409 : 400
      return NextResponse.json(
        { success: false, error: { code: result.error, message: result.message } },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create saved search:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Kayıtlı arama oluşturulurken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

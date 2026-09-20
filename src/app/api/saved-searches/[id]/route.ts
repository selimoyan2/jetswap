import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/require-user'
import {
  getSavedSearchById,
  updateSavedSearch,
  deleteSavedSearch,
  UpdateSavedSearchInput,
} from '@/lib/saved-searches'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  const { id } = await props.params
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ID', message: 'Geçersiz arama kimliği.' } },
      { status: 400 }
    )
  }

  try {
    const savedSearch = await getSavedSearchById(id, user.id)
    if (!savedSearch) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Kayıtlı arama bulunamadı.' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: savedSearch,
    })
  } catch (error) {
    console.error('Failed to get saved search:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Kayıtlı arama getirilirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, props: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  const { id } = await props.params
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ID', message: 'Geçersiz arama kimliği.' } },
      { status: 400 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Geçersiz istek gövdesi.' } },
      { status: 400 }
    )
  }

  const input: UpdateSavedSearchInput = {
    name: body.name,
    query: body.query,
    categoryId: body.categoryId,
    condition: body.condition,
    tradeMethod: body.tradeMethod,
    country: body.country,
    city: body.city,
  }

  try {
    const result = await updateSavedSearch(id, user.id, input)
    if (!result.success) {
      const status = result.error === 'NOT_FOUND' ? 404 : 400
      return NextResponse.json(
        { success: false, error: { code: result.error, message: result.message } },
        { status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Failed to update saved search:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Kayıtlı arama güncellenirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse || !user) return errorResponse

  const { id } = await props.params
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ID', message: 'Geçersiz arama kimliği.' } },
      { status: 400 }
    )
  }

  try {
    const result = await deleteSavedSearch(id, user.id)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: result.error, message: result.message } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to delete saved search:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Kayıtlı arama silinirken bir hata oluştu.' } },
      { status: 500 }
    )
  }
}

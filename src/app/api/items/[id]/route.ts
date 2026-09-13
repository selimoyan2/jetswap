import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/require-user'
import { detectCashKeywords } from '@/lib/cashFilter'
import { resolveCategoryId } from '@/lib/categories'
import { ItemCondition, TradeMethod } from '@prisma/client'

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/items/[id] - Fetch public item detail
export async function GET(request: Request, segmentData: Params) {
  const { id } = await segmentData.params

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_ID', message: 'Geçersiz ilan ID.' }
      },
      { status: 400 }
    )
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            city: true,
            country: true,
            createdAt: true,
          }
        }
      }
    })

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ITEM_NOT_FOUND', message: 'İlan bulunamadı.' }
        },
        { status: 404 }
      )
    }

    // Increment viewCount asynchronously without blocking
    prisma.item.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    }).catch(err => {
      console.warn('ViewCount increment error:', err)
    })

    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error('Error fetching item detail:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'İlan detayları alınırken bir hata oluştu.' }
      },
      { status: 500 }
    )
  }
}

const VALID_CONDITIONS: ItemCondition[] = ['BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR']
const VALID_TRADE_METHODS: TradeMethod[] = ['HAND_TO_HAND', 'CARGO_ONLY', 'BOTH']
const VALID_VALUE_TIERS = ['LOW', 'MEDIUM', 'HIGH', 'PREMIUM']

// PATCH /api/items/[id] - Update own item
export async function PATCH(request: Request, segmentData: Params) {
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  const { id } = await segmentData.params
  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_ID', message: 'Geçersiz ilan ID.' }
      },
      { status: 400 }
    )
  }

  try {
    const existing = await prisma.item.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ITEM_NOT_FOUND', message: 'İlan bulunamadı.' }
        },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existing.userId !== user!.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Bu ilanı güncelleme yetkiniz bulunmuyor.' }
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      condition,
      tradeMethod,
      images,
      country,
      city,
      targetCategories,
      targetDescription,
      valueTier,
    } = body || {}

    const updateData: any = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 120) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_TITLE', message: 'Başlık 3-120 karakter arasında olmalıdır.' } },
          { status: 400 }
        )
      }
      updateData.title = title.trim()
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 5000) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_DESCRIPTION', message: 'Açıklama 10-5000 karakter arasında olmalıdır.' } },
          { status: 400 }
        )
      }
      updateData.description = description.trim()
    }

    if (targetDescription !== undefined) {
      updateData.targetDescription = typeof targetDescription === 'string' ? targetDescription.trim() : ''
    }

    // Cash check on updated texts
    const combined = `${updateData.title || existing.title} ${updateData.description || existing.description} ${updateData.targetDescription || existing.targetDescription}`
    const cashCheck = detectCashKeywords(combined)
    if (cashCheck.hasCashViolation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CASH_VIOLATION',
            message: cashCheck.warningMessage || 'Nakit talebi içeren ifadelere izin verilmez.'
          }
        },
        { status: 422 }
      )
    }

    if (categoryId !== undefined) {
      const resolved = await resolveCategoryId(categoryId)
      if (resolved) updateData.categoryId = resolved
    }

    if (condition !== undefined && VALID_CONDITIONS.includes(condition)) {
      updateData.condition = condition
    }

    if (tradeMethod !== undefined && VALID_TRADE_METHODS.includes(tradeMethod)) {
      updateData.tradeMethod = tradeMethod
    }

    if (valueTier !== undefined && VALID_VALUE_TIERS.includes(valueTier)) {
      updateData.valueTier = valueTier
    }

    if (city !== undefined && typeof city === 'string' && city.trim().length > 0) {
      updateData.city = city.trim()
    }

    if (country !== undefined && typeof country === 'string' && country.trim().length > 0) {
      updateData.country = country.trim()
    }

    if (Array.isArray(images)) {
      updateData.images = images.filter(img => typeof img === 'string' && img.trim().length > 0).slice(0, 10)
    }

    if (Array.isArray(targetCategories)) {
      updateData.targetCategories = targetCategories.filter(c => typeof c === 'string' && c.trim().length > 0)
    }

    const updated = await prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            country: true,
            rating: true,
            reviewCount: true,
            createdAt: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UPDATE_ERROR', message: 'İlan güncellenirken bir hata oluştu.' }
      },
      { status: 500 }
    )
  }
}

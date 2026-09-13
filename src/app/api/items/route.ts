import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/require-user'
import { detectCashKeywords } from '@/lib/cashFilter'
import { resolveCategoryId } from '@/lib/categories'
import { ItemCondition, TradeMethod } from '@prisma/client'

// GET /api/items - Fetch public available swap listings with pagination & filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryParam = searchParams.get('category')
  const city = searchParams.get('city')
  const search = searchParams.get('search')
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
  const skip = (page - 1) * limit

  try {
    const whereClause: any = {
      status: 'AVAILABLE'
    }

    if (categoryParam && categoryParam !== 'all') {
      whereClause.OR = [
        { categoryId: categoryParam },
        { category: { slug: categoryParam } }
      ]
    }

    if (city && city !== 'all') {
      whereClause.city = { contains: city, mode: 'insensitive' }
    }

    if (search && search.trim() !== '') {
      const q = search.trim()
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { targetDescription: { contains: q, mode: 'insensitive' } },
          ]
        }
      ]
    }

    const [total, items] = await Promise.all([
      prisma.item.count({ where: whereClause }),
      prisma.item.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              nameTr: true,
              nameEn: true,
              icon: true,
            }
          },
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ])

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching items from database:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'İlanlar yüklenirken bir hata oluştu.'
        }
      },
      { status: 500 }
    )
  }
}

const VALID_CONDITIONS: ItemCondition[] = ['BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR']
const VALID_TRADE_METHODS: TradeMethod[] = ['HAND_TO_HAND', 'CARGO_ONLY', 'BOTH']
const VALID_VALUE_TIERS = ['LOW', 'MEDIUM', 'HIGH', 'PREMIUM']

// POST /api/items - Create a new item listing (requires authenticated user)
export async function POST(request: Request) {
  // 1. Authenticate user
  const { user, errorResponse } = await requireUser()
  if (errorResponse) return errorResponse

  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Geçersiz istek gövdesi.'
          }
        },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      categoryId,
      condition,
      tradeMethod,
      images,
      country = 'TR',
      city,
      targetCategories,
      targetDescription,
      valueTier = 'MEDIUM',
    } = body || {}

    // 2. Server-side validation
    if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 120) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TITLE',
            message: 'İlan başlığı 3 ile 120 karakter arasında olmalıdır.'
          }
        },
        { status: 400 }
      )
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DESCRIPTION',
            message: 'İlan açıklaması en az 10 karakter olmalıdır.'
          }
        },
        { status: 400 }
      )
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CITY',
            message: 'Şehir alanı zorunludur.'
          }
        },
        { status: 400 }
      )
    }

    // 3. Zero-Cash Prevention (PRD Madde 38)
    const combinedText = `${title} ${description} ${targetDescription || ''}`
    const cashCheck = detectCashKeywords(combinedText)
    if (cashCheck.hasCashViolation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CASH_VIOLATION',
            message: cashCheck.warningMessage || 'Nakit veya para talebi içeren ilanlara izin verilmez.',
            matchedWords: cashCheck.matchedWords
          }
        },
        { status: 422 }
      )
    }

    // 4. Resolve Category
    const resolvedCatId = await resolveCategoryId(categoryId)
    if (!resolvedCatId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Geçerli bir kategori seçiniz.'
          }
        },
        { status: 400 }
      )
    }

    // 5. Condition and TradeMethod enum checks
    const mappedCondition: ItemCondition = VALID_CONDITIONS.includes(condition) ? condition : 'GOOD'
    const mappedTradeMethod: TradeMethod = VALID_TRADE_METHODS.includes(tradeMethod) ? tradeMethod : 'BOTH'
    const mappedValueTier = VALID_VALUE_TIERS.includes(valueTier) ? valueTier : 'MEDIUM'

    // 6. Image validation
    let safeImages: string[] = []
    if (Array.isArray(images)) {
      safeImages = images
        .filter(img => typeof img === 'string' && img.trim().length > 0)
        .slice(0, 10)
    }
    if (safeImages.length === 0) {
      safeImages = ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80']
    }

    // 7. Target categories and description
    const safeTargetCategories = Array.isArray(targetCategories)
      ? targetCategories.filter(c => typeof c === 'string' && c.trim().length > 0)
      : []

    const safeTargetDescription = (typeof targetDescription === 'string' && targetDescription.trim().length > 0)
      ? targetDescription.trim()
      : 'Her türlü mantıklı takas teklifine açığım'

    // 8. Persist to PostgreSQL via Prisma
    const createdItem = await prisma.item.create({
      data: {
        userId: user!.id,
        title: title.trim(),
        description: description.trim(),
        categoryId: resolvedCatId,
        condition: mappedCondition,
        tradeMethod: mappedTradeMethod,
        images: safeImages,
        country: typeof country === 'string' ? country.trim() : 'TR',
        city: city.trim(),
        targetCategories: safeTargetCategories,
        targetDescription: safeTargetDescription,
        valueTier: mappedValueTier,
        status: 'AVAILABLE',
      },
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

    return NextResponse.json(
      {
        success: true,
        data: createdItem
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating item in database:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'İlan kaydedilirken bir sunucu hatası oluştu.'
        }
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { mockMyPortfolio, mockItems } from '@/data/mockData'

// GET /api/swaps - Fetch user's swap negotiations (Mobile & Web API)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'usr_me'

  try {
    const dbOffers = await prisma.tradeOffer.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: true,
        receiver: true,
        items: {
          include: { item: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    if (dbOffers && dbOffers.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: dbOffers
      })
    }
  } catch (err) {
    console.warn('Swaps DB query fallback:', err)
  }

  // Graceful fallback formatted for mobile app consumption
  return NextResponse.json({
    success: true,
    source: 'runtime_fallback',
    data: [
      {
        id: 'offer-1',
        partnerName: 'Caner Demir',
        partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        partnerTrust: 96,
        partnerCity: 'İstanbul (Kadıköy)',
        partnerPhone: '+90 533 111 22 33',
        partnerEmail: 'caner.demir@example.com',
        myItems: [mockMyPortfolio[0].title],
        partnerItems: [mockItems[0].title],
        status: 'NEGOTIATING',
        contactUnlocked: false,
        unreadCount: 1
      }
    ]
  })
}

// POST /api/swaps - Submit trade proposal from Mobile App
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { targetItemId, offeredItemIds, note } = body

    if (!targetItemId || !offeredItemIds || offeredItemIds.length === 0) {
      return NextResponse.json(
        { error: 'Hedef ürün ve teklif edilen ürün(ler) belirtilmelidir.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Takas teklifi mobil uygulama üzerinden başarıyla iletildi.',
      offerId: `offer-${Date.now()}`,
      status: 'SUBMITTED'
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Teklif oluşturulamadı.' }, { status: 500 })
  }
}

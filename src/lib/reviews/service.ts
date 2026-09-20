import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createNotification, NotificationType } from '@/lib/notifications'
import { validateReviewInput } from './validation'
import { serializeReview } from './serialization'
import { SerializedReview } from './types'

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    status: number
  }
}

/**
 * Creates a mutual review for a COMPLETED trade offer.
 * The author is taken from the session; the target user is derived server-side.
 * Rating must be an integer 1-5. Zero-cash and contact privacy filters are enforced on comments.
 * Updates target user's rating and reviewCount from actual database reviews.
 */
export async function createOfferReview(
  offerId: string,
  authorId: string,
  input: unknown
): Promise<ServiceResult<SerializedReview>> {
  if (!authorId) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Değerlendirme yapmak için giriş yapmalısınız.',
        status: 401,
      },
    }
  }

  // 1. Input validation
  const validation = validateReviewInput(input)
  if (!validation.isValid && validation.error) {
    const isFilterBlocked =
      validation.error.code === 'CASH_CONTENT_BLOCKED' ||
      validation.error.code === 'CONTACT_INFO_BLOCKED'

    return {
      success: false,
      error: {
        code: validation.error.code,
        message: validation.error.message,
        status: isFilterBlocked ? 422 : 400,
      },
    }
  }

  try {
    // 2. Offer & participant verification
    const offer = await prisma.tradeOffer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        status: true,
      },
    })

    if (!offer) {
      return {
        success: false,
        error: {
          code: 'OFFER_NOT_FOUND',
          message: 'Teklif bulunamadı.',
          status: 404,
        },
      }
    }

    const isSender = authorId === offer.senderId
    const isReceiver = authorId === offer.receiverId

    if (!isSender && !isReceiver) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Yalnızca bu takasın tarafları değerlendirme yapabilir.',
          status: 403,
        },
      }
    }

    // Reviews only allowed on COMPLETED offers
    if (offer.status !== 'COMPLETED') {
      return {
        success: false,
        error: {
          code: 'OFFER_NOT_COMPLETED',
          message: 'Değerlendirme yalnızca başarıyla tamamlanmış takaslarda yapılabilir.',
          status: 400,
        },
      }
    }

    // 3. Derive target user server-side
    const targetUserId = isSender ? offer.receiverId : offer.senderId

    // 4. Pre-check: has this author already reviewed this offer?
    const existingReview = await prisma.review.findUnique({
      where: {
        offerId_authorId: {
          offerId,
          authorId,
        },
      },
    })

    if (existingReview) {
      return {
        success: false,
        error: {
          code: 'REVIEW_ALREADY_EXISTS',
          message: 'Bu takas için daha önce değerlendirme yaptınız.',
          status: 409,
        },
      }
    }

    // 5. Transaction: Create review and recalculate target user's actual rating
    const createdReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          offerId,
          authorId,
          targetUserId,
          rating: validation.rating!,
          comment: validation.cleanComment ?? null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      })

      // Aggregate target user's reviews from actual DB rows
      const aggregate = await tx.review.aggregate({
        where: { targetUserId },
        _avg: { rating: true },
        _count: { rating: true },
      })

      const count = aggregate._count.rating
      // Round to 1 decimal place (e.g. 4.7)
      const avg =
        aggregate._avg.rating !== null
          ? Math.round(aggregate._avg.rating * 10) / 10
          : 5.0

      await tx.user.update({
        where: { id: targetUserId },
        data: {
          rating: avg,
          reviewCount: count,
        },
      })

      // Send NEW_REVIEW notification to target user
      await createNotification(
        {
          userId: targetUserId,
          type: NotificationType.NEW_REVIEW,
          href: `/offers/${offerId}`,
          dedupeKey: `review:${review.id}:new:${targetUserId}`,
          data: {
            offerId,
            reviewId: review.id,
          },
        },
        tx
      )

      return review
    })

    return {
      success: true,
      data: serializeReview(createdReview),
    }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: {
            code: 'REVIEW_ALREADY_EXISTS',
            message: 'Bu takas için daha önce değerlendirme yaptınız.',
            status: 409,
          },
        }
      }
    }

    console.error('Error in createOfferReview:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Değerlendirme kaydedilirken bir hata oluştu.',
        status: 500,
      },
    }
  }
}

/**
 * Lists all reviews for a completed trade offer.
 */
export async function listOfferReviews(
  offerId: string,
  userId?: string
): Promise<ServiceResult<{ myReview: SerializedReview | null; otherReview: SerializedReview | null; allReviews: SerializedReview[] }>> {
  try {
    const offer = await prisma.tradeOffer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        status: true,
      },
    })

    if (!offer) {
      return {
        success: false,
        error: {
          code: 'OFFER_NOT_FOUND',
          message: 'Teklif bulunamadı.',
          status: 404,
        },
      }
    }

    const isSender = userId === offer.senderId
    const isReceiver = userId === offer.receiverId

    if (userId && !isSender && !isReceiver) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Bu takasın değerlendirmelerini görme yetkiniz yok.',
          status: 403,
        },
      }
    }

    const reviews = await prisma.review.findMany({
      where: { offerId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const allReviews = reviews.map(serializeReview)
    let myReview: SerializedReview | null = null
    let otherReview: SerializedReview | null = null

    if (userId) {
      for (const r of allReviews) {
        if (r.author.id === userId) {
          myReview = r
        } else if (isSender || isReceiver) {
          otherReview = r
        }
      }
    }

    return {
      success: true,
      data: {
        myReview,
        otherReview,
        allReviews,
      },
    }
  } catch (error: unknown) {
    console.error('Error in listOfferReviews:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Değerlendirmeler getirilirken bir hata oluştu.',
        status: 500,
      },
    }
  }
}

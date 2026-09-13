import { prisma } from '@/lib/prisma'
import { detectCashKeywords } from '@/lib/cashFilter'
import { CreateOfferInput } from './types'

export interface ValidationResult<T = void> {
  isValid: boolean
  error?: {
    code: string
    message: string
    status: number
  }
  data?: T
}

export interface ValidatedOfferData {
  senderId: string
  receiverId: string
  offeredItemIds: string[]
  requestedItemIds: string[]
  note: string | null
}

export async function validateCreateOffer(
  input: CreateOfferInput
): Promise<ValidationResult<ValidatedOfferData>> {
  const { senderId, offeredItemIds, requestedItemIds, note } = input

  // 1. Basic array requirements
  if (!Array.isArray(offeredItemIds) || offeredItemIds.length === 0) {
    return {
      isValid: false,
      error: {
        code: 'MISSING_OFFERED_ITEMS',
        message: 'Teklif edebileceğiniz en az bir eşya seçmelisiniz.',
        status: 400,
      },
    }
  }

  if (!Array.isArray(requestedItemIds) || requestedItemIds.length === 0) {
    return {
      isValid: false,
      error: {
        code: 'MISSING_REQUESTED_ITEMS',
        message: 'Karşı taraftan istediğiniz en az bir eşya seçmelisiniz.',
        status: 400,
      },
    }
  }

  // 2. Duplicate item prevention within the same offer
  const allItemIds = [...offeredItemIds, ...requestedItemIds]
  if (new Set(allItemIds).size !== allItemIds.length) {
    return {
      isValid: false,
      error: {
        code: 'DUPLICATE_ITEMS_IN_OFFER',
        message: 'Bir eşya teklif içinde birden fazla kez veya her iki tarafta yer alamaz.',
        status: 400,
      },
    }
  }

  // 3. Note & Cash Rule Validation
  let cleanNote: string | null = null
  if (note && typeof note === 'string') {
    cleanNote = note.trim()
    if (cleanNote.length === 0) {
      cleanNote = null
    } else if (cleanNote.length > 1000) {
      return {
        isValid: false,
        error: {
          code: 'NOTE_TOO_LONG',
          message: 'Teklif notu en fazla 1000 karakter olabilir.',
          status: 400,
        },
      }
    } else {
      const cashCheck = detectCashKeywords(cleanNote)
      if (cashCheck.hasCashViolation) {
        return {
          isValid: false,
          error: {
            code: 'CASH_VIOLATION',
            message: 'Teklif notunda nakit para, fiyat veya satış teklifi yer alamaz (Sıfır Nakit Kuralı).',
            status: 422,
          },
        }
      }
    }
  }

  // 4. Fetch and validate OFFERED items (must belong to sender and be AVAILABLE)
  const offeredItems = await prisma.item.findMany({
    where: { id: { in: offeredItemIds } },
    select: { id: true, userId: true, status: true, title: true },
  })

  if (offeredItems.length !== offeredItemIds.length) {
    return {
      isValid: false,
      error: {
        code: 'OFFERED_ITEM_NOT_FOUND',
        message: 'Teklif ettiğiniz eşyalardan biri veya birkaçı bulunamadı.',
        status: 404,
      },
    }
  }

  for (const item of offeredItems) {
    if (item.userId !== senderId) {
      return {
        isValid: false,
        error: {
          code: 'FORBIDDEN_ITEM_OWNERSHIP',
          message: `"${item.title}" size ait bir eşya değildir. Yalnızca kendi eşyalarınızı teklif edebilirsiniz.`,
          status: 403,
        },
      }
    }

    if (item.status !== 'AVAILABLE') {
      return {
        isValid: false,
        error: {
          code: 'OFFERED_ITEM_NOT_AVAILABLE',
          message: `"${item.title}" şu anda takasa açık değildir.`,
          status: 400,
        },
      }
    }
  }

  // 5. Fetch and validate REQUESTED items (must belong to another single user and be AVAILABLE)
  const requestedItems = await prisma.item.findMany({
    where: { id: { in: requestedItemIds } },
    select: { id: true, userId: true, status: true, title: true },
  })

  if (requestedItems.length !== requestedItemIds.length) {
    return {
      isValid: false,
      error: {
        code: 'REQUESTED_ITEM_NOT_FOUND',
        message: 'İstediğiniz eşyalardan biri veya birkaçı bulunamadı.',
        status: 404,
      },
    }
  }

  const receiverId = requestedItems[0].userId

  // Self-offer check
  if (receiverId === senderId) {
    return {
      isValid: false,
      error: {
        code: 'SELF_OFFER_NOT_ALLOWED',
        message: 'Kendi ilanlarınıza takas teklifi gönderemezsiniz.',
        status: 400,
      },
    }
  }

  for (const item of requestedItems) {
    if (item.userId !== receiverId) {
      return {
        isValid: false,
        error: {
          code: 'MULTIPLE_RECEIVERS_NOT_ALLOWED',
          message: 'Bir takas teklifinde yalnızca aynı kullanıcıya ait eşyaları isteyebilirsiniz.',
          status: 400,
        },
      }
    }

    if (item.userId === senderId) {
      return {
        isValid: false,
        error: {
          code: 'SELF_OFFER_NOT_ALLOWED',
          message: 'Kendi eşyanızı teklifte talep edemezsiniz.',
          status: 400,
        },
      }
    }

    if (item.status !== 'AVAILABLE') {
      return {
        isValid: false,
        error: {
          code: 'REQUESTED_ITEM_NOT_AVAILABLE',
          message: `"${item.title}" şu anda takasa açık değildir.`,
          status: 400,
        },
      }
    }
  }

  // 6. Duplicate active offer prevention
  const existingPendingOffer = await prisma.tradeOffer.findFirst({
    where: {
      senderId,
      receiverId,
      status: 'PENDING',
      AND: [
        {
          items: {
            some: {
              itemId: { in: offeredItemIds },
              role: 'OFFERED',
            },
          },
        },
        {
          items: {
            some: {
              itemId: { in: requestedItemIds },
              role: 'REQUESTED',
            },
          },
        },
      ],
    },
  })

  if (existingPendingOffer) {
    return {
      isValid: false,
      error: {
        code: 'DUPLICATE_ACTIVE_OFFER',
        message: 'Bu ürünler için zaten bekleyen aktif bir takas teklifiniz bulunmaktadır.',
        status: 409,
      },
    }
  }

  return {
    isValid: true,
    data: {
      senderId,
      receiverId,
      offeredItemIds,
      requestedItemIds,
      note: cleanNote,
    },
  }
}

import { prisma } from '@/lib/prisma'
import { validateMessageContent } from './validation'
import { serializeTradeMessage } from './serialization'
import {
  CreateMessageInput,
  SerializedTradeMessage,
  ListMessagesResult,
} from './types'

export interface MessageServiceResult<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    status: number
  }
}

/**
 * List messages for an offer with deterministic order and participant verification.
 */
export async function listOfferMessages(
  offerId: string,
  viewerUserId: string
): Promise<MessageServiceResult<ListMessagesResult>> {
  if (!viewerUserId) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Bu işlemi gerçekleştirmek için giriş yapmalısınız.',
        status: 401,
      },
    }
  }

  // 1. Verify offer existence and viewer membership
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

  if (viewerUserId !== offer.senderId && viewerUserId !== offer.receiverId) {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bu teklifin mesajlarını görüntüleme yetkiniz yok.',
        status: 403,
      },
    }
  }

  // 2. Fetch messages ordered deterministically
  const messages = await prisma.tradeMessage.findMany({
    where: { offerId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: 50,
  })

  const canSendMessage = offer.status === 'PENDING' || offer.status === 'ACCEPTED'

  const serializedMessages = messages.map(msg =>
    serializeTradeMessage(msg, viewerUserId)
  )

  return {
    success: true,
    data: {
      messages: serializedMessages,
      canSendMessage,
      offerStatus: offer.status,
    },
  }
}

/**
 * Creates a message within an offer.
 * Enforces:
 * - Participant authorization
 * - Offer status (PENDING or ACCEPTED only)
 * - Zero Cash Rule
 * - Contact Privacy Barrier
 * - Spam protection
 */
export async function createOfferMessage(
  input: CreateMessageInput
): Promise<MessageServiceResult<SerializedTradeMessage>> {
  if (!input.senderId) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Bu işlemi gerçekleştirmek için giriş yapmalısınız.',
        status: 401,
      },
    }
  }

  // 1. Verify offer exists and sender is participant
  const offer = await prisma.tradeOffer.findUnique({
    where: { id: input.offerId },
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      status: true,
      contactRevealed: true,
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

  if (input.senderId !== offer.senderId && input.senderId !== offer.receiverId) {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bu teklife mesaj gönderme yetkiniz yok.',
        status: 403,
      },
    }
  }

  // 2. Verify offer is in a messageable state (PENDING or ACCEPTED)
  if (offer.status !== 'PENDING' && offer.status !== 'ACCEPTED') {
    return {
      success: false,
      error: {
        code: 'OFFER_CLOSED',
        message: 'Bu teklif kapandığı için yeni mesaj gönderilemez.',
        status: 400,
      },
    }
  }

  // 3. Validate content (length, zero-cash, contact-privacy, spam)
  // Sprint 9: If contactRevealed === true, contact sharing is allowed!
  const validation = validateMessageContent(input.content, {
    offerId: input.offerId,
    senderId: input.senderId,
    allowContact: offer.contactRevealed === true,
  })

  if (!validation.isValid || !validation.error === false) {
    const err = validation.error!
    let status = 400
    if (
      err.code === 'CASH_NEGOTIATION_BLOCKED' ||
      err.code === 'CONTACT_INFO_BLOCKED'
    ) {
      status = 422
    } else if (err.code === 'SPAM_RATE_LIMITED') {
      status = 429
    }

    return {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        status,
      },
    }
  }

  // 4. Create message record in database
  const created = await prisma.tradeMessage.create({
    data: {
      offerId: input.offerId,
      senderId: input.senderId,
      content: validation.cleanContent,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  })

  const serialized = serializeTradeMessage(created, input.senderId)

  return {
    success: true,
    data: serialized,
  }
}

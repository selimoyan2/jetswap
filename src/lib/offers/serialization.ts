import { TradeOffer, TradeOfferItem, Item, User, Category } from '@prisma/client'
import { SerializedTradeOffer, OfferPublicUser, OfferItemSummary, OfferRevisionSummary } from './types'

export type TradeOfferWithRelations = TradeOffer & {
  sender: Pick<User, 'id' | 'name' | 'avatar' | 'city' | 'country' | 'rating' | 'reviewCount'> & {
    phone?: string | null
    email?: string | null
  }
  receiver: Pick<User, 'id' | 'name' | 'avatar' | 'city' | 'country' | 'rating' | 'reviewCount'> & {
    phone?: string | null
    email?: string | null
  }
  items: (TradeOfferItem & {
    item: Item & {
      category?: Pick<Category, 'id' | 'nameTr' | 'nameEn'> | null
    }
  })[]
  parentOfferId?: string | null
  revision?: number
  senderContactApprovedAt?: Date | null
  receiverContactApprovedAt?: Date | null
}

/**
 * Serializes a Prisma TradeOffer with relations into a safe, strictly typed
 * SerializedTradeOffer.
 * CRITICAL PRIVACY RULE: Never reveals phone, email, or other personal contact data
 * unless offer.status === 'ACCEPTED' AND offer.contactRevealed === true.
 * When revealed, ONLY the other party's contact details are populated in `contact`.
 * Passwords, internal IDs, and other private metadata are NEVER exposed.
 */
export function serializeTradeOffer(
  offer: TradeOfferWithRelations,
  currentUserId?: string,
  history?: OfferRevisionSummary[]
): SerializedTradeOffer {
  const isSender = currentUserId === offer.senderId
  const isReceiver = currentUserId === offer.receiverId

  const viewerRole: 'SENDER' | 'RECEIVER' | 'OBSERVER' = isSender
    ? 'SENDER'
    : isReceiver
    ? 'RECEIVER'
    : 'OBSERVER'

  const canAccept = isReceiver && offer.status === 'PENDING'
  const canReject = isReceiver && offer.status === 'PENDING'
  const canCancel = isSender && offer.status === 'PENDING'
  const canCounter = (isSender || isReceiver) && offer.status === 'PENDING'

  const sender: OfferPublicUser = {
    id: offer.sender.id,
    name: offer.sender.name,
    avatar: offer.sender.avatar,
    city: offer.sender.city,
    country: offer.sender.country,
    rating: offer.sender.rating,
    reviewCount: offer.sender.reviewCount,
  }

  const receiver: OfferPublicUser = {
    id: offer.receiver.id,
    name: offer.receiver.name,
    avatar: offer.receiver.avatar,
    city: offer.receiver.city,
    country: offer.receiver.country,
    rating: offer.receiver.rating,
    reviewCount: offer.receiver.reviewCount,
  }

  const offeredItems: OfferItemSummary[] = []
  const requestedItems: OfferItemSummary[] = []
  const methodsFound = new Set<'HAND_TO_HAND' | 'CARGO_ONLY' | 'BOTH'>()

  for (const offerItem of offer.items) {
    const item = offerItem.item
    if (item.tradeMethod) {
      methodsFound.add(item.tradeMethod)
    }

    const summary: OfferItemSummary = {
      id: item.id,
      title: item.title,
      images: Array.isArray(item.images) ? (item.images as string[]) : [],
      condition: item.condition,
      status: item.status,
      city: item.city,
      country: item.country,
      tradeMethod: item.tradeMethod,
      category: item.category
        ? {
            id: item.category.id,
            nameTr: item.category.nameTr,
            nameEn: item.category.nameEn,
          }
        : null,
      role: offerItem.role,
    }

    if (offerItem.role === 'OFFERED') {
      offeredItems.push(summary)
    } else {
      requestedItems.push(summary)
    }
  }

  // Trade Handoff Summary
  const supportedMethods = Array.from(methodsFound)
  const hasHandToHand = supportedMethods.some((m) => m === 'HAND_TO_HAND' || m === 'BOTH')
  const hasCargo = supportedMethods.some((m) => m === 'CARGO_ONLY' || m === 'BOTH')

  const isAccepted = offer.status === 'ACCEPTED'
  const isRevealed = isAccepted && offer.contactRevealed === true

  // Contact Reveal State
  const myApproval = isSender
    ? !!offer.senderContactApprovedAt
    : isReceiver
    ? !!offer.receiverContactApprovedAt
    : false

  const otherApproval = isSender
    ? !!offer.receiverContactApprovedAt
    : isReceiver
    ? !!offer.senderContactApprovedAt
    : false

  const contactReveal = {
    available: isAccepted,
    myApproval,
    otherApproval,
    revealed: isRevealed,
    revealedAt: isRevealed && offer.contactRevealedAt ? offer.contactRevealedAt.toISOString() : null,
  }

  // Contact Info (only if revealed AND user is sender or receiver)
  let contact: { name: string; phone: string | null; email: string } | null = null
  if (isRevealed && (isSender || isReceiver)) {
    const otherUser = isSender ? offer.receiver : offer.sender
    contact = {
      name: otherUser.name,
      phone: otherUser.phone || null,
      email: otherUser.email || '',
    }
  }

  return {
    id: offer.id,
    status: offer.status,
    note: offer.note,
    parentOfferId: offer.parentOfferId || null,
    revision: offer.revision || 1,
    history,
    sender,
    receiver,
    offeredItems,
    requestedItems,
    contactRevealed: isRevealed,
    contactRevealedAt: isRevealed && offer.contactRevealedAt ? offer.contactRevealedAt.toISOString() : null,
    contactReveal,
    contact,
    tradeHandoff: {
      supportedMethods,
      hasHandToHand,
      hasCargo,
    },
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    viewerRole,
    canAccept,
    canReject,
    canCancel,
    canCounter,
  }
}

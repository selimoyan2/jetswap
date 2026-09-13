import { TradeOffer, TradeOfferItem, Item, User, Category } from '@prisma/client'
import { SerializedTradeOffer, OfferPublicUser, OfferItemSummary } from './types'

export type TradeOfferWithRelations = TradeOffer & {
  sender: Pick<User, 'id' | 'name' | 'avatar' | 'city' | 'country' | 'rating' | 'reviewCount'>
  receiver: Pick<User, 'id' | 'name' | 'avatar' | 'city' | 'country' | 'rating' | 'reviewCount'>
  items: (TradeOfferItem & {
    item: Item & {
      category?: Pick<Category, 'id' | 'nameTr' | 'nameEn'> | null
    }
  })[]
}

/**
 * Serializes a Prisma TradeOffer with relations into a safe, strictly typed
 * SerializedTradeOffer.
 * CRITICAL PRIVACY RULE: Never reveals phone, email, or other personal contact data.
 * Sets contactRevealed = false always for Sprint 6.
 */
export function serializeTradeOffer(
  offer: TradeOfferWithRelations,
  currentUserId?: string
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

  for (const offerItem of offer.items) {
    const item = offerItem.item
    const summary: OfferItemSummary = {
      id: item.id,
      title: item.title,
      images: Array.isArray(item.images) ? (item.images as string[]) : [],
      condition: item.condition,
      status: item.status,
      city: item.city,
      country: item.country,
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

  return {
    id: offer.id,
    status: offer.status,
    note: offer.note,
    sender,
    receiver,
    offeredItems,
    requestedItems,
    contactRevealed: false, // Sprint 6 Zero Contact Reveal strict rule
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    viewerRole,
    canAccept,
    canReject,
    canCancel,
  }
}

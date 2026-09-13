import { TradeOfferStatus, OfferItemRole, ItemCondition, ItemStatus } from '@prisma/client'

export interface CreateOfferInput {
  senderId: string
  offeredItemIds: string[]
  requestedItemIds: string[]
  note?: string | null
}

export interface OfferPublicUser {
  id: string
  name: string
  avatar: string | null
  city?: string | null
  country?: string | null
  rating?: number
  reviewCount?: number
}

export interface OfferItemSummary {
  id: string
  title: string
  images: string[]
  condition: ItemCondition
  status: ItemStatus
  city: string
  country: string
  category?: {
    id: string
    nameTr: string
    nameEn?: string
  } | null
  role: OfferItemRole
}

export interface SerializedTradeOffer {
  id: string
  status: TradeOfferStatus
  note: string | null
  sender: OfferPublicUser
  receiver: OfferPublicUser
  offeredItems: OfferItemSummary[]
  requestedItems: OfferItemSummary[]
  contactRevealed: boolean
  createdAt: string
  updatedAt: string
  viewerRole: 'SENDER' | 'RECEIVER' | 'OBSERVER'
  canAccept: boolean
  canReject: boolean
  canCancel: boolean
}

export type OfferListType = 'received' | 'sent' | 'all'

export interface ListOffersFilter {
  userId: string
  type?: OfferListType
  status?: TradeOfferStatus
}

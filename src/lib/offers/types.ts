import { TradeOfferStatus, OfferItemRole, ItemCondition, ItemStatus, TradeMethod } from '@prisma/client'

export interface CreateOfferInput {
  senderId: string
  offeredItemIds: string[]
  requestedItemIds: string[]
  note?: string | null
}

export interface CreateCounterOfferInput {
  parentOfferId: string
  userId: string
  offeredItemIds: string[]
  requestedItemIds: string[]
  note?: string | null
}

export interface OfferRevisionSummary {
  id: string
  revision: number
  status: TradeOfferStatus
  createdAt: string
  sender: OfferPublicUser
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
  tradeMethod?: TradeMethod
  category?: {
    id: string
    nameTr: string
    nameEn?: string
  } | null
  role: OfferItemRole
}

export interface RevealedContactInfo {
  name: string
  phone: string | null
  email: string
}

export interface ContactRevealState {
  available: boolean // true only if status === ACCEPTED
  myApproval: boolean
  otherApproval: boolean
  revealed: boolean
  revealedAt: string | null
}

export interface TradeHandoffSummary {
  supportedMethods: TradeMethod[]
  hasHandToHand: boolean
  hasCargo: boolean
}

export interface SerializedTradeOffer {
  id: string
  status: TradeOfferStatus
  note: string | null
  parentOfferId?: string | null
  revision: number
  history?: OfferRevisionSummary[]
  sender: OfferPublicUser
  receiver: OfferPublicUser
  offeredItems: OfferItemSummary[]
  requestedItems: OfferItemSummary[]
  contactRevealed: boolean
  contactRevealedAt?: string | null
  contactReveal?: ContactRevealState
  contact?: RevealedContactInfo | null
  tradeHandoff?: TradeHandoffSummary
  createdAt: string
  updatedAt: string
  viewerRole: 'SENDER' | 'RECEIVER' | 'OBSERVER'
  canAccept: boolean
  canReject: boolean
  canCancel: boolean
  canCounter: boolean
}

export type OfferListType = 'received' | 'sent' | 'all'

export interface ListOffersFilter {
  userId: string
  type?: OfferListType
  status?: TradeOfferStatus
}

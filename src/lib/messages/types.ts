import { TradeOfferStatus } from '@prisma/client'

export interface CreateMessageInput {
  offerId: string
  senderId: string
  content: string
}

export interface MessagePublicUser {
  id: string
  name: string
  avatar: string | null
}

export interface SerializedTradeMessage {
  id: string
  offerId: string
  content: string
  createdAt: string
  isMine: boolean
  sender: MessagePublicUser
}

export interface ListMessagesResult {
  messages: SerializedTradeMessage[]
  canSendMessage: boolean
  offerStatus: TradeOfferStatus
}

export interface MessageValidationError {
  code:
    | 'EMPTY_CONTENT'
    | 'MAX_LENGTH_EXCEEDED'
    | 'CASH_NEGOTIATION_BLOCKED'
    | 'CONTACT_INFO_BLOCKED'
    | 'SPAM_RATE_LIMITED'
  message: string
}

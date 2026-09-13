import { SerializedTradeMessage } from './types'

export interface RawTradeMessageWithSender {
  id: string
  offerId: string
  senderId: string
  content: string
  createdAt: Date | string
  sender: {
    id: string
    name: string
    avatar: string | null
    email?: string | null
    phone?: string | null
  }
}

export function serializeTradeMessage(
  message: RawTradeMessageWithSender,
  viewerUserId: string
): SerializedTradeMessage {
  return {
    id: message.id,
    offerId: message.offerId,
    content: message.content,
    createdAt:
      typeof message.createdAt === 'string'
        ? message.createdAt
        : message.createdAt.toISOString(),
    isMine: message.senderId === viewerUserId,
    sender: {
      id: message.sender.id,
      name: message.sender.name,
      avatar: message.sender.avatar || null,
    },
  }
}

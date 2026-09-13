import { Review, User } from '@prisma/client'
import { SerializedReview } from './types'

export type ReviewWithAuthor = Review & {
  author: Pick<User, 'id' | 'name' | 'avatar'>
}

/**
 * Serializes a Review model into a safe, public representation.
 * Guarantees zero leak of phone, email, password or internal secrets.
 */
export function serializeReview(review: ReviewWithAuthor): SerializedReview {
  return {
    id: review.id,
    offerId: review.offerId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    author: {
      id: review.author.id,
      name: review.author.name,
      avatar: review.author.avatar,
    },
  }
}

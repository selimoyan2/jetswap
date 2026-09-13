export interface CreateReviewInput {
  rating: number
  comment?: string | null
}

export interface ReviewAuthor {
  id: string
  name: string
  avatar: string | null
}

export interface SerializedReview {
  id: string
  offerId: string
  rating: number
  comment: string | null
  createdAt: string
  author: ReviewAuthor
}

export interface ReviewValidationError {
  code:
    | 'INVALID_RATING'
    | 'COMMENT_TOO_LONG'
    | 'CASH_CONTENT_BLOCKED'
    | 'CONTACT_INFO_BLOCKED'
  message: string
}

export interface ReviewValidationResult {
  isValid: boolean
  error?: ReviewValidationError
  rating?: number
  cleanComment?: string | null
}

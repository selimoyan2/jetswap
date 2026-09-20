import { prisma } from '@/lib/prisma'
import { TradeOfferStatus } from '@prisma/client'
import { calculateJetTrust } from './score'
import { JetTrustResult, JetTrustSignals } from './types'

export interface TradeOfferChainItem {
  id: string
  parentOfferId: string | null
  status: TradeOfferStatus
  revision: number
}

/**
 * Deduplicates counter-offer revision chains so that 1 negotiation chain
 * counts as exactly 1 trade lifecycle attempt.
 */
export function resolveRevisionChainOutcomes(offers: TradeOfferChainItem[]): {
  completedTrades: number
  cancelledTrades: number
} {
  const parentMap = new Map<string, string>()
  for (const o of offers) {
    if (o.parentOfferId) {
      parentMap.set(o.id, o.parentOfferId)
    }
  }

  function findRoot(id: string): string {
    let curr = id
    const visited = new Set<string>()
    while (parentMap.has(curr)) {
      visited.add(curr)
      const parent = parentMap.get(curr)!
      if (visited.has(parent)) break // cycle safety
      curr = parent
    }
    return curr
  }

  // Group offers by root chain ID
  const chains = new Map<string, TradeOfferChainItem[]>()
  for (const o of offers) {
    const rootId = findRoot(o.id)
    if (!chains.has(rootId)) {
      chains.set(rootId, [])
    }
    chains.get(rootId)!.push(o)
  }

  let completedTrades = 0
  let cancelledTrades = 0

  for (const chainOffers of chains.values()) {
    // If any revision in the chain completed, the chain is completed
    const hasCompleted = chainOffers.some((o) => o.status === 'COMPLETED')
    if (hasCompleted) {
      completedTrades++
      continue
    }

    // If cancelled, count as cancelled for trade reliability
    const hasCancelled = chainOffers.some((o) => o.status === 'CANCELLED')
    if (hasCancelled) {
      cancelledTrades++
    }
  }

  return { completedTrades, cancelledTrades }
}

/**
 * Gathers authentic signals from database records and computes the JetTrust score.
 * Never exposes passwords, phones, emails, or internal messages.
 */
export async function getJetTrustForUser(userId: string): Promise<JetTrustResult | null> {
  if (!userId) return null

  // 1. Fetch user core record
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      country: true,
      city: true,
      createdAt: true,
    },
  })

  if (!user) {
    return null
  }

  // 2. Account foundation (days since creation)
  const now = Date.now()
  const accountAgeDays = Math.max(
    0,
    Math.floor((now - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  )

  // 3. Profile completeness (only real fields present)
  const profile = {
    hasName: Boolean(user.name && user.name.trim().length > 0),
    hasEmail: Boolean(user.email && user.email.trim().length > 0),
    hasPhone: Boolean(user.phone && user.phone.trim().length > 0),
    hasAvatar: Boolean(user.avatar && user.avatar.trim().length > 0),
    hasBio: Boolean(user.bio && user.bio.trim().length > 0),
    hasCountry: Boolean(user.country && user.country.trim().length > 0),
    hasCity: Boolean(user.city && user.city.trim().length > 0),
  }

  // 4. Real review reputation from database (excluding placeholder 5.0 when count is 0)
  const reviewAgg = await prisma.review.aggregate({
    where: { targetUserId: userId },
    _count: { rating: true },
    _avg: { rating: true },
  })

  const reviewCount = reviewAgg._count.rating
  const reviewAverage =
    reviewCount > 0 && reviewAgg._avg.rating !== null
      ? Math.round(reviewAgg._avg.rating * 10) / 10
      : null

  // 5. Trade offers lifecycle and revision chain deduplication
  const userOffers = await prisma.tradeOffer.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: { in: ['COMPLETED', 'CANCELLED', 'COUNTER_OFFERED'] },
    },
    select: {
      id: true,
      parentOfferId: true,
      status: true,
      revision: true,
    },
  })

  const { completedTrades, cancelledTrades } = resolveRevisionChainOutcomes(userOffers)

  const signals: JetTrustSignals = {
    accountAgeDays,
    profile,
    completedTrades,
    reviews: {
      count: reviewCount,
      average: reviewAverage,
    },
    reliability: {
      completed: completedTrades,
      cancelled: cancelledTrades,
    },
  }

  return calculateJetTrust(signals)
}

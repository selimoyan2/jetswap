import { MatchReason, ScoreBreakdown, JetMatchType } from './types'

export interface ExplanationContext {
  matchType: JetMatchType
  breakdown: ScoreBreakdown
  categoryName?: string
  isFlexible?: boolean
  wantPriority?: number
}

export function buildMatchReasons(ctx: ExplanationContext): MatchReason[] {
  const reasons: MatchReason[] = []

  // 1. Reciprocity
  if (ctx.matchType === 'MUTUAL') {
    reasons.push({
      code: 'MUTUAL_WANT',
      points: ctx.breakdown.reciprocityPoints,
      message: 'İki tarafın takas tercihleri karşılıklı uyumlu (HAVE ↔ WANT).',
    })
  } else if (ctx.isFlexible) {
    reasons.push({
      code: 'FLEXIBLE_WANT',
      message: 'Karşı taraf esnek ve benzer tekliflere açık.',
    })
  }

  // 2. Category
  if (ctx.breakdown.categoryPoints > 0) {
    reasons.push({
      code: 'CATEGORY_MATCH',
      points: ctx.breakdown.categoryPoints,
      message: ctx.categoryName
        ? `Aradığın kategoriyle (${ctx.categoryName}) tam eşleşiyor.`
        : 'Aradığın takas kategorisiyle tam eşleşiyor.',
    })
  }

  // 3. Condition
  if (ctx.breakdown.conditionPoints > 0) {
    reasons.push({
      code: 'CONDITION_MATCH',
      points: ctx.breakdown.conditionPoints,
      message: 'Ürün durumu belirlediğin minimum kondisyon beklentisini karşılıyor.',
    })
  }

  // 4. Location
  if (ctx.breakdown.locationPoints === 10) {
    reasons.push({
      code: 'SAME_CITY',
      points: 10,
      message: 'Aynı şehirdesiniz; elden teslimat veya hızlı takas için ideal.',
    })
  } else if (ctx.breakdown.locationPoints === 5) {
    reasons.push({
      code: 'SAME_COUNTRY',
      points: 5,
      message: 'Aynı ülkedesiniz; kargo ile güvenli takas yapılabilir.',
    })
  }

  // 5. Priority
  if (ctx.breakdown.priorityBonus > 0) {
    const priorityLabel = ctx.wantPriority === 0 ? '1. Tercih (Öncelikli)' : `${(ctx.wantPriority || 0) + 1}. Tercih`
    reasons.push({
      code: 'PRIORITY_WANT',
      points: ctx.breakdown.priorityBonus,
      message: `Bu eşya senin ${priorityLabel} istek listendendir.`,
    })
  }

  return reasons
}

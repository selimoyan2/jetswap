import { JetTrustComponents, JetTrustSignals } from './types'

export const JETTRUST_DISCLAIMER =
  'JetTrust, kullanıcının JetSwap üzerindeki hesap geçmişi, tamamlanan takasları ve değerlendirmeleri gibi platform içi sinyallerden hesaplanan bir güven göstergesidir. Güvenlik garantisi değildir.'

export function generateExplanations(
  components: JetTrustComponents,
  signals: JetTrustSignals
): string[] {
  const explanations: string[] = []

  // 1. Account Foundation
  if (components.accountFoundation >= 11) {
    explanations.push('Platformda köklü bir hesap geçmişi bulunuyor.')
  } else if (components.accountFoundation >= 5) {
    explanations.push('Aktif bir hesap geçmişi mevcut.')
  } else {
    explanations.push('Hesap henüz yeni oluşturulmuş.')
  }

  // 2. Profile Completeness
  if (components.profileCompleteness >= 9) {
    explanations.push('Profil bilgileri büyük ölçüde tamamlanmış.')
  } else if (components.profileCompleteness >= 5) {
    explanations.push('Temel profil bilgileri girilmiş.')
  } else {
    explanations.push('Profil bilgileri henüz tamamlanma aşamasında.')
  }

  // 3. Completed Trades
  if (signals.completedTrades >= 15) {
    explanations.push("15'ten fazla başarılı takas tamamlandı.")
  } else if (signals.completedTrades >= 5) {
    explanations.push(`${signals.completedTrades} adet başarılı takas tamamlandı.`)
  } else if (signals.completedTrades >= 1) {
    explanations.push(`${signals.completedTrades} adet takas tamamlandı.`)
  } else {
    explanations.push('Henüz tamamlanmış takas geçmişi bulunmuyor.')
  }

  // 4. Review Reputation
  if (signals.reviews.count >= 5 && (signals.reviews.average ?? 0) >= 4.5) {
    explanations.push('Kullanıcı değerlendirmeleri ve memnuniyet oranı çok yüksek.')
  } else if (signals.reviews.count >= 1 && (signals.reviews.average ?? 0) >= 4.0) {
    explanations.push('Olumlu kullanıcı değerlendirmeleri mevcut.')
  } else if (signals.reviews.count >= 1) {
    explanations.push('Kullanıcı değerlendirmeleri bulunuyor.')
  } else {
    explanations.push('Henüz kullanıcı değerlendirmesi bulunmuyor.')
  }

  // 5. Trade Reliability
  const totalAttempts = signals.reliability.completed + signals.reliability.cancelled
  if (totalAttempts === 0) {
    explanations.push('Takas sürekliliği henüz başlangıç seviyesinde.')
  } else {
    const ratio = signals.reliability.completed / totalAttempts
    if (ratio >= 0.9) {
      explanations.push('Takas süreçleri yüksek oranda başarıyla sonuçlanıyor.')
    } else if (ratio >= 0.6) {
      explanations.push('Takas süreçleri istikrarlı şekilde tamamlanıyor.')
    } else {
      explanations.push('Tamamlanan takas oranı gelişme aşamasında.')
    }
  }

  return explanations
}

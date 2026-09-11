import { NextResponse } from 'next/server'
import { mockItems, mockMyPortfolio } from '@/data/mockData'
import { TradeItem } from '@/types'

// Akıllı Çift Taraflı Eşleştirme Motoru (Bilateral Recommendation Engine)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const myItemId = searchParams.get('itemId') || mockMyPortfolio[0].id

  const myItem = mockMyPortfolio.find(i => i.id === myItemId) || mockMyPortfolio[0]

  // Algoritma:
  // 1. Karşı tarafın aradığı kategoriler benim eşyamın kategorisini kapsıyor mu?
  // 2. Benim aradığım kategoriler karşı tarafın eşyasının kategorisini kapsıyor mu?
  // 3. Teslimat yöntemi uyumlu mu (Elden veya Kargo)?
  const matches = mockItems.map(item => {
    let score = 0
    let reasons: string[] = []

    // Kriter 1: Karşı taraf benim eşyamın kategorisini istiyor mu?
    const theyWantMe = item.targetCategories.includes(myItem.category) || 
                       item.targetDescription.toLowerCase().includes(myItem.category)
    if (theyWantMe) {
      score += 40
      reasons.push('Karşı taraf sizin kategorinizdeki eşyaları arıyor')
    }

    // Kriter 2: Ben karşı tarafın eşyasının kategorisini istiyor muyum?
    const iWantThem = myItem.targetCategories.includes(item.category) || 
                      myItem.targetDescription.toLowerCase().includes(item.category)
    if (iWantThem) {
      score += 40
      reasons.push('Siz bu kategorideki eşyaları arıyorsunuz')
    }

    // Kriter 3: Şehir / Konum uyumu
    if (item.city === myItem.city) {
      score += 10
      reasons.push('Aynı şehirdesiniz (Hızlı elden takas)')
    } else if (item.tradeMethod === 'CARGO_ONLY' || item.tradeMethod === 'BOTH') {
      score += 5
      reasons.push('Kargo ile takas mümkün')
    }

    // Kriter 4: Değer dengesi
    if (item.valueTier === myItem.valueTier) {
      score += 10
      reasons.push('Eşdeğer segment dengesi')
    }

    return {
      item,
      score,
      isMutualMatch: theyWantMe && iWantThem,
      reasons
    }
  }).sort((a, b) => b.score - a.score)

  return NextResponse.json({
    myItem,
    matches
  })
}

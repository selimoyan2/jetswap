import { SafeTradeZone } from '@/types'

export const SAFE_TRADE_ZONES: SafeTradeZone[] = [
  // İstanbul - Kadıköy
  {
    id: 'sz-ist-kadikoy-1',
    city: 'İstanbul',
    district: 'Kadıköy',
    name: 'Kadıköy Boğa Heykeli Meydanı & Zabıta Noktası',
    type: 'PUBLIC_SQUARE',
    address: 'Altıyol Meydanı, Boğa Heykeli Önü, Kadıköy / İstanbul',
    hasSecurityCameras: true,
    mapQuery: 'Kadıköy Boğa Heykeli İstanbul'
  },
  {
    id: 'sz-ist-kadikoy-2',
    city: 'İstanbul',
    district: 'Kadıköy',
    name: 'Tepe Nautilus AVM - Ana Güvenlik Girişi',
    type: 'MALL',
    address: 'Fatih Cad. No:1 Acıbadem, Kadıköy / İstanbul',
    hasSecurityCameras: true,
    mapQuery: 'Tepe Nautilus AVM Kadıköy'
  },
  {
    id: 'sz-ist-kadikoy-3',
    city: 'İstanbul',
    district: 'Kadıköy',
    name: 'Kadıköy Rıhtım Metro İstasyonu (Turnike Önü)',
    type: 'METRO',
    address: 'Kadıköy İskele Meydanı Metro Çıkışı, Kadıköy / İstanbul',
    hasSecurityCameras: true,
    mapQuery: 'Kadıköy Metro İstasyonu İstanbul'
  },
  // İstanbul - Beşiktaş
  {
    id: 'sz-ist-besiktas-1',
    city: 'İstanbul',
    district: 'Beşiktaş',
    name: 'Beşiktaş İskele Meydanı & Emniyet Noktası',
    type: 'PUBLIC_SQUARE',
    address: 'Sinanpaşa Mah. Beşiktaş Meydanı, Beşiktaş / İstanbul',
    hasSecurityCameras: true,
    mapQuery: 'Beşiktaş İskelesi İstanbul'
  },
  {
    id: 'sz-ist-besiktas-2',
    city: 'İstanbul',
    district: 'Beşiktaş',
    name: 'Zorlu Center - Metro Bağlantı Güvenlik Noktası',
    type: 'MALL',
    address: 'Levazım Mah. Koru Sok. No:2, Beşiktaş / İstanbul',
    hasSecurityCameras: true,
    mapQuery: 'Zorlu Center İstanbul'
  },
  // İstanbul - Şişli / Mecidiyeköy
  {
    id: 'sz-ist-sisli-1',
    city: 'İstanbul',
    district: 'Şişli',
    name: 'Cevahir AVM - Meydan Girişi',
    type: 'MALL',
    address: 'Büyükdere Cad. No:22 Şişli / İstanbul',
    hasSecurityCameras: true,
    mapQuery: 'Cevahir AVM Şişli İstanbul'
  },
  {
    id: 'sz-ist-sisli-2',
    city: 'İstanbul',
    district: 'Şişli',
    name: 'Mecidiyeköy Metro & Metrobüs Ortak Meydanı',
    type: 'METRO',
    address: 'Büyükdere Cad. Mecidiyeköy Meydanı, Şişli / İstanbul',
    hasSecurityCameras: true,
    mapQuery: 'Mecidiyeköy Metro İstasyonu'
  },
  // Ankara - Çankaya / Kızılay
  {
    id: 'sz-ank-cankaya-1',
    city: 'Ankara',
    district: 'Çankaya',
    name: 'Kızılay Metro İstasyonu Ortak Güvenlik Alanı',
    type: 'METRO',
    address: 'Atatürk Bulvarı Kızılay Meydanı, Çankaya / Ankara',
    hasSecurityCameras: true,
    mapQuery: 'Kızılay Metro İstasyonu Ankara'
  },
  {
    id: 'sz-ank-cankaya-2',
    city: 'Ankara',
    district: 'Çankaya',
    name: 'Ankamall AVM - Ana Giriş Meydanı',
    type: 'MALL',
    address: 'Gazi Mah. Mevlana Bulv. No:2, Yenimahalle / Ankara',
    hasSecurityCameras: true,
    mapQuery: 'ANKAmall Alışveriş Merkezi Ankara'
  },
  // İzmir - Konak / Alsancak
  {
    id: 'sz-izm-konak-1',
    city: 'İzmir',
    district: 'Konak',
    name: 'Alsancak Vapur İskelesi & Güvenlik Alanı',
    type: 'PUBLIC_SQUARE',
    address: 'Alsancak Mah. Atatürk Cad. Konak / İzmir',
    hasSecurityCameras: true,
    mapQuery: 'Alsancak İskelesi İzmir'
  },
  {
    id: 'sz-izm-konak-2',
    city: 'İzmir',
    district: 'Konak',
    name: 'Konak Meydanı & Saat Kulesi Zabıta Noktası',
    type: 'PUBLIC_SQUARE',
    address: 'Konak Meydanı, Konak / İzmir',
    hasSecurityCameras: true,
    mapQuery: 'İzmir Saat Kulesi Konak Meydanı'
  }
]

export function getSafeZonesForLocation(city: string, district?: string): SafeTradeZone[] {
  const matchCity = SAFE_TRADE_ZONES.filter(z => z.city.toLowerCase() === city.toLowerCase())
  if (district) {
    const matchDistrict = matchCity.filter(z => z.district.toLowerCase() === district.toLowerCase())
    if (matchDistrict.length > 0) return matchDistrict
  }
  return matchCity.length > 0 ? matchCity : SAFE_TRADE_ZONES.slice(0, 3)
}

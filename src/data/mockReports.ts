import { UserReport, UserSanction, ReportCategory, SanctionType } from '@/types'

export const INITIAL_MOCK_REPORTS: UserReport[] = [
  {
    id: 'rep-1',
    reporterId: 'usr_me',
    reporterName: 'Selim Yılmaz',
    reporterTrust: 94,
    reportedUserId: 'usr-bad-1',
    reportedUserName: 'Burak Demirtaş',
    reportedUserTrust: 62,
    itemId: 'item-88',
    itemTitle: 'iPhone 15 Pro 128GB Titanyum',
    category: 'CASH_DEMAND',
    details: 'Takas teklifinde "Gitarını istemiyorum, bana elden 32.000 TL nakit ver ya da IBAN atayım" diyerek platformun sıfır nakit takas kuralını açıkça ihlal etti. Israrla nakit para talep ediyor.',
    status: 'INQUIRY_SENT',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 saat önce
    adminInquiry: {
      question: 'Kullanıcının takas yerine sizden 32.000 TL nakit para veya IBAN ödemesi talep ettiğinize dair şikayeti bulunmaktadır. JetSwap sisteminde nakit takası kesinlikle yasaktır. Lütfen durumu ve sohbet bağlamını açıklayınız.',
      sentAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      deadlineHours: 24,
      deadlineDate: new Date(Date.now() + 3600000 * 21).toISOString(),
    }
  },
  {
    id: 'rep-2',
    reporterId: 'usr-3',
    reporterName: 'Elif Kaya',
    reporterTrust: 91,
    reportedUserId: 'usr-bad-2',
    reportedUserName: 'Murat Kara',
    reportedUserTrust: 54,
    itemId: 'item-92',
    itemTitle: 'AirPods Pro 2 ANC Kulaklık',
    category: 'FAKE_PRODUCT',
    details: 'İlanda orijinal Apple Türkiye garantili olduğu yazıyordu. Kadıköy güvenli noktada buluştuğumuzda kutu seri numarasının sahte olduğunu ve ses kalitesinin replika olduğunu fark ettim. Sorunca aceleyle uzaklaştı.',
    status: 'DEFENSE_RECEIVED',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 saat önce
    adminInquiry: {
      question: 'İlanınızdaki kulaklığın replika / sahte olduğuna ve güvenli takas noktasında bunu gizlemeye çalıştığınıza dair şikayet yapılmıştır. Orijinallik belgeniz / faturanız mevcut mudur?',
      sentAt: new Date(Date.now() - 3600000 * 16).toISOString(),
      deadlineHours: 24,
      deadlineDate: new Date(Date.now() + 3600000 * 8).toISOString(),
      response: 'Ürünü hediye olarak almıştım, sahte olduğunu bilmiyordum. Karşı taraf uyarınca takası iptal ettik ve ürünü ilandan kaldırdım. Kötü niyetim yoktu, faturası olmadığı için haklı olabilirler.',
      respondedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  },
  {
    id: 'rep-3',
    reporterId: 'usr-2',
    reporterName: 'Caner Demir',
    reporterTrust: 96,
    reportedUserId: 'usr-bad-3',
    reportedUserName: 'Yasin Çetin',
    reportedUserTrust: 48,
    category: 'NO_SHOW_SAFE_ZONE',
    details: 'Beşiktaş İskele Güvenli Takas Noktası için Cumartesi 14:00 olarak teyitleştik. Soğukta 45 dakika bekledim. Ne telefonlarıma yanıt verdi ne de mesaj attı. Sonradan mesaj atıp "uyuyakalmışım boşver" diyerek alay etti.',
    status: 'SANCTIONED',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    adminInquiry: {
      question: 'Güvenli takas noktasına gitmediğiniz ve karşı tarafı 45 dakika beklettiğiniz şikayet edilmiştir. Açıklamanız nedir?',
      sentAt: new Date(Date.now() - 3600000 * 44).toISOString(),
      deadlineHours: 24,
      deadlineDate: new Date(Date.now() - 3600000 * 20).toISOString(),
      response: 'Acil bir işim çıkmıştı yetişemedim.',
      respondedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    },
    sanction: {
      id: 'sanc-1',
      type: 'SUSPEND_7D',
      reason: 'Safe Zone randevusuna mazeretsiz gitmeme ve saygısız tutum',
      appliedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * (24 * 7 - 20)).toISOString(),
      appliedBy: 'Süperadmin (Güvenlik Ekibi)',
      jetTrustPenalty: 30,
      reportId: 'rep-3'
    }
  },
  {
    id: 'rep-4',
    reporterId: 'usr-4',
    reporterName: 'Deniz Yıldız',
    reporterTrust: 88,
    reportedUserId: 'usr-bad-4',
    reportedUserName: 'Volkan K.',
    reportedUserTrust: 50,
    category: 'ABUSIVE_BEHAVIOR',
    details: 'Takas teklifini reddettiğim için mesaj kutuma küfür ve hakaret dolu mesajlar yazdı. "Sen kimsin benim teklifimi reddediyorsun" diyerek tehdit etti.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 saat önce
  }
]

export const INITIAL_MOCK_SANCTIONS: UserSanction[] = [
  {
    id: 'sanc-1',
    type: 'SUSPEND_7D',
    reason: 'Safe Zone randevusuna mazeretsiz gitmeme ve saygısız tutum',
    appliedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * (24 * 7 - 20)).toISOString(),
    appliedBy: 'Süperadmin (Güvenlik Ekibi)',
    jetTrustPenalty: 30,
    reportId: 'rep-3'
  }
]

const STORAGE_KEY_REPORTS = 'jetswap_user_reports'
const STORAGE_KEY_SANCTIONS = 'jetswap_user_sanctions'

export function getStoredReports(): UserReport[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_REPORTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_MOCK_REPORTS))
      return INITIAL_MOCK_REPORTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_MOCK_REPORTS
  }
}

export function saveStoredReports(reports: UserReport[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports))
    window.dispatchEvent(new CustomEvent('jetswap_reports_updated', { detail: reports }))
  } catch (e) {
    console.error('Failed to save reports to localStorage:', e)
  }
}

export function getStoredSanctions(): UserSanction[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_SANCTIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SANCTIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SANCTIONS, JSON.stringify(INITIAL_MOCK_SANCTIONS))
      return INITIAL_MOCK_SANCTIONS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_MOCK_SANCTIONS
  }
}

export function saveStoredSanctions(sanctions: UserSanction[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_SANCTIONS, JSON.stringify(sanctions))
    window.dispatchEvent(new CustomEvent('jetswap_sanctions_updated', { detail: sanctions }))
  } catch (e) {
    console.error('Failed to save sanctions to localStorage:', e)
  }
}

export function createReport(data: {
  reporterId: string
  reporterName: string
  reporterTrust?: number
  reportedUserId: string
  reportedUserName: string
  reportedUserTrust?: number
  itemId?: string
  itemTitle?: string
  category: ReportCategory
  details: string
}): UserReport {
  const newReport: UserReport = {
    id: `rep-${Date.now()}`,
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }

  const reports = getStoredReports()
  const updated = [newReport, ...reports]
  saveStoredReports(updated)
  return newReport
}

export function sendAdminInquiry(reportId: string, question: string, deadlineHours: number = 24): UserReport | null {
  const reports = getStoredReports()
  const idx = reports.findIndex(r => r.id === reportId)
  if (idx === -1) return null

  const updatedReport: UserReport = {
    ...reports[idx],
    status: 'INQUIRY_SENT',
    adminInquiry: {
      question,
      sentAt: new Date().toISOString(),
      deadlineHours,
      deadlineDate: new Date(Date.now() + deadlineHours * 3600000).toISOString()
    }
  }

  reports[idx] = updatedReport
  saveStoredReports(reports)
  return updatedReport
}

export function submitUserDefense(reportId: string, response: string): UserReport | null {
  const reports = getStoredReports()
  const idx = reports.findIndex(r => r.id === reportId)
  if (idx === -1) return null

  const existingInquiry = reports[idx].adminInquiry
  const updatedReport: UserReport = {
    ...reports[idx],
    status: 'DEFENSE_RECEIVED',
    adminInquiry: existingInquiry ? {
      ...existingInquiry,
      response,
      respondedAt: new Date().toISOString()
    } : {
      question: 'Yönetici inceleme sorusu',
      sentAt: new Date().toISOString(),
      deadlineHours: 24,
      deadlineDate: new Date().toISOString(),
      response,
      respondedAt: new Date().toISOString()
    }
  }

  reports[idx] = updatedReport
  saveStoredReports(reports)
  return updatedReport
}

export function applyUserSanction(
  reportId: string,
  type: SanctionType,
  reason: string,
  durationHours?: number,
  jetTrustPenalty: number = 15
): UserReport | null {
  const reports = getStoredReports()
  const idx = reports.findIndex(r => r.id === reportId)
  if (idx === -1) return null

  const report = reports[idx]
  const expiresAt = durationHours ? new Date(Date.now() + durationHours * 3600000).toISOString() : undefined

  const newSanction: UserSanction = {
    id: `sanc-${Date.now()}`,
    type,
    reason,
    appliedAt: new Date().toISOString(),
    expiresAt,
    appliedBy: 'Süperadmin',
    jetTrustPenalty,
    reportId
  }

  const updatedReport: UserReport = {
    ...report,
    status: 'SANCTIONED',
    sanction: newSanction
  }

  reports[idx] = updatedReport
  saveStoredReports(reports)

  const sanctions = getStoredSanctions()
  saveStoredSanctions([newSanction, ...sanctions])

  return updatedReport
}

export function dismissReport(reportId: string, adminNotes?: string): UserReport | null {
  const reports = getStoredReports()
  const idx = reports.findIndex(r => r.id === reportId)
  if (idx === -1) return null

  const updatedReport: UserReport = {
    ...reports[idx],
    status: 'DISMISSED',
    adminNotes
  }

  reports[idx] = updatedReport
  saveStoredReports(reports)
  return updatedReport
}

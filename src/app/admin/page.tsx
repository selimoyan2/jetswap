'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShieldAlert, Users, Package, ArrowLeftRight, CheckCircle2, 
  DollarSign, BarChart3, Settings, Ban, Flag, Star, Search, 
  ExternalLink, ArrowLeft, RefreshCw, Eye, AlertTriangle, Radio,
  FolderTree, ChevronRight, Layers, Plus, Lock, LogOut, EyeOff, ShieldCheck, KeyRound,
  MessageSquare, Send, Clock, HelpCircle, Gavel, X, AlertCircle, Shield, Filter
} from 'lucide-react'
import { mockItems, mockCurrentUser, categories } from '@/data/mockData'
import { UserReport, ReportCategory, ReportStatus, SanctionType, UserSanction } from '@/types'
import { 
  getStoredReports, 
  sendAdminInquiry, 
  applyUserSanction, 
  dismissReport 
} from '@/data/mockReports'

export default function AdminPage() {
  // Superadmin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [adminUser, setAdminUser] = useState<{ username: string; role: string } | null>(null)
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    error: '',
    isSubmitting: false,
    showPassword: false,
  })

  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'categories' | 'users' | 'listings' | 'moderation'>('overview')

  // Check admin session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/verify')
        const data = await res.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          setAdminUser(data.user)
        } else {
          setIsAuthenticated(false)
        }
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginForm(prev => ({ ...prev, error: '', isSubmitting: true }))

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password.trim(),
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)
        setAdminUser(data.admin)
        setLoginForm({
          username: '',
          password: '',
          error: '',
          isSubmitting: false,
          showPassword: false,
        })
      } else {
        setLoginForm(prev => ({
          ...prev,
          error: data.message || 'Geçersiz kullanıcı adı veya şifre.',
          isSubmitting: false,
        }))
      }
    } catch {
      setLoginForm(prev => ({
        ...prev,
        error: 'Sunucuya bağlanırken bir hata oluştu.',
        isSubmitting: false,
      }))
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    setIsAuthenticated(false)
    setAdminUser(null)
  }

  // Ad Settings State
  const [adsensePublisherId, setAdsensePublisherId] = useState('ca-pub-1234567890123456')
  const [leaderboardSlot, setLeaderboardSlot] = useState('slot_leaderboard_top')
  const [inFeedSlot, setInFeedSlot] = useState('slot_in_feed_grid')
  const [isAdsEnabled, setIsAdsEnabled] = useState(true)
  const [adsSaved, setAdsSaved] = useState(false)

  // Selected Category for inspector
  const [selectedCatSlug, setSelectedCatSlug] = useState<string>(categories[0].slug)

  // Reports & Moderation State
  const [reports, setReports] = useState<UserReport[]>([])
  const [reportFilter, setReportFilter] = useState<'ALL' | ReportStatus>('ALL')
  const [inquiryModalReport, setInquiryModalReport] = useState<UserReport | null>(null)
  const [inquiryQuestion, setInquiryQuestion] = useState('')
  const [inquiryDeadlineHours, setInquiryDeadlineHours] = useState<number>(24)
  const [sanctionModalReport, setSanctionModalReport] = useState<UserReport | null>(null)
  const [sanctionType, setSanctionType] = useState<SanctionType>('SUSPEND_24H')
  const [sanctionReason, setSanctionReason] = useState('')
  const [sanctionDurationHours, setSanctionDurationHours] = useState<number>(24)
  const [sanctionPenalty, setSanctionPenalty] = useState<number>(15)

  useEffect(() => {
    setReports(getStoredReports())
    const handleUpdate = () => {
      setReports(getStoredReports())
    }
    window.addEventListener('jetswap_reports_updated', handleUpdate)
    return () => window.removeEventListener('jetswap_reports_updated', handleUpdate)
  }, [])

  const INQUIRY_TEMPLATES = [
    {
      title: 'Nakit Para Talebi İhlali',
      text: 'Takas teklifinde karşı taraftan nakit para, elden ödeme veya IBAN havalesi talep ettiğinize dair şikayet alınmıştır. JetSwap sıfır nakit kuralı gereği lütfen savunmanızı iletiniz.'
    },
    {
      title: 'Güvenli Noktaya / Randevuya Gelmeme',
      text: 'Belirlenen Güvenli Takas Noktası (Safe Trade Zone) randevusuna mazeretsiz olarak katılmadığınız ve karşı tarafı mağdur ettiğiniz şikayet edilmiştir. Durumu izah ediniz.'
    },
    {
      title: 'Sahte / Kusurlu / Yanıltıcı Ürün',
      text: 'İlanınızdaki ürünün orijinal olmadığı veya gizlenmiş ağır kusurları bulunduğu iddia edilmektedir. Ürünün orijinalliği ve faturasına dair savunmanızı gönderiniz.'
    },
    {
      title: 'Kaba / Tehditkar / Uygunsuz Davranış',
      text: 'Mesajlaşma esnasında platform nezaket kurallarına aykırı, kaba veya tehditkar ifadeler kullandığınız raporlanmıştır. Açıklamanız nedir?'
    }
  ]

  const handleOpenInquiryModal = (report: UserReport) => {
    setInquiryModalReport(report)
    if (report.category === 'CASH_DEMAND') {
      setInquiryQuestion(INQUIRY_TEMPLATES[0].text)
    } else if (report.category === 'NO_SHOW_SAFE_ZONE') {
      setInquiryQuestion(INQUIRY_TEMPLATES[1].text)
    } else if (report.category === 'FAKE_PRODUCT' || report.category === 'DEFECTIVE_ITEM') {
      setInquiryQuestion(INQUIRY_TEMPLATES[2].text)
    } else if (report.category === 'ABUSIVE_BEHAVIOR') {
      setInquiryQuestion(INQUIRY_TEMPLATES[3].text)
    } else {
      setInquiryQuestion('Hakkınızda bildirilen kural ihlali ile ilgili lütfen savunmanızı ve açıklamanızı iletiniz.')
    }
    setInquiryDeadlineHours(24)
  }

  const handleSendInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryModalReport || !inquiryQuestion.trim()) return

    sendAdminInquiry(inquiryModalReport.id, inquiryQuestion.trim(), inquiryDeadlineHours)
    setInquiryModalReport(null)
    setInquiryQuestion('')
  }

  const handleOpenSanctionModal = (report: UserReport) => {
    setSanctionModalReport(report)
    if (report.category === 'CASH_DEMAND') {
      setSanctionType('SUSPEND_24H')
      setSanctionReason('Sıfır nakit kuralı ihlali: Karşı taraftan nakit/para talep etme')
      setSanctionDurationHours(24)
      setSanctionPenalty(20)
    } else if (report.category === 'FRAUD_ATTEMPT' || report.category === 'FORBIDDEN_ITEM') {
      setSanctionType('PERMANENT_BAN')
      setSanctionReason('Kritik platform ihlali: Dolandırıcılık veya yasaklı madde')
      setSanctionDurationHours(0)
      setSanctionPenalty(100)
    } else if (report.category === 'NO_SHOW_SAFE_ZONE') {
      setSanctionType('SUSPEND_7D')
      setSanctionReason('Güvenli nokta randevusuna mazeretsiz gelmeme ve takasçıyı bekletme')
      setSanctionDurationHours(168)
      setSanctionPenalty(30)
    } else {
      setSanctionType('WARNING')
      setSanctionReason('Topluluk kurallarına aykırı davranış bildirimi')
      setSanctionDurationHours(0)
      setSanctionPenalty(15)
    }
  }

  const handleApplySanctionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sanctionModalReport) return

    applyUserSanction(
      sanctionModalReport.id,
      sanctionType,
      sanctionReason,
      sanctionDurationHours > 0 ? sanctionDurationHours : undefined,
      sanctionPenalty
    )

    setUsers(prev => prev.map(u => {
      if (u.id === sanctionModalReport.reportedUserId || u.name === sanctionModalReport.reportedUserName) {
        return {
          ...u,
          status: sanctionType === 'PERMANENT_BAN' ? 'BANNED' : 'SUSPENDED',
          jetTrust: Math.max(0, u.jetTrust - sanctionPenalty)
        }
      }
      return u
    }))

    setSanctionModalReport(null)
    setSanctionReason('')
  }

  const handleDismiss = (reportId: string) => {
    dismissReport(reportId, 'Yönetici incelemesi sonucu asılsız veya çözülmüş kabul edildi.')
  }

  // Mock Users List
  const [users, setUsers] = useState([
    { id: '1', name: 'Selim Yılmaz', email: 'selim@jetswap.com.tr', jetTrust: 94, verified: true, swaps: 27, status: 'ACTIVE' },
    { id: '2', name: 'Caner Demir', email: 'caner@example.com', jetTrust: 96, verified: true, swaps: 18, status: 'ACTIVE' },
    { id: '3', name: 'Elif Kaya', email: 'elif@example.com', jetTrust: 91, verified: true, swaps: 12, status: 'ACTIVE' },
    { id: 'usr-bad-1', name: 'Burak Demirtaş', email: 'burak@example.com', jetTrust: 62, verified: false, swaps: 3, status: 'IN_REVIEW' },
    { id: '4', name: 'Şüpheli Kullanıcı', email: 'spam@botmail.com', jetTrust: 42, verified: false, swaps: 0, status: 'SUSPENDED' },
  ])

  const handleSaveAds = (e: React.FormEvent) => {
    e.preventDefault()
    setAdsSaved(true)
    setTimeout(() => setAdsSaved(false), 3000)
  }

  const toggleUserVerification = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: !u.verified, jetTrust: u.verified ? u.jetTrust - 10 : u.jetTrust + 10 } : u))
  }

  const activeCategoryObj = categories.find(c => c.slug === selectedCatSlug) || categories[0]

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-black text-lg animate-pulse mb-4 shadow-xl">
          SA
        </div>
        <p className="text-xs font-semibold text-zinc-400">Yönetici oturumu kontrol ediliyor...</p>
      </div>
    )
  }

  // Superadmin Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-2xl shadow-xl shadow-red-900/30 mb-4 ring-4 ring-red-500/20">
              SA
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">JetSwap Süperadmin</h1>
            <p className="text-xs text-zinc-400 mt-1.5 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Güvenli Yönetim & Moderasyon Portalı</span>
            </p>
          </div>

          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
            <form onSubmit={handleLogin} className="space-y-5">
              {loginForm.error && (
                <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginForm.error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Yönetici Kullanıcı Adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="admin veya e-posta"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Yönetici Şifresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={loginForm.showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {loginForm.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginForm.isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loginForm.isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Doğrulanıyor...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Süperadmin Girişi Yap</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Bu yönetim alanı yalnızca yetkili sistem yöneticileri içindir. Tüm erişim denemeleri loglanmaktadır.
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>JetSwap Ana Sayfasına Dön</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      {/* Superadmin Top Navigation */}
      <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mr-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Siteye Dön</span>
            </Link>
            <div className="h-5 w-px bg-zinc-800" />
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              SA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-tight">JetSwap Süperadmin</span>
                <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/40 px-2 py-0.2 rounded-full font-bold uppercase">
                  Yönetim Konsolu
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Trafik, Kategori Ağacı, Moderasyon ve Google Ads Merkezi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Süperadmin: {adminUser?.username || 'admin'}
              </div>
              <span className="text-[10px] text-zinc-400">Hostinger VPS • Coolify Standalone</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-xs"
              title="Oturumu Kapat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-zinc-200 sticky top-16 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Genel Bakış & Gelir</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'categories' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>Kategoriler & Alt Kategoriler ({categories.length} / {categories.reduce((acc, c) => acc + c.subCategories.length, 0)})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ads' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>Google Ads Yönetimi</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'moderation' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Şikayetler & Moderasyon</span>
            {reports.filter(r => r.status === 'PENDING' || r.status === 'DEFENSE_RECEIVED').length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {reports.filter(r => r.status === 'PENDING' || r.status === 'DEFENSE_RECEIVED').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kullanıcılar & JetTrust</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'listings' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>İlanlar ({mockItems.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* TAB: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FolderTree className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-black text-zinc-900">Hiyerarşik Kategori & Alt Kategori Ağacı</h3>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  JetMatch eşleştirme motorunun ve ilan arama motorunun kullandığı hiyerarşik yapı.
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                10 Ana Kategori • 36 Alt Kategori
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              {/* Left column: Main Categories */}
              <div className="md:col-span-5 space-y-2 border-r border-zinc-100 pr-0 md:pr-4">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-2">
                  Ana Kategoriler
                </span>
                {categories.map(c => {
                  const isSelected = selectedCatSlug === c.slug
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCatSlug(c.slug)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-xs">{c.nameTr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-white text-zinc-600 border border-zinc-200'
                        }`}>
                          {c.subCategories.length} Alt Kategori
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-60" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right column: Selected Category's Subcategories */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    "{activeCategoryObj.nameTr}" Alt Kategorileri
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Toplam {activeCategoryObj.count} Takaslık Eşya</span>
                </div>

                <div className="space-y-2.5">
                  {activeCategoryObj.subCategories.map(sub => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between hover:border-emerald-400 transition-colors"
                    >
                      <div>
                        <h4 className="font-extrabold text-sm text-zinc-900">{sub.nameTr}</h4>
                        <span className="text-[11px] text-zinc-500 font-mono">slug: {sub.slug} • {sub.nameEn}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                          {sub.count || 0} İlan
                        </span>
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-xl">
                          JetMatch Aktif
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Aylık Ziyaretçi</span>
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-zinc-900">42,850</div>
                <span className="text-[11px] text-emerald-600 font-bold mt-1 block">↑ %24 Organik Artış</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Aktif Takaslık İlan</span>
                  <Package className="w-5 h-5 text-teal-600" />
                </div>
                <div className="text-3xl font-black text-zinc-900">1,240</div>
                <span className="text-[11px] text-zinc-500 font-medium mt-1 block">10 Kategoride Aktif</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Tamamlanan Takas</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-zinc-900">318</div>
                <span className="text-[11px] text-emerald-700 font-bold mt-1 block">0 ₺ Para Akışı (Saf Takas)</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Tahmini Reklam Geliri</span>
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-zinc-900">₺18,450</div>
                <span className="text-[11px] text-amber-600 font-bold mt-1 block">Google AdSense Trafiğinden</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/30 uppercase">
                  Stratejik Büyüme Modeli
                </div>
                <h3 className="text-2xl font-black text-white">
                  Sıfır Komisyon, Yüksek Trafik ve Maksimum Reklam Verimi
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                  JetSwap üzerinde kullanıcılardan hiçbir zaman takas veya ürün satışı için para alınmaz. 
                  Bu durum siteyi yüksek ilgi gören bir <strong>cazibe merkezi</strong> haline getirir. 
                  Oluşan yoğun ve nitelikli ziyaretçi kitlesi, ziyaretçiyi sıkmayacak biçimde yerleştirilen 
                  <strong> Google AdSense banner alanları</strong> üzerinden yüksek reklam geliri (RPM) üretir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE ADS SETTINGS */}
        {activeTab === 'ads' && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black text-zinc-900">Google AdSense Entegrasyonu & Reklam Alanları</h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Ön yüzde ziyaretçinin akışını ve kullanıcı deneyimini bozmayacak reklam yuvalarını buradan yönetebilirsiniz.
              </p>
            </div>

            {adsSaved && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <strong>Reklam ayarları başarıyla kaydedildi ve ön yüze uygulandı!</strong>
              </div>
            )}

            <form onSubmit={handleSaveAds} className="space-y-5 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div>
                  <strong className="text-xs font-bold text-zinc-900 block">Sitede Reklamları Göster</strong>
                  <span className="text-[11px] text-zinc-500">Kapalı duruma getirilirse tüm Google Ads yuvaları gizlenir.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdsEnabled}
                    onChange={e => setIsAdsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Google AdSense Publisher / Client ID
                </label>
                <input
                  type="text"
                  required
                  value={adsensePublisherId}
                  onChange={e => setAdsensePublisherId(e.target.value)}
                  placeholder="ca-pub-1234567890123456"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Google AdSense hesabınızdaki yayıncı kimliğiniz.</span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  1. Üst Leaderboard Slot ID (728x90 / Responsive)
                </label>
                <input
                  type="text"
                  value={leaderboardSlot}
                  onChange={e => setLeaderboardSlot(e.target.value)}
                  placeholder="1234567890"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Hero bölümünün altında doğal geçiş alanı.</span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  2. İlanlar Arası Doğal (Native In-Feed) Slot ID
                </label>
                <input
                  type="text"
                  value={inFeedSlot}
                  onChange={e => setInFeedSlot(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">Takas ilanları akışında 4. ilandan sonra organik olarak görünür.</span>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Reklam Ayarlarını Kaydet
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: COMPLAINTS & MODERATION */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>Şikayet & Topluluk Moderasyon Merkezi</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Kullanıcı şikayetlerini inceleyin, savunma / açıklama talep edin ve süreli yaptırımlar uygulayın.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500">Toplam Dosya: {reports.length}</span>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full">
                  {reports.filter(r => r.status === 'PENDING' || r.status === 'DEFENSE_RECEIVED').length} İşlem Bekliyor
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'Tümü', count: reports.length },
                { id: 'PENDING', label: 'İnceleme Bekliyor', count: reports.filter(r => r.status === 'PENDING').length },
                { id: 'INQUIRY_SENT', label: 'Savunma Bekleniyor', count: reports.filter(r => r.status === 'INQUIRY_SENT').length },
                { id: 'DEFENSE_RECEIVED', label: 'Savunma Geldi', count: reports.filter(r => r.status === 'DEFENSE_RECEIVED').length },
                { id: 'SANCTIONED', label: 'Yaptırımlı', count: reports.filter(r => r.status === 'SANCTIONED').length },
                { id: 'DISMISSED', label: 'Kapatılanlar', count: reports.filter(r => r.status === 'DISMISSED').length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setReportFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    reportFilter === f.id 
                      ? 'bg-zinc-900 text-white shadow-xs' 
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    reportFilter === f.id ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {reports
                .filter(r => reportFilter === 'ALL' || r.status === reportFilter)
                .map(report => {
                  const isPending = report.status === 'PENDING'
                  const isInquirySent = report.status === 'INQUIRY_SENT'
                  const isDefenseReceived = report.status === 'DEFENSE_RECEIVED'
                  const isSanctioned = report.status === 'SANCTIONED'
                  const isDismissed = report.status === 'DISMISSED'

                  return (
                    <div 
                      key={report.id} 
                      className={`p-5 rounded-2xl border transition-all space-y-4 ${
                        isDefenseReceived
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : isSanctioned
                          ? 'border-red-200 bg-red-50/10'
                          : isInquirySent
                          ? 'border-amber-200 bg-amber-50/10'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-zinc-400">#{report.id}</span>
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-red-100 text-red-800">
                            {report.category}
                          </span>
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            isDefenseReceived 
                              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400 animate-pulse'
                              : isInquirySent
                              ? 'bg-amber-100 text-amber-800'
                              : isSanctioned
                              ? 'bg-rose-100 text-rose-800'
                              : isDismissed
                              ? 'bg-zinc-100 text-zinc-500'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isDefenseReceived && 'Savunma Geldi (İnceleyiniz)'}
                            {isInquirySent && 'Savunma Bekleniyor'}
                            {isSanctioned && 'Yaptırım Uygulandı'}
                            {isDismissed && 'Kapatıldı / Asılsız'}
                            {isPending && 'Yeni İnceleme'}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {new Date(report.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>

                      {/* Involved Parties */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Şikayet Eden (Bildiren)</span>
                          <div className="font-bold text-zinc-900 mt-0.5 flex items-center gap-2">
                            <span>{report.reporterName}</span>
                            {report.reporterTrust !== undefined && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 rounded">
                                JT: {report.reporterTrust}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Şikayet Edilen (Sanık)</span>
                          <div className="font-bold text-red-700 mt-0.5 flex items-center gap-2">
                            <span>{report.reportedUserName}</span>
                            {report.reportedUserTrust !== undefined && (
                              <span className="text-[10px] bg-red-100 text-red-800 font-black px-1.5 rounded">
                                JT: {report.reportedUserTrust}
                              </span>
                            )}
                          </div>
                          {report.itemTitle && (
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              İlan: <strong>{report.itemTitle}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Statement */}
                      <div className="text-xs space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Şikayet Gerekçesi ve İddia:</span>
                        <div className="p-3.5 rounded-xl bg-zinc-100 text-zinc-800 leading-relaxed font-medium">
                          "{report.details}"
                        </div>
                      </div>

                      {/* Admin Inquiry & Defense Box */}
                      {report.adminInquiry && (
                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4 text-amber-600" />
                              <span>Yönetici Soru & Savunma Talebi:</span>
                            </span>
                            <span className="text-[10px] text-amber-700 font-semibold">
                              Süre: {report.adminInquiry.deadlineHours} Saat • Gönderim: {new Date(report.adminInquiry.sentAt).toLocaleTimeString('tr-TR')}
                            </span>
                          </div>

                          <p className="text-amber-950 font-medium bg-white/80 p-2.5 rounded-lg border border-amber-200">
                            {report.adminInquiry.question}
                          </p>

                          {/* Response if submitted */}
                          {report.adminInquiry.response ? (
                            <div className="pt-2 border-t border-amber-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Kullanıcının Savunması:</span>
                                </span>
                                {report.adminInquiry.respondedAt && (
                                  <span className="text-[10px] text-zinc-400">
                                    {new Date(report.adminInquiry.respondedAt).toLocaleString('tr-TR')}
                                  </span>
                                )}
                              </div>
                              <p className="text-zinc-800 bg-white p-3 rounded-lg border border-emerald-200 font-medium italic">
                                "{report.adminInquiry.response}"
                              </p>
                            </div>
                          ) : (
                            <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              <span>Kullanıcıdan savunma yanıtı bekleniyor...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sanction Box if applied */}
                      {report.sanction && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-red-900 flex items-center gap-1.5">
                              <Gavel className="w-4 h-4 text-red-600" />
                              <span>Uygulanan Yaptırım: {report.sanction.type}</span>
                            </span>
                            <span className="text-[10px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded">
                              -{report.sanction.jetTrustPenalty} JetTrust
                            </span>
                          </div>
                          <p className="text-red-800 font-medium">
                            <strong>Gerekçe:</strong> {report.sanction.reason}
                          </p>
                          {report.sanction.expiresAt && (
                            <p className="text-[11px] text-red-700">
                              <strong>Bitiş Tarihi:</strong> {new Date(report.sanction.expiresAt).toLocaleString('tr-TR')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons Toolbar */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                        {!isSanctioned && !isDismissed && (
                          <>
                            <button
                              onClick={() => handleOpenInquiryModal(report)}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>{report.adminInquiry ? 'Tekrar Soru Sor' : 'Savunma İste (Soru Sor)'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenSanctionModal(report)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            >
                              <Gavel className="w-3.5 h-3.5" />
                              <span>Yaptırım Uygula</span>
                            </button>

                            <button
                              onClick={() => handleDismiss(report.id)}
                              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors"
                            >
                              {isDefenseReceived ? 'Savunmayı Onayla & Kapat' : 'Şikayeti Düşür (Asılsız)'}
                            </button>
                          </>
                        )}

                        {isDismissed && (
                          <span className="text-xs text-zinc-400 font-bold">
                            Dosya kapatıldı.
                          </span>
                        )}

                        {isSanctioned && (
                          <span className="text-xs text-red-600 font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Yaptırım Yürürlükte
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

              {reports.filter(r => reportFilter === 'ALL' || r.status === reportFilter).length === 0 && (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  Bu filtreye ait şikayet dosyası bulunamadı.
                </div>
              )}
            </div>
          </div>
        )}

        {/* INQUIRY MODAL (ADMIN ASKS QUESTION) */}
        {inquiryModalReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200">
              <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Kullanıcıya Soru Sor & Savunma Talep Et</h3>
                </div>
                <button
                  onClick={() => setInquiryModalReport(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendInquirySubmit} className="p-6 space-y-4">
                <div className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  Şikayet Edilen: <strong>{inquiryModalReport.reportedUserName}</strong> • Konu: <strong>{inquiryModalReport.category}</strong>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Hazır Soru Şablonları
                  </label>
                  <select
                    onChange={e => {
                      if (e.target.value) setInquiryQuestion(e.target.value)
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 cursor-pointer mb-2"
                  >
                    <option value="">Şablondan Seçiniz (İsteğe Bağlı)...</option>
                    {INQUIRY_TEMPLATES.map((tmpl, i) => (
                      <option key={i} value={tmpl.text}>{tmpl.title}</option>
                    ))}
                  </select>

                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Kullanıcıya İletilecek Soru
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryQuestion}
                    onChange={e => setInquiryQuestion(e.target.value)}
                    placeholder="Kullanıcıdan açıklamasını istediğiniz detayları yazın..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Savunma İçin Tanınan Süre
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[24, 48, 72].map(hours => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setInquiryDeadlineHours(hours)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          inquiryDeadlineHours === hours
                            ? 'border-amber-600 bg-amber-50 text-amber-900'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {hours} Saat
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setInquiryModalReport(null)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Soruyu Gönder & Bildir</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SANCTION MODAL (ADMIN APPLIES SANCTION) */}
        {sanctionModalReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200">
              <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Disiplin & Yaptırım Uygula</h3>
                </div>
                <button
                  onClick={() => setSanctionModalReport(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplySanctionSubmit} className="p-6 space-y-4">
                <div className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  Cezalandırılacak Kullanıcı: <strong>{sanctionModalReport.reportedUserName}</strong>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Yaptırım Türü
                  </label>
                  <div className="space-y-2">
                    {[
                      { type: 'WARNING', label: 'Resmi İkaz (Sarı Kart)', penalty: 15, hours: 0, desc: 'Profil puanı kırılır (-15 JetTrust)' },
                      { type: 'SUSPEND_24H', label: '24 Saatlik Takas Dondurma', penalty: 20, hours: 24, desc: '24 saat boyunca yeni teklif veremez' },
                      { type: 'SUSPEND_7D', label: '7 Günlük Askıya Alma', penalty: 30, hours: 168, desc: '1 hafta boyunca sistem erişimi askıya alınır (-30 JT)' },
                      { type: 'FREEZE_30D', label: '30 Günlük Hesap Dondurma', penalty: 50, hours: 720, desc: 'Ağır ihlallerde 1 ay kısıtlama' },
                      { type: 'PERMANENT_BAN', label: 'Kalıcı Men / Kırmızı Kart', penalty: 100, hours: 0, desc: 'Hesap kalıcı kapatılır, tüm ilanlar silinir' },
                    ].map(opt => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setSanctionType(opt.type as SanctionType)
                          setSanctionDurationHours(opt.hours)
                          setSanctionPenalty(opt.penalty)
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                          sanctionType === opt.type
                            ? 'border-red-600 bg-red-50 ring-1 ring-red-500'
                            : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                          <div className="text-[11px] text-zinc-500">{opt.desc}</div>
                        </div>
                        <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded shrink-0">
                          -{opt.penalty} JT
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Yaptırım Gerekçesi (Kullanıcıya Gösterilecek)
                  </label>
                  <textarea
                    rows={3}
                    value={sanctionReason}
                    onChange={e => setSanctionReason(e.target.value)}
                    placeholder="Uygulanan yaptırımın gerekçesini yazınız..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setSanctionModalReport(null)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Yaptırımı Onayla & Uygula</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & JETTRUST */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-black text-zinc-900">Kullanıcı Yönetimi & JetTrust Doğrulamaları</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Kullanıcı</th>
                    <th className="pb-3">E-posta</th>
                    <th className="pb-3">JetTrust</th>
                    <th className="pb-3">Doğrulanmış (Verified)</th>
                    <th className="pb-3">Takaslar</th>
                    <th className="pb-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50">
                      <td className="py-3 font-bold text-zinc-900">{u.name}</td>
                      <td className="py-3 text-zinc-600 font-mono">{u.email}</td>
                      <td className="py-3">
                        <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {u.jetTrust}/100
                        </span>
                      </td>
                      <td className="py-3">
                        {u.verified ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Doğrulanmış
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-medium">Doğrulanmamış</span>
                        )}
                      </td>
                      <td className="py-3 font-bold text-zinc-800">{u.swaps} Takas</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => toggleUserVerification(u.id)}
                          className="text-xs text-emerald-700 hover:underline font-bold"
                        >
                          {u.verified ? 'Doğrulamayı Kaldır' : 'Doğrula (Verified Yap)'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LISTINGS */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-black text-zinc-900">Sistemdeki Aktif Takas İlanları</h3>
            <div className="space-y-3">
              {mockItems.map(item => (
                <div key={item.id} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">
                        {item.user.name} • Alt Kategori: {item.subCategory} • Aradığı: {item.targetDescription}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md">
                    Yayında
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

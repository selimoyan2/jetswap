'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShieldAlert, Users, Package, ArrowLeftRight, CheckCircle2, 
  DollarSign, BarChart3, Settings, Ban, Flag, Star, Search, 
  ExternalLink, ArrowLeft, RefreshCw, Eye, AlertTriangle, Radio,
  FolderTree, ChevronRight, Layers, Plus
} from 'lucide-react'
import { mockItems, mockCurrentUser, categories } from '@/data/mockData'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'categories' | 'users' | 'listings' | 'moderation'>('overview')

  // Ad Settings State
  const [adsensePublisherId, setAdsensePublisherId] = useState('ca-pub-1234567890123456')
  const [leaderboardSlot, setLeaderboardSlot] = useState('slot_leaderboard_top')
  const [inFeedSlot, setInFeedSlot] = useState('slot_in_feed_grid')
  const [isAdsEnabled, setIsAdsEnabled] = useState(true)
  const [adsSaved, setAdsSaved] = useState(false)

  // Selected Category for inspector
  const [selectedCatSlug, setSelectedCatSlug] = useState<string>(categories[0].slug)

  // Moderation items
  const [modQueue, setModQueue] = useState([
    {
      id: 'm-1',
      title: 'iPhone 15 Pro 128GB',
      user: 'Ahmet Yılmaz',
      category: 'Telefon',
      issue: 'Açıklamada "25.000 TL nakit" para ifadesi yakalandı',
      type: 'CASH_VIOLATION',
      priority: 'YÜKSEK',
      date: '12 dakika önce'
    },
    {
      id: 'm-2',
      title: 'AirPods Pro 2 Sahte Taklit',
      user: 'Bilinmeyen_99',
      category: 'Elektronik',
      issue: 'Kullanıcılar tarafından sahte ürün şikayeti yapıldı (3 bildirim)',
      type: 'FAKE_PRODUCT',
      priority: 'KRİTİK',
      date: '35 dakika önce'
    }
  ])

  // Mock Users List
  const [users, setUsers] = useState([
    { id: '1', name: 'Selim Yılmaz', email: 'selim@jetswap.com.tr', jetTrust: 94, verified: true, swaps: 27, status: 'ACTIVE' },
    { id: '2', name: 'Caner Demir', email: 'caner@example.com', jetTrust: 96, verified: true, swaps: 18, status: 'ACTIVE' },
    { id: '3', name: 'Elif Kaya', email: 'elif@example.com', jetTrust: 91, verified: true, swaps: 12, status: 'ACTIVE' },
    { id: '4', name: 'Şüpheli Kullanıcı', email: 'spam@botmail.com', jetTrust: 42, verified: false, swaps: 0, status: 'SUSPENDED' },
  ])

  const handleSaveAds = (e: React.FormEvent) => {
    e.preventDefault()
    setAdsSaved(true)
    setTimeout(() => setAdsSaved(false), 3000)
  }

  const handleResolveModeration = (id: string, action: 'REMOVE' | 'APPROVE') => {
    setModQueue(prev => prev.filter(item => item.id !== id))
  }

  const toggleUserVerification = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: !u.verified, jetTrust: u.verified ? u.jetTrust - 10 : u.jetTrust + 10 } : u))
  }

  const activeCategoryObj = categories.find(c => c.slug === selectedCatSlug) || categories[0]

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
              <span className="text-xs font-bold text-emerald-400 block flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Sistem Çevrimiçi
              </span>
              <span className="text-[10px] text-zinc-500">Hostinger VPS • Coolify Standalone</span>
            </div>
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
            <span>Kategoriler & Alt Kategoriler (10 / 36)</span>
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
            <span>Moderasyon Kuyruğu</span>
            {modQueue.length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {modQueue.length}
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

        {/* TAB 3: MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>Aktif Moderasyon & Şikayet Kuyruğu</span>
                </h3>
                <p className="text-xs text-zinc-500">Para talebi, ahlaka aykırı ürün veya sahte ilan bildirimleri</p>
              </div>
              <span className="text-xs bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full">
                {modQueue.length} İncelenecek İlan
              </span>
            </div>

            <div className="space-y-3">
              {modQueue.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        item.priority === 'KRİTİK' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-zinc-400">{item.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 mt-1">{item.title}</h4>
                    <p className="text-xs text-red-700 font-semibold mt-0.5">
                      {item.issue} • Ekleyen: {item.user} ({item.category})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveModeration(item.id, 'APPROVE')}
                      className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                    >
                      Onayla (Sorunsuz)
                    </button>
                    <button
                      onClick={() => handleResolveModeration(item.id, 'REMOVE')}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer"
                    >
                      İlanı Kaldır & Kullanıcıyı Uyar
                    </button>
                  </div>
                </div>
              ))}
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

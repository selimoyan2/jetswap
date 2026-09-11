'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { UserDashboardBar } from '@/components/user-dashboard-bar'
import { Hero } from '@/components/hero'
import { Manifesto } from '@/components/manifesto'
import { SmartMatchAlert } from '@/components/smart-match-alert'
import { CategoryBar } from '@/components/category-bar'
import { ItemCard } from '@/components/item-card'
import { HowItWorks } from '@/components/how-it-works'
import { Footer } from '@/components/footer'
import { TradeOfferModal } from '@/components/trade-offer-modal'
import { PortfolioModal } from '@/components/portfolio-modal'
import { CreateListingModal } from '@/components/create-listing-modal'
import { ReportModal } from '@/components/report-modal'
import { ForbiddenItemsModal } from '@/components/forbidden-items-modal'
import { MySwapsModal } from '@/components/my-swaps-modal'
import { AuthModal } from '@/components/auth-modal'
import { EditProfileModal } from '@/components/edit-profile-modal'
import { TrustVerificationModal } from '@/components/trust-verification-modal'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { AdBanner } from '@/components/ads/ad-banner'
import { mockItems, mockMyPortfolio, categories } from '@/data/mockData'
import { TradeItem, TimeFilterScope, LocationFilterScope, User } from '@/types'
import { QuickTimeFilter } from '@/components/quick-time-filter'
import { ArrowLeftRight, PackageOpen, Sparkles, Filter, ShieldAlert, Shield } from 'lucide-react'

export default function HomePage() {
  // Current logged in user (null = Guest / Visitor)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [items, setItems] = useState<TradeItem[]>(mockItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubCategory, setSelectedSubCategory] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [timeScope, setTimeScope] = useState<TimeFilterScope>('all')
  const [locationScope, setLocationScope] = useState<LocationFilterScope>('all')

  // Modals state
  const [targetItemForTrade, setTargetItemForTrade] = useState<TradeItem | null>(null)
  const [myPreselectedItem, setMyPreselectedItem] = useState<TradeItem | null>(null)
  const [reportingItem, setReportingItem] = useState<TradeItem | null>(null)
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false)
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false)
  const [isForbiddenModalOpen, setIsForbiddenModalOpen] = useState(false)
  const [isSwapsOpen, setIsSwapsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isTrustVerificationOpen, setIsTrustVerificationOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authPromptReason, setAuthPromptReason] = useState('')

  // Check saved session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jetswap_active_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.id) {
          setCurrentUser(parsed)
        }
      }
    } catch {}
  }, [])

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('jetswap_active_user', JSON.stringify(user))
    } catch {}
  }

  const handleLogout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem('jetswap_active_user')
    } catch {}
  }

  const handleUpdateUser = (updated: User) => {
    setCurrentUser(updated)
    try {
      localStorage.setItem('jetswap_active_user', JSON.stringify(updated))
    } catch {}
  }

  // Scope counts for QuickTimeFilter
  const scopeCounts = useMemo(() => {
    return {
      today: items.filter(i => i.daysAgo === 0).length,
      yesterday: items.filter(i => i.daysAgo === 1).length,
      week: items.filter(i => i.daysAgo <= 7).length,
      month: items.filter(i => i.daysAgo <= 30).length,
      nearby: currentUser ? items.filter(i => i.district === currentUser.district).length : 0,
      city: currentUser ? items.filter(i => i.city === currentUser.city).length : 0,
      all: items.length,
    }
  }, [items, currentUser])

  // Filtered items (Kategori, Alt Kategori, Zaman & Konum Filtreleme)
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Main Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }
      // Sub Category filter
      if (selectedSubCategory !== 'all' && item.subCategory !== selectedSubCategory) {
        return false
      }
      // City filter from hero
      if (selectedCity !== 'all' && !item.city.includes(selectedCity)) {
        return false
      }
      // District filter from hero
      if (selectedDistrict !== 'all' && item.district !== selectedDistrict) {
        return false
      }
      // Time scope quick filter (Bugün, Dün, Son 7 Gün, Son 30 Gün)
      if (timeScope === 'today' && item.daysAgo !== 0) {
        return false
      }
      if (timeScope === 'yesterday' && item.daysAgo !== 1) {
        return false
      }
      if (timeScope === '7days' && item.daysAgo > 7) {
        return false
      }
      if (timeScope === '30days' && item.daysAgo > 30) {
        return false
      }
      // Location scope quick filter (Yakınımdaki Takaslar / Şehrimdeki İlanlar)
      if (locationScope === 'nearby' && currentUser && item.district !== currentUser.district) {
        return false
      }
      if (locationScope === 'city' && currentUser && item.city !== currentUser.city) {
        return false
      }
      // Search query filter (Brand, Model, Title, Description, Target)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchBrand = item.brand?.toLowerCase().includes(query) || false
        const matchModel = item.modelName?.toLowerCase().includes(query) || false
        const matchDesc = item.description.toLowerCase().includes(query)
        const matchTarget = item.targetDescription.toLowerCase().includes(query)
        if (!matchTitle && !matchBrand && !matchModel && !matchDesc && !matchTarget) {
          return false
        }
      }
      return true
    })
  }, [items, selectedCategory, selectedSubCategory, selectedCity, selectedDistrict, timeScope, locationScope, searchQuery, currentUser])

  // Handle open trade offer (Requires login)
  const handleOpenTradeOffer = (targetItem: TradeItem, myItem?: TradeItem) => {
    if (!currentUser) {
      setAuthMode('register')
      setAuthPromptReason('Bu ürüne takas teklifi gönderebilmek için lütfen ücretsiz üye olun veya giriş yapın.')
      setIsAuthOpen(true)
      return
    }
    setTargetItemForTrade(targetItem)
    setMyPreselectedItem(myItem || null)
  }

  // Handle open create listing (Requires login)
  const handleOpenCreateListing = () => {
    if (!currentUser) {
      setAuthMode('register')
      setAuthPromptReason('Takas ilanı yayınlayabilmek için lütfen ücretsiz kayıt olun veya giriş yapın.')
      setIsAuthOpen(true)
      return
    }
    setIsCreateListingOpen(true)
  }

  // Handle open portfolio (Requires login)
  const handleOpenPortfolio = () => {
    if (!currentUser) {
      setAuthMode('login')
      setAuthPromptReason('Takas portföyünüzü ve eşyalarınızı yönetmek için lütfen giriş yapın.')
      setIsAuthOpen(true)
      return
    }
    setIsPortfolioOpen(true)
  }

  // Handle open swaps (Requires login)
  const handleOpenSwaps = () => {
    if (!currentUser) {
      setAuthMode('login')
      setAuthPromptReason('Gelen ve giden takas tekliflerinizi görüntülemek için lütfen giriş yapın.')
      setIsAuthOpen(true)
      return
    }
    setIsSwapsOpen(true)
  }

  // Handle submit offer
  const handleSubmitOffer = (targetItem: TradeItem, offeredItems: TradeItem[], note: string) => {
    console.log('Trade offer submitted:', { targetItem, offeredItems, note })
  }

  // Handle new item listing (HAVE)
  const handleItemCreated = (newItemData: Partial<TradeItem>) => {
    const author: User = currentUser || {
      id: `usr-${Date.now()}`,
      name: 'Yeni Takasçı',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      country: 'TR',
      city: newItemData.city || 'İstanbul',
      district: newItemData.district || 'Merkez',
      jetTrust: 70,
      verifiedSwapper: false,
      completedSwaps: 0,
      rating: 5.0,
      reviewCount: 0
    }

    const created: TradeItem = {
      id: `item-${Date.now()}`,
      title: newItemData.title || '',
      brand: newItemData.brand || '',
      modelName: newItemData.modelName || '',
      description: newItemData.description || '',
      category: newItemData.category || 'telefon',
      subCategory: newItemData.subCategory || 'akilli-telefon',
      condition: newItemData.condition || 'LIKE_NEW',
      tradeMethod: newItemData.tradeMethod || 'BOTH',
      images: newItemData.images || ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      city: newItemData.city || author.city,
      district: newItemData.district || author.district || 'Merkez',
      country: newItemData.country || author.country,
      targetCategories: newItemData.targetCategories || ['bilgisayar'],
      targetSubCategories: newItemData.targetSubCategories || ['dizustu-laptop'],
      targetDescription: newItemData.targetDescription || 'Her türlü mantıklı takas teklifine açığım',
      openToOffers: newItemData.openToOffers ?? true,
      matchScore: 95,
      valueTier: 'HIGH',
      user: author,
      createdAt: 'Bugün',
      daysAgo: 0,
      status: 'ACTIVE',
      likesCount: 0
    }
    setItems(prev => [created, ...prev])
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-16 md:pb-0">
      {/* Navbar with Guest vs Authenticated state */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'register')
          setAuthPromptReason('')
          setIsAuthOpen(true)
        }}
        onLogout={handleLogout}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenPortfolio={handleOpenPortfolio}
        onOpenCreateItem={handleOpenCreateListing}
        onOpenForbiddenPolicy={() => setIsForbiddenModalOpen(true)}
        onOpenTrustVerification={() => setIsTrustVerificationOpen(true)}
      />

      <main className="flex-1">
        {/* User Greeting Dashboard Bar - YALNIZCA GİRİŞ YAPMIŞ ÜYELERE GÖRÜNÜR */}
        {currentUser && (
          <UserDashboardBar
            currentUser={currentUser}
            onOpenSwaps={handleOpenSwaps}
            onOpenPortfolio={handleOpenPortfolio}
            onOpenCreateItem={handleOpenCreateListing}
            onOpenTrustVerification={() => setIsTrustVerificationOpen(true)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        )}

        {/* Hero Section */}
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={cat => {
            setSelectedCategory(cat)
            setSelectedSubCategory('all')
          }}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          onOpenCreateItem={() => setIsCreateListingOpen(true)}
        />

        {/* GOOGLE ADS SLOT 1: Leaderboard */}
        <AdBanner format="leaderboard" slotId="slot_top_leaderboard" />

        {/* JetMatch Smart Matching Engine Highlight */}
        <SmartMatchAlert
          onSelectTrade={(target, myItem) => handleOpenTradeOffer(target, myItem)}
        />

        {/* Zero Cash Manifesto Section */}
        <Manifesto />

        {/* Live Barter Listings Feed */}
        <section id="kesfet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Quick Time & Proximity Scope Bar */}
          <QuickTimeFilter
            timeScope={timeScope}
            setTimeScope={setTimeScope}
            locationScope={locationScope}
            setLocationScope={setLocationScope}
            userCity={currentUser?.city || 'İstanbul'}
            userDistrict={currentUser?.district || 'Kadıköy'}
            counts={scopeCounts}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                  Canlı Takas Pazarı
                </span>
                <span className="text-xs text-zinc-500 font-bold">({filteredItems.length} Takaslık Eşya)</span>
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight mt-1">
                Güncel Takas İlanları
              </h2>
            </div>

            {/* Reset Filters if active */}
            {(selectedCategory !== 'all' || selectedSubCategory !== 'all' || selectedCity !== 'all' || selectedDistrict !== 'all' || timeScope !== 'all' || locationScope !== 'all' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedSubCategory('all')
                  setSelectedCity('all')
                  setSelectedDistrict('all')
                  setTimeScope('all')
                  setLocationScope('all')
                  setSearchQuery('')
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline self-start sm:self-auto cursor-pointer"
              >
                Tüm Filtreleri Temizle
              </button>
            )}
          </div>

          {/* Category Bar with Cascading Subcategories */}
          <CategoryBar
            selectedCategory={selectedCategory}
            onSelectCategory={slug => {
              setSelectedCategory(slug)
              setSelectedSubCategory('all')
            }}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={subSlug => setSelectedSubCategory(subSlug)}
          />

          {/* Items Grid with In-Feed Organic Ad */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredItems.slice(0, 3).map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onMakeOffer={item => handleOpenTradeOffer(item)}
                  onReport={item => setReportingItem(item)}
                />
              ))}

              {/* GOOGLE ADS SLOT 2: Native In-Feed Ad */}
              <AdBanner format="in-feed" slotId="slot_grid_infeed" />

              {filteredItems.slice(3).map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onMakeOffer={item => handleOpenTradeOffer(item)}
                  onReport={item => setReportingItem(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 mt-6 p-8 shadow-xs">
              <PackageOpen className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <h3 className="font-extrabold text-base text-zinc-800">Aramanıza Uygun Takas İlanı Bulunamadı</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Farklı bir alt kategori veya arama kelimesi seçebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedSubCategory('all')
                  setSelectedCity('all')
                  setSearchQuery('')
                }}
                className="mt-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Tüm İlanları Göster
              </button>
            </div>
          )}
        </section>

        {/* How It Works Section */}
        <HowItWorks />
      </main>

      {/* Footer */}
      <Footer onOpenForbiddenPolicy={() => setIsForbiddenModalOpen(true)} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenCreateItem={() => setIsCreateListingOpen(true)}
        onOpenSwaps={() => setIsSwapsOpen(true)}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
      />

      {/* Modals & Dialogs */}
      <TradeOfferModal
        targetItem={targetItemForTrade}
        initialMyItem={myPreselectedItem}
        onClose={() => {
          setTargetItemForTrade(null)
          setMyPreselectedItem(null)
        }}
        onSubmitOffer={handleSubmitOffer}
      />

      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        onOpenCreateItem={handleOpenCreateListing}
        onOpenTrustVerification={() => setIsTrustVerificationOpen(true)}
        currentUser={currentUser}
      />

      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onItemCreated={handleItemCreated}
        onOpenForbiddenPolicy={() => setIsForbiddenModalOpen(true)}
      />

      <MySwapsModal
        isOpen={isSwapsOpen}
        onClose={() => setIsSwapsOpen(false)}
      />

      <ReportModal
        item={reportingItem}
        isOpen={!!reportingItem}
        onClose={() => setReportingItem(null)}
      />

      <ForbiddenItemsModal
        isOpen={isForbiddenModalOpen}
        onClose={() => setIsForbiddenModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
        customPromptMessage={authPromptReason}
      />

      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
        />
      )}

      <TrustVerificationModal
        isOpen={isTrustVerificationOpen}
        onClose={() => setIsTrustVerificationOpen(false)}
        currentUser={currentUser}
      />
    </div>
  )
}

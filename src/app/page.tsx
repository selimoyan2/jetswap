'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { UserDashboardBar } from '@/components/user-dashboard-bar'
import { Hero } from '@/components/hero'
import { Manifesto } from '@/components/manifesto'
import { SmartMatchAlert } from '@/components/smart-match-alert'
import { CategoryBar } from '@/components/category-bar'
import { ItemCard } from '@/components/item-card'
import { HowItWorks } from '@/components/how-it-works'
import { TradeOfferModal } from '@/components/trade-offer-modal'
import { PortfolioModal } from '@/components/portfolio-modal'
import { CreateListingModal } from '@/components/create-listing-modal'
import { ReportModal } from '@/components/report-modal'
import { ForbiddenItemsModal } from '@/components/forbidden-items-modal'
import { AuthModal } from '@/components/auth-modal'
import { EditProfileModal } from '@/components/edit-profile-modal'
import { TrustVerificationModal } from '@/components/trust-verification-modal'
import { UserSanctionBanner } from '@/components/user-sanction-banner'
import { SanctionRestrictionModal } from '@/components/sanction-restriction-modal'
import { isUserTradeRestricted } from '@/data/mockReports'
import { AdBanner } from '@/components/ads/ad-banner'
import { mockItems, mockMyPortfolio, categories, mockCurrentUser } from '@/data/mockData'
import { TradeItem, TimeFilterScope, LocationFilterScope, User } from '@/types'
import { QuickTimeFilter } from '@/components/quick-time-filter'
import FlashTradeShowcase from '@/components/flash-trade-showcase'
import JetRadarModal from '@/components/jet-radar-modal'
import FaqSection from '@/components/faq-section'
import { ArrowLeftRight, PackageOpen, Sparkles, Filter, ShieldAlert, Shield, Bookmark } from 'lucide-react'
import { SaveSearchModal } from '@/components/save-search-modal'
import { useLanguage } from '@/i18n'

export default function HomePage() {
  const { t } = useLanguage()
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
  const [isFlashOnly, setIsFlashOnly] = useState(false)
  const [isRadarOpen, setIsRadarOpen] = useState(false)
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false)
  const [favoriteItemIds, setFavoriteItemIds] = useState<Set<string>>(new Set())

  // Modals state
  const [targetItemForTrade, setTargetItemForTrade] = useState<TradeItem | null>(null)
  const [myPreselectedItem, setMyPreselectedItem] = useState<TradeItem | null>(null)
  const [reportingItem, setReportingItem] = useState<TradeItem | null>(null)
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false)
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false)
  const [isForbiddenModalOpen, setIsForbiddenModalOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isTrustVerificationOpen, setIsTrustVerificationOpen] = useState(false)
  const [isFirstListingWelcome, setIsFirstListingWelcome] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authPromptReason, setAuthPromptReason] = useState('')
  const [restrictionModalState, setRestrictionModalState] = useState<{
    isOpen: boolean
    sanction?: any
    actionType: 'TRADE_OFFER' | 'CREATE_LISTING'
  }>({
    isOpen: false,
    actionType: 'TRADE_OFFER'
  })

  // Check saved session on mount & fetch real DB items
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jetswap_active_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.id) {
          setCurrentUser(parsed)
          // Yeni üye ilk girdiğinde ilan penceresi kontrolü
          const pendingFirstListing = sessionStorage.getItem('jetswap_first_listing_prompt')
          if (pendingFirstListing === 'true') {
            setIsFirstListingWelcome(true)
            setIsCreateListingOpen(true)
            sessionStorage.removeItem('jetswap_first_listing_prompt')
          }
        }
      }
    } catch {}

    // Parse URL search parameters for saved search reconstruction
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const q = sp.get('search')
      const cat = sp.get('category')
      const ct = sp.get('city')
      if (q) setSearchQuery(q)
      if (cat) setSelectedCategory(cat)
      if (ct) setSelectedCity(ct)
    }

    // Fetch user favorites if logged in
    fetch('/api/favorites')
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setFavoriteItemIds(new Set(res.data.map((f: any) => f.itemId)))
        }
      })
      .catch(() => {})

    // Fetch real listings from PostgreSQL via /api/items
    let isMounted = true
    fetch('/api/items?limit=50')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: TradeItem[] = data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            brand: '',
            modelName: '',
            description: item.description,
            category: item.category?.slug || 'telefon',
            subCategory: item.targetCategories?.[0] || 'genel',
            condition: item.condition || 'GOOD',
            tradeMethod: item.tradeMethod || 'BOTH',
            images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
            city: item.city || 'İstanbul',
            district: 'Merkez',
            country: item.country || 'TR',
            targetCategories: item.targetCategories || [],
            targetSubCategories: [],
            targetDescription: item.targetDescription || 'Her türlü mantıklı takas teklifine açığım',
            openToOffers: true,
            matchScore: 90,
            valueTier: item.valueTier || 'MEDIUM',
            user: item.user ? {
              id: item.user.id,
              name: item.user.name,
              avatar: item.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              country: item.user.country || 'TR',
              city: item.user.city || 'İstanbul',
              district: 'Merkez',
              jetTrust: 75,
              verifiedSwapper: false,
              completedSwaps: 0,
              rating: item.user.rating || 5.0,
              reviewCount: item.user.reviewCount || 0
            } : mockCurrentUser,
            createdAt: new Date(item.createdAt).toLocaleDateString('tr-TR'),
            daysAgo: 0,
            status: 'ACTIVE',
            likesCount: item.viewCount || 0
          }))
          setItems(mapped)
        }
      })
      .catch(err => {
        console.warn('Real items fetch error, using initial listings:', err)
      })

    return () => { isMounted = false }
  }, [])

  const handleAuthSuccess = (user: User, isNewRegistration?: boolean) => {
    setCurrentUser(user)
    try {
      localStorage.setItem('jetswap_active_user', JSON.stringify(user))
    } catch {}

    // Yeni üye sisteme ilk girdiğinde hemen elindeki eşyayı girmesi için pencere açılsın
    if (isNewRegistration) {
      setIsFirstListingWelcome(true)
      setIsCreateListingOpen(true)
      try {
        sessionStorage.setItem('jetswap_first_listing_prompt', 'true')
      } catch {}
    }
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
      // Flash Trade Filter (24s Acil Takas)
      if (isFlashOnly && !item.isFlashTrade) {
        return false
      }
      return true
    })
  }, [items, selectedCategory, selectedSubCategory, selectedCity, selectedDistrict, timeScope, locationScope, searchQuery, currentUser, isFlashOnly])

  // Handle open trade offer (Requires login & no active sanctions)
  const handleOpenTradeOffer = (targetItem: TradeItem, myItem?: TradeItem) => {
    if (!currentUser) {
      setAuthMode('register')
      setAuthPromptReason('Bu ürüne takas teklifi gönderebilmek için lütfen ücretsiz üye olun veya giriş yapın.')
      setIsAuthOpen(true)
      return
    }

    const restriction = isUserTradeRestricted(currentUser.id)
    if (restriction.restricted) {
      setRestrictionModalState({
        isOpen: true,
        sanction: restriction.sanction,
        actionType: 'TRADE_OFFER'
      })
      return
    }

    setTargetItemForTrade(targetItem)
    setMyPreselectedItem(myItem || null)
  }

  // Handle open create listing (Requires login & no active sanctions)
  const handleOpenCreateListing = () => {
    if (!currentUser) {
      setAuthMode('register')
      setAuthPromptReason('Takas ilanı yayınlayabilmek için lütfen ücretsiz kayıt olun veya giriş yapın.')
      setIsAuthOpen(true)
      return
    }

    const restriction = isUserTradeRestricted(currentUser.id)
    if (restriction.restricted) {
      setRestrictionModalState({
        isOpen: true,
        sanction: restriction.sanction,
        actionType: 'CREATE_LISTING'
      })
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

  // Handle submit offer
  const handleSubmitOffer = (targetItem: TradeItem, offeredItems: TradeItem[], note: string) => {
    console.log('Trade offer submitted:', { targetItem, offeredItems, note })
  }

  // Handle new item listing (HAVE)
  const handleItemCreated = (newItemData: any) => {
    const author: User = currentUser || {
      id: newItemData.user?.id || `usr-${Date.now()}`,
      name: newItemData.user?.name || 'Yeni Takasçı',
      avatar: newItemData.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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
      id: newItemData.id || `item-${Date.now()}`,
      title: newItemData.title || '',
      brand: newItemData.brand || '',
      modelName: newItemData.modelName || '',
      description: newItemData.description || '',
      category: newItemData.category?.slug || newItemData.category || 'telefon',
      subCategory: newItemData.targetCategories?.[0] || 'genel',
      condition: newItemData.condition || 'GOOD',
      tradeMethod: newItemData.tradeMethod || 'BOTH',
      images: newItemData.images && newItemData.images.length > 0 ? newItemData.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      city: newItemData.city || author.city,
      district: newItemData.district || author.district || 'Merkez',
      country: newItemData.country || author.country,
      targetCategories: newItemData.targetCategories || ['bilgisayar'],
      targetSubCategories: newItemData.targetSubCategories || [],
      targetDescription: newItemData.targetDescription || 'Her türlü mantıklı takas teklifine açığım',
      openToOffers: true,
      matchScore: 95,
      valueTier: newItemData.valueTier || 'MEDIUM',
      user: author,
      createdAt: 'Bugün',
      daysAgo: 0,
      status: 'ACTIVE',
      likesCount: 0
    }
    setItems(prev => [created, ...prev])
    setIsFirstListingWelcome(false)
    try {
      sessionStorage.removeItem('jetswap_first_listing_prompt')
    } catch {}
  }

  return (
    <div className="w-full">
      {/* Active Sanctions & Admin Defense Inquiries Banner - Sadece giriş yapmış ve yaptırımlı kullanıcıya görünür */}
      {currentUser && <UserSanctionBanner currentUser={currentUser} />}

        {/* User Greeting Dashboard Bar - YALNIZCA GİRİŞ YAPMIŞ ÜYELERE GÖRÜNÜR */}
        {currentUser && (
          <UserDashboardBar
            currentUser={currentUser}
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
          {/* Flash Trade 24h Showcase */}
          <FlashTradeShowcase
            items={items}
            onSelectItem={(item) => handleOpenTradeOffer(item)}
            onViewAllFlash={() => setIsFlashOnly(true)}
            className="mb-8"
          />

          {/* Quick Time & Proximity Scope Bar */}
          <QuickTimeFilter
            timeScope={timeScope}
            setTimeScope={setTimeScope}
            locationScope={locationScope}
            setLocationScope={setLocationScope}
            userCity={currentUser?.city || 'İstanbul'}
            userDistrict={currentUser?.district || 'Kadıköy'}
            isLoggedIn={!!currentUser}
            onRequireLogin={(promptReason) => {
              setAuthMode('login')
              setAuthPromptReason(promptReason || 'Konumunuza özel takas ilanlarını listelemek için giriş yapın.')
              setIsAuthOpen(true)
            }}
            counts={scopeCounts}
            isFlashOnly={isFlashOnly}
            onToggleFlashOnly={() => setIsFlashOnly(!isFlashOnly)}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                  {t.feed.badge}
                </span>
                <span className="text-xs text-zinc-500 font-bold">({filteredItems.length} {t.feed.itemCount})</span>
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight mt-1">
                {t.feed.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Save Search Button */}
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    setAuthMode('login')
                    setAuthPromptReason('Aramalarınızı kaydetmek ve daha sonra tek tıkla ulaşmak için giriş yapın.')
                    setIsAuthOpen(true)
                    return
                  }
                  setIsSaveSearchOpen(true)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                title="Mevcut arama ve filtre kriterlerini kaydet"
              >
                <Bookmark className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Aramayı Kaydet</span>
              </button>

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
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
                >
                  {t.feed.resetButton}
                </button>
              )}
            </div>
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
                  initialIsFavorite={favoriteItemIds.has(item.id)}
                  onRequireAuth={() => {
                    setAuthMode('login')
                    setAuthPromptReason('İlanları favorilerinize eklemek için lütfen giriş yapın.')
                    setIsAuthOpen(true)
                  }}
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
                  initialIsFavorite={favoriteItemIds.has(item.id)}
                  onRequireAuth={() => {
                    setAuthMode('login')
                    setAuthPromptReason('İlanları favorilerinize eklemek için lütfen giriş yapın.')
                    setIsAuthOpen(true)
                  }}
                  onMakeOffer={item => handleOpenTradeOffer(item)}
                  onReport={item => setReportingItem(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 mt-6 p-8 shadow-xs">
              <PackageOpen className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <h3 className="font-extrabold text-base text-zinc-800">{t.feed.emptyTitle}</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {t.feed.emptyDesc}
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
                {t.common.viewAll}
              </button>
            </div>
          )}
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Frequently Asked Questions (FAQ) Section with JSON-LD Schema */}
        <FaqSection className="bg-white border-t border-zinc-200" />

      {/* Modals & Dialogs */}
      <TradeOfferModal
        targetItem={targetItemForTrade}
        initialMyItem={myPreselectedItem}
        currentUser={currentUser}
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
        onClose={() => {
          setIsCreateListingOpen(false)
          setIsFirstListingWelcome(false)
          try {
            sessionStorage.removeItem('jetswap_first_listing_prompt')
          } catch {}
        }}
        onItemCreated={handleItemCreated}
        onOpenForbiddenPolicy={() => setIsForbiddenModalOpen(true)}
        isFirstTimeUser={isFirstListingWelcome}
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

      {/* JetRadar Modal */}
      <JetRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        allItems={items}
        onSelectMatchingItem={(item) => handleOpenTradeOffer(item)}
        onApplyFilter={(kw) => setSearchQuery(kw)}
      />

      {/* Sanction Restriction Modal */}
      <SanctionRestrictionModal
        isOpen={restrictionModalState.isOpen}
        onClose={() => setRestrictionModalState(prev => ({ ...prev, isOpen: false }))}
        sanction={restrictionModalState.sanction}
        actionType={restrictionModalState.actionType}
      />

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={isSaveSearchOpen}
        onClose={() => setIsSaveSearchOpen(false)}
        query={searchQuery}
        category={selectedCategory}
        city={selectedCity}
        isLoggedIn={!!currentUser}
        onRequireAuth={() => {
          setAuthMode('login')
          setAuthPromptReason('Aramalarınızı kaydetmek ve daha sonra tek tıkla ulaşmak için giriş yapın.')
          setIsAuthOpen(true)
        }}
      />
    </div>
  )
}

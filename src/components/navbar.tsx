'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftRight, Search, PlusCircle, Shield, Globe, Menu, X, 
  Sparkles, ShieldAlert, ShieldCheck, LogIn, UserPlus, LogOut, Settings, User as UserIcon, Radio, BookOpen, Heart, Bookmark, Bell
} from 'lucide-react'
import { User } from '@/types'
import { useLanguage } from '@/i18n'
import { ThemeToggle } from '@/theme'
import { ForbiddenItemsModal } from '@/components/forbidden-items-modal'

interface NavbarProps {
  currentUser?: User | null
  onOpenAuth?: (mode?: 'login' | 'register') => void
  onLogout?: () => void
  onOpenEditProfile?: () => void
  onOpenPortfolio?: () => void
  onOpenCreateItem?: () => void
  onOpenForbiddenPolicy?: () => void
  onOpenTrustVerification?: () => void
  onOpenRadar?: () => void
  searchQuery?: string
  setSearchQuery?: (val: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser: propCurrentUser,
  onOpenAuth,
  onLogout,
  onOpenEditProfile,
  onOpenPortfolio,
  onOpenCreateItem,
  onOpenForbiddenPolicy,
  onOpenTrustVerification,
  onOpenRadar,
  searchQuery = '',
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0)
  const [internalUser, setInternalUser] = useState<User | null>(null)
  const [isForbiddenModalOpen, setIsForbiddenModalOpen] = useState(false)
  const { language, toggleLanguage, t, availableLanguages } = useLanguage()

  useEffect(() => {
    if (propCurrentUser !== undefined) {
      setInternalUser(propCurrentUser)
    } else {
      try {
        const stored = localStorage.getItem('jetswap_active_user')
        if (stored) {
          setInternalUser(JSON.parse(stored))
        }
      } catch {}
    }
  }, [propCurrentUser])

  const currentUser = propCurrentUser !== undefined ? propCurrentUser : internalUser

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      try {
        localStorage.removeItem('jetswap_active_user')
      } catch {}
      window.location.href = '/'
    }
  }

  const handleOpenAuth = (mode?: 'login' | 'register') => {
    if (onOpenAuth) {
      onOpenAuth(mode)
    } else {
      window.location.href = `/login?mode=${mode || 'login'}`
    }
  }

  const handleOpenEditProfile = () => {
    if (onOpenEditProfile) {
      onOpenEditProfile()
    } else {
      window.location.href = '/'
    }
  }

  useEffect(() => {
    if (!currentUser) {
      setUnreadNotificationCount(0)
      return
    }

    let isMounted = true
    fetch('/api/notifications/unread-count')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success) {
          setUnreadNotificationCount(data.data?.unreadCount ?? data.unreadCount ?? 0)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [currentUser])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xs transition-colors">
      {/* Zero Cash Ribbon (PRD Madde 3.1 & 38) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs py-1.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-emerald-200" />
        <span>{t.nav.zeroCashRibbon}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-zinc-900 dark:text-zinc-100">Jet<span className="text-emerald-600 dark:text-emerald-400">Swap</span></span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">Global</span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold hidden sm:block">Global Swap Network</p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            const target = document.getElementById('kesfet')
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="hidden md:flex flex-1 max-w-md relative items-center"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery?.(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-full pl-10 pr-9 py-2 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery?.('')}
              className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full cursor-pointer hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition-colors"
              title={t.common.clear}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Navigation & Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/#nasil-calisir" className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {t.nav.howItWorks}
          </Link>
          <Link href="/jetmatch" className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t.nav.jetMatch}
          </Link>

          {/* JetRadar Button */}
          <button
            onClick={() => (onOpenRadar ? onOpenRadar() : (window.location.href = '/#kesfet'))}
            className="text-xs font-bold text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-200 transition-colors flex items-center gap-1.5 cursor-pointer relative px-2.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800 shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{t.jetRadar.navbarBadge}</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Theme Toggle (Sprint 16) */}
          <ThemeToggle />

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer bg-white dark:bg-zinc-800 shadow-2xs"
            title="Dili Değiştir / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}</span>
          </button>

          {/* AUTHENTICATION STATE: GUEST vs LOGGED IN */}
          {currentUser ? (
            <div className="flex items-center gap-2 relative">
              {/* User Dropdown Trigger */}
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-500">
                  <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                </div>
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
              </button>

              {/* JetTrust Score Badge */}
              <button
                onClick={onOpenTrustVerification}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-black transition-colors cursor-pointer"
                title={t.nav.jetTrustCenter}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{currentUser.jetTrust} JT</span>
              </button>

              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs flex items-center justify-center"
                title={t.nav.notifications}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <p className="font-black text-xs text-zinc-900 dark:text-zinc-100 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{currentUser.district ? `${currentUser.district}, ` : ''}{currentUser.city}</p>
                  </div>

                  <Link
                    href="/jetmatch"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>JetMatch</span>
                  </Link>

                  <Link
                    href="/notifications"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.nav.notifications}</span>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/offers"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.nav.myOffers}</span>
                  </Link>

                  <Link
                    href="/favorites"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{t.nav.favorites}</span>
                  </Link>

                  <Link
                    href="/saved-searches"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.nav.savedSearches}</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onOpenPortfolio?.()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.nav.myPortfolio}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      handleOpenEditProfile()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" />
                    <span>{t.nav.editProfile}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onOpenTrustVerification?.()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>{t.nav.jetTrustCenter}</span>
                  </button>

                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>{t.nav.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.login}</span>
              </button>

              <button
                onClick={() => handleOpenAuth('register')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{t.nav.register}</span>
              </button>
            </div>
          )}

          {/* Create Listing CTA */}
          <button
            onClick={() => (onOpenCreateItem ? onOpenCreateItem() : (window.location.href = '/#kesfet'))}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer ml-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.nav.listForSwap}</span>
          </button>
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {currentUser && (
            <Link
              href="/notifications"
              className="relative p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center"
              title="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-3 text-center leading-tight">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </Link>
          )}
          {/* Mobile Theme Toggle */}
          <ThemeToggle />
          {/* Mobile Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-[11px] font-black px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800"
          >
            <span>{language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}</span>
          </button>
          <button
            onClick={() => (onOpenCreateItem ? onOpenCreateItem() : (window.location.href = '/#kesfet'))}
            className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t.common.apply}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-3 pb-6 space-y-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              setMobileMenuOpen(false)
              const target = document.getElementById('kesfet')
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery?.(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
            />
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery?.('')}
                className="absolute right-2.5 top-2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full cursor-pointer"
                title={t.common.clear}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <div className="flex flex-col gap-2 pt-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {currentUser ? (
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-600">
                      <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-zinc-900 dark:text-zinc-100">{currentUser.name}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{currentUser.district ? `${currentUser.district}, ` : ''}{currentUser.city}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {currentUser.jetTrust} JT
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleOpenEditProfile(); }}
                    className="flex-1 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-300 text-center"
                  >
                    {t.nav.editProfile}
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-[11px] font-bold text-red-700 dark:text-red-400 text-center"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleOpenAuth('login'); }}
                  className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-center text-xs font-bold text-zinc-800 dark:text-zinc-200"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleOpenAuth('register'); }}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-center text-xs font-black"
                >
                  {t.nav.register}
                </button>
              </div>
            )}

            <Link href="#nasil-calisir" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600 dark:hover:text-emerald-400">
              {t.nav.howItWorks}
            </Link>
            <Link href="/jetmatch" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.nav.jetMatch}</span>
            </Link>
            {currentUser && (
              <>
                <Link href="/offers" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.nav.myOffers}</span>
                </Link>
                <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.nav.notifications}</span>
                  </div>
                  {unreadNotificationCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </Link>
                <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{t.nav.favorites}</span>
                </Link>
                <Link href="/saved-searches" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.nav.savedSearches}</span>
                </Link>
              </>
            )}
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.nav.guidesAndBlog}</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenRadar?.()
              }}
              className="text-left py-2 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-2 text-cyan-800 dark:text-cyan-300"
            >
              <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
              <span>{t.jetRadar.navbarBadge}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                if (onOpenForbiddenPolicy) {
                  onOpenForbiddenPolicy()
                } else {
                  setIsForbiddenModalOpen(true)
                }
              }}
              className="text-left py-2 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>{t.nav.forbiddenItems}</span>
            </button>
          </div>
        </div>
      )}
      <ForbiddenItemsModal
        isOpen={isForbiddenModalOpen}
        onClose={() => setIsForbiddenModalOpen(false)}
      />
    </header>
  )
}

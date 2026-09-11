'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftRight, Search, PlusCircle, Shield, Globe, Menu, X, 
  Sparkles, ShieldAlert, ShieldCheck, LogIn, UserPlus, LogOut, Settings, User as UserIcon
} from 'lucide-react'
import { User } from '@/types'

interface NavbarProps {
  currentUser: User | null
  onOpenAuth: (mode?: 'login' | 'register') => void
  onLogout: () => void
  onOpenEditProfile: () => void
  onOpenPortfolio?: () => void
  onOpenCreateItem?: () => void
  onOpenForbiddenPolicy?: () => void
  onOpenTrustVerification?: () => void
  onSelectLanguage?: (lang: 'TR' | 'EN') => void
  currentLang?: 'TR' | 'EN'
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenEditProfile,
  onOpenPortfolio,
  onOpenCreateItem,
  onOpenForbiddenPolicy,
  onOpenTrustVerification,
  currentLang = 'TR'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [lang, setLang] = useState<'TR' | 'EN'>(currentLang)

  const toggleLang = () => {
    setLang(prev => (prev === 'TR' ? 'EN' : 'TR'))
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Zero Cash Ribbon (PRD Madde 3.1 & 38) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs py-1.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-emerald-200" />
        <span>
          {lang === 'TR' 
            ? '⚡ PARA YOK. TAKAS VAR. (PRD v1.0) • Kesinlikle nakit kabul edilmez. Yalnızca doğrudan eşya/hizmet takası geçerlidir.'
            : '⚡ NO MONEY. JUST SWAP. • Pure item and service barter only. No cash allowed.'}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-zinc-900">Jet<span className="text-emerald-600">Swap</span></span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Global</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold hidden sm:block">Global Swap Network</p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative items-center">
          <input
            type="text"
            placeholder={lang === 'TR' ? "Ne takas etmek istiyorsun? (örn: iPhone, Kamera, Bisiklet...)" : "What do you want to swap? (e.g. Camera, Bike...)"}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5" />
        </div>

        {/* Navigation & Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="#nasil-calisir" className="text-xs font-bold text-zinc-600 hover:text-emerald-600 transition-colors">
            {lang === 'TR' ? 'Nasıl Çalışır?' : 'How It Works'}
          </Link>
          <Link href="#eslesmeler" className="text-xs font-bold text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {lang === 'TR' ? 'JetMatch' : 'JetMatch'}
          </Link>
          <button
            onClick={onOpenForbiddenPolicy}
            className="text-xs font-bold text-zinc-600 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
            <span>{lang === 'TR' ? 'Yasaklı Ürünler' : 'Forbidden Items'}</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 mx-1" />

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
            title="Dili Değiştir / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>{lang}</span>
          </button>

          {/* AUTHENTICATION STATE: GUEST vs LOGGED IN */}
          {currentUser ? (
            <div className="flex items-center gap-2 relative">
              {/* User Dropdown Trigger */}
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-800 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer border border-zinc-200"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-500">
                  <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                </div>
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
              </button>

              {/* JetTrust Score Badge */}
              <button
                onClick={onOpenTrustVerification}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-black transition-colors cursor-pointer"
                title="JetTrust Doğrulama Merkezi"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser.jetTrust} JT</span>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 border-b border-zinc-100 mb-1">
                    <p className="font-black text-xs text-zinc-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{currentUser.district ? `${currentUser.district}, ` : ''}{currentUser.city}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onOpenPortfolio?.()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                    <span>Portföyüm</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onOpenEditProfile()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" />
                    <span>Profili Düzenle</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onOpenTrustVerification?.()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>JetTrust Doğrulama</span>
                  </button>

                  <div className="h-px bg-zinc-100 my-1" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onLogout()
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-700 hover:text-emerald-700 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kayıt Ol</span>
              </button>
            </div>
          )}

          {/* Create Listing CTA */}
          <button
            onClick={onOpenCreateItem}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer ml-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'TR' ? 'Takas İlanı Ver' : 'List for Swap'}</span>
          </button>
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenCreateItem}
            className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>İlan Ver</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder={lang === 'TR' ? "Ne takas etmek istiyorsun?" : "Search items..."}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-800"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-col gap-2 pt-2 text-xs font-bold text-zinc-700">
            {currentUser ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-600">
                      <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-zinc-900">{currentUser.name}</p>
                      <p className="text-[10px] text-zinc-500">{currentUser.district ? `${currentUser.district}, ` : ''}{currentUser.city}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                    {currentUser.jetTrust} JT
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenEditProfile(); }}
                    className="flex-1 py-1.5 bg-white border border-zinc-200 rounded-xl text-[11px] font-bold text-zinc-700 text-center"
                  >
                    Profili Düzenle
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 text-center"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                  className="flex-1 py-2.5 bg-zinc-100 rounded-xl text-center text-xs font-bold text-zinc-800"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-center text-xs font-black"
                >
                  Kayıt Ol
                </button>
              </div>
            )}

            <Link href="#nasil-calisir" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600">
              {lang === 'TR' ? 'Nasıl Çalışır?' : 'How It Works'}
            </Link>
            <Link href="#eslesmeler" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-600">
              {lang === 'TR' ? 'JetMatch' : 'JetMatch'}
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenForbiddenPolicy?.()
              }}
              className="text-left py-2 hover:text-red-600 flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              <span>Yasaklı Ürünler & Kurallar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

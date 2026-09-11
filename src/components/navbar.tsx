'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftRight, Search, PlusCircle, Shield, Globe, Menu, X, Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react'
import { mockCurrentUser } from '@/data/mockData'

interface NavbarProps {
  onOpenPortfolio?: () => void
  onOpenCreateItem?: () => void
  onOpenForbiddenPolicy?: () => void
  onOpenTrustVerification?: () => void
  onSelectLanguage?: (lang: 'TR' | 'EN') => void
  currentLang?: 'TR' | 'EN'
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPortfolio,
  onOpenCreateItem,
  onOpenForbiddenPolicy,
  onOpenTrustVerification,
  currentLang = 'TR'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        <div className="hidden lg:flex items-center gap-4">
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
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
            title="Dili Değiştir / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>{lang}</span>
          </button>

          {/* User Portfolio */}
          <button
            onClick={onOpenPortfolio}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer border border-zinc-200/60"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[11px]">
              {mockCurrentUser.name.charAt(0)}
            </div>
            <span>Portföyüm</span>
          </button>

          {/* JetTrust Verification Badge Trigger */}
          <button
            onClick={onOpenTrustVerification}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-black transition-colors cursor-pointer"
            title="JetTrust Doğrulama Merkezi"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{mockCurrentUser.jetTrust} JT</span>
          </button>

          {/* Create Listing CTA */}
          <button
            onClick={onOpenCreateItem}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer"
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
            className="p-2 text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
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
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenPortfolio?.()
              }}
              className="text-left py-2 hover:text-emerald-600 flex items-center justify-between"
            >
              <span>Portföyüm</span>
              <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded-full font-black">
                {mockCurrentUser.jetTrust} JetTrust
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

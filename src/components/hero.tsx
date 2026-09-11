'use client'

import React from 'react'
import { ArrowLeftRight, Search, Shield, MapPin, Zap, Sparkles, CheckCircle } from 'lucide-react'
import { categories } from '@/data/mockData'
import { TURKEY_CITIES } from '@/data/locations'
import { useLanguage } from '@/i18n'

interface HeroProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedCategory: string
  setSelectedCategory: (val: string) => void
  selectedCity: string
  setSelectedCity: (val: string) => void
  selectedDistrict?: string
  setSelectedDistrict?: (val: string) => void
  onOpenCreateItem: () => void
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  selectedDistrict = 'all',
  setSelectedDistrict,
  onOpenCreateItem,
}) => {
  const { language, t } = useLanguage()

  return (
    <section className="relative pt-8 pb-12 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-teal-50/20 to-transparent -z-10 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* PRD Slogan Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-black tracking-wide mb-6 shadow-xs">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span>{t.hero.badge}</span>
        </div>

        {/* PRD Madde 31: Ana Başlık */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 max-w-4xl mx-auto leading-tight">
          {t.hero.title1} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">
            {t.hero.titleHighlight}
          </span>
        </h1>

        {/* PRD Madde 31: Açıklama */}
        <p className="mt-5 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {t.hero.subtitle}
        </p>

        {/* PRD Madde 50: HAVE → WANT → MATCH → SWAP Süreç Çubuğu */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 bg-white border border-zinc-200/90 py-2 px-4 rounded-2xl shadow-xs text-xs font-black text-zinc-700">
          <span className="text-emerald-700">{t.hero.steps.step1}</span>
          <span className="text-zinc-300">→</span>
          <span className="text-teal-700">{t.hero.steps.step2}</span>
          <span className="text-zinc-300">→</span>
          <span className="text-amber-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {t.hero.steps.step3}
          </span>
          <span className="text-zinc-300">→</span>
          <span className="text-emerald-800">{t.hero.steps.step4}</span>
        </div>

        {/* Global Interactive Search & Filter Card */}
        <div className="mt-8 max-w-4xl mx-auto bg-white p-3.5 sm:p-5 rounded-3xl shadow-xl border border-zinc-200/80 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block px-1 mb-1">
                {t.hero.searchLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="sm:col-span-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block px-1 mb-1">
                {t.hero.categoryLabel}
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-semibold"
              >
                <option value="all">{t.hero.allCities === 'All Cities' ? 'All Categories' : 'Tüm Kategoriler'}</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {language === 'en' ? c.nameEn : c.nameTr}
                  </option>
                ))}
              </select>
            </div>

            {/* Location / City Filter (PRD Madde 24) */}
            <div className={selectedCity !== 'all' ? "sm:col-span-2" : "sm:col-span-2"}>
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block px-1 mb-1">
                {t.hero.cityLabel}
              </label>
              <select
                value={selectedCity}
                onChange={e => {
                  setSelectedCity(e.target.value)
                  if (setSelectedDistrict) setSelectedDistrict('all')
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-semibold"
              >
                <option value="all">{t.hero.allCities}</option>
                <optgroup label={t.hero.turkeyGroup}>
                  {TURKEY_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
                <optgroup label={t.hero.globalGroup}>
                  <option value="Berlin">Berlin 🇩🇪</option>
                  <option value="Frankfurt">Frankfurt 🇩🇪</option>
                  <option value="Londra">Londra 🇬🇧</option>
                  <option value="New York">New York 🇺🇸</option>
                  <option value="Bakü">Bakü 🇦🇿</option>
                  <option value="Amsterdam">Amsterdam 🇳🇱</option>
                  <option value="Paris">Paris 🇫🇷</option>
                </optgroup>
              </select>
            </div>

            {/* CTA Button (PRD Madde 31: Takasa Başla) */}
            <div className="sm:col-span-2 pt-4 sm:pt-4">
              <button
                onClick={onOpenCreateItem}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black py-3 px-3 rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{t.hero.startSwapButton}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 border-t border-zinc-200/60">
          <div>
            <span className="text-2xl font-black text-emerald-700">{t.hero.ticker.zeroCash}</span>
            <p className="text-xs text-zinc-500 font-bold">{t.hero.ticker.zeroCashSub}</p>
          </div>
          <div>
            <span className="text-2xl font-black text-zinc-900">{t.hero.ticker.matchRate}</span>
            <p className="text-xs text-zinc-500 font-bold">{t.hero.ticker.matchRateSub}</p>
          </div>
          <div>
            <span className="text-2xl font-black text-zinc-900">{t.hero.ticker.trust}</span>
            <p className="text-xs text-zinc-500 font-bold">{t.hero.ticker.trustSub}</p>
          </div>
          <div>
            <span className="text-2xl font-black text-zinc-900">{t.hero.ticker.global}</span>
            <p className="text-xs text-zinc-500 font-bold">{t.hero.ticker.globalSub}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

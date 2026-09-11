'use client'

import React from 'react'
import { Zap, Clock, Calendar, CalendarDays, MapPin, Building2, Globe2 } from 'lucide-react'
import { TimeFilterScope, LocationFilterScope } from '@/types'
import { useLanguage } from '@/i18n'

interface QuickTimeFilterProps {
  timeScope: TimeFilterScope
  setTimeScope: (scope: TimeFilterScope) => void
  locationScope: LocationFilterScope
  setLocationScope: (scope: LocationFilterScope) => void
  userCity?: string
  userDistrict?: string
  isLoggedIn?: boolean
  onRequireLogin?: (promptReason?: string) => void
  isFlashOnly?: boolean
  onToggleFlashOnly?: () => void
  counts?: {
    today: number
    yesterday: number
    week: number
    month: number
    nearby: number
    city: number
    all: number
  }
}

export const QuickTimeFilter: React.FC<QuickTimeFilterProps> = ({
  timeScope,
  setTimeScope,
  locationScope,
  setLocationScope,
  userCity = 'İstanbul',
  userDistrict = 'Kadıköy',
  isLoggedIn = false,
  onRequireLogin,
  isFlashOnly = false,
  onToggleFlashOnly,
  counts,
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 p-3 sm:p-4 shadow-xs mb-6">
      {/* Scope Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.quickFilter.title}</span>
          </h3>
          <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
            {t.quickFilter.subtitle}
          </p>
        </div>

        {/* Active scope indicator badge */}
        {(timeScope !== 'all' || locationScope !== 'all') && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              {t.quickFilter.activeFilter}: {timeScope !== 'all' ? (
                timeScope === 'today' ? t.quickFilter.today :
                timeScope === 'yesterday' ? t.quickFilter.yesterday :
                timeScope === '7days' ? t.quickFilter.last7Days : t.quickFilter.last30Days
              ) : ''} {locationScope !== 'all' ? `• ${locationScope === 'nearby' ? `${t.quickFilter.nearbyDistrict} (${userDistrict})` : `${t.quickFilter.inMyCity} (${userCity})`}` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setTimeScope('all')
                setLocationScope('all')
              }}
              className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
            >
              {t.quickFilter.reset}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
        {/* TIME SCOPE BUTTONS */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
            {t.quickFilter.timeSectionTitle}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {/* ⚡ Acil Takas (24s) */}
            {onToggleFlashOnly && (
              <button
                type="button"
                onClick={onToggleFlashOnly}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isFlashOnly
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-bounce" />
                <span>{t.flashTrade.filterChip}</span>
              </button>
            )}

            {/* Bugün */}
            <button
              type="button"
              onClick={() => setTimeScope(timeScope === 'today' ? 'all' : 'today')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeScope === 'today'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{t.quickFilter.today}</span>
              {counts?.today !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${timeScope === 'today' ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {counts.today}
                </span>
              )}
            </button>

            {/* Dün */}
            <button
              type="button"
              onClick={() => setTimeScope(timeScope === 'yesterday' ? 'all' : 'yesterday')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeScope === 'yesterday'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{t.quickFilter.yesterday}</span>
              {counts?.yesterday !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${timeScope === 'yesterday' ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {counts.yesterday}
                </span>
              )}
            </button>

            {/* Son 7 Gün */}
            <button
              type="button"
              onClick={() => setTimeScope(timeScope === '7days' ? 'all' : '7days')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeScope === '7days'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{t.quickFilter.last7Days}</span>
              {counts?.week !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${timeScope === '7days' ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {counts.week}
                </span>
              )}
            </button>

            {/* Son 30 Gün */}
            <button
              type="button"
              onClick={() => setTimeScope(timeScope === '30days' ? 'all' : '30days')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                timeScope === '30days'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span>{t.quickFilter.last30Days}</span>
              {counts?.month !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${timeScope === '30days' ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {counts.month}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* LOCATION / NEIGHBORHOOD SCOPE BUTTONS */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
            {t.quickFilter.locationSectionTitle}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {/* Yakınımdaki Takaslar (Semt) */}
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn && onRequireLogin) {
                  onRequireLogin(t.quickFilter.requireLoginNearby)
                  return
                }
                setLocationScope(locationScope === 'nearby' ? 'all' : 'nearby')
              }}
              title={isLoggedIn ? `${t.quickFilter.nearbyDistrict}: ${userDistrict}` : t.quickFilter.requireLoginNearby}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                locationScope === 'nearby'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-teal-50 text-zinc-700 hover:text-teal-700'
              }`}
            >
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>{isLoggedIn ? `${t.quickFilter.nearbyDistrict} (${userDistrict})` : `${t.quickFilter.nearbyDistrict} (${t.nav.login})`}</span>
              {counts?.nearby !== undefined && isLoggedIn && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${locationScope === 'nearby' ? 'bg-teal-800 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {counts.nearby}
                </span>
              )}
            </button>

            {/* Şehrimdeki İlanlar */}
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn && onRequireLogin) {
                  onRequireLogin(t.quickFilter.requireLoginCity)
                  return
                }
                setLocationScope(locationScope === 'city' ? 'all' : 'city')
              }}
              title={isLoggedIn ? `${t.quickFilter.inMyCity}: ${userCity}` : t.quickFilter.requireLoginCity}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                locationScope === 'city'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-teal-50 text-zinc-700 hover:text-teal-700'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>{isLoggedIn ? `${t.quickFilter.inMyCity} (${userCity})` : `${t.quickFilter.inMyCity} (${t.nav.login})`}</span>
              {counts?.city !== undefined && isLoggedIn && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${locationScope === 'city' ? 'bg-teal-800 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {counts.city}
                </span>
              )}
            </button>

            {/* Tümü */}
            <button
              type="button"
              onClick={() => {
                setLocationScope('all')
                setTimeScope('all')
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                locationScope === 'all' && timeScope === 'all'
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              <Globe2 className="w-3 h-3" />
              <span>{t.quickFilter.allListings}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

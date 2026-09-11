'use client'

import React from 'react'
import { Zap, Clock, Calendar, CalendarDays, MapPin, Building2, Globe2 } from 'lucide-react'
import { TimeFilterScope, LocationFilterScope } from '@/types'

interface QuickTimeFilterProps {
  timeScope: TimeFilterScope
  setTimeScope: (scope: TimeFilterScope) => void
  locationScope: LocationFilterScope
  setLocationScope: (scope: LocationFilterScope) => void
  userCity?: string
  userDistrict?: string
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
  counts,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 p-3 sm:p-4 shadow-xs mb-6">
      {/* Scope Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hızlı Zaman & Bölge Filtreleri</span>
          </h3>
          <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
            Zaman dilimine veya konumuna (semt & şehir) göre tek tıkla filtrele.
          </p>
        </div>

        {/* Active scope indicator badge */}
        {(timeScope !== 'all' || locationScope !== 'all') && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              Aktif Filtre: {timeScope !== 'all' ? (
                timeScope === 'today' ? 'Bugünün İlanları' :
                timeScope === 'yesterday' ? 'Dünkü İlanlar' :
                timeScope === '7days' ? 'Son 7 Gün' : 'Son 30 Gün'
              ) : ''} {locationScope !== 'all' ? `• ${locationScope === 'nearby' ? `Semt (${userDistrict})` : `Şehir (${userCity})`}` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setTimeScope('all')
                setLocationScope('all')
              }}
              className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
            >
              Sıfırla
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
        {/* TIME SCOPE BUTTONS */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
            Tarihe Göre İlanlar
          </span>
          <div className="flex flex-wrap gap-1.5">
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
              <span>Bugünün İlanları</span>
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
              <span>Dünkü İlanlar</span>
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
              <span>Son 7 Gün</span>
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
              <span>Son 30 Gün</span>
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
            Konum & Yakınlık
          </span>
          <div className="flex flex-wrap gap-1.5">
            {/* Yakınımdaki Takaslar (Semt) */}
            <button
              type="button"
              onClick={() => setLocationScope(locationScope === 'nearby' ? 'all' : 'nearby')}
              title={`Semtiniz: ${userDistrict}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                locationScope === 'nearby'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-teal-50 text-zinc-700 hover:text-teal-700'
              }`}
            >
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>Yakınımdaki Takaslar ({userDistrict})</span>
              {counts?.nearby !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${locationScope === 'nearby' ? 'bg-teal-800 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {counts.nearby}
                </span>
              )}
            </button>

            {/* Şehrimdeki İlanlar */}
            <button
              type="button"
              onClick={() => setLocationScope(locationScope === 'city' ? 'all' : 'city')}
              title={`Şehriniz: ${userCity}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                locationScope === 'city'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-teal-50 text-zinc-700 hover:text-teal-700'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Şehrimdeki İlanlar ({userCity})</span>
              {counts?.city !== undefined && (
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
              <span>Tüm İlanlar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

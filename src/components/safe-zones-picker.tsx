'use client'

import React, { useState } from 'react'
import { SafeTradeZone } from '@/types'
import { getSafeZonesForLocation } from '@/data/safeZones'
import { useLanguage } from '@/i18n'
import { ShieldCheck, Video, MapPin, ExternalLink, Check, Info } from 'lucide-react'

interface SafeZonesPickerProps {
  selectedZone: SafeTradeZone | null
  onSelectZone: (zone: SafeTradeZone | null) => void
  city?: string
  district?: string
  className?: string
}

export default function SafeZonesPicker({
  selectedZone,
  onSelectZone,
  city = 'İstanbul',
  district,
  className = ''
}: SafeZonesPickerProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  // Filter zones matching current location or fallback to all
  const availableZones = getSafeZonesForLocation(city, district)

  const getTypeLabel = (type: SafeTradeZone['type']) => {
    switch (type) {
      case 'MALL':
        return t.safeZones.types.MALL
      case 'METRO':
        return t.safeZones.types.METRO
      case 'POLICE_NEARBY':
        return t.safeZones.types.POLICE_NEARBY
      case 'PUBLIC_SQUARE':
        return t.safeZones.types.PUBLIC_SQUARE
      default:
        return type
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-900 block">{t.safeZones.title}</span>
            <span className="text-[11px] text-zinc-500">{t.safeZones.subtitle}</span>
          </div>
        </div>
      </div>

      {/* Selected Box or Dropdown Trigger */}
      {selectedZone ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-950">{selectedZone.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-medium flex items-center gap-1">
                  <Video className="w-3 h-3 text-emerald-700" />
                  {t.safeZones.cameraSecurity}
                </span>
              </div>
              <p className="text-[11px] text-zinc-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                {selectedZone.address}, {selectedZone.district} / {selectedZone.city}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline flex-shrink-0 cursor-pointer"
            >
              Değiştir
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedZone.mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3 h-3" />
              {t.safeZones.viewOnMap}
            </a>

            <button
              type="button"
              onClick={() => onSelectZone(null)}
              className="text-[11px] text-zinc-500 hover:text-red-600 cursor-pointer"
            >
              Seçimi Kaldır
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left p-3 rounded-xl bg-white border border-zinc-200 hover:border-emerald-500 transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
              <div>
                <span className="text-xs font-medium text-zinc-800 block group-hover:text-emerald-900">
                  {t.safeZones.selectZone}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {availableZones.length} doğrulanmış güvenli nokta ({city})
                </span>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">Seç</span>
          </button>
        </div>
      )}

      {/* Dropdown / List Modal */}
      {isOpen && (
        <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-2 max-h-60 overflow-y-auto shadow-lg">
          <div className="text-[11px] text-zinc-600 font-medium px-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            {city} için Doğrulanmış Kameralı Güvenli Noktalar
          </div>
          {availableZones.map((zone) => {
            const isSelected = selectedZone?.id === zone.id
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  onSelectZone(zone)
                  setIsOpen(false)
                }}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                    {zone.name}
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600">
                      {getTypeLabel(zone.type)}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {zone.address}, {zone.district}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

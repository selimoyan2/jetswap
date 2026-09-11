'use client'

import React, { useState, useEffect } from 'react'
import { RadarAlert, TradeItem } from '@/types'
import { useLanguage } from '@/i18n'
import { TURKEY_CITIES } from '@/data/locations'
import { Radio, Plus, Trash2, Search, Bell, CheckCircle2, ArrowRight, X } from 'lucide-react'

interface JetRadarModalProps {
  isOpen: boolean
  onClose: () => void
  allItems: TradeItem[]
  onSelectMatchingItem?: (item: TradeItem) => void
  onApplyFilter?: (keyword: string) => void
}

const RADAR_STORAGE_KEY = 'jetswap_radar_alerts'

export default function JetRadarModal({
  isOpen,
  onClose,
  allItems,
  onSelectMatchingItem,
  onApplyFilter
}: JetRadarModalProps) {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<RadarAlert[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newDistrict, setNewDistrict] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // Load alerts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(RADAR_STORAGE_KEY)
        if (saved) {
          setAlerts(JSON.parse(saved))
        } else {
          // Default initial alert example
          const initial: RadarAlert[] = [
            {
              id: 'radar-default-1',
              userId: 'user-current',
              keyword: 'Gitar',
              city: 'İstanbul',
              createdAt: new Date().toISOString(),
              matchCount: 1
            }
          ]
          setAlerts(initial)
          localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(initial))
        }
      } catch (err) {
        console.error('Failed to load radar alerts', err)
      }
    }
  }, [])

  // Save alerts to localStorage
  const saveAlerts = (newAlerts: RadarAlert[]) => {
    setAlerts(newAlerts)
    if (typeof window !== 'undefined') {
      localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(newAlerts))
    }
  }

  // Calculate matching items for an alert
  const getMatchingItems = (alert: RadarAlert): TradeItem[] => {
    return allItems.filter(item => {
      const matchKeyword = !alert.keyword || 
        item.title.toLowerCase().includes(alert.keyword.toLowerCase()) || 
        item.description.toLowerCase().includes(alert.keyword.toLowerCase()) ||
        item.targetDescription.toLowerCase().includes(alert.keyword.toLowerCase())
      
      const matchCategory = !alert.category || item.category === alert.category
      const matchCity = !alert.city || item.city.toLowerCase() === alert.city.toLowerCase()
      const matchDistrict = !alert.district || (item.district && item.district.toLowerCase().includes(alert.district.toLowerCase()))

      return matchKeyword && matchCategory && matchCity && matchDistrict
    })
  }

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyword.trim()) return

    const newAlert: RadarAlert = {
      id: `radar-${Date.now()}`,
      userId: 'user-current',
      keyword: newKeyword.trim(),
      category: newCategory || undefined,
      city: newCity || undefined,
      district: newDistrict.trim() || undefined,
      createdAt: new Date().toISOString(),
      matchCount: 0
    }

    const updated = [newAlert, ...alerts]
    saveAlerts(updated)
    setNewKeyword('')
    setNewCategory('')
    setNewCity('')
    setNewDistrict('')
    setFeedbackMsg(t.jetRadar.alertCreatedSuccess)
    setTimeout(() => setFeedbackMsg(null), 3000)
  }

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id)
    saveAlerts(updated)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Header */}
        <div className="relative p-6 bg-gradient-to-r from-cyan-950/60 via-neutral-900 to-blue-950/60 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {t.jetRadar.title}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold uppercase tracking-wider border border-cyan-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">{t.jetRadar.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Create Alert Form */}
          <form onSubmit={handleCreateAlert} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-400" />
                {t.jetRadar.createAlert}
              </span>
              {feedbackMsg && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {feedbackMsg}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">{t.jetRadar.keywordLabel} *</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder={t.jetRadar.keywordPlaceholder}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">{t.jetRadar.cityLabel}</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">{t.jetRadar.allCities}</option>
                  {TURKEY_CITIES.map((cityName) => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">{t.jetRadar.districtLabel}</label>
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  placeholder="Örn: Kadıköy, Çankaya..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder:text-neutral-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              {t.jetRadar.submitAlert}
            </button>
          </form>

          {/* Active Alerts List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              {t.jetRadar.activeAlerts} ({alerts.length})
            </h4>

            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                <Radio className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-400">{t.jetRadar.noAlerts}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const matches = getMatchingItems(alert)
                  return (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-neutral-800/60 border border-white/10 hover:border-cyan-500/30 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{alert.keyword}</span>
                            {alert.city && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                                {alert.city} {alert.district ? `/ ${alert.district}` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            Kurulum: {new Date(alert.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
                            matches.length > 0
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                              : 'bg-white/5 text-neutral-400'
                          }`}>
                            {matches.length} {t.jetRadar.matchesFound}
                          </span>

                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title={t.jetRadar.deleteAlert}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Matching Items Preview */}
                      {matches.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                          <div className="text-[11px] font-medium text-cyan-400 mb-2 flex items-center justify-between">
                            <span>{t.jetRadar.liveMatches}</span>
                            {onApplyFilter && (
                              <button
                                onClick={() => {
                                  onApplyFilter(alert.keyword)
                                  onClose()
                                }}
                                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-0.5 underline cursor-pointer"
                              >
                                İlanlarda Filtrele <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {matches.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (onSelectMatchingItem) {
                                    onSelectMatchingItem(item)
                                    onClose()
                                  }
                                }}
                                className="p-2 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/40 cursor-pointer flex items-center gap-2.5 transition-all group"
                              >
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-xs font-semibold text-white truncate group-hover:text-cyan-400">
                                    {item.title}
                                  </h5>
                                  <p className="text-[10px] text-neutral-400 truncate">
                                    {item.city} • {item.user.name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

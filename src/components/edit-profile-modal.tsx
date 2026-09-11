'use client'

import React, { useState, useEffect } from 'react'
import { X, User as UserIcon, Phone, MapPin, Building, ShieldCheck, Check, Sparkles, Truck, HandMetal, ArrowLeftRight, Globe } from 'lucide-react'
import { User, TradeMethod } from '@/types'
import { COUNTRIES, TURKEY_CITIES } from '@/data/locations'
import { useLanguage } from '@/i18n'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  onUpdateUser: (updated: User) => void
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
]

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const { t } = useLanguage()
  const [name, setName] = useState(currentUser.name)
  const [phone, setPhone] = useState(currentUser.phone || '')
  const [country, setCountry] = useState(currentUser.country || 'TR')
  const [city, setCity] = useState(currentUser.city || 'İstanbul')
  const [district, setDistrict] = useState(currentUser.district || '')
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar)
  const [tradeMethod, setTradeMethod] = useState<TradeMethod>('BOTH')
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    setName(currentUser.name)
    setPhone(currentUser.phone || '')
    setCountry(currentUser.country || 'TR')
    setCity(currentUser.city || 'İstanbul')
    setDistrict(currentUser.district || '')
    setSelectedAvatar(currentUser.avatar)
  }, [currentUser])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const updated: User = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      country,
      city: city.trim(),
      district: district.trim(),
      avatar: selectedAvatar,
    }

    onUpdateUser(updated)
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-zinc-900">{t.profile.title}</h3>
              <p className="text-[11px] text-zinc-500">{t.profile.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-zinc-900">{t.profile.savedSuccess}</h4>
            <p className="text-xs text-zinc-600">{t.common.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Avatar Seçimi */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-2">
                {t.profile.selectAvatar}
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(img)}
                    className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedAvatar === img 
                        ? 'border-emerald-600 ring-4 ring-emerald-500/20 scale-105' 
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <img src={img} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Ad & Soyad */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {t.profile.fullName} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {t.profile.phone} <span className="text-red-500">*</span>
                <span className="text-[10px] text-zinc-400 font-normal ml-1">{t.auth.phoneHint}</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Ülke Seçimi */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                {t.profile.country} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={e => {
                    const val = e.target.value
                    setCountry(val)
                    if (val === 'TR') {
                      setCity('İstanbul')
                    } else {
                      setCity('')
                    }
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Konum: Şehir & İlçe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  {t.profile.city} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {country === 'TR' ? (
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium cursor-pointer"
                    >
                      {TURKEY_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder={t.auth.cityPlaceholder}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                    />
                  )}
                  <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  {t.profile.district} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder={t.auth.districtPlaceholder}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Tercih Edilen Takas Yöntemi */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                {t.profile.tradePreference}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTradeMethod('HAND_TO_HAND')}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    tradeMethod === 'HAND_TO_HAND'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <HandMetal className="w-4 h-4 text-emerald-600" />
                  <span>{t.tradeMethods.HAND_TO_HAND}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTradeMethod('CARGO_ONLY')}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    tradeMethod === 'CARGO_ONLY'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>{t.tradeMethods.CARGO_ONLY}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTradeMethod('BOTH')}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    tradeMethod === 'BOTH'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                  <span>{t.tradeMethods.BOTH}</span>
                </button>
              </div>
            </div>

            {/* JetTrust Bilgi Kutusu */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{t.trustCenter.currentScore}:</span>
              </div>
              <span className="font-black text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                {currentUser.jetTrust}/100
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {t.profile.saveChanges}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

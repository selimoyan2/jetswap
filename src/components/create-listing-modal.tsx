'use client'

import React, { useState, useMemo } from 'react'
import { X, Plus, ArrowLeftRight, CheckCircle2, Sparkles, AlertTriangle, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { categories } from '@/data/mockData'
import { TURKEY_CITIES, COUNTRIES } from '@/data/locations'
import { TradeItem, ItemCondition, TradeMethod } from '@/types'
import { detectCashKeywords } from '@/lib/cashFilter'
import { useLanguage } from '@/i18n'
import { getConditionLabel, getTradeMethodLabel } from '@/i18n/helpers'

interface FormWant {
  id: string
  categoryId: string
  brand: string
  model: string
  minimumCondition: ItemCondition | ''
  isFlexible: boolean
  note: string
}

interface CreateListingModalProps {
  isOpen: boolean
  onClose: () => void
  onItemCreated: (newItem: Partial<TradeItem>) => void
  onOpenForbiddenPolicy: () => void
  isFirstTimeUser?: boolean
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
  onOpenForbiddenPolicy,
  isFirstTimeUser = false,
}) => {
  const { t, language } = useLanguage()
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [modelName, setModelName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('telefon')
  const [subCategory, setSubCategory] = useState('akilli-telefon')
  const [condition, setCondition] = useState<ItemCondition>('LIKE_NEW')
  const [tradeMethod, setTradeMethod] = useState<TradeMethod>('BOTH')
  const [city, setCity] = useState('İstanbul')
  const [country, setCountry] = useState('TR')
  const [wantsList, setWantsList] = useState<FormWant[]>([
    {
      id: 'want-1',
      categoryId: 'bilgisayar',
      brand: '',
      model: '',
      minimumCondition: '',
      isFlexible: false,
      note: '',
    }
  ])
  const [targetDescription, setTargetDescription] = useState('')
  const [openToOffers, setOpenToOffers] = useState(false)
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80')
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  // PRD Madde 38: Gerçek Zamanlı Para Talebi Filtresi
  const cashCheck = useMemo(() => {
    const wantsText = wantsList.map(w => `${w.brand} ${w.model} ${w.note}`).join(' ')
    const combinedText = `${title} ${description} ${targetDescription} ${wantsText}`
    return detectCashKeywords(combinedText)
  }, [title, description, targetDescription, wantsList])

  // Get active subcategories for selected category
  const activeCategoryObj = useMemo(() => {
    return categories.find(c => c.slug === category) || categories[0]
  }, [category])

  if (!isOpen) return null

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat)
    const catObj = categories.find(c => c.slug === newCat)
    if (catObj && catObj.subCategories.length > 0) {
      setSubCategory(catObj.subCategories[0].slug)
    }
  }

  const handleAddWant = () => {
    if (wantsList.length >= 10) return
    setWantsList(prev => [
      ...prev,
      {
        id: `want-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        categoryId: 'bilgisayar',
        brand: '',
        model: '',
        minimumCondition: '',
        isFlexible: false,
        note: '',
      }
    ])
  }

  const handleRemoveWant = (index: number) => {
    if (wantsList.length <= 1) return
    setWantsList(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateWant = (index: number, field: keyof FormWant, value: FormWant[keyof FormWant]) => {
    setWantsList(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    if (!title || !description) return
    if (cashCheck.hasCashViolation) return

    setLoading(true)

    try {
      const structuredWants = wantsList.map((w, idx) => ({
        categoryId: w.categoryId,
        brand: w.brand.trim() || undefined,
        model: w.model.trim() || undefined,
        minimumCondition: w.minimumCondition ? (w.minimumCondition as ItemCondition) : undefined,
        isFlexible: w.isFlexible || openToOffers,
        note: w.note.trim() || undefined,
        priority: idx,
      }))

      const targetDescText = targetDescription.trim() || (openToOffers ? 'Her türlü mantıklı takas teklifine açığım' : wantsList.map(w => w.note || `${w.brand} ${w.model}`.trim()).filter(Boolean).join(', ') || 'Takas tekliflerine açık')

      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId: category,
        condition,
        tradeMethod,
        images: [imageUrl],
        city: city.trim(),
        country: country.trim() || 'TR',
        targetCategories: wantsList.map(w => w.categoryId),
        targetDescription: targetDescText,
        valueTier: 'MEDIUM',
        wants: structuredWants,
      }

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          setServerError('İlan oluşturabilmek için lütfen önce giriş yapınız.')
        } else {
          setServerError(data?.error?.message || 'İlan oluşturulurken bir hata oluştu.')
        }
        setLoading(false)
        return
      }

      onItemCreated(data.data)
      setIsSuccess(true)
    } catch {
      setServerError('Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetAndClose = () => {
    setIsSuccess(false)
    setServerError('')
    setTitle('')
    setDescription('')
    setTargetDescription('')
    setWantsList([
      {
        id: 'want-1',
        categoryId: 'bilgisayar',
        brand: '',
        model: '',
        minimumCondition: '',
        isFlexible: false,
        note: '',
      }
    ])
    setOpenToOffers(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900">{t.createListing.modalTitle}</h3>
              <p className="text-xs text-zinc-500">{t.createListing.modalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-zinc-900">{t.createListing.addedToPortfolio}</h4>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              {t.createListing.addedToPortfolioDesc}
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {t.createListing.done}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* New User Welcome Banner */}
            {isFirstTimeUser && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300/80 rounded-2xl flex items-start gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-950">{t.createListing.welcomeNewUserTitle}</h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">{t.createListing.welcomeNewUserDesc}</p>
                </div>
              </div>
            )}

            {/* Cash Violation Alert */}
            {cashCheck.hasCashViolation && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-xs text-red-900 flex items-start gap-2.5 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">{t.createListing.cashBlockedTitle}</strong>
                  {cashCheck.warningMessage}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                {t.createListing.titleLabel} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t.createListing.titlePlaceholder}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  {t.createListing.brandLabel}
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder={t.createListing.brandPlaceholder}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  {t.createListing.modelLabel}
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  placeholder={t.createListing.modelPlaceholder}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Dynamic Cascading Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1.5">
                  {t.createListing.categoryLabel} *
                </label>
                <select
                  value={category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{language === 'en' ? c.nameEn : c.nameTr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1.5">
                  {t.createListing.subCategoryLabel} *
                </label>
                <select
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-emerald-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  {activeCategoryObj.subCategories.map(sub => (
                    <option key={sub.slug} value={sub.slug}>{language === 'en' ? sub.nameEn : sub.nameTr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition & Trade Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  {t.createListing.conditionLabel}
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as ItemCondition)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  <option value="BRAND_NEW">{getConditionLabel('BRAND_NEW', language)}</option>
                  <option value="LIKE_NEW">{getConditionLabel('LIKE_NEW', language)}</option>
                  <option value="VERY_GOOD">{getConditionLabel('VERY_GOOD', language)}</option>
                  <option value="GOOD">{getConditionLabel('GOOD', language)}</option>
                  <option value="FAIR">{getConditionLabel('FAIR', language)}</option>
                  <option value="REPAIR_NEEDED">{getConditionLabel('REPAIR_NEEDED', language)}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  {t.createListing.tradeMethodLabel}
                </label>
                <select
                  value={tradeMethod}
                  onChange={e => setTradeMethod(e.target.value as TradeMethod)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  <option value="BOTH">{getTradeMethodLabel('BOTH', language)}</option>
                  <option value="HAND_TO_HAND">{getTradeMethodLabel('HAND_TO_HAND', language)}</option>
                  <option value="CARGO_ONLY">{getTradeMethodLabel('CARGO_ONLY', language)}</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  {t.createListing.countryLabel}
                </label>
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
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  {t.createListing.cityLabel}
                </label>
                {country === 'TR' ? (
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
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
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                )}
              </div>
            </div>

            {/* NE İSTİYORSUN? YAPILANDIRILMIŞ WANTS (SPRINT 3) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/90 border-2 border-emerald-300/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-950">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                  <span>{t.createListing.wantSectionTitle || 'Takas Tercihleri (Ne İstiyorsun?)'}</span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    {wantsList.length}/10 İstek
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-300 self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={openToOffers}
                    onChange={e => setOpenToOffers(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-emerald-800">{t.createListing.openToAllOffers}</span>
                </label>
              </div>

              {/* Repeatable Want Cards */}
              <div className="space-y-3">
                {wantsList.map((want, index) => (
                  <div key={want.id} className="bg-white rounded-2xl p-3.5 border border-emerald-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                      <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <span>{index === 0 ? '1. Tercih (Öncelikli)' : `${index + 1}. Tercih`}</span>
                      </span>

                      {wantsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWant(index)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="İsteği Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Sil</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Kategori *
                        </label>
                        <select
                          value={want.categoryId}
                          onChange={e => handleUpdateWant(index, 'categoryId', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                        >
                          {categories.map(c => (
                            <option key={c.slug} value={c.slug}>{language === 'en' ? c.nameEn : c.nameTr}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Minimum Durum
                        </label>
                        <select
                          value={want.minimumCondition}
                          onChange={e => handleUpdateWant(index, 'minimumCondition', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                        >
                          <option value="">Fark Etmez / Her Durum</option>
                          <option value="BRAND_NEW">{getConditionLabel('BRAND_NEW', language)}</option>
                          <option value="LIKE_NEW">{getConditionLabel('LIKE_NEW', language)}</option>
                          <option value="VERY_GOOD">{getConditionLabel('VERY_GOOD', language)}</option>
                          <option value="GOOD">{getConditionLabel('GOOD', language)}</option>
                          <option value="FAIR">{getConditionLabel('FAIR', language)}</option>
                        </select>
                      </div>
                    </div>

                    {/* Brand & Model */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          İstenen Marka <span className="text-zinc-400 font-normal">(İsteğe bağlı)</span>
                        </label>
                        <input
                          type="text"
                          value={want.brand}
                          onChange={e => handleUpdateWant(index, 'brand', e.target.value)}
                          placeholder="örn. Sony, Apple, Dell"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          İstenen Model <span className="text-zinc-400 font-normal">(İsteğe bağlı)</span>
                        </label>
                        <input
                          type="text"
                          value={want.model}
                          onChange={e => handleUpdateWant(index, 'model', e.target.value)}
                          placeholder="örn. A7 III, MacBook Air M1"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>

                    {/* Flexible Checkbox & Note */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={want.isFlexible}
                          onChange={e => handleUpdateWant(index, 'isFlexible', e.target.checked)}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-zinc-700">
                          Benzer veya dengi ürün tekliflerine de açığım
                        </span>
                      </label>

                      <input
                        type="text"
                        value={want.note}
                        onChange={e => handleUpdateWant(index, 'note', e.target.value)}
                        placeholder="Özel istek notu (örn: Kutusu veya garantisi olursa sevinirim)"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Want Button */}
              {wantsList.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddWant}
                  className="w-full py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-100/50 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Başka İstek Ekle (Maksimum 10)</span>
                </button>
              )}

              {/* Genel Açıklama / Not */}
              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                  Genel Takas Tercihi Açıklaması
                </label>
                <textarea
                  rows={2}
                  value={targetDescription}
                  onChange={e => setTargetDescription(e.target.value)}
                  placeholder={openToOffers ? t.createListing.openToAllOffers : 'Takas tercihlerinize dair eklemek istediğiniz genel bir not...'}
                  className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <p className="text-[10px] text-emerald-800 mt-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                  <strong>JetMatch Hazırlığı:</strong> Eklediğiniz her yapılandırılmış istek ilerde eşleşme oranınızı artıracaktır.
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                {t.createListing.descriptionLabel} *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t.createListing.descriptionPlaceholder}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {serverError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={loading || cashCheck.hasCashViolation}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <span>{t.createListing.submitButton}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

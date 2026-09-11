'use client'

import React, { useState, useMemo } from 'react'
import { X, Plus, ArrowLeftRight, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react'
import { categories } from '@/data/mockData'
import { TradeItem, ItemCondition, TradeMethod } from '@/types'
import { detectCashKeywords } from '@/lib/cashFilter'

interface CreateListingModalProps {
  isOpen: boolean
  onClose: () => void
  onItemCreated: (newItem: Partial<TradeItem>) => void
  onOpenForbiddenPolicy: () => void
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
  onOpenForbiddenPolicy,
}) => {
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
  const [targetCategory, setTargetCategory] = useState('bilgisayar')
  const [targetSubCategory, setTargetSubCategory] = useState('dizustu-laptop')
  const [targetDescription, setTargetDescription] = useState('')
  const [openToOffers, setOpenToOffers] = useState(false)
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80')
  const [isSuccess, setIsSuccess] = useState(false)

  // PRD Madde 38: Gerçek Zamanlı Para Talebi Filtresi
  const cashCheck = useMemo(() => {
    const combinedText = `${title} ${description} ${targetDescription}`
    return detectCashKeywords(combinedText)
  }, [title, description, targetDescription])

  // Get active subcategories for selected category
  const activeCategoryObj = useMemo(() => {
    return categories.find(c => c.slug === category) || categories[0]
  }, [category])

  // Get active subcategories for target category
  const activeTargetCategoryObj = useMemo(() => {
    return categories.find(c => c.slug === targetCategory) || categories[1]
  }, [targetCategory])

  if (!isOpen) return null

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat)
    const catObj = categories.find(c => c.slug === newCat)
    if (catObj && catObj.subCategories.length > 0) {
      setSubCategory(catObj.subCategories[0].slug)
    }
  }

  const handleTargetCategoryChange = (newCat: string) => {
    setTargetCategory(newCat)
    const catObj = categories.find(c => c.slug === newCat)
    if (catObj && catObj.subCategories.length > 0) {
      setTargetSubCategory(catObj.subCategories[0].slug)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || (!targetDescription && !openToOffers)) return
    if (cashCheck.hasCashViolation) return

    onItemCreated({
      title,
      brand,
      modelName,
      description,
      category,
      subCategory,
      condition,
      tradeMethod,
      city,
      country,
      targetCategories: [targetCategory],
      targetSubCategories: [targetSubCategory],
      targetDescription: openToOffers && !targetDescription ? 'Her türlü mantıklı takas teklifine açığım' : targetDescription,
      openToOffers,
      images: [imageUrl],
      status: 'ACTIVE',
      createdAt: 'Bugün',
      likesCount: 0
    })

    setIsSuccess(true)
  }

  const handleResetAndClose = () => {
    setIsSuccess(false)
    setTitle('')
    setDescription('')
    setTargetDescription('')
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
              <h3 className="font-extrabold text-base text-zinc-900">Takasa Ürün Ekle (HAVE → WANT)</h3>
              <p className="text-xs text-zinc-500">Kategori & Alt Kategori Bazlı İsabetli Eşleşme</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-zinc-900">İlan Portföyünüze Eklendi!</h4>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              İlanınız başarıyla yayına alındı. <strong>JetMatch motorumuz</strong> belirlediğiniz alt kategori kriterlerine göre eşleşmeleri hesaplamaya başladı.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all"
            >
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Cash Violation Alert */}
            {cashCheck.hasCashViolation && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-xs text-red-900 flex items-start gap-2.5 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Para Talebi Engellendi (PRD Madde 3.1 & 38):</strong>
                  {cashCheck.warningMessage}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                1. Ürün Başlığı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Örn: iPhone 16 Pro 256GB veya Fender Player Stratocaster"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  Marka (Brand)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="Apple, Sony, Fender, Trek..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  Model
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  placeholder="16 Pro, WH-1000XM4, Stratocaster..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Dynamic Cascading Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-1.5">
                  Ana Kategori *
                </label>
                <select
                  value={category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.nameTr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1.5">
                  Alt Kategori (Spesifik Alan) *
                </label>
                <select
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-emerald-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {activeCategoryObj.subCategories.map(sub => (
                    <option key={sub.slug} value={sub.slug}>{sub.nameTr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition & Trade Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  Ürün Durumu (PRD Madde 7)
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as ItemCondition)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="BRAND_NEW">Sıfır / Kutusunda</option>
                  <option value="LIKE_NEW">Sıfıra Yakın (Çok Az Kullanılmış)</option>
                  <option value="VERY_GOOD">Çok İyi</option>
                  <option value="GOOD">İyi Durumda</option>
                  <option value="FAIR">Kullanılmış</option>
                  <option value="REPAIR_NEEDED">Onarım Gerekli</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  Teslim Yöntemi (PRD Madde 26)
                </label>
                <select
                  value={tradeMethod}
                  onChange={e => setTradeMethod(e.target.value as TradeMethod)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="BOTH">Yüz Yüze veya Kargo</option>
                  <option value="HAND_TO_HAND">Yalnızca Yüz Yüze Takas</option>
                  <option value="CARGO_ONLY">Yalnızca Kargo ile Takas</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  Ülke
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="TR">Türkiye (TR)</option>
                  <option value="DE">Almanya (DE)</option>
                  <option value="UK">Birleşik Krallık (UK)</option>
                  <option value="US">Amerika Birleşik Devletleri</option>
                  <option value="GLOBAL">Küresel / Online</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                  Şehir / Bölge
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="İstanbul (Kadıköy)"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* "NE İSTİYORSUN?" SİSTEMİ İLE HEDEF ALT KATEGORİ SEÇİMİ */}
            <div className="p-4 rounded-3xl bg-emerald-50/90 border-2 border-emerald-300/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-emerald-950">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-700" />
                  <span>Karşılığında Ne Almak İstersin? (WANT)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                  <input
                    type="checkbox"
                    checked={openToOffers}
                    onChange={e => setOpenToOffers(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-600 rounded"
                  />
                  <span className="text-[11px] font-bold text-emerald-800">Tekliflere Açığım</span>
                </label>
              </div>

              {/* Target Category & Target SubCategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                    İstediğin Kategori
                  </label>
                  <select
                    value={targetCategory}
                    onChange={e => handleTargetCategoryChange(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.nameTr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                    İstediğin Alt Kategori
                  </label>
                  <select
                    value={targetSubCategory}
                    onChange={e => setTargetSubCategory(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-emerald-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {activeTargetCategoryObj.subCategories.map(sub => (
                      <option key={sub.slug} value={sub.slug}>{sub.nameTr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                  Açık Takas İsteğin & Detaylar *
                </label>
                <textarea
                  required={!openToOffers}
                  rows={2}
                  value={targetDescription}
                  onChange={e => setTargetDescription(e.target.value)}
                  placeholder={openToOffers ? "Örn: Her türlü mantıklı teklife açığım..." : "Örn: MacBook Air M2 veya Sony aynasız gövde arıyorum..."}
                  className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <p className="text-[10px] text-emerald-800 mt-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                  <strong>JetMatch:</strong> Alt kategori eşleşmesi sayesinde %100 doğrudan isabet sağlanır.
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1.5">
                Eşyanın Detaylı Açıklaması *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Kutu içeriği, kozmetik durumu, batarya sağlığı veya bilinen kusurlarını dürüstçe yazınız..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={cashCheck.hasCashViolation}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                İlanı Portföye Ekle & Yayınla
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

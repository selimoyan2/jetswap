'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { 
  X, ArrowLeftRight, CheckCircle2, Clock, MessageSquare, Send, 
  ShieldCheck, Star, ThumbsUp, AlertCircle, Phone, Mail, MapPin, 
  ChevronRight, Sparkles, User, RefreshCw, Handshake, Ban, Leaf, Plus, Trash2, Scale
} from 'lucide-react'
import { mockCurrentUser, mockMyPortfolio, mockItems } from '@/data/mockData'
import { TradeOfferStatus, TradeItem } from '@/types'
import { detectCashKeywords } from '@/lib/cashFilter'
import { useLanguage } from '@/i18n'
import FairBarterScale from '@/components/fair-barter-scale'
import EcoImpactModal from '@/components/eco-impact-modal'

interface MySwapsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface MockOfferState {
  id: string
  partnerName: string
  partnerAvatar: string
  partnerTrust: number
  partnerCity: string
  partnerPhone: string
  partnerEmail: string
  myItems: string[]
  partnerItems: string[]
  status: TradeOfferStatus
  contactUnlocked: boolean
  messages: Array<{ sender: string; text: string; time: string; isMe: boolean }>
  timeline: Array<{ time: string; text: string; done: boolean }>
}

export const MySwapsModal: React.FC<MySwapsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'completed'>('incoming')
  const [selectedOfferId, setSelectedOfferId] = useState<string>('offer-1')
  const [chatInput, setChatInput] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [ratings, setRatings] = useState({ communication: 5, accuracy: 5, trust: 5 })
  const [reviewComment, setReviewComment] = useState('')
  const [showEcoModal, setShowEcoModal] = useState(false)
  const [isCounterDeskOpen, setIsCounterDeskOpen] = useState(false)
  const [counterItemIds, setCounterItemIds] = useState<string[]>([mockMyPortfolio[0]?.id || 'item-p1'])
  const [counterNote, setCounterNote] = useState('')

  // State for active offers
  const [offer, setOffer] = useState<MockOfferState>({
    id: 'offer-1',
    partnerName: 'Caner Demir',
    partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    partnerTrust: 96,
    partnerCity: 'İstanbul (Kadıköy)',
    partnerPhone: '+90 533 111 22 33',
    partnerEmail: 'caner.demir@example.com',
    myItems: ['Sony WH-1000XM4 Kablosuz ANC Kulaklık'],
    partnerItems: ['Fender Player Stratocaster Elektro Gitar'],
    status: 'NEGOTIATING',
    contactUnlocked: false,
    messages: [
      { sender: 'Caner', text: 'Merhaba Selim, gitar çok temiz. Kulaklığın batarya durumu nasıl?', time: '11:05', isMe: false },
      { sender: 'Selim', text: 'Selam Caner! Bataryası %100, 30 saat kesintisiz gidiyor. Kadıköy tarafında elden teslim edebilirim.', time: '11:12', isMe: true },
      { sender: 'Caner', text: 'Harika! İletişim bilgilerini açalım mı, hafta sonu buluşup takası yapalım?', time: '11:20', isMe: false }
    ],
    timeline: [
      { time: '10:32', text: 'Selim takas teklifini gönderdi', done: true },
      { time: '10:45', text: 'Caner teklifi görüntüledi', done: true },
      { time: '11:05', text: 'Görüşme ve müzakere başladı', done: true },
      { time: '11:20', text: 'Ön anlaşma ve iletişim onayı bekleniyor', done: false },
      { time: '--:--', text: 'Fiziksel takas ve kapanış onayı', done: false }
    ]
  })

  if (!isOpen) return null

  const chatCashCheck = detectCashKeywords(chatInput)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    if (chatCashCheck.hasCashViolation) return

    setOffer(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { sender: 'Selim', text: chatInput, time: 'Şimdi', isMe: true }
      ]
    }))
    setChatInput('')
  }

  const handleUnlockContact = () => {
    setOffer(prev => ({
      ...prev,
      contactUnlocked: true,
      status: 'CONTACT_REVEALED',
      timeline: prev.timeline.map((t, i) => i === 3 ? { ...t, done: true, text: 'İletişim bilgileri karşılıklı açıldı' } : t)
    }))
  }

  const handleCompleteSwap = () => {
    setShowReviewModal(true)
  }

  const handleSubmitReview = () => {
    setOffer(prev => ({
      ...prev,
      status: 'COMPLETED',
      timeline: prev.timeline.map(t => ({ ...t, done: true }))
    }))
    setReviewSubmitted(true)
  }

  const targetItemForScale = mockItems[0]
  const selectedCounterItems = mockMyPortfolio.filter(i => counterItemIds.includes(i.id))

  const toggleCounterItem = (id: string) => {
    setCounterItemIds(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(item => item !== id) : prev) : [...prev, id]
    )
  }

  const handleSendCounterOffer = () => {
    if (selectedCounterItems.length === 0) return
    const itemTitles = selectedCounterItems.map(i => i.title)
    
    setOffer(prev => ({
      ...prev,
      myItems: itemTitles,
      status: 'COUNTER_OFFERED',
      messages: [
        ...prev.messages,
        {
          sender: 'Selim',
          text: `🔄 [Müzakere Masası Revizyonu]: Teklifim güncellendi (${selectedCounterItems.length} eşya). ${counterNote ? `Not: "${counterNote}"` : ''}`,
          time: 'Şimdi',
          isMe: true
        }
      ],
      timeline: [
        ...prev.timeline,
        { time: 'Şimdi', text: 'Selim masadan yeni bir karşı teklif sundu', done: true }
      ]
    }))
    setIsCounterDeskOpen(false)
    setCounterNote('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[850px] flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base">{t.mySwaps.title}</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-md uppercase">
                  PRD Madde 37
                </span>
              </div>
              <p className="text-xs text-zinc-400">{t.mySwaps.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-zinc-100 px-6 pt-3 flex items-center gap-2 border-b border-zinc-200 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>{t.mySwaps.tabIncoming}</span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">1</span>
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>{t.mySwaps.tabOutgoing}</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>{t.mySwaps.tabCompleted}</span>
            <span className="bg-zinc-200 text-zinc-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">27</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Active Swap Info & Timeline */}
          <div className="md:col-span-6 p-5 border-r border-zinc-200 overflow-y-auto space-y-4 bg-zinc-50/50">
            {/* PRD Madde 28: Sabit Aktif Teklif Kartı */}
            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {t.mySwaps.activeSwapPackage} (1 ↔ 1)
                </span>
                <span className="text-xs font-black text-amber-600">
                  {offer.status === 'COMPLETED' ? `✓ ${t.statuses.COMPLETED}` : t.statuses[offer.status] || offer.status}
                </span>
              </div>

              {/* Side by side items */}
              <div className="grid grid-cols-5 gap-2 items-center text-xs">
                <div className="col-span-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  <span className="text-[9px] font-bold text-zinc-400 block uppercase">{t.mySwaps.youGive}</span>
                  <strong className="text-zinc-900 text-xs line-clamp-2 mt-0.5">{offer.myItems[0]}</strong>
                </div>

                <div className="col-span-1 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="col-span-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[9px] font-bold text-emerald-800 block uppercase">{t.mySwaps.partnerGives}</span>
                  <strong className="text-emerald-950 text-xs line-clamp-2 mt-0.5">{offer.partnerItems[0]}</strong>
                </div>
              </div>

              {/* Partner Card */}
              <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-zinc-200">
                    <Image src={offer.partnerAvatar} alt={offer.partnerName} fill className="object-cover" />
                  </div>
                  <div>
                    <strong className="text-xs text-zinc-900 block">{offer.partnerName}</strong>
                    <span className="text-[10px] text-zinc-500">{offer.partnerCity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {offer.partnerTrust} JetTrust
                  </span>
                </div>
              </div>
            </div>

            {/* PRD Madde 27: Teklif Zaman Çizelgesi (Timeline) */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-600 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{t.mySwaps.timelineTitle}</span>
              </h4>

              <div className="space-y-3 relative pl-3 border-l-2 border-emerald-200 ml-1">
                {offer.timeline.map((tItem, idx) => (
                  <div key={idx} className="relative flex items-start gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full -left-[18px] absolute mt-0.5 ${
                      tItem.done ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-zinc-300'
                    }`} />
                    <div className="min-w-0 flex-1 text-xs">
                      <span className="text-[10px] text-zinc-400 font-mono block">{tItem.time}</span>
                      <span className={`font-semibold ${tItem.done ? 'text-zinc-800' : 'text-zinc-400'}`}>
                        {tItem.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canlı Müzakere Masası (PRD & Innov #5) */}
            {offer.status !== 'COMPLETED' && (
              <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-cyan-600" />
                    <div>
                      <h5 className="font-extrabold text-xs text-zinc-900">{t.counterDesk.title}</h5>
                      <p className="text-[11px] text-zinc-500">{t.counterDesk.subtitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCounterDeskOpen(!isCounterDeskOpen)}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {isCounterDeskOpen ? 'Kapat' : 'Masayı Aç'}
                  </button>
                </div>

                {isCounterDeskOpen && (
                  <div className="pt-2 border-t border-cyan-500/20 space-y-3">
                    <div className="text-[11px] font-bold text-zinc-700">
                      {t.counterDesk.tableTitle} ({selectedCounterItems.length} eşya)
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {mockMyPortfolio.map((item) => {
                        const isSelected = counterItemIds.includes(item.id)
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleCounterItem(item.id)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-all ${
                              isSelected
                                ? 'bg-cyan-50 border-cyan-500 text-cyan-950 font-bold'
                                : 'bg-white border-zinc-200 text-zinc-600'
                            }`}
                          >
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-7 h-7 rounded-md object-cover"
                            />
                            <span className="truncate flex-1 text-[11px]">{item.title}</span>
                            <span className="text-[10px]">{isSelected ? '✓' : '+'}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Live Fair Scale */}
                    <FairBarterScale
                      offeredItems={selectedCounterItems}
                      targetItem={targetItemForScale}
                    />

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                        {t.counterDesk.noteLabel}
                      </label>
                      <input
                        type="text"
                        value={counterNote}
                        onChange={(e) => setCounterNote(e.target.value)}
                        placeholder={t.counterDesk.notePlaceholder}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendCounterOffer}
                      disabled={selectedCounterItems.length === 0}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {t.counterDesk.sendCounterOffer}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PRD Madde 30: İletişim Bilgilerini Açma Kartı */}
            <div className={`p-4 rounded-2xl border transition-all ${
              offer.contactUnlocked 
                ? 'bg-emerald-50 border-emerald-300' 
                : 'bg-zinc-900 text-white border-zinc-800'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className={`w-4 h-4 ${offer.contactUnlocked ? 'text-emerald-700' : 'text-emerald-400'}`} />
                <h5 className="font-extrabold text-xs">
                  {offer.contactUnlocked ? t.mySwaps.contactUnlockedTitle : t.mySwaps.contactLockedTitle}
                </h5>
              </div>

              {offer.contactUnlocked ? (
                <div className="space-y-1.5 text-xs text-emerald-950 mt-2 bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" /> 
                    <strong>{t.auth.phone}:</strong> {offer.partnerPhone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" /> 
                    <strong>{t.auth.email}:</strong> {offer.partnerEmail}
                  </p>
                  <p className="text-[11px] text-emerald-800 pt-1">
                    {t.mySwaps.contactRevealedNotice}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
                    {t.mySwaps.contactLockedNotice}
                  </p>
                  <button
                    onClick={handleUnlockContact}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {t.mySwaps.unlockContactButton}
                  </button>
                </div>
              )}
            </div>

            {/* PRD Madde 33: Takas Tamamlama Butonu */}
            {offer.contactUnlocked && offer.status !== 'COMPLETED' && (
              <button
                onClick={handleCompleteSwap}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black py-3 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Handshake className="w-4 h-4" />
                <span>{t.mySwaps.markCompletedButton}</span>
              </button>
            )}

            {/* Eko-Etki Karnesi Butonu */}
            <button
              onClick={() => setShowEcoModal(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>{t.ecoImpact.title}</span>
            </button>
          </div>

          {/* Right Column: In-Offer Messaging (PRD Madde 28) */}
          <div className="md:col-span-6 flex flex-col h-full bg-white">
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-zinc-800">{t.mySwaps.chatHeader}</span>
              </div>
              <span className="text-[10px] text-zinc-400">{t.mySwaps.chatSubtitle}</span>
            </div>

            {/* Messages stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/30">
              {offer.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      m.isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span className={`text-[9px] block mt-1 ${m.isMe ? 'text-emerald-100' : 'text-zinc-400'}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <div className="border-t border-zinc-200 bg-white p-3">
              {chatCashCheck.hasCashViolation && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span><strong>{t.createListing.cashBlockedTitle}</strong> {chatCashCheck.warningMessage}</span>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={t.mySwaps.chatPlaceholder}
                  className={`flex-1 bg-zinc-50 border rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 ${
                    chatCashCheck.hasCashViolation ? 'border-red-400 focus:ring-red-300' : 'border-zinc-200 focus:ring-emerald-500/30'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatCashCheck.hasCashViolation}
                  className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* PRD Madde 35: Değerlendirme Modalı (Takas Nasıl Geçti?) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            {reviewSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">{t.mySwaps.reviewSuccessTitle}</h3>
                <p className="text-xs text-zinc-600">
                  {t.mySwaps.reviewSuccessDesc}
                </p>
                <button
                  onClick={() => {
                    setShowReviewModal(false)
                    setReviewSubmitted(false)
                  }}
                  className="mt-3 bg-zinc-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  {t.common.close}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-base text-zinc-900">{t.mySwaps.reviewTitle}</h4>
                  <button onClick={() => setShowReviewModal(false)} className="text-zinc-400 hover:text-zinc-700 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  <strong>{offer.partnerName}</strong> {t.mySwaps.reviewSubtitle}
                </p>

                {/* 3 Criteria Ratings */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">{t.mySwaps.critCommunication}</label>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-5 h-5 fill-amber-500 cursor-pointer" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">{t.mySwaps.critAccuracy}</label>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-5 h-5 fill-amber-500 cursor-pointer" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">{t.mySwaps.critTrust}</label>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-5 h-5 fill-amber-500 cursor-pointer" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">{t.mySwaps.yourComment}</label>
                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder={t.mySwaps.commentPlaceholder}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                  >
                    {t.mySwaps.submitReview}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Eco Impact Modal */}
      <EcoImpactModal
        isOpen={showEcoModal}
        onClose={() => setShowEcoModal(false)}
      />
    </div>
  )
}

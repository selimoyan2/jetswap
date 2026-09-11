'use client'

import React, { useState } from 'react'
import { X, ShieldAlert, Users, Package, ArrowLeftRight, CheckCircle2, AlertTriangle, Ban, Flag, ShieldCheck } from 'lucide-react'

interface AdminDashboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [queue, setQueue] = useState([
    {
      id: 'mod-1',
      title: 'iPhone 15 Pro (Açıklamada "25000 TL" kelimesi geçti)',
      user: 'Ahmet K.',
      priority: 'ORTA',
      reason: 'Para Talebi Algılandı (PRD Madde 38)',
      time: '10 dk önce',
      status: 'PENDING'
    },
    {
      id: 'mod-2',
      title: 'Çakma AirPods Pro 2. Nesil',
      user: 'Bilinmeyen Kullanıcı',
      priority: 'YÜKSEK',
      reason: 'Sahte / Taklit Ürün Şikayeti',
      time: '25 dk önce',
      status: 'PENDING'
    },
  ])

  if (!isOpen) return null

  const handleAction = (id: string, action: 'APPROVE' | 'REMOVE') => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base">JetSwap Yönetim & Moderasyon Paneli</h3>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  Admin (Madde 45-47)
                </span>
              </div>
              <p className="text-xs text-zinc-400">Moderasyon kuyruğu, şikayetler ve sistem sağlığı</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Today Metrics Grid (Madde 45) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-xs font-bold">Yeni Üyeler</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-zinc-900">+48</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-xs font-bold">Takaslık Eşyalar</span>
                <Package className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-2xl font-black text-zinc-900">1,240</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-xs font-bold">Başarılı Takas</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-zinc-900">89</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-xs font-bold">Para Talebi Engellendi</span>
                <Ban className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-2xl font-black text-red-600">12</span>
            </div>
          </div>

          {/* Moderation Queue (Madde 46) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Bekleyen Moderasyon Kuyruğu ({queue.length})</span>
              </h4>
              <span className="text-[11px] text-zinc-400">Öncelik: Kritik &gt; Yüksek &gt; Orta</span>
            </div>

            {queue.length > 0 ? (
              <div className="space-y-3">
                {queue.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                          item.priority === 'YÜKSEK' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.priority} ÖNCELİK
                        </span>
                        <span className="text-xs text-zinc-400">{item.time}</span>
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 mt-1">{item.title}</h5>
                      <p className="text-xs text-red-700 font-semibold mt-0.5">{item.reason} • Gönderen: {item.user}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(item.id, 'APPROVE')}
                        className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'REMOVE')}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        İlanı Kaldır & Uyar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-500">
                Kuyrukta bekleyen şikayet veya kural ihlali bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

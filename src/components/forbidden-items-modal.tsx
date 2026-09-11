'use client'

import React from 'react'
import { X, ShieldAlert, Ban, AlertOctagon, CheckCircle } from 'lucide-react'

interface ForbiddenItemsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ForbiddenItemsModal: React.FC<ForbiddenItemsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const forbiddenList = [
    { title: 'Nakit Para & Para Karşılığı Satış', desc: 'Kesinlikle takas haricinde fiyat belirtmek, nakit talep etmek veya banka havalesi istemek yasaktır.' },
    { title: 'Yasa Dışı Maddeler & Reçeteli İlaçlar', desc: 'Uyuşturucu maddeler, tıbbi cihazlar ve reçeteye tabi ilaçların takası kabul edilmez.' },
    { title: 'Silahlar, Patlayıcılar & Mühimmat', desc: 'Ateşli veya kesici saldırı silahları, havalı tüfekler ve mühimmatlar takasa açılamaz.' },
    { title: 'Sahte & İmitasyon Ürünler', desc: 'Orijinal olmayan, lisanssız veya sahte marka taklidi ürünler sistem tarafından engellenir.' },
    { title: 'Ahlaka Aykırı & Pornografik İçerikler', desc: 'Genel ahlaka, aile yapısına aykırı her türlü müstehcen materyal ve yetişkin içerikleri.' },
    { title: 'Çalıntı Eşyalar & Seri Numarası Silinmiş Cihazlar', desc: 'Fatura veya meşru mülkiyeti şüpheli eşyalar.' },
    { title: 'Kişisel Veriler & Yasa Dışı Dijital Hesaplar', desc: 'Oyun hilesi, çalıntı hesap veya veri tabanı içeren dijital materyaller.' },
    { title: 'Yasa Dışı Canlı Hayvan Ticareti', desc: 'Nesli tükenmekte olan ve koruma altındaki yaban hayvanları.' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-zinc-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 text-red-600">
            <Ban className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base text-zinc-900">Yasaklı Ürünler & Ahlak Politikası</h3>
              <p className="text-xs text-zinc-500">PRD Madde 4 Uyarınca Genel Standartlar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 leading-relaxed">
            <strong>Önemli Hatırlatma:</strong> JetSwap güvenli, ahlaki kurallara saygılı ve yasal bir takas ekosistemi sunar. Aşağıda listelenen ürünlerin listelenmesi durumunda kullanıcı hesabı süresiz askıya alınır.
          </div>

          <div className="space-y-3">
            {forbiddenList.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-900">{item.title}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

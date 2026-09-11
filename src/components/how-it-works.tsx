'use client'

import React from 'react'
import { PlusCircle, Search, ArrowLeftRight, Lock, CheckCircle2, ShieldCheck, Cpu, Sparkles, Handshake } from 'lucide-react'

export const HowItWorks: React.FC = () => {
  // PRD Madde 33: 5 Adımlı "Nasıl Çalışır?"
  const steps = [
    {
      step: '01',
      title: '1. Ürününü Ekle (HAVE)',
      desc: 'Takas etmek istediğin ürünü marka, model, fotoğraflar ve durumuyla birkaç dakikada portföyüne ekle.',
      icon: PlusCircle,
      badge: 'Portföy'
    },
    {
      step: '02',
      title: '2. Ne İstediğini Söyle (WANT)',
      desc: 'Karşılığında almak istediğin kategorileri ve ürünleri seç veya "Tekliflere Açığım" olarak işaretle.',
      icon: Search,
      badge: 'İstek Listesi'
    },
    {
      step: '03',
      title: '3. JetMatch Eşleştirsin (MATCH)',
      desc: 'Sistem aradığın eşyaya sahip ve senin ürününü isteyen kullanıcıları akıllı algoritmasıyla anında bulur.',
      icon: Cpu,
      badge: 'JetMatch'
    },
    {
      step: '04',
      title: '4. Teklif Yap & Müzakere',
      desc: '1\'e 1 veya portföyünden çoklu ürün seçerek teklifini sun. Karşı tekliflerle ortak noktada buluş.',
      icon: ArrowLeftRight,
      badge: 'Çoklu Takas'
    },
    {
      step: '05',
      title: '5. Takas Et & Değerlendir (SWAP)',
      desc: 'Karşılıklı mutabakatta iletişim kartı açılır. Para kullanmadan değişimi tamamla, JetTrust puanı kazan!',
      icon: Handshake,
      badge: 'Sıfır Para'
    },
  ]

  return (
    <section id="nasil-calisir" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200">
          PRD Madde 33 • 5 Adımda Süreç
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mt-3">
          JetSwap Nasıl Çalışır?
        </h2>
        <p className="text-sm text-zinc-600 mt-3 font-medium max-w-xl mx-auto">
          Tek bir kuruş ödemeden, güvenli ve şeffaf adımlarla eşyalarınızı yeni sahipleriyle buluşturun.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="relative bg-white border border-zinc-200/90 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-zinc-200 group-hover:text-emerald-500 transition-colors">
                    {item.step}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                    {item.badge}
                  </span>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-zinc-100 group-hover:bg-emerald-600 group-hover:text-white text-zinc-700 flex items-center justify-center transition-all duration-300 mb-3">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-extrabold text-sm text-zinc-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

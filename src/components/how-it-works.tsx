'use client'

import React from 'react'
import { PlusCircle, Search, ArrowLeftRight, Lock, CheckCircle2, ShieldCheck, Cpu, Sparkles, Handshake } from 'lucide-react'
import { useLanguage } from '@/i18n'

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage()

  // PRD Madde 33: 5 Adımlı "Nasıl Çalışır?"
  const steps = [
    {
      step: '01',
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: PlusCircle,
      badge: t.howItWorks.step1Badge
    },
    {
      step: '02',
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: Search,
      badge: t.howItWorks.step2Badge
    },
    {
      step: '03',
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: Cpu,
      badge: t.howItWorks.step3Badge
    },
    {
      step: '04',
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
      icon: ArrowLeftRight,
      badge: t.howItWorks.step4Badge
    },
    {
      step: '05',
      title: t.howItWorks.step5Title,
      desc: t.howItWorks.step5Desc,
      icon: Handshake,
      badge: t.howItWorks.step5Badge
    },
  ]

  return (
    <section id="nasil-calisir" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200">
          {t.howItWorks.badge}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mt-3">
          {t.howItWorks.title}
        </h2>
        <p className="text-sm text-zinc-600 mt-3 font-medium max-w-xl mx-auto">
          {t.howItWorks.desc}
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

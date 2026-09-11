'use client'

import React from 'react'
import { Ban, ShieldCheck, Cpu, RefreshCw, Handshake, Lock } from 'lucide-react'
import { useLanguage } from '@/i18n'

export const Manifesto: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-8 my-8 shadow-2xl border border-zinc-800">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4 tracking-wider uppercase">
            <Ban className="w-4 h-4 text-emerald-400" />
            {t.manifesto.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {t.manifesto.title1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {t.manifesto.title2}
            </span>
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            {t.manifesto.desc}
          </p>
        </div>

        {/* 3 Core Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-6 backdrop-blur-xs hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t.manifesto.card1Title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t.manifesto.card1Desc}
            </p>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-6 backdrop-blur-xs hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t.manifesto.card2Title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t.manifesto.card2Desc}
            </p>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-6 backdrop-blur-xs hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t.manifesto.card3Title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t.manifesto.card3Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

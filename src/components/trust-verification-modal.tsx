'use client'

import React, { useState } from 'react'
import { X, ShieldCheck, CheckCircle2, Lock, Smartphone, Mail, FileText, ArrowRight, Sparkles, Award } from 'lucide-react'
import { mockCurrentUser } from '@/data/mockData'

import { User } from '@/types'
import { useLanguage } from '@/i18n'

interface TrustVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser?: User | null
}

export const TrustVerificationModal: React.FC<TrustVerificationModalProps> = ({ isOpen, onClose, currentUser }) => {
  const { t } = useLanguage()
  const activeUser = currentUser || mockCurrentUser
  const [activeStep, setActiveStep] = useState<number>(2) // User has Level 1 verified by default
  const [smsCode, setSmsCode] = useState('')
  const [isSmsSent, setIsSmsSent] = useState(false)
  const [level2Done, setLevel2Done] = useState(true)
  const [level3Status, setLevel3Status] = useState<'pending' | 'submitted' | 'verified'>('pending')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900">{t.trustCenter.title}</h2>
              <p className="text-xs text-zinc-500 font-medium">
                {t.trustCenter.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Trust Score Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                {t.trustCenter.currentScore}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black">{activeUser.jetTrust}</span>
                <span className="text-xs text-emerald-200">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-1">
                {t.trustCenter.verifiedBadge}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-800/80 border border-emerald-400/40 flex flex-col items-center justify-center text-center">
              <Award className="w-6 h-6 text-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white mt-0.5">Level 2</span>
            </div>
          </div>

          {/* Verification Levels */}
          <div className="space-y-4">
            {/* Level 1: E-posta */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-zinc-900">{t.trustCenter.level1Title}</h4>
                    <span className="text-[9px] font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                      {t.trustCenter.completedBadge} (+30)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{activeUser.email || mockCurrentUser.email}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
            </div>

            {/* Level 2: Telefon / SMS */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-zinc-900">{t.trustCenter.level2Title}</h4>
                    <span className="text-[9px] font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                      {t.trustCenter.completedBadge} (+40)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{activeUser.phone || mockCurrentUser.phone}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
            </div>

            {/* Level 3: Kimlik / Adres Teyidi (Opsiyonel Güven Rozeti) */}
            <div className="p-4 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-zinc-900">{t.trustCenter.level3Title}</h4>
                      <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                        +30 (Max 100 JT)
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {t.trustCenter.level3Desc}
                    </p>
                  </div>
                </div>
              </div>

              {level3Status === 'pending' ? (
                <div className="bg-zinc-50 rounded-xl p-3 border border-dashed border-zinc-300 text-center">
                  <p className="text-xs text-zinc-600 mb-2">
                    {t.trustCenter.privacyNote}
                  </p>
                  <button
                    type="button"
                    onClick={() => setLevel3Status('submitted')}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.trustCenter.uploadDoc}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.trustCenter.underReview}</span>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-2 border-t border-zinc-100">
            <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>
              {t.trustCenter.privacyNote}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  )
}

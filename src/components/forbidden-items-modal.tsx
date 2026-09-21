'use client'

import React from 'react'
import { X, ShieldAlert, Ban, AlertOctagon, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/i18n'

interface ForbiddenItemsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ForbiddenItemsModal: React.FC<ForbiddenItemsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage()
  if (!isOpen) return null

  const forbiddenList = [
    { title: t.forbiddenModal.rule1Title, desc: t.forbiddenModal.rule1Desc },
    { title: t.forbiddenModal.rule2Title, desc: t.forbiddenModal.rule2Desc },
    { title: t.forbiddenModal.rule3Title, desc: t.forbiddenModal.rule3Desc },
    { title: t.forbiddenModal.rule4Title, desc: t.forbiddenModal.rule4Desc },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
            <Ban className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">{t.forbiddenModal.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.forbiddenModal.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-xs text-red-800 dark:text-red-300 leading-relaxed">
            <strong>{t.forbiddenModal.penaltyNotice}</strong>
          </div>

          <div className="space-y-3">
            {forbiddenList.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs text-zinc-600 dark:text-zinc-300">
            {t.forbiddenModal.bannedItemsList}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

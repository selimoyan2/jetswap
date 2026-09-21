'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftRight, Shield, Globe, Heart, Lock, ShieldAlert, ShieldCheck, BookOpen } from 'lucide-react'
import { useLanguage } from '@/i18n'
import { ForbiddenItemsModal } from '@/components/forbidden-items-modal'

interface FooterProps {
  onOpenForbiddenPolicy?: () => void
}

export const Footer: React.FC<FooterProps> = ({ onOpenForbiddenPolicy }) => {
  const { t } = useLanguage()
  const [isForbiddenModalOpen, setIsForbiddenModalOpen] = useState(false)

  const handleForbiddenClick = () => {
    if (onOpenForbiddenPolicy) {
      onOpenForbiddenPolicy()
    } else {
      setIsForbiddenModalOpen(true)
    }
  }

  return (
    <footer className="bg-zinc-950 text-zinc-400 text-xs border-t border-zinc-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">Jet<span className="text-emerald-500">Swap</span></span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-medium">
              {t.footer.brandTagline}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>{t.footer.cashFreeGuarantee}</span>
            </div>
          </div>

          {/* Col 2: Platform & Özellikler */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">{t.footer.colPlatform}</h4>
            <ul className="space-y-2.5">
              <li><Link href="/#nasil-calisir" className="hover:text-emerald-400 transition-colors">{t.footer.howItWorksLink}</Link></li>
              <li><Link href="/jetmatch" className="hover:text-emerald-400 transition-colors">{t.footer.jetMatchLink}</Link></li>
              <li><Link href="/blog/esyadan-esyaya-takas-nasil-yapilir" className="hover:text-emerald-400 transition-colors">{t.footer.howToSwapLink}</Link></li>
            </ul>
          </div>

          {/* Col 3: Kaynaklar & Güvenlik */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">{t.footer.colResourcesSafety}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/blog" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t.footer.guidesAndBlog}</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleForbiddenClick}
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{t.footer.prohibitedItemsAndRules}</span>
                </button>
              </li>
              <li><Link href="/blog/guvenli-elden-takas-icin-5-altin-kural" className="hover:text-emerald-400 transition-colors">{t.footer.safeHandoverGuideLink}</Link></li>
              <li><Link href="/blog/takasta-deger-dengesi-nasil-saglanir" className="hover:text-emerald-400 transition-colors">{t.footer.fairBarterGuideLink}</Link></li>
              <li><Link href="/blog/dongusel-ekonomi-ve-sifir-atik" className="hover:text-emerald-400 transition-colors">{t.footer.circularEconomyGuideLink}</Link></li>
            </ul>
          </div>

          {/* Col 4: Küresel Ağ & Hosting */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">{t.footer.colNetwork}</h4>
            <p className="text-zinc-400 mb-3 text-xs leading-relaxed">
              {t.footer.networkDesc}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">{t.footer.coverage}</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {t.footer.hostingDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <p>{t.footer.bottomCopyright}</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              {t.footer.motto}
            </p>
            <Link 
              href="/admin" 
              className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
              title={t.footer.adminLink}
            >
              {t.footer.adminLink}
            </Link>
          </div>
        </div>
      </div>
      <ForbiddenItemsModal
        isOpen={isForbiddenModalOpen}
        onClose={() => setIsForbiddenModalOpen(false)}
      />
    </footer>
  )
}

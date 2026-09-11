'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeftRight, Shield, Globe, Heart, Lock, ShieldAlert, ShieldCheck } from 'lucide-react'

interface FooterProps {
  onOpenForbiddenPolicy?: () => void
}

export const Footer: React.FC<FooterProps> = ({ onOpenForbiddenPolicy }) => {
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
              Global Swap Network • Para Yok. Takas Var. (No Money. Just Swap.) Eşyaların eşyalarla buluştuğu nakitsiz küresel takas ekosistemi.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>%100 Nakitsiz Ekonomi Garantisi (PRD v1.0)</span>
            </div>
          </div>

          {/* Col 2: Platform & Özellikler */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Platform & Motorlar</h4>
            <ul className="space-y-2.5">
              <li><Link href="#nasil-calisir" className="hover:text-emerald-400 transition-colors">Nasıl Çalışır? (HAVE → WANT)</Link></li>
              <li><Link href="#eslesmeler" className="hover:text-emerald-400 transition-colors">JetMatch Eşleştirme Motoru</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Swap Chain (Çapraz Takas)</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Portföy Yönetim Rehberi</Link></li>
            </ul>
          </div>

          {/* Col 3: Güvenlik, JetTrust & Kurallar */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Güvenlik & JetTrust</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={onOpenForbiddenPolicy}
                  className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Yasaklı Ürünler & Ahlak Politikası</span>
                </button>
              </li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">JetTrust Güven Skoru Rehberi</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Korumalı İletişim Bariyeri</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Para Talebini Engelleme Sistemi</Link></li>
            </ul>
          </div>

          {/* Col 4: Küresel Ağ & Hosting */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Küresel Takas & Altyapı</h4>
            <p className="text-zinc-400 mb-3 text-xs leading-relaxed">
              jetswap.com.tr alan adı üzerinden Türkiye ve dünya geneline yayılan bağımsız takas ağı.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">TR / EN / DE / UK Kapsamı</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Hostinger VPS + Coolify Docker Standalone üzerinde barındırılır.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <p>© 2026 JetSwap (jetswap.com.tr) • PRD v1.0 • Para trafiği kesinlikle yasaktır.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Swap What You Have. Get What You Want.
            </p>
            <Link 
              href="/admin" 
              className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
              title="Yönetici Girişi"
            >
              Yönetici
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

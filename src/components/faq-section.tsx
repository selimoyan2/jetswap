'use client'

import React, { useState } from 'react'
import { ChevronDown, HelpCircle, Sparkles, MessageCircle, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/i18n'
import { FaqJsonLd } from '@/components/seo/json-ld'

interface FaqItem {
  qTr: string
  qEn: string
  aTr: string
  aEn: string
}

const GLOBAL_FAQS: FaqItem[] = [
  {
    qTr: 'JetSwap\'ta eşya takası yaparken para ödemek veya almak mümkün mü?',
    qEn: 'Is it possible to pay or receive money during a barter on JetSwap?',
    aTr: 'Hayır. JetSwap %100 sıfır nakit (zero-cash) kuralıyla çalışır. Sistemimizde para, ek ücret, banka havalesi veya kripto ödeme teklif etmek kesinlikle yasaktır ve otomatik filtrelerle anında engellenir. Değer farkı olduğunda portföyünüzden ek bir eşya masaya sürülür.',
    aEn: 'No. JetSwap operates under a strict 100% zero-cash policy. Demanding or offering cash top-ups, bank transfers, or cryptocurrency is strictly prohibited and automatically blocked. Value gaps are balanced by bundling additional items from your portfolio.'
  },
  {
    qTr: 'İki eşyanın değeri birbirine denk değilse takas nasıl dengelenir?',
    qEn: 'How is a trade balanced if two items are not equal in value?',
    aTr: 'JetSwap Adil Takas Terazisi (Fair Barter Scale) sayesinde ürünler 4 değer segmentine (Temel, Orta, Üst, Premium) ayrılır. Eşyalar arasında değer farkı varsa, sisteme portföyünüzden 1 veya daha fazla eşya ekleyerek "Paket Takas" (Bundle) oluşturabilir ve kabul edilme şansınızı %85\'in üzerine çıkarabilirsiniz.',
    aEn: 'Using the JetSwap Fair Barter Scale, items are assigned to 4 value tiers (Basic, Mid-Tier, Upper, Premium). When a value difference exists, you can bundle one or more items from your portfolio to achieve equilibrium, raising acceptance chances above 85%.'
  },
  {
    qTr: 'Elden takas yaparken güvenliğimi nasıl sağlarım?',
    qEn: 'How can I ensure my personal safety during in-person handovers?',
    aTr: 'JetSwap, İstanbul, Ankara ve İzmir gibi metropollerde 7/24 güvenlik kameralı ve kalabalık AVM ana girişleri, metro meydanları ve zabıta/emniyet yakınındaki "Doğrulanmış Güvenli Buluşma Noktaları"nı (Safe Trade Zones) önerir. Ayrıca Gizlilik Bariyeri sayesinde iki taraf onaylayana kadar telefon numaranız diğer kullanıcıya gösterilmez.',
    aEn: 'JetSwap recommends verified CCTV-monitored Safe Trade Zones located at central mall entrances, metro concourses, and municipal watch posts in major cities. Additionally, the Privacy Gate shields your phone number and email until both parties formally accept the barter terms.'
  },
  {
    qTr: 'JetTrust puanı nedir ve nasıl yükseltilir?',
    qEn: 'What is the JetTrust score and how can it be increased?',
    aTr: 'JetTrust (0-100), her kullanıcının takas güvenilirlik seviyesini gösteren dinamik bir skordur. Başarıyla tamamlanan takaslar, diğer üyelerden alınan 5 yıldızlı değerlendirmeler, profil doğrulama ve zamanında buluşma JetTrust puanınızı hızla yükseltir.',
    aEn: 'JetTrust (0-100) is a dynamic score reflecting each member\'s trustworthiness. Successfully completed handovers, 5-star peer reviews, profile verification, and punctuality increase your JetTrust rating.'
  },
  {
    qTr: 'JetRadar nedir ve nasıl çalışır?',
    qEn: 'What is JetRadar and how does it function?',
    aTr: 'JetRadar, aradığınız bir eşyayı (örneğin elektro gitar, MacBook, bisiklet) sisteme alarm olarak kaydetmenizi sağlar. Türkiye genelinde veya belirlediğiniz il/ilçede aradığınız kriterlere uygun yeni bir takas ilanı yayınlandığında JetRadar sizi anında uyarır.',
    aEn: 'JetRadar allows you to configure wishlist alerts for specific items (e.g., electric guitars, MacBooks, road bikes). When a matching barter is listed in your selected city or nationwide, JetRadar alerts you in real-time.'
  },
  {
    qTr: 'Eko-Etki Karnesi (Sıfır Atık) ne anlama gelir?',
    qEn: 'What does the Eco-Impact Scorecard signify?',
    aTr: 'Her tamamlanan takas, yeni bir ürünün fabrikalarda üretilmesini engelleyerek ortalama 14.5 kg CO₂ salınımını önler ve çöplüklere gidecek katı atığı kurtarır. Takas sonrası kazandığınız Eko-Etki Karnesi, doğaya doğrudan katkınızı tesciller ve sosyal medyada paylaşılabilir bir başarı kartı sunar.',
    aEn: 'Every completed swap prevents an average of 14.5 kg of CO₂ emissions and diverts usable hardware from landfills. Your Eco-Impact Scorecard validates your green contribution and provides a shareable digital achievement badge.'
  }
]

interface FaqSectionProps {
  className?: string
}

export default function FaqSection({ className = '' }: FaqSectionProps) {
  const { language, t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const isTr = language === 'tr'

  // Prepared data for JSON-LD schema
  const schemaFaqs = GLOBAL_FAQS.map(item => ({
    question: isTr ? item.qTr : item.qEn,
    answer: isTr ? item.aTr : item.aEn
  }))

  return (
    <section id="sss" className={`py-12 ${className}`}>
      {/* Dynamic JSON-LD Schema for Google Rich Snippets */}
      <FaqJsonLd faqs={schemaFaqs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center space-y-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            {t.faq.sectionBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {t.faq.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto">
            {t.faq.subtitle}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {GLOBAL_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            const question = isTr ? faq.qTr : faq.qEn
            const answer = isTr ? faq.aTr : faq.aEn

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-white/80 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-emerald-900' : 'text-zinc-800'}`}>
                    {question}
                  </span>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100">
                    <p>{answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Help Box */}
        <div className="mt-8 p-4 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.faq.stillHaveQuestions}</p>
              <p className="text-[11px] text-zinc-400">
                {isTr ? 'Takas rehberlerimizi inceleyebilir veya blog bölümümüzden detaylı kılavuzları okuyabilirsiniz.' : 'Explore our comprehensive barter guides in the knowledge hub.'}
              </p>
            </div>
          </div>

          <a
            href="/blog"
            className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
          >
            <span>{isTr ? 'Takas Rehberini İncele' : 'Read Barter Guides'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}

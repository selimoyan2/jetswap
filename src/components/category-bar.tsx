'use client'

import React from 'react'
import { categories } from '@/data/mockData'
import { useLanguage } from '@/i18n'
import { 
  Smartphone, Laptop, Camera, Gamepad2, Guitar, Bike, 
  Watch, Home, Compass, Car, Layers, ChevronRight,
  Shirt, Baby, BookOpen, Palette, Wrench, Sparkles
} from 'lucide-react'

interface CategoryBarProps {
  selectedCategory: string
  onSelectCategory: (slug: string) => void
  selectedSubCategory?: string
  onSelectSubCategory?: (slug: string) => void
}

const iconMap: Record<string, any> = {
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Guitar,
  Bike,
  Watch,
  Home,
  Compass,
  Car,
  Shirt,
  Baby,
  BookOpen,
  Palette,
  Wrench,
  Sparkles
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSubCategory = 'all',
  onSelectSubCategory
}) => {
  const { language, t } = useLanguage()
  const currentCategoryObj = categories.find(c => c.slug === selectedCategory)

  return (
    <div className="w-full space-y-2 py-3">
      {/* Level 1: Main Categories */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2.5 min-w-max">
          <button
            onClick={() => {
              onSelectCategory('all')
              onSelectSubCategory?.('all')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.categories.allCategories}</span>
          </button>

          {categories.map(c => {
            const Icon = iconMap[c.icon] || Layers
            const isSelected = selectedCategory === c.slug
            const categoryName = language === 'en' ? c.nameEn : c.nameTr

            return (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCategory(c.slug)
                  onSelectSubCategory?.('all')
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{categoryName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {c.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Level 2: Subcategories Pills (Appears when a main category is active) */}
      {currentCategoryObj && currentCategoryObj.subCategories && currentCategoryObj.subCategories.length > 0 && (
        <div className="overflow-x-auto no-scrollbar pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 min-w-max p-1.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 px-2 flex items-center gap-1">
              <span>{language === 'en' ? currentCategoryObj.nameEn : currentCategoryObj.nameTr}</span>
              <ChevronRight className="w-3 h-3" />
            </span>

            {/* All Subcategories Option */}
            <button
              onClick={() => onSelectSubCategory?.('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubCategory === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-emerald-900 hover:bg-emerald-100/60 border border-emerald-200'
              }`}
            >
              {language === 'en' ? 'All Subcategories' : 'Tüm Alt Başlıklar'}
            </button>

            {/* Individual Subcategories */}
            {currentCategoryObj.subCategories.map(sub => {
              const isSubSelected = selectedSubCategory === sub.slug
              const subName = language === 'en' ? sub.nameEn : sub.nameTr

              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubCategory?.(sub.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSubSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-zinc-800 hover:bg-emerald-100/60 border border-emerald-200/80'
                  }`}
                >
                  <span>{subName}</span>
                  {sub.count && (
                    <span className={`text-[9px] px-1.5 rounded-full ${
                      isSubSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {sub.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { SupportedLanguage, TranslationSchema, LanguageInfo, SUPPORTED_LANGUAGES } from './types'
import { dictionaries } from './locales'

export * from './types'
export * from './helpers'
export * from './locales'

interface LanguageContextValue {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  toggleLanguage: () => void
  t: TranslationSchema
  availableLanguages: LanguageInfo[]
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = 'jetswap_preferred_locale'

interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: SupportedLanguage
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'tr',
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'tr' || stored === 'en') {
        setLanguageState(stored)
      }
    } catch {}
  }, [])

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, newLang)
    } catch {}
  }

  const toggleLanguage = () => {
    const nextLang = language === 'tr' ? 'en' : 'tr'
    setLanguage(nextLang)
  }

  const t = useMemo(() => {
    return dictionaries[language] || dictionaries.tr
  }, [language])

  const contextValue = useMemo(() => {
    return {
      language,
      setLanguage,
      toggleLanguage,
      t,
      availableLanguages: SUPPORTED_LANGUAGES,
    }
  }, [language, t])

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react'
import { 
  SupportedLanguage, 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE, 
  LOCALE_COOKIE_NAME, 
  LOCALE_STORAGE_KEY,
  isValidLocale,
  getLocaleDirection,
  TextDirection,
  SUPPORTED_LOCALE_CODES
} from './config'

import { TranslationSchema } from './types'
import { dictionaries } from './locales'

export * from './config'
export * from './types'
export * from './helpers'
export * from './locales'

interface LanguageContextValue {
  language: SupportedLanguage
  direction: TextDirection
  setLanguage: (lang: SupportedLanguage) => void
  toggleLanguage: () => void
  t: TranslationSchema
  availableLanguages: SupportedLanguage[]
}


const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: SupportedLanguage
  initialLocale?: SupportedLanguage
}

function persistLocale(lang: SupportedLanguage) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lang)
    document.cookie = `${LOCALE_COOKIE_NAME}=${lang};path=/;max-age=31536000;SameSite=Lax`
  } catch {}
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = DEFAULT_LOCALE,
  initialLocale,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (initialLocale && isValidLocale(initialLocale)) {
      return initialLocale
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
        if (stored && isValidLocale(stored)) {
          return stored
        }
      } catch {}
    }
    return defaultLanguage
  })

  // Synchronize on mount if client has stored preference different from server initial
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored && isValidLocale(stored) && stored !== language) {
        setLanguageState(stored)
        document.cookie = `${LOCALE_COOKIE_NAME}=${stored};path=/;max-age=31536000;SameSite=Lax`
      }
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!isValidLocale(newLang)) return
    setLanguageState(newLang)
    persistLocale(newLang)

    // Update document lang and dir dynamically on client
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang
      document.documentElement.dir = getLocaleDirection(newLang)
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: SupportedLanguage = prev === 'tr' ? 'en' : 'tr'
      persistLocale(next)
      if (typeof document !== 'undefined') {
        document.documentElement.lang = next
        document.documentElement.dir = getLocaleDirection(next)
      }
      return next
    })
  }, [])

  const t = useMemo(() => {
    return dictionaries[language] || dictionaries.tr
  }, [language])

  const direction = useMemo(() => {
    return getLocaleDirection(language)
  }, [language])

  const contextValue = useMemo(() => {
    return {
      language,
      direction,
      setLanguage,
      toggleLanguage,
      t,
      availableLanguages: SUPPORTED_LOCALE_CODES,
    }
  }, [language, direction, setLanguage, toggleLanguage, t])


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

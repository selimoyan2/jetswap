'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { Theme, DEFAULT_THEME, THEME_COOKIE_NAME, THEME_STORAGE_KEY, isValidTheme } from './config'

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: Theme
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {}

  try {
    // 1 year persistence, SameSite=Lax for security and seamless navigation
    document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`
  } catch {}
}

function applyThemeToDOM(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }
}

export function ThemeProvider({ children, initialTheme = DEFAULT_THEME }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  // Ensure DOM matches theme on initial mount
  useEffect(() => {
    // Check if localStorage has an override
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (isValidTheme(stored) && stored !== theme) {
        setThemeState(stored)
        applyThemeToDOM(stored)
        return
      }
    } catch {}

    applyThemeToDOM(theme)
  }, [])

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    persistTheme(nextTheme)
    applyThemeToDOM(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      persistTheme(next)
      applyThemeToDOM(next)
      return next
    })
  }, [])

  const contextValue = useMemo<ThemeContextValue>(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }), [theme, setTheme, toggleTheme])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

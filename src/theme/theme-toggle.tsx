'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './theme-context'
import { useLanguage } from '@/i18n'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  const isDark = theme === 'dark'
  const title = isDark ? t.common.switchToLight : t.common.switchToDark
  const label = isDark ? t.common.lightTheme : t.common.darkTheme

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer bg-white dark:bg-zinc-900 shadow-2xs ${className}`}
      title={title}
      aria-label={title}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
      )}
      {showLabel && <span>{label}</span>}
    </button>
  )
}

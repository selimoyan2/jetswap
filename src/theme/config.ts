export type Theme = 'light' | 'dark'

export const DEFAULT_THEME: Theme = 'light'
export const THEME_COOKIE_NAME = 'jetswap_theme'
export const THEME_STORAGE_KEY = 'jetswap_preferred_theme'

export const SUPPORTED_THEMES: Theme[] = ['light', 'dark']
export const THEMES = SUPPORTED_THEMES

export function isValidTheme(theme: unknown): theme is Theme {
  return typeof theme === 'string' && (theme === 'light' || theme === 'dark')
}

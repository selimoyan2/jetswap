/**
 * Sprint 16: Global Light / Dark Theme Foundation
 * Test Suite: Theme Architecture, Persistence, and Locale Independence Verification
 *
 * Covers:
 * 1. Theme configuration contracts (default theme, supported themes, cookie/storage constants)
 * 2. Theme validator (isValidTheme)
 * 3. 1:1 Translation key parity for theme controls (Turkish and English)
 * 4. Strict independence between Theme and Locale states (distinct cookies and storage keys)
 * 5. Tailwind CSS v4 class-based dark mode variant verification in globals.css
 * 6. Zero FOUC pre-hydration script and layout SSR cookie contract verification
 */

import fs from 'fs'
import path from 'path'
import { 
  DEFAULT_THEME, 
  THEMES, 
  THEME_COOKIE_NAME, 
  THEME_STORAGE_KEY, 
  isValidTheme 
} from '../src/theme/config'
import { LOCALE_COOKIE_NAME, LOCALE_STORAGE_KEY } from '../src/i18n/config'
import { tr } from '../src/i18n/locales/tr'
import { en } from '../src/i18n/locales/en'

let totalTests = 0
let passedTests = 0

function assert(condition: boolean, testName: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ PASS: ${testName}`)
  } else {
    console.error(`  ❌ FAIL: ${testName}`)
    throw new Error(`Test failed: ${testName}`)
  }
}

console.log('\n========================================')
console.log('🧪 JETSWAP THEME FOUNDATION TEST SUITE')
console.log('========================================\n')

// 1. Theme Configuration Contracts
console.log('--- Group 1: Theme Configuration Contracts ---')
assert(DEFAULT_THEME === 'light', 'Default theme MUST be "light"')
assert(THEMES.length === 2 && THEMES.includes('light') && THEMES.includes('dark'), 'THEMES must contain exactly "light" and "dark"')
assert(THEME_COOKIE_NAME === 'jetswap_theme', 'THEME_COOKIE_NAME must be "jetswap_theme"')
assert(THEME_STORAGE_KEY === 'jetswap_preferred_theme', 'THEME_STORAGE_KEY must be "jetswap_preferred_theme"')

// 2. Theme Validation (isValidTheme)
console.log('\n--- Group 2: Theme Validation Logic ---')
assert(isValidTheme('light') === true, 'isValidTheme("light") must be true')
assert(isValidTheme('dark') === true, 'isValidTheme("dark") must be true')
assert(isValidTheme('system') === false, 'isValidTheme("system") must be false (only explicit light or dark supported)')
assert(isValidTheme('blue') === false, 'isValidTheme("blue") must be false')
assert(isValidTheme('') === false, 'isValidTheme("") must be false')
assert(isValidTheme(null) === false, 'isValidTheme(null) must be false')
assert(isValidTheme(undefined) === false, 'isValidTheme(undefined) must be false')
assert(isValidTheme(123) === false, 'isValidTheme(123) must be false')

// 3. Theme & Locale Independence Invariant
console.log('\n--- Group 3: Theme and Locale Independence Matrix ---')
assert((THEME_COOKIE_NAME as string) !== (LOCALE_COOKIE_NAME as string), 'Theme cookie name must be strictly distinct from Locale cookie name')
assert((THEME_STORAGE_KEY as string) !== (LOCALE_STORAGE_KEY as string), 'Theme localStorage key must be strictly distinct from Locale localStorage key')

// 4. i18n Translation Keys for Theme
console.log('\n--- Group 4: i18n Theme Translation Keys ---')
assert(typeof tr.common.theme === 'string' && tr.common.theme.length > 0, 'tr.common.theme is defined')
assert(typeof en.common.theme === 'string' && en.common.theme.length > 0, 'en.common.theme is defined')
assert(typeof tr.common.lightTheme === 'string' && tr.common.lightTheme.length > 0, 'tr.common.lightTheme is defined')
assert(typeof en.common.lightTheme === 'string' && en.common.lightTheme.length > 0, 'en.common.lightTheme is defined')
assert(typeof tr.common.darkTheme === 'string' && tr.common.darkTheme.length > 0, 'tr.common.darkTheme is defined')
assert(typeof en.common.darkTheme === 'string' && en.common.darkTheme.length > 0, 'en.common.darkTheme is defined')
assert(typeof tr.common.switchToLight === 'string' && tr.common.switchToLight.length > 0, 'tr.common.switchToLight is defined')
assert(typeof en.common.switchToLight === 'string' && en.common.switchToLight.length > 0, 'en.common.switchToLight is defined')
assert(typeof tr.common.switchToDark === 'string' && tr.common.switchToDark.length > 0, 'tr.common.switchToDark is defined')
assert(typeof en.common.switchToDark === 'string' && en.common.switchToDark.length > 0, 'en.common.switchToDark is defined')

// 5. Tailwind CSS v4 Dark Mode Variant Contract
console.log('\n--- Group 5: Tailwind CSS v4 & CSS Variables Contract ---')
const globalsCssPath = path.resolve(__dirname, '../src/app/globals.css')
const globalsCssContent = fs.readFileSync(globalsCssPath, 'utf8')
assert(
  globalsCssContent.includes('@custom-variant dark (&:where(.dark, .dark *));'),
  'globals.css must contain @custom-variant dark (&:where(.dark, .dark *)); for class-based dark mode'
)
assert(
  globalsCssContent.includes(':root') && globalsCssContent.includes('.dark'),
  'globals.css must define both :root (light) and .dark semantic CSS custom properties'
)

// 6. Zero FOUC Pre-Hydration & Layout SSR Contract
console.log('\n--- Group 6: Zero FOUC & Layout SSR Contract ---')
const layoutPath = path.resolve(__dirname, '../src/app/layout.tsx')
const layoutContent = fs.readFileSync(layoutPath, 'utf8')
assert(
  layoutContent.includes('THEME_COOKIE_NAME') || layoutContent.includes('jetswap_theme'),
  'layout.tsx must read the THEME_COOKIE_NAME cookie during SSR'
)
assert(
  layoutContent.includes('dangerouslySetInnerHTML'),
  'layout.tsx must contain a synchronous pre-hydration script to prevent FOUC'
)
assert(
  layoutContent.includes('ThemeProvider'),
  'layout.tsx must wrap application tree in ThemeProvider'
)

console.log('\n========================================')
console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED!`)
console.log('========================================\n')

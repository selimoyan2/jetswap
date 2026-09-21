/**
 * Sprint: Internationalization Foundation & Global App Shell
 * Test Suite: i18n & App Shell Contract Verification
 *
 * Covers:
 * 1. 1:1 Key Parity between Turkish (tr) and English (en) dictionaries
 * 2. Leaf values validation (no missing, undefined, or empty values)
 * 3. TradeOfferStatus label translations for all 6 Prisma enum values
 * 4. ItemCondition & TradeMethod localized helpers and fallback handling
 * 5. Locale configuration, validation, and text direction resolution
 * 6. Date formatting localization
 * 7. Cookie and Header contract verification
 */

import { tr } from '../src/i18n/locales/tr'
import { en } from '../src/i18n/locales/en'
import { 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE, 
  isValidLocale, 
  getLocaleDirection, 
  LOCALE_COOKIE_NAME, 
  LOCALE_STORAGE_KEY 
} from '../src/i18n/config'
import { 
  getOfferStatusLabel, 
  getConditionLabel, 
  getItemConditionLabel, 
  getTradeMethodLabel, 
  formatLocalizedDate 
} from '../src/i18n/helpers'
import { TradeOfferStatus } from '../src/types'

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

// Helper: recursively extract all dotted key paths from an object
function getAllKeyPaths(obj: Record<string, any>, prefix = ''): string[] {
  let paths: string[] = []
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      paths = paths.concat(getAllKeyPaths(val, fullPath))
    } else {
      paths.push(fullPath)
    }
  }
  return paths
}

// Helper: get value at dotted path
function getValueByPath(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

console.log('\n======================================================')
console.log('  JETSWAP i18n & GLOBAL APP SHELL TEST SUITE')
console.log('======================================================\n')

// 1. DICTIONARY KEY PARITY TESTS
console.log('--- Suite 1: Dictionary 1:1 Parity (TR <-> EN) ---')
const trKeyPaths = getAllKeyPaths(tr).sort()
const enKeyPaths = getAllKeyPaths(en).sort()

assert(trKeyPaths.length > 0, `TR dictionary has populated keys (found ${trKeyPaths.length})`)
assert(enKeyPaths.length > 0, `EN dictionary has populated keys (found ${enKeyPaths.length})`)

const missingInEn = trKeyPaths.filter(k => !enKeyPaths.includes(k))
const missingInTr = enKeyPaths.filter(k => !trKeyPaths.includes(k))

assert(
  missingInEn.length === 0,
  `No missing keys in EN (Missing count: ${missingInEn.length} ${missingInEn.slice(0, 3).join(', ')})`
)
assert(
  missingInTr.length === 0,
  `No extra/missing keys in TR compared to EN (Missing count: ${missingInTr.length})`
)
assert(
  trKeyPaths.length === enKeyPaths.length,
  `Exact key count parity between TR and EN (${trKeyPaths.length} keys each)`
)

// 2. LEAF VALUES VALIDITY
console.log('\n--- Suite 2: Leaf Values Validity ---')
let allStringsTr = true
let allStringsEn = true
let emptyLeavesTr: string[] = []
let emptyLeavesEn: string[] = []

for (const path of trKeyPaths) {
  const trVal = getValueByPath(tr, path)
  if (typeof trVal !== 'string') allStringsTr = false
  if (typeof trVal === 'string' && trVal.trim().length === 0) emptyLeavesTr.push(path)

  const enVal = getValueByPath(en, path)
  if (typeof enVal !== 'string') allStringsEn = false
  if (typeof enVal === 'string' && enVal.trim().length === 0) emptyLeavesEn.push(path)
}

assert(allStringsTr, 'All TR leaf values are valid strings')
assert(allStringsEn, 'All EN leaf values are valid strings')
assert(emptyLeavesTr.length === 0, `No empty string leaves in TR (Empty count: ${emptyLeavesTr.length})`)
assert(emptyLeavesEn.length === 0, `No empty string leaves in EN (Empty count: ${emptyLeavesEn.length})`)

// 3. STATUS LABEL LOCALIZATION (ALL 6 PRISMA ENUM VALUES)
console.log('\n--- Suite 3: TradeOfferStatus Label Localization ---')
const allStatuses: TradeOfferStatus[] = [
  'PENDING',
  'COUNTER_OFFERED',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED'
]

for (const status of allStatuses) {
  const labelTr = getOfferStatusLabel(status, 'tr')
  const labelEn = getOfferStatusLabel(status, 'en')

  assert(Boolean(labelTr) && labelTr !== status, `TR label for ${status} is human-friendly ("${labelTr}")`)
  assert(Boolean(labelEn) && labelEn !== status, `EN label for ${status} is human-friendly ("${labelEn}")`)
  assert(labelTr !== labelEn, `TR and EN labels for ${status} are distinct ("${labelTr}" != "${labelEn}")`)
}

// Check fallback for unknown status
assert(getOfferStatusLabel('UNKNOWN_STATUS' as any, 'tr') === 'UNKNOWN_STATUS', 'Fallback for unknown status returns raw key')

// 4. ITEM CONDITION & TRADE METHOD LOCALIZATION
console.log('\n--- Suite 4: ItemCondition & TradeMethod Localization ---')
const conditions = ['BRAND_NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'FAIR', 'REPAIR_NEEDED']
for (const cond of conditions) {
  const trLabel = getConditionLabel(cond, 'tr')
  const enLabel = getConditionLabel(cond, 'en')
  assert(Boolean(trLabel) && trLabel !== cond, `TR condition label for ${cond} resolved ("${trLabel}")`)
  assert(Boolean(enLabel) && enLabel !== cond, `EN condition label for ${cond} resolved ("${enLabel}")`)
}
assert(getItemConditionLabel === getConditionLabel, 'getItemConditionLabel is an exact alias of getConditionLabel')

const tradeMethods = ['HAND_TO_HAND', 'CARGO_ONLY', 'BOTH', 'FACE_TO_FACE', 'CARGO']
for (const method of tradeMethods) {
  const trLabel = getTradeMethodLabel(method, 'tr')
  const enLabel = getTradeMethodLabel(method, 'en')
  assert(Boolean(trLabel) && trLabel !== method, `TR trade method label for ${method} resolved ("${trLabel}")`)
  assert(Boolean(enLabel) && enLabel !== method, `EN trade method label for ${method} resolved ("${enLabel}")`)
}


// 5. CONFIGURATION & LOCALE VALIDATION
console.log('\n--- Suite 5: Configuration & Locale Validation ---')
assert(DEFAULT_LOCALE === 'tr', 'Default locale is "tr"')
assert(isValidLocale('tr'), 'isValidLocale("tr") is true')
assert(isValidLocale('en'), 'isValidLocale("en") is true')
assert(!isValidLocale('de'), 'isValidLocale("de") is false (not yet active)')
assert(!isValidLocale(''), 'isValidLocale("") is false')
assert(!isValidLocale(null), 'isValidLocale(null) is false')
assert(!isValidLocale(undefined), 'isValidLocale(undefined) is false')

assert(getLocaleDirection('tr') === 'ltr', 'getLocaleDirection("tr") is "ltr"')
assert(getLocaleDirection('en') === 'ltr', 'getLocaleDirection("en") is "ltr"')
assert(SUPPORTED_LOCALES.tr.localeCode === 'tr-TR', 'TR locale code is tr-TR')
assert(SUPPORTED_LOCALES.en.localeCode === 'en-US', 'EN locale code is en-US')

// 6. COOKIE & STORAGE CONSTANTS
console.log('\n--- Suite 6: Cookie & Storage Constants ---')
assert(LOCALE_COOKIE_NAME === 'jetswap_locale', 'LOCALE_COOKIE_NAME is "jetswap_locale"')
assert(LOCALE_STORAGE_KEY === 'jetswap_preferred_locale', 'LOCALE_STORAGE_KEY is "jetswap_preferred_locale"')

// 7. DATE FORMATTING
console.log('\n--- Suite 7: Localized Date Formatting ---')
const testDate = new Date('2026-09-20T12:30:00Z')
const dateStrTr = formatLocalizedDate(testDate, 'tr')
const dateStrEn = formatLocalizedDate(testDate, 'en')
assert(Boolean(dateStrTr) && dateStrTr.length > 0, `TR date format generated: "${dateStrTr}"`)
assert(Boolean(dateStrEn) && dateStrEn.length > 0, `EN date format generated: "${dateStrEn}"`)
assert(formatLocalizedDate('invalid-date', 'tr') === '', 'Invalid date returns empty string safely')

// 8. HEADER NAVIGATION CLEANUP & FOOTER CONTRACT
console.log('\n--- Suite 8: Header Navigation Cleanup & Resources/Safety Footer Contract ---')
assert(tr.footer.colResourcesSafety === 'Kaynaklar & Güvenlik', 'TR footer.colResourcesSafety is "Kaynaklar & Güvenlik"')
assert(en.footer.colResourcesSafety === 'Resources & Safety', 'EN footer.colResourcesSafety is "Resources & Safety"')
assert(tr.footer.guidesAndBlog === 'Rehber & Blog', 'TR footer.guidesAndBlog is "Rehber & Blog"')
assert(en.footer.guidesAndBlog === 'Guides & Blog', 'EN footer.guidesAndBlog is "Guides & Blog"')
assert(tr.footer.prohibitedItemsAndRules === 'Yasaklı Ürünler & Kurallar', 'TR footer.prohibitedItemsAndRules is "Yasaklı Ürünler & Kurallar"')
assert(en.footer.prohibitedItemsAndRules === 'Prohibited Items & Rules', 'EN footer.prohibitedItemsAndRules is "Prohibited Items & Rules"')

import fs from 'fs'
import path from 'path'

const navbarPath = path.resolve(__dirname, '../src/components/navbar.tsx')
const navbarContent = fs.readFileSync(navbarPath, 'utf8')
const desktopNavMatch = navbarContent.match(/<div className="hidden lg:flex items-center gap-3">([\s\S]*?)<\/div>/)
assert(Boolean(desktopNavMatch), 'Desktop nav section found in navbar.tsx')
if (desktopNavMatch) {
  const desktopNavCode = desktopNavMatch[1]
  assert(!desktopNavCode.includes('href="/blog"'), 'Desktop nav does NOT contain /blog (Rehber & Blog)')
  assert(!desktopNavCode.includes('forbiddenItems'), 'Desktop nav does NOT contain forbiddenItems (Yasaklı Ürünler & Kurallar)')
  assert(desktopNavCode.includes('t.nav.howItWorks'), 'Desktop nav prioritizes Nasıl Çalışır')
  assert(desktopNavCode.includes('t.nav.jetMatch'), 'Desktop nav prioritizes JetMatch')
  assert(desktopNavCode.includes('t.jetRadar.navbarBadge'), 'Desktop nav prioritizes Canlı Radar')
}

// Check mobile drawer retains links
assert(navbarContent.includes('setMobileMenuOpen(false)'), 'Mobile menu close handling exists')
assert(navbarContent.includes('<Link href="/blog" onClick={() => setMobileMenuOpen(false)}'), 'Mobile menu retains /blog (Rehber & Blog)')
assert(navbarContent.includes('t.nav.forbiddenItems'), 'Mobile menu retains forbiddenItems (Yasaklı Ürünler & Kurallar)')

// Check Footer contract
const footerPath = path.resolve(__dirname, '../src/components/footer.tsx')
const footerContent = fs.readFileSync(footerPath, 'utf8')
assert(footerContent.includes('colResourcesSafety'), 'Footer includes colResourcesSafety')
assert(footerContent.includes('guidesAndBlog'), 'Footer includes guidesAndBlog link')
assert(footerContent.includes('prohibitedItemsAndRules'), 'Footer includes prohibitedItemsAndRules')
assert(footerContent.includes('ForbiddenItemsModal'), 'Footer includes ForbiddenItemsModal')

console.log('\n======================================================')
console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`)
console.log('======================================================\n')

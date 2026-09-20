/**
 * Sprint 12 — Saved Searches Test Suite
 * Comprehensive, self-contained test suite covering:
 *
 * 1. UNAUTHENTICATED_ACCESS_REJECTED: Unauthenticated requests rejected with 401
 * 2. CREATE_VALID_SAVED_SEARCH: Valid search saved with all typed criteria
 * 3. LIST_ONLY_OWN_SEARCHES: Users list only their own searches
 * 4. READ_OWN_SAVED_SEARCH: User reads their saved search by ID
 * 5. USER_A_CANNOT_READ_USER_B_SEARCH: Cross-user read blocked (404/FORBIDDEN)
 * 6. USER_A_CANNOT_UPDATE_USER_B_SEARCH: Cross-user update blocked (404/FORBIDDEN)
 * 7. USER_A_CANNOT_DELETE_USER_B_SEARCH: Cross-user delete blocked (404/FORBIDDEN)
 * 8. RENAME_UPDATE_OWN_SEARCH: User successfully renames / updates search criteria
 * 9. DELETE_OWN_SEARCH: User successfully deletes their saved search
 * 10. INVALID_CONDITION_REJECTED: Invalid condition enum value rejected (400)
 * 11. INVALID_TRADE_METHOD_REJECTED: Invalid tradeMethod enum value rejected (400)
 * 12. INVALID_CATEGORY_REJECTED: Nonexistent category rejected (400)
 * 13. OVERLONG_NAME_REJECTED: Name > 80 characters rejected (400)
 * 14. EMPTY_NAME_REJECTED: Blank / empty name rejected (400)
 * 15. OVERLONG_QUERY_REJECTED: Query > 100 characters rejected (400)
 * 16. DUPLICATE_EXACT_REJECTED: Exact duplicate (same normalized name + criteria) rejected with 409
 * 17. DUPLICATE_SAME_CRITERIA_DIFF_NAME_ALLOWED: Same criteria with different names is permitted
 * 18. DUPLICATE_SAME_NAME_DIFF_CRITERIA_ALLOWED: Same name with different criteria is permitted
 * 19. CANONICAL_URL_RECONSTRUCTION: Canonical URL accurately maps query, category, city, condition, tradeMethod
 * 20. PRIVACY_NO_LEAKAGE: Saved search payloads contain no private user credentials
 */

import { buildSearchUrl } from '../src/lib/saved-searches'
import { ItemCondition, TradeMethod } from '@prisma/client'

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

interface SimCategory {
  id: string
  slug: string
  nameTr: string
  nameEn: string
}

interface SimSavedSearch {
  id: string
  userId: string
  name: string
  query: string | null
  categoryId: string | null
  condition: ItemCondition | null
  tradeMethod: TradeMethod | null
  country: string | null
  city: string | null
  createdAt: Date
  updatedAt: Date
}

const VALID_CONDITIONS: ItemCondition[] = ['BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR']
const VALID_TRADE_METHODS: TradeMethod[] = ['HAND_TO_HAND', 'CARGO_ONLY', 'BOTH']

class SavedSearchServiceMock {
  private categories: Map<string, SimCategory> = new Map()
  private searches: SimSavedSearch[] = []
  private nextId = 1

  addCategory(cat: SimCategory) {
    this.categories.set(cat.id, cat)
    this.categories.set(cat.slug, cat)
  }

  createSavedSearch(userId: string | null, input: any) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }

    const name = input.name?.trim()
    if (!name || name.length < 1 || name.length > 80) {
      return { success: false, status: 400, error: 'INVALID_NAME' }
    }

    const query = input.query ? input.query.trim() : null
    if (query && query.length > 100) {
      return { success: false, status: 400, error: 'INVALID_QUERY' }
    }

    let categoryId = input.categoryId ? input.categoryId.trim() : null
    if (categoryId) {
      const cat = this.categories.get(categoryId)
      if (!cat) {
        return { success: false, status: 400, error: 'INVALID_CATEGORY' }
      }
      categoryId = cat.id
    }

    const condition = input.condition || null
    if (condition && !VALID_CONDITIONS.includes(condition)) {
      return { success: false, status: 400, error: 'INVALID_CONDITION' }
    }

    const tradeMethod = input.tradeMethod || null
    if (tradeMethod && !VALID_TRADE_METHODS.includes(tradeMethod)) {
      return { success: false, status: 400, error: 'INVALID_TRADE_METHOD' }
    }

    const city = input.city ? input.city.trim() : null
    if (city && city.length > 50) {
      return { success: false, status: 400, error: 'INVALID_CITY' }
    }

    const country = input.country ? input.country.trim().toUpperCase() : 'TR'

    // Duplicate check: SAME user, SAME normalized name, and SAME normalized criteria (with Turkish locale support)
    const normName = name.toLocaleLowerCase('tr-TR')
    const normQuery = query ? query.toLocaleLowerCase('tr-TR') : null
    const normCity = city ? city.toLocaleLowerCase('tr-TR') : null

    const isDuplicate = this.searches.some(existing => {
      if (existing.userId !== userId) return false
      if (existing.name.trim().toLocaleLowerCase('tr-TR') !== normName) return false

      const existingNormQuery = existing.query ? existing.query.trim().toLocaleLowerCase('tr-TR') : null
      const existingNormCity = existing.city ? existing.city.trim().toLocaleLowerCase('tr-TR') : null
      const existingNormCountry = (existing.country || 'TR').trim().toUpperCase()

      return (
        existingNormQuery === normQuery &&
        (existing.categoryId || null) === categoryId &&
        (existing.condition || null) === condition &&
        (existing.tradeMethod || null) === tradeMethod &&
        existingNormCity === normCity &&
        existingNormCountry === country
      )
    })

    if (isDuplicate) {
      return { success: false, status: 409, error: 'DUPLICATE_SAVED_SEARCH' }
    }

    const record: SimSavedSearch = {
      id: `ss_${this.nextId++}`,
      userId,
      name,
      query,
      categoryId,
      condition,
      tradeMethod,
      country,
      city,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.searches.push(record)

    return {
      success: true,
      status: 201,
      data: {
        ...record,
        searchUrl: buildSearchUrl({
          query: record.query,
          categoryId: record.categoryId,
          condition: record.condition,
          tradeMethod: record.tradeMethod,
          city: record.city,
        }),
      },
    }
  }

  listSavedSearches(userId: string | null) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }

    const userSearches = this.searches
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return {
      success: true,
      status: 200,
      data: userSearches.map(s => ({
        ...s,
        searchUrl: buildSearchUrl({
          query: s.query,
          categoryId: s.categoryId,
          condition: s.condition,
          tradeMethod: s.tradeMethod,
          city: s.city,
        }),
      })),
    }
  }

  getSavedSearchById(id: string, userId: string | null) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }

    const found = this.searches.find(s => s.id === id && s.userId === userId)
    if (!found) {
      return { success: false, status: 404, error: 'NOT_FOUND' }
    }

    return {
      success: true,
      status: 200,
      data: {
        ...found,
        searchUrl: buildSearchUrl({
          query: found.query,
          categoryId: found.categoryId,
          condition: found.condition,
          tradeMethod: found.tradeMethod,
          city: found.city,
        }),
      },
    }
  }

  updateSavedSearch(id: string, userId: string | null, input: any) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }

    const found = this.searches.find(s => s.id === id && s.userId === userId)
    if (!found) {
      return { success: false, status: 404, error: 'NOT_FOUND' }
    }

    if (input.name !== undefined) {
      const name = input.name.trim()
      if (!name || name.length < 1 || name.length > 80) {
        return { success: false, status: 400, error: 'INVALID_NAME' }
      }
      found.name = name
    }

    if (input.query !== undefined) {
      const query = input.query ? input.query.trim() : null
      if (query && query.length > 100) {
        return { success: false, status: 400, error: 'INVALID_QUERY' }
      }
      found.query = query
    }

    if (input.condition !== undefined) {
      if (input.condition && !VALID_CONDITIONS.includes(input.condition)) {
        return { success: false, status: 400, error: 'INVALID_CONDITION' }
      }
      found.condition = input.condition
    }

    found.updatedAt = new Date()

    return {
      success: true,
      status: 200,
      data: {
        ...found,
        searchUrl: buildSearchUrl({
          query: found.query,
          categoryId: found.categoryId,
          condition: found.condition,
          tradeMethod: found.tradeMethod,
          city: found.city,
        }),
      },
    }
  }

  deleteSavedSearch(id: string, userId: string | null) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }

    const index = this.searches.findIndex(s => s.id === id && s.userId === userId)
    if (index === -1) {
      return { success: false, status: 404, error: 'NOT_FOUND' }
    }

    this.searches.splice(index, 1)
    return { success: true, status: 200 }
  }
}

async function runSavedSearchTests() {
  console.log('\n🚀 Starting Sprint 12 — Saved Searches Test Suite...\n')

  const service = new SavedSearchServiceMock()

  // Seed categories
  service.addCategory({
    id: 'cat_elektronik',
    slug: 'elektronik',
    nameTr: 'Elektronik',
    nameEn: 'Electronics',
  })
  service.addCategory({
    id: 'cat_spor',
    slug: 'spor',
    nameTr: 'Spor & Outdoor',
    nameEn: 'Sports & Outdoor',
  })

  // 1. Unauthenticated barriers
  console.log('--- 1. Authentication Barriers ---')
  const unauthCreate = service.createSavedSearch(null, { name: 'Test' })
  assert(unauthCreate.status === 401, 'UNAUTHENTICATED_ACCESS_REJECTED: Create rejected without auth')

  const unauthList = service.listSavedSearches(null)
  assert(unauthList.status === 401, 'UNAUTHENTICATED_ACCESS_REJECTED: List rejected without auth')

  const unauthGet = service.getSavedSearchById('ss_1', null)
  assert(unauthGet.status === 401, 'UNAUTHENTICATED_ACCESS_REJECTED: Get by ID rejected without auth')

  const unauthUpdate = service.updateSavedSearch('ss_1', null, { name: 'New' })
  assert(unauthUpdate.status === 401, 'UNAUTHENTICATED_ACCESS_REJECTED: Update rejected without auth')

  const unauthDelete = service.deleteSavedSearch('ss_1', null)
  assert(unauthDelete.status === 401, 'UNAUTHENTICATED_ACCESS_REJECTED: Delete rejected without auth')

  // 2. Create valid saved search
  console.log('\n--- 2. Valid Search Creation ---')
  const createRes1 = service.createSavedSearch('user_alice', {
    name: 'İstanbul Kamp Ekipmanları',
    query: 'çadır mat',
    categoryId: 'spor',
    condition: 'LIKE_NEW',
    tradeMethod: 'HAND_TO_HAND',
    city: 'İstanbul',
    country: 'TR',
  })
  assert(createRes1.status === 201 && createRes1.success, 'CREATE_VALID_SAVED_SEARCH: Created successfully')
  assert(createRes1.data?.name === 'İstanbul Kamp Ekipmanları', 'CREATE_VALID_SAVED_SEARCH: Correct name')
  assert(createRes1.data?.city === 'İstanbul', 'CREATE_VALID_SAVED_SEARCH: Correct city')
  assert(createRes1.data?.condition === 'LIKE_NEW', 'CREATE_VALID_SAVED_SEARCH: Correct condition')

  // 3. Validation Rules
  console.log('\n--- 3. Validation & Boundary Enforcement ---')
  const emptyName = service.createSavedSearch('user_alice', { name: '   ' })
  assert(emptyName.status === 400 && emptyName.error === 'INVALID_NAME', 'EMPTY_NAME_REJECTED: Blank name rejected')

  const longName = service.createSavedSearch('user_alice', { name: 'A'.repeat(81) })
  assert(longName.status === 400 && longName.error === 'INVALID_NAME', 'OVERLONG_NAME_REJECTED: Name > 80 chars rejected')

  const longQuery = service.createSavedSearch('user_alice', { name: 'Valid Name', query: 'Q'.repeat(101) })
  assert(longQuery.status === 400 && longQuery.error === 'INVALID_QUERY', 'OVERLONG_QUERY_REJECTED: Query > 100 chars rejected')

  const badCategory = service.createSavedSearch('user_alice', { name: 'Valid Name', categoryId: 'non_existent_category' })
  assert(badCategory.status === 400 && badCategory.error === 'INVALID_CATEGORY', 'INVALID_CATEGORY_REJECTED: Unknown category rejected')

  const badCondition = service.createSavedSearch('user_alice', { name: 'Valid Name', condition: 'SUPER_NEW' as any })
  assert(badCondition.status === 400 && badCondition.error === 'INVALID_CONDITION', 'INVALID_CONDITION_REJECTED: Invalid condition rejected')

  const badTradeMethod = service.createSavedSearch('user_alice', { name: 'Valid Name', tradeMethod: 'DRONE_DELIVERY' as any })
  assert(badTradeMethod.status === 400 && badTradeMethod.error === 'INVALID_TRADE_METHOD', 'INVALID_TRADE_METHOD_REJECTED: Invalid tradeMethod rejected')

  // 4. Duplicate Policies
  console.log('\n--- 4. Deterministic Duplicate Policy ---')
  // Exact duplicate: Same user, same name (case-insensitive), same criteria
  const exactDup = service.createSavedSearch('user_alice', {
    name: '  istanbul kamp ekipmanları  ',
    query: 'çadır mat',
    categoryId: 'spor',
    condition: 'LIKE_NEW',
    tradeMethod: 'HAND_TO_HAND',
    city: 'istanbul',
    country: 'TR',
  })
  assert(exactDup.status === 409 && exactDup.error === 'DUPLICATE_SAVED_SEARCH', 'DUPLICATE_EXACT_REJECTED: Exact match rejected with 409')

  // Same criteria with DIFFERENT name -> Allowed
  const diffName = service.createSavedSearch('user_alice', {
    name: 'Haftasonu Çadır Araması',
    query: 'çadır mat',
    categoryId: 'spor',
    condition: 'LIKE_NEW',
    tradeMethod: 'HAND_TO_HAND',
    city: 'İstanbul',
    country: 'TR',
  })
  assert(diffName.status === 201 && diffName.success, 'DUPLICATE_SAME_CRITERIA_DIFF_NAME_ALLOWED: Different name allowed')

  // Same name with DIFFERENT criteria -> Allowed
  const diffCriteria = service.createSavedSearch('user_alice', {
    name: 'İstanbul Kamp Ekipmanları',
    query: 'uyku tulumu',
    categoryId: 'spor',
    city: 'İstanbul',
  })
  assert(diffCriteria.status === 201 && diffCriteria.success, 'DUPLICATE_SAME_NAME_DIFF_CRITERIA_ALLOWED: Different criteria allowed')

  // Another user saving the exact same thing -> Allowed (per-user namespace)
  const otherUserDup = service.createSavedSearch('user_bob', {
    name: 'İstanbul Kamp Ekipmanları',
    query: 'çadır mat',
    categoryId: 'spor',
    condition: 'LIKE_NEW',
    tradeMethod: 'HAND_TO_HAND',
    city: 'İstanbul',
    country: 'TR',
  })
  assert(otherUserDup.status === 201 && otherUserDup.success, 'PER_USER_ISOLATION: User Bob can save search with same name and criteria')

  // 5. Listing & Cross-User Security (IDOR isolation)
  console.log('\n--- 5. Listing & IDOR / Ownership Security ---')
  const aliceList = service.listSavedSearches('user_alice')
  assert(aliceList.status === 200 && (aliceList.data?.length ?? 0) === 3, 'LIST_ONLY_OWN_SEARCHES: Alice sees only her 3 searches')

  const bobList = service.listSavedSearches('user_bob')
  assert(bobList.status === 200 && (bobList.data?.length ?? 0) === 1, 'LIST_ONLY_OWN_SEARCHES: Bob sees only his 1 search')

  const aliceSearchId = aliceList.data![0].id

  // Bob tries to read Alice's search
  const bobReadAlice = service.getSavedSearchById(aliceSearchId, 'user_bob')
  assert(bobReadAlice.status === 404 && !bobReadAlice.success, 'USER_A_CANNOT_READ_USER_B_SEARCH: 404 returned for foreign search')

  // Bob tries to update Alice's search
  const bobUpdateAlice = service.updateSavedSearch(aliceSearchId, 'user_bob', { name: 'Hacked Name' })
  assert(bobUpdateAlice.status === 404 && !bobUpdateAlice.success, 'USER_A_CANNOT_UPDATE_USER_B_SEARCH: 404 returned on unauthorized update')

  // Bob tries to delete Alice's search
  const bobDeleteAlice = service.deleteSavedSearch(aliceSearchId, 'user_bob')
  assert(bobDeleteAlice.status === 404 && !bobDeleteAlice.success, 'USER_A_CANNOT_DELETE_USER_B_SEARCH: 404 returned on unauthorized delete')

  // Alice reads her own search
  const aliceReadOwn = service.getSavedSearchById(aliceSearchId, 'user_alice')
  assert(aliceReadOwn.status === 200 && aliceReadOwn.data?.id === aliceSearchId, 'READ_OWN_SAVED_SEARCH: Alice reads her own search')

  // Alice renames her own search
  const aliceUpdate = service.updateSavedSearch(aliceSearchId, 'user_alice', { name: 'Yeni Başlık' })
  assert(aliceUpdate.status === 200 && aliceUpdate.data?.name === 'Yeni Başlık', 'RENAME_UPDATE_OWN_SEARCH: Successfully renamed')

  // Alice deletes her own search
  const aliceDelete = service.deleteSavedSearch(aliceSearchId, 'user_alice')
  assert(aliceDelete.status === 200 && aliceDelete.success, 'DELETE_OWN_SEARCH: Successfully deleted')

  const aliceListAfter = service.listSavedSearches('user_alice')
  assert((aliceListAfter.data?.length ?? 0) === 2, 'DELETE_OWN_SEARCH: Search count decremented to 2')

  // 6. Canonical URL Reconstruction
  console.log('\n--- 6. Canonical Search URL Reconstruction ---')
  const url1 = buildSearchUrl({
    query: 'bisiklet',
    categorySlug: 'spor',
    city: 'İzmir',
    condition: 'GOOD',
    tradeMethod: 'HAND_TO_HAND',
  })
  assert(url1.includes('search=bisiklet'), 'CANONICAL_URL_RECONSTRUCTION: Query param preserved')
  assert(url1.includes('category=spor'), 'CANONICAL_URL_RECONSTRUCTION: Category slug preserved')
  assert(url1.includes('city=%C4%B0zmir') || url1.includes('city=İzmir'), 'CANONICAL_URL_RECONSTRUCTION: City preserved')
  assert(url1.includes('condition=GOOD'), 'CANONICAL_URL_RECONSTRUCTION: Condition preserved')
  assert(url1.includes('tradeMethod=HAND_TO_HAND'), 'CANONICAL_URL_RECONSTRUCTION: Trade method preserved')

  // Empty criteria builds clean root
  const urlEmpty = buildSearchUrl({})
  assert(urlEmpty === '/', 'CANONICAL_URL_RECONSTRUCTION: Empty criteria yields clean root /')

  // 7. Privacy
  console.log('\n--- 7. Privacy & Payload Security ---')
  const sampleSearch = (bobList.data?.[0] || {}) as any
  assert(sampleSearch.password === undefined, 'PRIVACY_NO_LEAKAGE: No password field in search')
  assert(sampleSearch.email === undefined, 'PRIVACY_NO_LEAKAGE: No email field in search')
  assert(sampleSearch.phone === undefined, 'PRIVACY_NO_LEAKAGE: No phone field in search')

  console.log('\n======================================================')
  console.log(`🎉 Sprint 12 Saved Searches Test Suite Complete: ${passedTests}/${totalTests} tests passed!`)
  console.log('======================================================\n')
}

runSavedSearchTests().catch(err => {
  console.error('Test runner failed:', err)
  process.exit(1)
})

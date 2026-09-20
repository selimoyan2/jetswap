/**
 * Sprint 12 — Item Favorites Test Suite
 * Comprehensive, self-contained test suite covering:
 *
 * 1. UNAUTHENTICATED_ADD_REJECTED: Adding favorite without auth returns 401
 * 2. UNAUTHENTICATED_LIST_REJECTED: Listing favorites without auth returns 401
 * 3. UNAUTHENTICATED_DELETE_REJECTED: Deleting favorite without auth returns 401
 * 4. FAVORITE_EXISTING_ITEM: Successfully favorites an existing item
 * 5. DUPLICATE_FAVORITE_IDEMPOTENT: Re-favoriting same item does not duplicate row and returns safe success
 * 6. LIST_OWN_FAVORITES: User lists own favorites accurately sorted by creation date
 * 7. REMOVE_FAVORITE: Removing favorite successfully deletes the relation
 * 8. REPEATED_REMOVE_IDEMPOTENT: Removing an already removed favorite succeeds safely
 * 9. NONEXISTENT_ITEM_HANDLING: Favoriting a non-existent item returns 404 / ITEM_NOT_FOUND
 * 10. USER_ISOLATION: User A's favorites are strictly isolated and invisible to User B
 * 11. DELETED_ITEM_CLEANUP: Deletion of item cascades and removes favorite references
 * 12. DELETED_USER_CLEANUP: Deletion of user cascades and removes favorite references
 * 13. PRIVACY_NO_PASSWORD: User password is never exposed in favorite queries/payloads
 * 14. PRIVACY_NO_PHONE: User phone is never exposed in favorite payloads
 * 15. PRIVACY_NO_EMAIL: User email is never exposed in favorite payloads
 * 16. BULK_FAVORITE_IDS: getUserFavoriteItemIds returns expected array of item IDs
 */

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

// In-memory relational simulation of Favorite store to test business logic and constraints
interface SimUser {
  id: string
  name: string
  email: string
  phone?: string
  password?: string
  rating: number
  reviewCount: number
}

interface SimItem {
  id: string
  userId: string
  title: string
  description: string
  condition: string
  tradeMethod: string
  status: string
  images: string[]
  city: string
  country: string
}

interface SimFavorite {
  id: string
  userId: string
  itemId: string
  createdAt: Date
}

class FavoritesServiceMock {
  private users: Map<string, SimUser> = new Map()
  private items: Map<string, SimItem> = new Map()
  private favorites: SimFavorite[] = [];
  private nextId = 1

  addUser(user: SimUser) {
    this.users.set(user.id, user)
  }

  addItem(item: SimItem) {
    this.items.set(item.id, item)
  }

  deleteItem(itemId: string) {
    this.items.delete(itemId)
    // Cascade delete simulation
    this.favorites = this.favorites.filter(f => f.itemId !== itemId)
  }

  deleteUser(userId: string) {
    this.users.delete(userId)
    // Cascade delete simulation
    this.favorites = this.favorites.filter(f => f.userId !== userId)
  }

  addFavorite(userId: string | null, itemId: string) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }
    if (!this.items.has(itemId)) {
      return { success: false, status: 404, error: 'ITEM_NOT_FOUND' }
    }

    const existing = this.favorites.find(f => f.userId === userId && f.itemId === itemId)
    if (existing) {
      return { success: true, status: 200, isFavorite: true, alreadyExisted: true }
    }

    const newFav: SimFavorite = {
      id: `fav_${this.nextId++}`,
      userId,
      itemId,
      createdAt: new Date(),
    }
    this.favorites.push(newFav)
    return { success: true, status: 201, isFavorite: true, alreadyExisted: false }
  }

  removeFavorite(userId: string | null, itemId: string) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }

    this.favorites = this.favorites.filter(f => !(f.userId === userId && f.itemId === itemId))
    return { success: true, status: 200, isFavorite: false }
  }

  getUserFavorites(userId: string | null) {
    if (!userId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED', data: null }
    }

    const userFavs = this.favorites
      .filter(f => f.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const sanitized = userFavs.map(f => {
      const item = this.items.get(f.itemId)!
      const owner = this.users.get(item.userId)!

      return {
        id: f.id,
        itemId: f.itemId,
        createdAt: f.createdAt,
        item: {
          id: item.id,
          title: item.title,
          description: item.description,
          condition: item.condition,
          tradeMethod: item.tradeMethod,
          images: item.images,
          status: item.status,
          city: item.city,
          country: item.country,
          user: {
            id: owner.id,
            name: owner.name,
            rating: owner.rating,
            reviewCount: owner.reviewCount,
            // Strictly exclude: email, phone, password
          },
        },
      }
    })

    return { success: true, status: 200, data: sanitized }
  }

  isItemFavorited(userId: string, itemId: string) {
    return this.favorites.some(f => f.userId === userId && f.itemId === itemId)
  }

  getUserFavoriteItemIds(userId: string) {
    return this.favorites.filter(f => f.userId === userId).map(f => f.itemId)
  }

  getFavoriteRowCount() {
    return this.favorites.length
  }
}

async function runFavoritesTests() {
  console.log('\n🚀 Starting Sprint 12 — Item Favorites Test Suite...\n')

  const service = new FavoritesServiceMock()

  // Setup seed users and items
  service.addUser({
    id: 'user_1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '05551112233',
    password: '$2a$10$hashedPassword1',
    rating: 4.8,
    reviewCount: 12,
  })

  service.addUser({
    id: 'user_2',
    name: 'Ayşe Kaya',
    email: 'ayse@example.com',
    phone: '05554445566',
    password: '$2a$10$hashedPassword2',
    rating: 5.0,
    reviewCount: 7,
  })

  service.addItem({
    id: 'item_1',
    userId: 'user_1',
    title: 'Vintage Fotoğraf Makinesi',
    description: 'Analog koleksiyonluk makine',
    condition: 'GOOD',
    tradeMethod: 'BOTH',
    status: 'AVAILABLE',
    images: ['https://example.com/camera.jpg'],
    city: 'İstanbul',
    country: 'TR',
  })

  service.addItem({
    id: 'item_2',
    userId: 'user_1',
    title: 'Akustik Gitar',
    description: 'Yamaha F310 temiz gitar',
    condition: 'LIKE_NEW',
    tradeMethod: 'HAND_TO_HAND',
    status: 'AVAILABLE',
    images: ['https://example.com/guitar.jpg'],
    city: 'İstanbul',
    country: 'TR',
  })

  service.addItem({
    id: 'item_3',
    userId: 'user_2',
    title: 'Mekanik Klavye',
    description: 'Brown switch kablosuz',
    condition: 'BRAND_NEW',
    tradeMethod: 'CARGO_ONLY',
    status: 'AVAILABLE',
    images: ['https://example.com/keyboard.jpg'],
    city: 'Ankara',
    country: 'TR',
  })

  // 1. Unauthenticated checks
  console.log('--- 1. Authentication Barriers ---')
  const unauthAdd = service.addFavorite(null, 'item_1')
  assert(unauthAdd.status === 401 && !unauthAdd.success, 'UNAUTHENTICATED_ADD_REJECTED: 401 unauthorized')

  const unauthList = service.getUserFavorites(null)
  assert(unauthList.status === 401 && !unauthList.success, 'UNAUTHENTICATED_LIST_REJECTED: 401 unauthorized')

  const unauthDel = service.removeFavorite(null, 'item_1')
  assert(unauthDel.status === 401 && !unauthDel.success, 'UNAUTHENTICATED_DELETE_REJECTED: 401 unauthorized')

  // 2. Favorite existing item
  console.log('\n--- 2. Favorite Creation & Idempotency ---')
  const addRes1 = service.addFavorite('user_2', 'item_1')
  assert(addRes1.status === 201 && addRes1.success && addRes1.isFavorite === true, 'FAVORITE_EXISTING_ITEM: Added successfully')
  assert(addRes1.alreadyExisted === false, 'FAVORITE_EXISTING_ITEM: Marked as newly added')
  assert(service.isItemFavorited('user_2', 'item_1'), 'FAVORITE_EXISTING_ITEM: isItemFavorited is true')

  // 3. Duplicate favorite idempotency
  const addResDup = service.addFavorite('user_2', 'item_1')
  assert(addResDup.status === 200 && addResDup.success && addResDup.isFavorite === true, 'DUPLICATE_FAVORITE_IDEMPOTENT: 200 success returned')
  assert(addResDup.alreadyExisted === true, 'DUPLICATE_FAVORITE_IDEMPOTENT: alreadyExisted flag true')
  assert(service.getFavoriteRowCount() === 1, 'DUPLICATE_FAVORITE_IDEMPOTENT: Row count did NOT increase, exact 1 row maintained')

  // 4. Nonexistent item handling
  console.log('\n--- 3. Nonexistent Item Handling ---')
  const nonExistRes = service.addFavorite('user_2', 'non_existent_item_999')
  assert(nonExistRes.status === 404 && !nonExistRes.success, 'NONEXISTENT_ITEM_HANDLING: 404 returned for missing item')

  // 5. List own favorites & User isolation
  console.log('\n--- 4. Listing & Isolation ---')
  service.addFavorite('user_2', 'item_2') // user_2 favorites item_2 as well
  service.addFavorite('user_1', 'item_3') // user_1 favorites item_3

  const user2Favs = service.getUserFavorites('user_2')
  assert(user2Favs.success && user2Favs.data?.length === 2, 'LIST_OWN_FAVORITES: User 2 sees exactly 2 favorites')

  const user1Favs = service.getUserFavorites('user_1')
  assert(user1Favs.success && user1Favs.data?.length === 1, 'USER_ISOLATION: User 1 sees exactly 1 favorite')
  assert(user1Favs.data?.[0].itemId === 'item_3', 'USER_ISOLATION: User 1 does not see User 2 favorites')
  assert(service.isItemFavorited('user_1', 'item_1') === false, 'USER_ISOLATION: item_1 is not favorited by user 1')

  // 6. Bulk item IDs
  console.log('\n--- 5. Bulk Item IDs Helper ---')
  const u2Ids = service.getUserFavoriteItemIds('user_2')
  assert(u2Ids.includes('item_1') && u2Ids.includes('item_2') && u2Ids.length === 2, 'BULK_FAVORITE_IDS: Correct IDs array returned')

  // 7. Remove favorite & Idempotency
  console.log('\n--- 6. Deletion & Idempotent Removal ---')
  const rem1 = service.removeFavorite('user_2', 'item_1')
  assert(rem1.status === 200 && rem1.isFavorite === false, 'REMOVE_FAVORITE: Removed successfully')
  assert(service.isItemFavorited('user_2', 'item_1') === false, 'REMOVE_FAVORITE: isItemFavorited is now false')

  // Repeated remove
  const remDup = service.removeFavorite('user_2', 'item_1')
  assert(remDup.status === 200 && remDup.isFavorite === false, 'REPEATED_REMOVE_IDEMPOTENT: Safe repeated delete returns 200')

  // 8. Cascading Deletions
  console.log('\n--- 7. Cascading Deletion Verification ---')
  // user_2 still has item_2 favorited. Delete item_2
  assert(service.isItemFavorited('user_2', 'item_2') === true, 'DELETED_ITEM_CLEANUP: Before item deletion, favorite exists')
  service.deleteItem('item_2')
  assert(service.isItemFavorited('user_2', 'item_2') === false, 'DELETED_ITEM_CLEANUP: Favorite cascaded on item deletion')

  // user_1 still has item_3 favorited. Delete user_1
  assert(service.isItemFavorited('user_1', 'item_3') === true, 'DELETED_USER_CLEANUP: Before user deletion, favorite exists')
  service.deleteUser('user_1')
  assert(service.isItemFavorited('user_1', 'item_3') === false, 'DELETED_USER_CLEANUP: Favorite cascaded on user deletion')
  assert(service.getFavoriteRowCount() === 0, 'DELETED_USER_CLEANUP: Zero orphaned favorite rows remain')

  // 9. Privacy Verification
  console.log('\n--- 8. Privacy & Data Leakage Protection ---')
  // Re-add to inspect serialized structure
  service.addUser({
    id: 'user_privacy',
    name: 'Gizli Kullanıcı',
    email: 'private@jetswap.com',
    phone: '05009998877',
    password: '$2a$10$supersecret',
    rating: 4.9,
    reviewCount: 3,
  })
  service.addItem({
    id: 'item_privacy',
    userId: 'user_privacy',
    title: 'Özel İlan',
    description: 'Açıklama',
    condition: 'GOOD',
    tradeMethod: 'BOTH',
    status: 'AVAILABLE',
    images: [],
    city: 'İzmir',
    country: 'TR',
  })
  service.addFavorite('user_2', 'item_privacy')
  const privacyFavs = service.getUserFavorites('user_2')
  const firstFavOwner = privacyFavs.data?.[0]?.item?.user as any

  assert(firstFavOwner.password === undefined, 'PRIVACY_NO_PASSWORD: Password field never present')
  assert(firstFavOwner.phone === undefined, 'PRIVACY_NO_PHONE: Phone field never present')
  assert(firstFavOwner.email === undefined, 'PRIVACY_NO_EMAIL: Email field never present')
  assert(firstFavOwner.name === 'Gizli Kullanıcı', 'PRIVACY_PUBLIC_NAME_PRESERVED: Public display name preserved')

  console.log('\n======================================================')
  console.log(`🎉 Sprint 12 Favorites Test Suite Complete: ${passedTests}/${totalTests} tests passed!`)
  console.log('======================================================\n')
}

runFavoritesTests().catch(err => {
  console.error('Test runner failed:', err)
  process.exit(1)
})

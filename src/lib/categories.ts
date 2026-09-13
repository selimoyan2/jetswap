import { prisma } from '@/lib/prisma'

export const DEFAULT_CATEGORIES = [
  { slug: 'telefon', nameTr: 'Telefon & Mobil', nameEn: 'Phones & Mobile', icon: 'Smartphone' },
  { slug: 'bilgisayar', nameTr: 'Bilgisayar & Donanım', nameEn: 'Computers & Tech', icon: 'Laptop' },
  { slug: 'fotograf-kamera', nameTr: 'Fotoğraf, Video & Drone', nameEn: 'Cameras & Drones', icon: 'Camera' },
  { slug: 'oyun-konsolu', nameTr: 'Oyun Konsolu & Hobi', nameEn: 'Gaming & Consoles', icon: 'Gamepad2' },
  { slug: 'muzik-aletleri', nameTr: 'Müzik Aletleri & Stüdyo', nameEn: 'Musical Instruments', icon: 'Guitar' },
  { slug: 'bisiklet-surus', nameTr: 'Bisiklet & Kişisel Taşıt', nameEn: 'Bikes & Rides', icon: 'Bike' },
  { slug: 'saat-koleksiyon', nameTr: 'Saat, Antika & Koleksiyon', nameEn: 'Watches & Collectibles', icon: 'Watch' },
  { slug: 'ev-mobilya', nameTr: 'Ev, Mobilya & Yaşam', nameEn: 'Home & Living', icon: 'Home' },
  { slug: 'spor-outdoor', nameTr: 'Spor, Kamp & Outdoor', nameEn: 'Sports & Outdoors', icon: 'Compass' },
  { slug: 'arac-vasita', nameTr: 'Motosiklet & Araç', nameEn: 'Vehicles & Motors', icon: 'Car' },
  { slug: 'moda-giyim', nameTr: 'Moda, Giyim & Lüks Aksesuar', nameEn: 'Fashion & Luxury', icon: 'Shirt' },
  { slug: 'bebek-cocuk-oyuncak', nameTr: 'Bebek, Çocuk & Oyuncak', nameEn: 'Baby, Kids & Toys', icon: 'Baby' },
  { slug: 'kitap-kirtasiye', nameTr: 'Kitap, Çizgi Roman & Kırtasiye', nameEn: 'Books & Stationery', icon: 'BookOpen' },
  { slug: 'sanat-el-emegi', nameTr: 'Sanat, El Emeği & Tasarım', nameEn: 'Art & Handmade Crafts', icon: 'Palette' },
  { slug: 'alet-bahce-atolye', nameTr: 'Alet, Atölye & Bahçe Ekipmanı', nameEn: 'Tools, Workshop & Garden', icon: 'Wrench' },
  { slug: 'hizmet-beceri-takas', nameTr: 'Beceri, Hizmet & Freelance Takas', nameEn: 'Skills & Service Barter', icon: 'Sparkles' },
]

/**
 * Ensures a category exists in the database by ID or Slug.
 * If not found, attempts to upsert from default categories so foreign key constraint is satisfied.
 */
export async function resolveCategoryId(categoryIdOrSlug: string): Promise<string | null> {
  if (!categoryIdOrSlug) return null

  try {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { id: categoryIdOrSlug },
          { slug: categoryIdOrSlug },
        ]
      }
    })

    if (existing) {
      return existing.id
    }

    // Check if it matches a known default category by slug
    const matchedDefault = DEFAULT_CATEGORIES.find(
      c => c.slug === categoryIdOrSlug || c.slug === categoryIdOrSlug.toLowerCase()
    )

    if (matchedDefault) {
      const created = await prisma.category.upsert({
        where: { slug: matchedDefault.slug },
        update: {},
        create: {
          slug: matchedDefault.slug,
          nameTr: matchedDefault.nameTr,
          nameEn: matchedDefault.nameEn,
          icon: matchedDefault.icon,
        }
      })
      return created.id
    }

    // Fallback: pick the first category in DB or seed first default
    const anyCat = await prisma.category.findFirst()
    if (anyCat) return anyCat.id

    const fallback = await prisma.category.create({
      data: {
        slug: DEFAULT_CATEGORIES[0].slug,
        nameTr: DEFAULT_CATEGORIES[0].nameTr,
        nameEn: DEFAULT_CATEGORIES[0].nameEn,
        icon: DEFAULT_CATEGORIES[0].icon,
      }
    })
    return fallback.id
  } catch (err) {
    console.error('Category resolution error:', err)
    return null
  }
}

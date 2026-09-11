import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting idempotent database seed...')

  // 1. Initial Default Categories
  const defaultCategories = [
    { slug: 'telefon', nameTr: 'Telefon & Mobil', nameEn: 'Phones & Mobile', icon: 'Smartphone' },
    { slug: 'bilgisayar', nameTr: 'Bilgisayar & Donanım', nameEn: 'Computers & Tech', icon: 'Laptop' },
    { slug: 'fotograf-kamera', nameTr: 'Fotoğraf Makinesi & Lens', nameEn: 'Cameras & Optics', icon: 'Camera' },
    { slug: 'oyun-konsolu', nameTr: 'Oyun Konsolu & Ekipman', nameEn: 'Gaming Consoles', icon: 'Gamepad2' },
    { slug: 'muzik-aletleri', nameTr: 'Müzik Aletleri & Ses', nameEn: 'Musical Instruments', icon: 'Guitar' },
    { slug: 'bisiklet-surus', nameTr: 'Bisiklet & Kişisel Taşıt', nameEn: 'Bikes & Rides', icon: 'Bike' },
    { slug: 'saat-koleksiyon', nameTr: 'Saat, Antika & Koleksiyon', nameEn: 'Watches & Collectibles', icon: 'Watch' },
    { slug: 'ev-mobilya', nameTr: 'Ev, Mobilya & Yaşam', nameEn: 'Home & Living', icon: 'Home' },
    { slug: 'spor-outdoor', nameTr: 'Spor, Kamp & Outdoor', nameEn: 'Sports & Outdoors', icon: 'Compass' },
    { slug: 'arac-vasita', nameTr: 'Motosiklet & Araç', nameEn: 'Vehicles & Motors', icon: 'Car' },
  ]

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        nameTr: cat.nameTr,
        nameEn: cat.nameEn,
        icon: cat.icon,
      },
      create: {
        slug: cat.slug,
        nameTr: cat.nameTr,
        nameEn: cat.nameEn,
        icon: cat.icon,
      },
    })
  }

  console.log(`✅ ${defaultCategories.length} categories seeded/verified.`)

  // 2. Initial Verified System Admin / Demo User (Without overwriting existing accounts)
  const systemAdmin = await prisma.user.upsert({
    where: { email: 'admin@jetswap.com.tr' },
    update: {},
    create: {
      name: 'JetSwap Sistem Yöneticisi',
      email: 'admin@jetswap.com.tr',
      phone: '+90 532 000 00 00',
      country: 'TR',
      city: 'İstanbul',
      rating: 5.0,
      reviewCount: 50,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  })

  console.log(`✅ System admin user verified: ${systemAdmin.email}`)
  console.log('🎉 Seed completed successfully without modifying user data.')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

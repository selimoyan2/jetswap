import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillItemWants() {
  console.log('🔄 Starting idempotent ItemWant backfill...')

  let processedCount = 0
  let createdWantsCount = 0
  let skippedExistingCount = 0
  let unresolvedCategoriesCount = 0

  try {
    const items = await prisma.item.findMany({
      include: {
        wants: true
      }
    })

    console.log(`📋 Found ${items.length} items to inspect.`)

    for (const item of items) {
      processedCount++

      // Idempotence check: If item already has structured wants, skip!
      if (item.wants && item.wants.length > 0) {
        skippedExistingCount++
        continue
      }

      const legacyCats = item.targetCategories || []
      const legacyDesc = item.targetDescription || ''

      const wantsToCreate: any[] = []

      if (legacyCats.length > 0) {
        for (let i = 0; i < legacyCats.length; i++) {
          const catSlugOrId = legacyCats[i]
          let categoryId: string | null = null

          const cat = await prisma.category.findFirst({
            where: {
              OR: [
                { id: catSlugOrId },
                { slug: catSlugOrId },
                { slug: catSlugOrId.toLowerCase() }
              ]
            }
          })

          if (cat) {
            categoryId = cat.id
          } else {
            unresolvedCategoriesCount++
          }

          wantsToCreate.push({
            itemId: item.id,
            categoryId,
            note: i === 0 && legacyDesc ? legacyDesc : null,
            priority: i,
            isFlexible: true,
          })
        }
      } else if (legacyDesc && legacyDesc.trim().length > 0) {
        wantsToCreate.push({
          itemId: item.id,
          categoryId: null,
          note: legacyDesc.trim(),
          priority: 0,
          isFlexible: true,
        })
      }

      if (wantsToCreate.length > 0) {
        await prisma.$transaction(
          wantsToCreate.map(w => prisma.itemWant.create({ data: w }))
        )
        createdWantsCount += wantsToCreate.length
      }
    }

    console.log('\n========================================')
    console.log('🎉 ItemWant Backfill Complete!')
    console.log(`Processed:              ${processedCount}`)
    console.log(`Created wants:          ${createdWantsCount}`)
    console.log(`Skipped existing:       ${skippedExistingCount}`)
    console.log(`Unresolved categories:  ${unresolvedCategoriesCount}`)
    console.log('========================================\n')
  } catch (error) {
    console.error('❌ Error during ItemWant backfill:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

backfillItemWants()

// @ts-nocheck
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Copy from src/app/products/page.tsx
const CATEGORY_STRUCTURE = {
    'Bahan Kering': [
      'Beras', 'Tepung terigu', 'Tepung beras', 'Tepung maizena', 'Tepung tapioka', 'Gula pasir', 'Gula aren', 'gula merah', 
      'Garam', 'Kacang tanah', 'Kacang hijau', 'Kacang merah', 'Kacang kedelai', 'Kacang tolo', 'Kacang polong', 'Wijen', 
      'Jagung pipil', 'Bawang putih bubuk', 'Bawang merah goreng', 'Ketumbar', 'Merica', 'lada', 'Jintan', 'Pala', 'Cengkeh', 
      'Kayu manis', 'Kapulaga', 'Kunyit bubuk', 'Jahe bubuk', 'Lengkuas bubuk', 'Cabai bubuk', 'Daun salam kering', 
      'Daun jeruk kering', 'Mi kering', 'Bihun', 'Soun', 'Makaroni', 'Spaghetti', 'Tepung panir', 'breadcrumbs', 'Abon', 
      'Dendeng', 'Ikan asin', 'Kaldu bubuk', 'Penyedap rasa', 'Vanili', 'Cokelat bubuk', 'Santan bubuk', 'Susu bubuk', 
      'Ragi instan', 'Baking powder', 'Baking soda', 'Minyak goreng', 'Margarin', 'Minyak wijen', 'Minyak zaitun', 
      'Sereal', 'Oatmeal', 'Granola', 'Biskuit', 'Crackers'
    ],
    'Bahan Basah': [
      'Bayam', 'Kangkung', 'Sawi', 'Pakcoy', 'Kubis', 'kol', 'Wortel', 'Kentang', 'Tomat', 'Mentimun', 'Terong', 'Buncis', 
      'Kacang panjang', 'Labu siam', 'Jagung manis', 'Brokoli', 'Kembang kol', 'Daun bawang', 'Seledri', 'Selada', 'Pisang', 
      'Apel', 'Jeruk', 'Pepaya', 'Semangka', 'Melon', 'Mangga', 'Pir', 'Anggur', 'Daging Ayam', 'Ayam Potong', 'Daging Sapi', 'Ikan', 'Kepiting', 'Rajungan', 
      'Udang', 'Cumi', 'Telur', 'Bawang merah', 'Bawang putih', 'Cabai', 'Jahe', 'Kunyit', 'Lengkuas', 'Serai', 'Daun salam', 
      'Daun jeruk', 'Kemiri', 'Susu', 'Yogurt', 'Keju', 'Mentega', 'Tahu', 'Tempe', 'Oncom', 'Sosis', 'Bakso'
    ]
}

// Build reverse map: Name -> Category
const itemToCategory: Record<string, string> = {}
Object.entries(CATEGORY_STRUCTURE).forEach(([cat, items]) => {
  items.forEach(item => {
    itemToCategory[item.toLowerCase()] = cat
  })
})

async function main() {
  console.log('Starting product cleanup...')

  const products = await prisma.product.findMany()
  console.log(`Found ${products.length} products total.`)

  const productsToDelete: string[] = []
  const updates: Promise<any>[] = []

  // 1. Identify duplicates
  // Group by "normalized" name (lowercase, remove special chars)
  const grouped: Record<string, typeof products> = {}

  for (const p of products) {
    // Normalize: remove suffix like _u1xkt, replace -/_ with space
    let normalized = p.name.toLowerCase()
    
    // Attempt to match with known categories first
    let matchedCategory = null
    for (const [key, cat] of Object.entries(itemToCategory)) {
        if (normalized.includes(key)) {
            matchedCategory = cat
            // If we found a match, maybe use the key as the normalized group?
            // This helps group "Pisang (ambon)" and "PISANG" together if needed.
            // But let's be careful. "Pisang" vs "Pisang Ambon" might be different.
            break
        }
    }

    // Heuristic for duplicates:
    // If SKU ends with _[a-z0-9]{5}, strip it.
    let baseSku = p.sku.toLowerCase()
    const suffixMatch = baseSku.match(/_[a-z0-9]{5}$/)
    if (suffixMatch) {
        baseSku = baseSku.substring(0, baseSku.length - 6)
    }
    // Normalize separators
    baseSku = baseSku.replace(/[_-]/g, ' ')

    if (!grouped[baseSku]) {
        grouped[baseSku] = []
    }
    grouped[baseSku].push(p)
  }

  // 2. Process groups
  for (const [key, group] of Object.entries(grouped)) {
    // If we have multiple items in a group, we need to pick a winner and delete losers
    // Winner criteria:
    // 1. Has no weird suffix in SKU
    // 2. Has Price > 0
    // 3. Has Quantity > 0
    
    let winner = group[0]
    
    if (group.length > 1) {
        // Sort to find best winner
        group.sort((a, b) => {
            const aHasSuffix = /_[a-z0-9]{5}$/.test(a.sku)
            const bHasSuffix = /_[a-z0-9]{5}$/.test(b.sku)
            
            // Prefer no suffix
            if (!aHasSuffix && bHasSuffix) return -1
            if (aHasSuffix && !bHasSuffix) return 1
            
            // Prefer price > 0
            if (a.price > 0 && b.price === 0) return -1
            if (a.price === 0 && b.price > 0) return 1
            
            return 0
        })
        
        winner = group[0]
        const losers = group.slice(1)
        
        for (const loser of losers) {
            console.log(`Merging ${loser.sku} into ${winner.sku}...`)
            
            // Re-link relations
            await prisma.recipeItem.updateMany({
                where: { productId: loser.id },
                data: { productId: winner.id }
            })
            
            await prisma.purchaseOrderItem.updateMany({
                where: { productId: loser.id },
                data: { productId: winner.id }
            })
            
            await prisma.goodsReceiptItem.updateMany({
                where: { productId: loser.id },
                data: { productId: winner.id }
            })
            
            await prisma.stockMovement.updateMany({
                where: { productId: loser.id },
                data: { productId: winner.id }
            })
            
            productsToDelete.push(loser.id)
        }
        
        console.log(`Keeping ${winner.sku}, deleting duplicates: ${losers.map(l => l.sku).join(', ')}`)
    }

    // 3. Update Category for the winner
    // Find matching category based on name
    let categoryToSet = 'Lain-lain'
    const lowerName = winner.name.toLowerCase()
    
    for (const [key, cat] of Object.entries(itemToCategory)) {
        // Check if name contains the keyword
        if (lowerName.includes(key)) {
            categoryToSet = cat
            break
        }
    }

    // Force update if category is different or missing
    if (winner.category !== categoryToSet) {
        console.log(`Updating ${winner.name}: ${winner.category || 'null'} -> ${categoryToSet}`)
        updates.push(prisma.product.update({
            where: { id: winner.id },
            data: { category: categoryToSet }
        }))
    }
  }

  // Execute Deletes
  if (productsToDelete.length > 0) {
      console.log(`Deleting ${productsToDelete.length} duplicate products...`)
      await prisma.product.deleteMany({
          where: { id: { in: productsToDelete } }
      })
  }

  // Execute Updates
  if (updates.length > 0) {
      console.log(`Updating categories for ${updates.length} products...`)
      await Promise.all(updates)
  }

  console.log('Cleanup complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

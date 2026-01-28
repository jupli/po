
import { prisma } from '@/lib/prisma'

export default async function MigrationPage() {
  const logs: string[] = []
  const log = (msg: string) => {
    logs.push(msg)
    console.log(msg)
  }

  try {
    log('Starting migration...')

    // 1. Ensure Suppliers exist
    const suppliersToCheck = [
      { name: 'General Supplier' },
      { name: 'Supplier Beras' },
      { name: 'Supplier Daging Ayam' },
      { name: 'Supplier Bumbu' },
      { name: 'Supplier Sayur-mayur' },
      { name: 'Supplier Buah' }
    ]

    const supplierMap: Record<string, string> = {}

    for (const s of suppliersToCheck) {
      let supplier = await prisma.supplier.findFirst({ where: { name: s.name } })
      if (!supplier) {
        log(`Creating supplier: ${s.name}`)
        supplier = await prisma.supplier.create({ data: s })
      }
      supplierMap[s.name] = supplier.id
    }

    // 2. Update Product Supplier Links (Comprehensive Mapping)
    // Keys are lowercase keywords to match in product name
    const keywordToSupplier: Record<string, string> = {
      'beras': 'Supplier Beras',
      'ayam': 'Supplier Daging Ayam',
      'susu': 'General Supplier',
      'bayam': 'Supplier Sayur-mayur',
      'jagung': 'Supplier Sayur-mayur',
      'wortel': 'Supplier Sayur-mayur',
      'sayur': 'Supplier Sayur-mayur',
      'pisang': 'Supplier Buah',
      'apel': 'Supplier Buah',
      'jeruk': 'Supplier Buah',
      'buah': 'Supplier Buah',
      'garam': 'Supplier Bumbu',
      'gula': 'Supplier Bumbu',
      'bawang': 'Supplier Bumbu',
      'kaldu': 'Supplier Bumbu',
      'merica': 'Supplier Bumbu',
      'ketumbar': 'Supplier Bumbu',
      'minyak': 'Supplier Bumbu',
      'tepung': 'Supplier Bumbu',
      'air': 'Supplier Bumbu',
    }

    // Sort keywords by length descending to prevent substring matches (e.g. 'ayam' matching 'bayam')
    const sortedKeywords = Object.entries(keywordToSupplier).sort((a, b) => b[0].length - a[0].length)

    const allProducts = await prisma.product.findMany()
    
    for (const product of allProducts) {
        const nameLower = product.name.toLowerCase()
        let targetSupplierName = 'General Supplier' // Default

        // Find best match
        for (const [keyword, supplierName] of sortedKeywords) {
            if (nameLower.includes(keyword)) {
                targetSupplierName = supplierName
                break 
            }
        }

        const targetSupplierId = supplierMap[targetSupplierName]
        if (targetSupplierId && product.supplierId !== targetSupplierId) {
            log(`Updating Product: ${product.name} -> ${targetSupplierName}`)
            await prisma.product.update({
                where: { id: product.id },
                // @ts-ignore
                data: { supplierId: targetSupplierId }
            })
        }
    }

    // 3. Fix existing POs - Scan ALL POs
    const allPOs = await prisma.purchaseOrder.findMany({
      include: { 
        supplier: true,
        items: { include: { product: true } } 
      }
    })

    log(`Found ${allPOs.length} total POs in database`)

    for (const po of allPOs) {
      const itemsBySupplier: Record<string, typeof po.items> = {}
      let needsMigration = false
      
      for (const item of po.items) {
        // Determine correct supplier based on Product Name (using same logic as above)
        let targetSupplierName = 'General Supplier'
        const productName = item.product?.name.toLowerCase() || ''
        
        for (const [keyword, supplierName] of sortedKeywords) {
            if (productName.includes(keyword)) {
                targetSupplierName = supplierName
                break 
            }
        }

        // Get target supplier ID
        let targetSupplierId = supplierMap[targetSupplierName]
        
        // If logic failed to map (e.g. unknown item), keep in current supplier if possible, or General
        if (!targetSupplierId) {
            targetSupplierId = supplierMap['General Supplier']
        }

        // Check if item is in the WRONG supplier PO
        if (targetSupplierId && targetSupplierId !== po.supplierId) {
          needsMigration = true
          if (!itemsBySupplier[targetSupplierId]) {
            itemsBySupplier[targetSupplierId] = []
          }
          itemsBySupplier[targetSupplierId].push(item)
          log(`  -> Item '${item.product?.name}' in ${po.supplier?.name} should be in ${targetSupplierName}`)
        }
      }

      if (!needsMigration) {
          continue
      }

      // Execute Migration
      for (const [newSupplierId, items] of Object.entries(itemsBySupplier)) {
        const supplier = await prisma.supplier.findUnique({ where: { id: newSupplierId } })
        if (!supplier) continue

        log(`  Moving ${items.length} items to new PO for ${supplier.name}`)

        // Create new PO
        const count = await prisma.purchaseOrder.count()
        const randomSuffix = Math.floor(Math.random() * 1000)
        const poNumber = `PO-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}-${supplier.name.substring(0, 3).toUpperCase()}-${randomSuffix}`
        
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)

        const newPO = await prisma.purchaseOrder.create({
          data: {
            poNumber,
            supplierId: newSupplierId,
            date: po.date,
            status: po.status,
            totalAmount
          }
        })

        // Move items
        for (const item of items) {
          await prisma.purchaseOrderItem.update({
            where: { id: item.id },
            data: { purchaseOrderId: newPO.id }
          })
        }
      }

      // Cleanup Old PO
      const remainingItems = await prisma.purchaseOrderItem.count({ where: { purchaseOrderId: po.id } })
      if (remainingItems === 0) {
        log(`  Deleting empty old PO ${po.poNumber}`)
        await prisma.goodsReceipt.deleteMany({ where: { poId: po.id } })
        await prisma.purchaseOrder.delete({ where: { id: po.id } })
      } else {
        // Recalculate total for old PO
        const currentItems = await prisma.purchaseOrderItem.findMany({ where: { purchaseOrderId: po.id } })
        const newTotal = currentItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
        await prisma.purchaseOrder.update({
          where: { id: po.id },
          data: { totalAmount: newTotal }
        })
        log(`  Updated old PO ${po.poNumber} total to ${newTotal}`)
      }
    }

    // 4. Consolidate POs (Merge multiple POs for same Supplier + Date)
    const finalPOs = await prisma.purchaseOrder.findMany({
      include: { items: true }
    })

    const poGroups: Record<string, typeof finalPOs> = {}

    for (const po of finalPOs) {
      const dateKey = po.date.toISOString().split('T')[0] // Group by YYYY-MM-DD
      const key = `${po.supplierId}-${dateKey}`
      
      if (!poGroups[key]) {
        poGroups[key] = []
      }
      poGroups[key].push(po)
    }

    for (const [key, pos] of Object.entries(poGroups)) {
      if (pos.length > 1) {
        log(`Consolidating ${pos.length} POs for group ${key}`)
        
        // Keep the first one as master
        const masterPO = pos[0]
        const posToMerge = pos.slice(1)

        for (const po of posToMerge) {
          log(`  Merging items from ${po.poNumber} into ${masterPO.poNumber}`)
          
          // Move items
          await prisma.purchaseOrderItem.updateMany({
            where: { purchaseOrderId: po.id },
            data: { purchaseOrderId: masterPO.id }
          })

          // Delete empty PO
          await prisma.goodsReceipt.deleteMany({ where: { poId: po.id } })
          await prisma.purchaseOrder.delete({ where: { id: po.id } })
        }

        // Recalculate Master Total
        const allItems = await prisma.purchaseOrderItem.findMany({ where: { purchaseOrderId: masterPO.id } })
        const newTotal = allItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
        
        await prisma.purchaseOrder.update({
          where: { id: masterPO.id },
          data: { totalAmount: newTotal }
        })
        
        log(`  Updated Master PO ${masterPO.poNumber} total to ${newTotal}`)
      }
    }

    // 5. Consolidate Duplicate Items within POs
    const allPOsFinal = await prisma.purchaseOrder.findMany({
      include: { items: true }
    })

    for (const po of allPOsFinal) {
        const itemsByProduct: Record<string, typeof po.items> = {}
        let hasDuplicates = false

        for (const item of po.items) {
            if (!itemsByProduct[item.productId]) {
                itemsByProduct[item.productId] = []
            }
            itemsByProduct[item.productId].push(item)
            if (itemsByProduct[item.productId].length > 1) hasDuplicates = true
        }

        if (hasDuplicates) {
            log(`Consolidating duplicate items in PO ${po.poNumber}`)
            
            for (const [productId, items] of Object.entries(itemsByProduct)) {
                if (items.length > 1) {
                    const masterItem = items[0]
                    const duplicates = items.slice(1)
                    
                    const totalQty = items.reduce((sum: number, i: any) => sum + i.quantity, 0)

                    // Update master item
                    await prisma.purchaseOrderItem.update({
                        where: { id: masterItem.id },
                        data: {
                            quantity: totalQty
                        }
                    })

                    // Delete duplicates
                    for (const dup of duplicates) {
                        // Use deleteMany to avoid error if record already deleted (e.g. by parallel request)
                        await prisma.purchaseOrderItem.deleteMany({ where: { id: dup.id } })
                    }
                    
                    log(`  Merged ${items.length} items for product ${productId}`)
                }
            }
        }
    }

    // 6. Update Product Categories (Bahan Kering vs Bahan Basah)
    const dryGoods = [
      'Beras', 'Tepung terigu', 'Tepung beras', 'Tepung maizena', 'Tepung tapioka', 'Gula pasir', 'Gula aren', 'gula merah', 
      'Garam', 'Kacang tanah', 'Kacang hijau', 'Kacang merah', 'Kacang kedelai', 'Kacang tolo', 'Kacang polong', 'Wijen', 
      'Jagung pipil', 'Bawang putih bubuk', 'Bawang merah goreng', 'Ketumbar', 'Merica', 'lada', 'Jintan', 'Pala', 'Cengkeh', 
      'Kayu manis', 'Kapulaga', 'Kunyit bubuk', 'Jahe bubuk', 'Lengkuas bubuk', 'Cabai bubuk', 'Daun salam kering', 
      'Daun jeruk kering', 'Mi kering', 'Bihun', 'Soun', 'Makaroni', 'Spaghetti', 'Tepung panir', 'breadcrumbs', 'Abon', 
      'Dendeng', 'Ikan asin', 'Kaldu bubuk', 'Penyedap rasa', 'Vanili', 'Cokelat bubuk', 'Santan bubuk', 'Susu bubuk', 
      'Ragi instan', 'Baking powder', 'Baking soda', 'Minyak goreng', 'Margarin', 'Minyak wijen', 'Minyak zaitun', 
      'Sereal', 'Oatmeal', 'Granola', 'Biskuit', 'Crackers'
    ]

    const wetGoods = [
      'Bayam', 'Kangkung', 'Sawi', 'Pakcoy', 'Kubis', 'kol', 'Wortel', 'Kentang', 'Tomat', 'Mentimun', 'Terong', 'Buncis', 
      'Kacang panjang', 'Labu siam', 'Jagung manis', 'Brokoli', 'Kembang kol', 'Daun bawang', 'Seledri', 'Selada', 'Pisang', 
      'Apel', 'Jeruk', 'Pepaya', 'Semangka', 'Melon', 'Mangga', 'Pir', 'Anggur', 'Daging Ayam', 'Ayam Potong', 'Daging Sapi', 'Ikan', 'Kepiting', 'Rajungan', 
      'Udang', 'Cumi', 'Telur', 'Bawang merah', 'Bawang putih', 'Cabai', 'Jahe', 'Kunyit', 'Lengkuas', 'Serai', 'Daun salam', 
      'Daun jeruk', 'Kemiri', 'Susu', 'Yogurt', 'Keju', 'Mentega', 'Tahu', 'Tempe', 'Oncom', 'Sosis', 'Bakso'
    ]
    
    // Additional mapping for specific sub-categories if needed in future
    // For now we just use the list names as the "Sub Category" implicitly or just grouping by Main Category
    
    log('Classifying Products...')
    const productsToClassify = await prisma.product.findMany()

    const categoryMap: Record<string, string> = {}
    // We want to map keywords to "Bahan Kering" or "Bahan Basah"
    dryGoods.forEach(k => categoryMap[k.toLowerCase()] = 'Bahan Kering')
    wetGoods.forEach(k => categoryMap[k.toLowerCase()] = 'Bahan Basah')
    
    // Sort by length desc to prioritize "Susu Bubuk" over "Susu"
    const sortedCategoryKeywords = Object.entries(categoryMap).sort((a, b) => b[0].length - a[0].length)

    for (const product of productsToClassify) {
        const nameLower = product.name.toLowerCase()
        let newCategory = null
        let subCategory = null // Not storing sub-category in DB yet, but could be useful

        for (const [keyword, cat] of sortedCategoryKeywords) {
            if (nameLower.includes(keyword)) {
                newCategory = cat
                // In a real app we might want to store the specific keyword as a "Type" or "SubCategory"
                break
            }
        }

        if (newCategory && product.category !== newCategory) {
            log(`  Classifying ${product.name} -> ${newCategory}`)
            await prisma.product.update({
                where: { id: product.id },
                data: { category: newCategory }
            })
        }
    }

    log('Migration completed successfully.')

  } catch (error: any) {
    log(`Error: ${error.message}`)
    console.error(error)
  }

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Migration Status</h1>
      <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded">
        Halaman ini akan otomatis memperbaiki data PO yang salah grouping.
        Jika Anda melihat log "Migration completed successfully", berarti data sudah diperbaiki.
        Silakan kembali ke halaman Purchase Orders.
      </div>
      <pre className="bg-gray-100 p-4 rounded border overflow-auto max-h-[500px]">
        {logs.join('\n')}
      </pre>
    </div>
  )
}

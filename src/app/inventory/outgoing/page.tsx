import { getProducts } from '@/app/actions/product'
import { getRecipes } from '@/app/actions/recipe'
import OutgoingForm from '@/components/OutgoingForm'

export default async function OutgoingPage() {
  const [products, recipesResult] = await Promise.all([
    getProducts(),
    getRecipes()
  ])
  
  const recipes = (recipesResult.success && recipesResult.recipes) ? recipesResult.recipes : []
  
  // Sort products by name for better UX
  const sortedProducts = products.sort((a: any, b: any) => a.name.localeCompare(b.name))

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Form Bahan Keluar (Usage / Masak)</h1>
        <p className="text-gray-500">
            <strong>Pilih Menu Masakan</strong> untuk pengurangan stok otomatis berdasarkan resep.
        </p>
      </div>
      
      <OutgoingForm products={sortedProducts} recipes={recipes} />
    </div>
  )
}

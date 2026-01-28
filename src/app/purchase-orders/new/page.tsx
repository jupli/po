import { getSuppliers } from '@/app/actions/supplier'
import { getProducts } from '@/app/actions/product'
import CreatePOForm from '../../../components/CreatePOForm'

export default async function NewPOPage() {
  const suppliers = await getSuppliers()
  const products = await getProducts()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Purchase Order</h1>
      <CreatePOForm suppliers={suppliers} products={products} />
    </div>
  )
}

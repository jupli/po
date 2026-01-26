'use client'

import { updateProduct } from '@/app/actions/product'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const res = await updateProduct(product.id, formData)
    if (res.success) {
      router.push('/products')
      router.refresh()
    } else {
      setError(res.error || 'Something went wrong')
    }
  }

  return (
    <form action={handleSubmit} className="bg-white shadow rounded-lg p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Product Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product.name}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">
          SKU
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="sku"
          name="sku"
          type="text"
          required
          defaultValue={product.sku}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          name="description"
          rows={3}
          defaultValue={product.description || ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Price
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="price"
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={product.price}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unit">
            Unit
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="unit"
            name="unit"
            type="text"
            required
            defaultValue={product.unit}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
          Current Quantity
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          id="quantity"
          name="quantity"
          type="number"
          defaultValue={product.quantity}
          readOnly
          title="Update quantity via Stock Adjustment or PO"
        />
        <p className="text-xs text-gray-500 mt-1">Quantity is managed via Stock Movements</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Update Product
        </button>
        <button
          className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          type="button"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

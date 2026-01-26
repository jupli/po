'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPurchaseOrder } from '@/app/actions/po'

type Props = {
  suppliers: any[]
  products: any[]
}

export default function CreatePOForm({ suppliers, products }: Props) {
  const router = useRouter()
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    const item = { ...newItems[index], [field]: value }
    
    // If product changed, set default price
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        item.unitPrice = Number(product.price)
      }
    }
    
    newItems[index] = item
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) {
      setError('Please select a supplier')
      return
    }
    if (items.length === 0) {
      setError('Please add at least one item')
      return
    }
    if (items.some(item => !item.productId || item.quantity <= 0 || item.unitPrice < 0)) {
      setError('Please fill in all item details correctly')
      return
    }

    const res = await createPurchaseOrder({
      supplierId,
      items
    })

    if (res.success) {
      router.push('/purchase-orders')
    } else {
      setError(res.error || 'Failed to create PO')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Supplier</label>
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select Supplier</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex gap-4 mb-4 items-end border-b pb-4">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1">Product</label>
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                className="shadow border rounded w-full py-1 px-2 text-sm"
                required
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs font-bold mb-1">Quantity</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                className="shadow border rounded w-full py-1 px-2 text-sm"
                min="1"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold mb-1">Unit Price</label>
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                className="shadow border rounded w-full py-1 px-2 text-sm"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="w-32 text-right">
              <label className="block text-xs font-bold mb-1">Total</label>
              <div className="py-1 text-sm font-bold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.quantity * item.unitPrice)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700 font-bold px-2"
            >
              ×
            </button>
          </div>
        ))}

        <div className="text-right mt-4">
          <span className="text-lg font-bold">Total Amount: </span>
          <span className="text-xl font-bold text-blue-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal())}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
        >
          Create Purchase Order
        </button>
      </div>
    </form>
  )
}

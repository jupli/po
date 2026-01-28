'use client'

import { updateSupplier } from '@/app/actions/supplier'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EditSupplierForm({ supplier }: { supplier: any }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const res = await updateSupplier(supplier.id, formData)
    if (res.success) {
      router.push('/suppliers')
      router.refresh()
    } else {
      setError(res.error || 'Something went wrong')
    }
  }

  return (
    <form action={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Supplier Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          name="name"
          type="text"
          required
          defaultValue={supplier.name}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact">
          Contact Person
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="contact"
          name="contact"
          type="text"
          defaultValue={supplier.contact || ''}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="address"
          name="address"
          rows={3}
          defaultValue={supplier.address || ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            name="email"
            type="email"
            defaultValue={supplier.email || ''}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="phone"
            name="phone"
            type="text"
            defaultValue={supplier.phone || ''}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Update Supplier
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

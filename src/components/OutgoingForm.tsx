'use client'

import { useState } from 'react'
import { cookMenu } from '@/app/actions/recipe'
import { useRouter } from 'next/navigation'

interface OutgoingFormProps {
  products: any[]
  recipes: any[]
}

export default function OutgoingForm({ products, recipes }: OutgoingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Cooking Mode State
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [portions, setPortions] = useState(1)

  // -- Cooking Mode Handlers --

  async function handleCookSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedRecipeId) {
      alert('Mohon pilih menu yang akan dimasak')
      return
    }
    if (portions <= 0) {
      alert('Jumlah porsi harus lebih dari 0')
      return
    }

    const recipeName = recipes.find(r => r.id === selectedRecipeId)?.name || 'Menu'
    if (!confirm(`Konfirmasi masak ${portions} porsi ${recipeName}?\nStok bahan-bahan akan dikurangi otomatis.`)) return

    setLoading(true)

    try {
      const result = await cookMenu(selectedRecipeId, portions)
      
      if (result.success) {
        alert(`Berhasil! Bahan-bahan untuk ${recipeName} telah dikurangi dari stok.`)
        setSelectedRecipeId('')
        setPortions(1)
        router.refresh()
      } else {
        alert('Gagal memproses masakan: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  // Helper to get selected recipe details
  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

  return (
    <div className="space-y-6">
      <form onSubmit={handleCookSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-orange-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pilih Menu Masakan</label>
              <select
                required
                value={selectedRecipeId}
                onChange={e => {
                    const newId = e.target.value
                    setSelectedRecipeId(newId)
                    const r = recipes.find(recipe => recipe.id === newId)
                    if (r && r.defaultPortion) {
                        setPortions(r.defaultPortion)
                    } else {
                        setPortions(1)
                    }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-lg font-medium"
              >
                <option value="">-- Pilih Menu --</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString('id-ID') : 'No Date'})
                  </option>
                ))}
              </select>
              {recipes.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Belum ada resep yang tersimpan.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Porsi</label>
              <div className="flex items-center mt-1">
                  <input
                    type="number"
                    required
                    min="1"
                    value={portions}
                    onChange={e => setPortions(Number(e.target.value))}
                    className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-lg font-bold text-center"
                  />
                  <span className="ml-3 text-gray-500">Porsi</span>
              </div>
            </div>
          </div>

          {/* Recipe Preview */}
          {selectedRecipe && (
            <div className="mt-6 bg-orange-50 p-4 rounded-md border border-orange-200">
              <h4 className="text-md font-bold text-orange-800 mb-3">
                  Rincian Bahan yang Akan Digunakan ({portions} Porsi):
              </h4>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-orange-200">
                      <thead>
                          <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Bahan</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Per Porsi</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Total Dibutuhkan</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Stok Tersedia</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-orange-700 uppercase">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-200">
                          {selectedRecipe.ingredients.map((ing: any) => {
                              const totalRequired = ing.quantity * portions
                              const isEnough = ing.product.quantity >= totalRequired
                              return (
                                  <tr key={ing.id} className={isEnough ? '' : 'bg-red-100'}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{ing.product.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-600">{ing.quantity} {ing.unit}</td>
                                      <td className="px-4 py-2 text-sm font-bold text-gray-900">{totalRequired} {ing.unit}</td>
                                      <td className="px-4 py-2 text-sm text-gray-600">{ing.product.quantity} {ing.unit}</td>
                                      <td className="px-4 py-2 text-sm">
                                          {isEnough ? (
                                              <span className="text-green-600 font-bold">✓ Cukup</span>
                                          ) : (
                                              <span className="text-red-600 font-bold">✕ Kurang</span>
                                          )}
                                      </td>
                                  </tr>
                              )
                          })}
                      </tbody>
                  </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !selectedRecipeId}
            className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 font-bold shadow-lg text-lg flex items-center"
          >
            {loading ? 'Sedang Memproses...' : '🍳 Masak Sekarang & Kurangi Stok'}
          </button>
        </div>
      </form>
    </div>
  )
}
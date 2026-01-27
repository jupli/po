'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getProducts } from '../actions/product'

// Define the hierarchy structure
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

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [currentLevel, setCurrentLevel] = useState<'root' | 'category' | 'subcategory'>('root')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  // Navigation handlers
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setCurrentLevel('category')
  }

  const handleSubCategoryClick = (subCategory: string) => {
    setSelectedSubCategory(subCategory)
    setCurrentLevel('subcategory')
  }

  const handleBack = () => {
    if (currentLevel === 'subcategory') {
      setCurrentLevel('category')
      setSelectedSubCategory(null)
    } else if (currentLevel === 'category') {
      setCurrentLevel('root')
      setSelectedCategory(null)
    }
  }

  // Filter logic
  const getFilteredItems = () => {
    if (currentLevel === 'subcategory' && selectedSubCategory) {
      return products.filter(p => p.name.toLowerCase().includes(selectedSubCategory.toLowerCase()))
    }
    return []
  }

  if (loading) return <div className="p-8 text-center">Loading Inventory...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
            {currentLevel !== 'root' && (
                <button onClick={handleBack} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
                    ← Back
                </button>
            )}
            <h1 className="text-3xl font-bold">
                {currentLevel === 'root' && 'Stock Bahan (Inventory)'}
                {currentLevel === 'category' && `${selectedCategory}`}
                {currentLevel === 'subcategory' && `${selectedCategory} > ${selectedSubCategory}`}
            </h1>
        </div>
        <Link href="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add New Item
        </Link>
      </div>

      {/* LEVEL 1: Main Categories (Folders) */}
      {currentLevel === 'root' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(CATEGORY_STRUCTURE).map((cat) => (
                <div 
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-blue-500 flex flex-col items-center justify-center h-48"
                >
                    <div className="text-6xl mb-4">📁</div>
                    <h3 className="text-xl font-bold text-gray-800">{cat}</h3>
                    <p className="text-gray-500 mt-2">{products.filter(p => p.category === cat).length} Items</p>
                </div>
            ))}
             {/* "Uncategorized" Folder if any */}
             {products.some(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')) && (
                <div 
                    onClick={() => {
                        setSelectedCategory('Lain-lain')
                        setCurrentLevel('subcategory') // Direct to list for uncategorized
                        setSelectedSubCategory('') // Empty filter to show all matches
                    }}
                    className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-gray-400 flex flex-col items-center justify-center h-48"
                >
                    <div className="text-6xl mb-4">📁</div>
                    <h3 className="text-xl font-bold text-gray-800">Lain-lain</h3>
                    <p className="text-gray-500 mt-2">
                        {products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).length} Items
                    </p>
                </div>
            )}
        </div>
      )}

      {/* LEVEL 2: Sub-Categories (Folders) */}
      {currentLevel === 'category' && selectedCategory && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* @ts-ignore */}
            {CATEGORY_STRUCTURE[selectedCategory]?.map((subCat: string) => {
                // Count items matching this subcategory keyword
                const count = products.filter(p => 
                    p.category === selectedCategory && 
                    p.name.toLowerCase().includes(subCat.toLowerCase())
                ).length

                return (
                    <div 
                        key={subCat}
                        onClick={() => handleSubCategoryClick(subCat)}
                        className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center text-center"
                    >
                        <div className="text-4xl mb-2">📂</div>
                        <h4 className="font-semibold text-gray-700">{subCat}</h4>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full mt-2 text-gray-600">{count} items</span>
                    </div>
                )
            })}
        </div>
      )}

      {/* LEVEL 3: Items List */}
      {currentLevel === 'subcategory' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {selectedCategory === 'Lain-lain' 
                ? products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).map((product) => (
                   <ProductRow key={product.id} product={product} /> 
                ))
                : getFilteredItems().map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
            }
            {((selectedCategory !== 'Lain-lain' && getFilteredItems().length === 0) || (selectedCategory === 'Lain-lain' && products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).length === 0)) && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No items found in this folder.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}

function ProductRow({ product }: { product: any }) {
    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{product.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                product.quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                {product.quantity} {product.unit}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(product.price))}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Link href={`/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
            </td>
        </tr>
    )
}

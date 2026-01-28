'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getProducts, updateProduct } from '../actions/product'

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
  const [editingProduct, setEditingProduct] = useState<any>(null)

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, low_stock, out_of_stock

  const fetchProducts = () => {
    getProducts().then(data => {
      setProducts(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
  }

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

  // Filter logic for Folders
  const getFolderFilteredItems = () => {
    if (currentLevel === 'subcategory' && selectedSubCategory) {
      return products.filter(p => p.name.toLowerCase().includes(selectedSubCategory.toLowerCase()))
    }
    return []
  }

  // Global Search & Filter Logic
  const isSearchingOrFiltering = searchTerm !== '' || filterStatus !== 'all'
  
  const globalFilteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    if (filterStatus === 'low_stock') matchesFilter = product.quantity < 10 && product.quantity > 0
    if (filterStatus === 'out_of_stock') matchesFilter = product.quantity === 0
    
    return matchesSearch && matchesFilter
  })

  if (loading) return <div className="p-8 text-center">Loading Inventory...</div>

  return (
    <div className="p-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
            {currentLevel !== 'root' && !isSearchingOrFiltering && (
                <button onClick={handleBack} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
                    ← Back
                </button>
            )}
            <h1 className="text-3xl font-bold">
                {isSearchingOrFiltering ? 'Search Results' : (
                    <>
                    {currentLevel === 'root' && 'Stock Bahan (Inventory)'}
                    {currentLevel === 'category' && `${selectedCategory}`}
                    {currentLevel === 'subcategory' && `${selectedCategory} > ${selectedSubCategory}`}
                    </>
                )}
            </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <input 
                type="text" 
                placeholder="Search name or SKU..." 
                className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="all">All Status</option>
                <option value="low_stock">Low Stock (&lt;10)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
            </select>
            <Link href="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center whitespace-nowrap">
            + Add New Item
            </Link>
        </div>
      </div>

      {isSearchingOrFiltering ? (
          // SEARCH RESULTS VIEW
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100 text-blue-800 flex justify-between items-center">
                <span>Found {globalFilteredProducts.length} items matching your criteria.</span>
                <button 
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Clear Search
                </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pembelian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pemakaian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {globalFilteredProducts.map((product) => (
                        <ProductRow key={product.id} product={product} showCategory={true} onEdit={handleEditProduct} />
                    ))}
                    {globalFilteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                No products found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      ) : (
          // NORMAL FOLDER VIEW
          <>
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
                            <div className="mt-2 text-center">
                                <p className="text-gray-500 text-sm">{products.filter(p => p.category === cat).length} Jenis Barang</p>
                                <p className={`text-xs font-bold ${products.filter(p => p.category === cat).reduce((sum, p) => sum + p.quantity, 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Total Stok: {products.filter(p => p.category === cat).reduce((sum, p) => sum + p.quantity, 0)}
                                </p>
                            </div>
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
                            <div className="mt-2 text-center">
                                <p className="text-gray-500 text-sm">
                                    {products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).length} Jenis Barang
                                </p>
                                <p className={`text-xs font-bold ${products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).reduce((sum, p) => sum + p.quantity, 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Total Stok: {products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).reduce((sum, p) => sum + p.quantity, 0)}
                                </p>
                            </div>
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
                        const matchingProducts = products.filter(p => 
                            p.category === selectedCategory && 
                            p.name.toLowerCase().includes(subCat.toLowerCase())
                        )
                        const count = matchingProducts.length
                        const totalStock = matchingProducts.reduce((sum, p) => sum + p.quantity, 0)

                        return (
                            <div 
                                key={subCat}
                                onClick={() => handleSubCategoryClick(subCat)}
                                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-center text-center"
                            >
                                <div className="text-4xl mb-2">📂</div>
                                <h4 className="font-semibold text-gray-700">{subCat}</h4>
                                <div className="mt-2 flex flex-col gap-1">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{count} Jenis</span>
                                    <span className={`text-xs font-bold ${totalStock > 0 ? 'text-green-600' : 'text-red-500'}`}>Stok: {totalStock}</span>
                                </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pembelian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pemakaian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {selectedCategory === 'Lain-lain' 
                        ? products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).map((product) => (
                        <ProductRow key={product.id} product={product} onEdit={handleEditProduct} /> 
                        ))
                        : getFolderFilteredItems().map((product) => (
                        <ProductRow key={product.id} product={product} onEdit={handleEditProduct} />
                        ))
                    }
                    {((selectedCategory !== 'Lain-lain' && getFolderFilteredItems().length === 0) || (selectedCategory === 'Lain-lain' && products.filter(p => !p.category || (p.category !== 'Bahan Kering' && p.category !== 'Bahan Basah')).length === 0)) && (
                    <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No items found in this folder.
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            )}
          </>
      )}
      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          isOpen={!!editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onSuccess={fetchProducts}
        />
      )}
    </div>
  )
}

function ProductRow({ product, showCategory = false, onEdit }: { product: any, showCategory?: boolean, onEdit: (p: any) => void }) {
    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
            {showCategory ? (
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || '-'}</td>
            ) : (
                 <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{product.description}</td>
            )}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.lastPurchaseDate ? new Date(product.lastPurchaseDate).toLocaleDateString('id-ID') : '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.lastUsageDate ? new Date(product.lastUsageDate).toLocaleDateString('id-ID') : '-'}
            </td>
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
        </tr>
    )
}

function EditProductModal({ product, isOpen, onClose, onSuccess }: { product: any, isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  if (!isOpen) return null

  async function handleSubmit(formData: FormData) {
    const res = await updateProduct(product.id, formData)
    if (res.success) {
      onSuccess()
      onClose()
    } else {
      alert('Failed to update product')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
        <form action={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Product Name</label>
            <input defaultValue={product.name} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">SKU</label>
            <input defaultValue={product.sku} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="sku" name="sku" type="text" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea defaultValue={product.description} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price</label>
              <input defaultValue={product.price} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="price" name="price" type="number" step="0.01" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unit">Unit</label>
              <input defaultValue={product.unit} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="unit" name="unit" type="text" required />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">Quantity (Stok)</label>
            <input 
                defaultValue={product.quantity} 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline cursor-not-allowed" 
                id="quantity" 
                name="quantity" 
                type="number" 
                disabled 
            />
            <p className="text-xs text-red-500 mt-1 italic">
                * Stok tidak dapat diedit manual. Gunakan menu Penerimaan/Pengeluaran Barang.
            </p>
          </div>
          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

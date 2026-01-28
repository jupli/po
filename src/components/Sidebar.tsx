'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const [isPurchasingOpen, setIsPurchasingOpen] = useState(true)
  const [isInventoryOpen, setIsInventoryOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 fixed h-full overflow-y-auto print:hidden">
      <h1 className="text-2xl font-bold mb-8">Modul PO</h1>
      <nav className="flex flex-col space-y-2">
        <Link 
          href="/" 
          className={`p-2 rounded hover:bg-gray-800 ${pathname === '/' ? 'bg-gray-800' : ''}`}
        >
          Dashboard
        </Link>
        
        {/* Purchasing Menu */}
        <div>
          <button 
            onClick={() => setIsPurchasingOpen(!isPurchasingOpen)}
            className="w-full text-left p-2 hover:bg-gray-800 rounded flex justify-between items-center"
          >
            <span>Purchasing</span>
            <span className="text-xs">{isPurchasingOpen ? '▼' : '▶'}</span>
          </button>
          
          {isPurchasingOpen && (
            <div className="ml-4 flex flex-col space-y-1 mt-1 border-l border-gray-700 pl-2">
              <Link 
                href="/purchasing/request" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/purchasing/request' ? 'bg-gray-800' : ''}`}
              >
                1. Permintaan Bahan
              </Link>
              <Link 
                href="/purchasing/purchase" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/purchasing/purchase' ? 'bg-gray-800' : ''}`}
              >
                2. Pembelian Bahan
              </Link>
              <Link 
                href="/purchasing/submission" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/purchasing/submission' ? 'bg-gray-800' : ''}`}
              >
                3. Pengajuan Pembelian
              </Link>
            </div>
          )}
        </div>

        <div className="pt-4 pb-2 text-xs text-gray-400 uppercase font-semibold">Master Data</div>
        <Link 
          href="/purchase-orders" 
          className={`p-2 hover:bg-gray-800 rounded ${pathname.startsWith('/purchase-orders') ? 'bg-gray-800' : ''}`}
        >
          Purchase Orders
        </Link>
        
        {/* Inventory Menu */}
        <div>
          <button 
            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
            className="w-full text-left p-2 hover:bg-gray-800 rounded flex justify-between items-center"
          >
            <span>Products (Inventory)</span>
            <span className="text-xs">{isInventoryOpen ? '▼' : '▶'}</span>
          </button>
          
          {isInventoryOpen && (
            <div className="ml-4 flex flex-col space-y-1 mt-1 border-l border-gray-700 pl-2">
              <Link 
                href="/inventory/incoming" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/inventory/incoming' ? 'bg-gray-800' : ''}`}
              >
                1. Bahan Masuk
              </Link>
              <Link 
                href="/inventory/outgoing" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/inventory/outgoing' ? 'bg-gray-800' : ''}`}
              >
                2. Bahan Keluar
              </Link>
              <Link 
                href="/products" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/products' ? 'bg-gray-800' : ''}`}
              >
                3. Stock Bahan
              </Link>
              <Link 
                href="/recipes" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/recipes' ? 'bg-gray-800' : ''}`}
              >
                4. Jadwal Masak Menu
              </Link>
              <Link 
                href="/distribution" 
                className={`p-2 text-sm hover:bg-gray-800 rounded ${pathname === '/distribution' ? 'bg-gray-800' : ''}`}
              >
                5. Distribusi & QC
              </Link>
            </div>
          )}
        </div>

        <Link 
          href="/suppliers" 
          className={`p-2 hover:bg-gray-800 rounded ${pathname.startsWith('/suppliers') ? 'bg-gray-800' : ''}`}
        >
          Suppliers
        </Link>
      </nav>
    </div>
  )
}

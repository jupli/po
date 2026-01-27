import Link from 'next/link'

export default function OutgoingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bahan Keluar (Outgoing)</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">Fitur pencatatan bahan keluar (pemakaian produksi) akan segera hadir.</p>
        <div className="mt-4">
          <Link href="/products" className="text-blue-600 hover:text-blue-800">
            &larr; Kembali ke Stock Bahan
          </Link>
        </div>
      </div>
    </div>
  )
}

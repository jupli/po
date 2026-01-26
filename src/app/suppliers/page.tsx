import { getSuppliers } from '../actions/supplier'
import Link from 'next/link'

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Link href="/suppliers/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Supplier
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link href={`/suppliers/${supplier.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No suppliers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

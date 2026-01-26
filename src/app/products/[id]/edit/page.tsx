import { prisma } from '@/lib/prisma'
import { updateProduct } from '@/app/actions/product'
import EditProductForm from '../../../../components/EditProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product: {product.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Details</h2>
          <EditProductForm product={product} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Stock History</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {product.stockMovements.map((move) => (
                  <tr key={move.id}>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {new Date(move.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${
                        move.type === 'IN' ? 'bg-green-100 text-green-800' :
                        move.type === 'OUT' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {move.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs font-bold">
                      {move.type === 'OUT' ? '-' : '+'}{move.quantity}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {move.reference || '-'}
                    </td>
                  </tr>
                ))}
                {product.stockMovements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-xs text-gray-500">No movements yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

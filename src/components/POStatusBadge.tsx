import { POStatus } from '@prisma/client'

export default function POStatusBadge({ status }: { status: POStatus }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    KIRIM: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    RECEIVED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  )
}

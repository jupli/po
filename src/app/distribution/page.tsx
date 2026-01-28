import { getDistributionItems } from '@/app/actions/distribution'
import DistributionClient from './DistributionClient'

export default async function Page() {
  const result = await getDistributionItems()
  const items = (result.success && result.data) ? result.data : []

  return <DistributionClient initialItems={items} />
}

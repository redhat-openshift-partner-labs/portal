import { getDb } from '../../utils/db'
import { REQUEST_TYPE_LABELS } from '../../../app/config/requestTypeLabels'

export interface RequestsByType {
  total: number
  breakdown: Array<{
    requestType: string
    label: string
    count: number
  }>
}

export default defineEventHandler(async (event): Promise<RequestsByType> => {
  requireAuth(event)

  const db = await getDb()

  // Count labs by request type for active states
  const activeStates = ['Running', 'Hibernating', 'Approved', 'Pending']

  const labs = await db.lab.groupBy({
    by: ['requestType'],
    where: {
      state: { in: activeStates },
    },
    _count: {
      requestType: true,
    },
  })

  // Build breakdown with labels
  const breakdown = labs.map(item => ({
    requestType: item.requestType,
    label: REQUEST_TYPE_LABELS[item.requestType] ?? item.requestType,
    count: item._count.requestType,
  }))

  // Calculate total
  const total = breakdown.reduce((sum, item) => sum + item.count, 0)

  return {
    total,
    breakdown,
  }
})

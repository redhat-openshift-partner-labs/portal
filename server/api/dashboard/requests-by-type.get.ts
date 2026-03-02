import { getDb } from '../../utils/db'
import { REQUEST_TYPE_LABELS } from '../../../app/config/requestTypeLabels'

export interface RequestsByType {
  total: number
  breakdown: Array<{
    requestType: string
    label: string
    count: number
    byState: Array<{ state: string, count: number }>
  }>
}

export default defineEventHandler(async (event): Promise<RequestsByType> => {
  requireAuth(event)

  const db = await getDb()

  // Count labs by request type for active states
  const activeStates = ['Running', 'Hibernating', 'Approved', 'Pending']

  const labs = await db.lab.groupBy({
    by: ['requestType', 'state'],
    where: {
      state: { in: activeStates },
    },
    _count: {
      requestType: true,
    },
  })

  // Group by requestType first, then aggregate states
  const typeMap = new Map<string, { count: number, byState: Map<string, number> }>()

  for (const item of labs) {
    const existing = typeMap.get(item.requestType) ?? { count: 0, byState: new Map() }
    existing.count += item._count.requestType
    existing.byState.set(item.state, item._count.requestType)
    typeMap.set(item.requestType, existing)
  }

  // Build breakdown with labels and state breakdown
  const breakdown = Array.from(typeMap.entries()).map(([requestType, data]) => ({
    requestType,
    label: REQUEST_TYPE_LABELS[requestType] ?? requestType,
    count: data.count,
    byState: Array.from(data.byState.entries()).map(([state, count]) => ({ state, count })),
  }))

  // Calculate total
  const total = breakdown.reduce((sum, item) => sum + item.count, 0)

  return {
    total,
    breakdown,
  }
})

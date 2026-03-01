import { getDb } from '../../utils/db'

export interface ExtensionStatsData {
  byStatus: {
    approved: number
    pending: number
    denied: number
  }
  byDuration: Array<{
    duration: string
    label: string
    count: number
  }>
  byMonth: Array<{
    month: string
    approved: number
    pending: number
    denied: number
  }>
}

// Duration labels mapping
const durationLabels: Record<string, string> = {
  '3d': '3 Days',
  '1w': '1 Week',
  '2w': '2 Weeks',
  '1mo': '1 Month',
}

export default defineEventHandler(async (event): Promise<ExtensionStatsData> => {
  requireAuth(event)

  const db = await getDb()

  // Get counts by status
  const [approved, pending, denied] = await Promise.all([
    db.extensionRequest.count({ where: { status: 'Approved' } }),
    db.extensionRequest.count({ where: { status: 'Pending' } }),
    db.extensionRequest.count({ where: { status: 'Denied' } }),
  ])

  // Get counts by extension duration
  const byDurationRaw = await db.extensionRequest.groupBy({
    by: ['extension'],
    _count: {
      id: true,
    },
    where: {
      extension: {
        not: null,
      },
    },
  })

  const byDuration = byDurationRaw
    .filter(item => item.extension !== null)
    .map(item => ({
      duration: item.extension as string,
      label: durationLabels[item.extension as string] ?? item.extension as string,
      count: item._count.id,
    }))
    .sort((a, b) => {
      // Sort by duration order: 3d, 1w, 2w, 1mo
      const order = ['3d', '1w', '2w', '1mo']
      return order.indexOf(a.duration) - order.indexOf(b.duration)
    })

  // Get extension requests by month (last 6 months)
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const recentRequests = await db.extensionRequest.findMany({
    where: {
      date: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      date: true,
      status: true,
    },
  })

  // Group by month and status
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = new Map<string, { approved: number, pending: number, denied: number }>()

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12
    const year = now.getMonth() - i < 0 ? now.getFullYear() - 1 : now.getFullYear()
    const key = `${year}-${monthIndex}`
    monthlyData.set(key, { approved: 0, pending: 0, denied: 0 })
  }

  // Populate with actual data
  for (const req of recentRequests) {
    if (!req.date || !req.status) continue
    const date = new Date(req.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const entry = monthlyData.get(key)
    if (entry) {
      const status = req.status.toLowerCase() as 'approved' | 'pending' | 'denied'
      if (status in entry) {
        entry[status]++
      }
    }
  }

  // Convert to array
  const byMonth: ExtensionStatsData['byMonth'] = []
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12
    const year = now.getMonth() - i < 0 ? now.getFullYear() - 1 : now.getFullYear()
    const key = `${year}-${monthIndex}`
    const entry = monthlyData.get(key) ?? { approved: 0, pending: 0, denied: 0 }
    byMonth.push({
      month: monthNames[monthIndex] ?? '',
      ...entry,
    })
  }

  return {
    byStatus: { approved, pending, denied },
    byDuration,
    byMonth,
  }
})

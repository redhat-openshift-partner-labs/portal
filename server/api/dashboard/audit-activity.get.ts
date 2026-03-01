import { getDb } from '../../utils/db'

export interface AuditActivityData {
  byDate: Array<{
    date: string
    count: number
  }>
  byLoginType: Record<string, number>
  byHour: number[]
}

export default defineEventHandler(async (event): Promise<AuditActivityData> => {
  requireAuth(event)

  const db = await getDb()

  // Get all audit records with access time
  const audits = await db.audit.findMany({
    where: {
      accessTime: {
        not: null,
      },
    },
    select: {
      accessTime: true,
      loginType: true,
    },
  })

  // Build byDate (last 365 days for heatmap)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const dateCountMap = new Map<string, number>()
  const loginTypeMap = new Map<string, number>()
  const hourCounts = new Array(24).fill(0) as number[]

  for (const audit of audits) {
    if (!audit.accessTime) continue

    const date = new Date(audit.accessTime)
    const dateStr = date.toISOString().split('T')[0]

    // Count by date (for heatmap)
    if (dateStr && date >= oneYearAgo) {
      dateCountMap.set(dateStr, (dateCountMap.get(dateStr) ?? 0) + 1)
    }

    // Count by login type
    const loginType = audit.loginType ?? 'Unknown'
    loginTypeMap.set(loginType, (loginTypeMap.get(loginType) ?? 0) + 1)

    // Count by hour
    const hour = date.getHours()
    const currentCount = hourCounts[hour]
    if (typeof currentCount === 'number') {
      hourCounts[hour] = currentCount + 1
    }
  }

  // Convert date map to sorted array
  const byDate = Array.from(dateCountMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Convert login type map to object
  const byLoginType: Record<string, number> = {}
  for (const [type, count] of loginTypeMap.entries()) {
    byLoginType[type] = count
  }

  return {
    byDate,
    byLoginType,
    byHour: hourCounts,
  }
})

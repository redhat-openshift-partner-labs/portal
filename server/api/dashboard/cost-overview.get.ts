import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const now = new Date()
  const currentYear = now.getFullYear()
  const lastYear = currentYear - 1

  const db = await getDb()

  // Get costs for this year (last 6 months)
  const thisYearCosts = await db.cloudCost.findMany({
    where: {
      year: currentYear,
    },
    select: {
      cost: true,
      month: true,
    },
  })

  // Get costs for last year (same 6 month period, one year ago)
  const lastYearCosts = await db.cloudCost.findMany({
    where: {
      year: lastYear,
    },
    select: {
      cost: true,
      month: true,
    },
  })

  // Group by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const thisYearByMonth = new Map<number, number>()
  const lastYearByMonth = new Map<number, number>()

  for (const cost of thisYearCosts) {
    if (cost.month !== null) {
      // Month is 1-indexed in production
      const monthIndex = cost.month - 1
      thisYearByMonth.set(monthIndex, (thisYearByMonth.get(monthIndex) || 0) + cost.cost)
    }
  }

  for (const cost of lastYearCosts) {
    if (cost.month !== null) {
      const monthIndex = cost.month - 1
      lastYearByMonth.set(monthIndex, (lastYearByMonth.get(monthIndex) || 0) + cost.cost)
    }
  }

  // Build ordered arrays for the last 6 months
  const months: string[] = []
  const thisYearData: number[] = []
  const lastYearData: number[] = []

  for (let i = 5; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12
    months.push(monthNames[monthIndex] ?? '')
    thisYearData.push(Math.round((thisYearByMonth.get(monthIndex) || 0) / 1000 * 10) / 10)
    lastYearData.push(Math.round((lastYearByMonth.get(monthIndex) || 0) / 1000 * 10) / 10)
  }

  return {
    thisYear: thisYearData,
    lastYear: lastYearData,
    months,
  }
})

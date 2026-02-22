export default defineEventHandler(async (event) => {
  requireAuth(event)

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const eighteenMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth() - 5, 1)
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1)

  // Get costs for this year (last 6 months)
  const thisYearCosts = await prisma.cost.findMany({
    where: {
      date: { gte: sixMonthsAgo },
    },
    select: {
      amount: true,
      date: true,
    },
  })

  // Get costs for last year (same 6 month period, one year ago)
  const lastYearCosts = await prisma.cost.findMany({
    where: {
      date: {
        gte: eighteenMonthsAgo,
        lt: twelveMonthsAgo,
      },
    },
    select: {
      amount: true,
      date: true,
    },
  })

  // Group by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const thisYearByMonth = new Map<number, number>()
  const lastYearByMonth = new Map<number, number>()

  for (const cost of thisYearCosts) {
    const month = cost.date.getMonth()
    thisYearByMonth.set(month, (thisYearByMonth.get(month) || 0) + cost.amount)
  }

  for (const cost of lastYearCosts) {
    const month = cost.date.getMonth()
    lastYearByMonth.set(month, (lastYearByMonth.get(month) || 0) + cost.amount)
  }

  // Build ordered arrays for the last 6 months
  const months: string[] = []
  const thisYearData: number[] = []
  const lastYearData: number[] = []

  for (let i = 5; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12
    months.push(monthNames[monthIndex])
    thisYearData.push(Math.round((thisYearByMonth.get(monthIndex) || 0) / 1000 * 10) / 10)
    lastYearData.push(Math.round((lastYearByMonth.get(monthIndex) || 0) / 1000 * 10) / 10)
  }

  return {
    thisYear: thisYearData,
    lastYear: lastYearData,
    months,
  }
})

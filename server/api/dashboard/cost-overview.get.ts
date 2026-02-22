interface MonthlyCost {
  month: number
  total: string
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const thisYear = await query<MonthlyCost>(`
    SELECT EXTRACT(MONTH FROM date) as month, SUM(cost) as total
    FROM costs
    WHERE date >= NOW() - INTERVAL '6 months'
    GROUP BY month
    ORDER BY month
  `)

  const lastYear = await query<MonthlyCost>(`
    SELECT EXTRACT(MONTH FROM date) as month, SUM(cost) as total
    FROM costs
    WHERE date >= NOW() - INTERVAL '18 months' AND date < NOW() - INTERVAL '12 months'
    GROUP BY month
    ORDER BY month
  `)

  // Convert to arrays of numbers for chart consumption
  const thisYearData = thisYear.map((row) => Number(row.total) / 1000) // Convert to thousands
  const lastYearData = lastYear.map((row) => Number(row.total) / 1000)

  // Get month labels
  const months = thisYear.map((row) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return monthNames[Number(row.month) - 1]
  })

  return {
    thisYear: thisYearData,
    lastYear: lastYearData,
    months,
  }
})

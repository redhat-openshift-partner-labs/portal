interface MonthlyLabs {
  month: number
  total: string
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const created = await query<MonthlyLabs>(`
    SELECT EXTRACT(MONTH FROM created_at) as month, COUNT(*) as total
    FROM labs
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY month
    ORDER BY month
  `)

  const completed = await query<MonthlyLabs>(`
    SELECT EXTRACT(MONTH FROM completed_at) as month, COUNT(*) as total
    FROM labs
    WHERE completed_at >= NOW() - INTERVAL '6 months' AND completed_at IS NOT NULL
    GROUP BY month
    ORDER BY month
  `)

  // Convert to arrays of numbers for chart consumption
  const createdData = created.map((row) => Number(row.total))
  const completedData = completed.map((row) => Number(row.total))

  // Calculate totals
  const totalCreated = createdData.reduce((sum, val) => sum + val, 0)
  const totalCompleted = completedData.reduce((sum, val) => sum + val, 0)

  // Get month labels
  const months = created.map((row) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return monthNames[Number(row.month) - 1]
  })

  return {
    created: createdData,
    completed: completedData,
    totalCreated,
    totalCompleted,
    months,
  }
})

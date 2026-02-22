export default defineEventHandler(async (event) => {
  requireAuth(event)

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // Get labs created in the last 6 months
  const createdLabs = await prisma.lab.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      createdAt: true,
    },
  })

  // Get labs completed in the last 6 months
  const completedLabs = await prisma.lab.findMany({
    where: {
      completedAt: {
        gte: sixMonthsAgo,
        not: null,
      },
    },
    select: {
      completedAt: true,
    },
  })

  // Group by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const createdByMonth = new Map<number, number>()
  const completedByMonth = new Map<number, number>()

  for (const lab of createdLabs) {
    const month = lab.createdAt.getMonth()
    createdByMonth.set(month, (createdByMonth.get(month) || 0) + 1)
  }

  for (const lab of completedLabs) {
    if (lab.completedAt) {
      const month = lab.completedAt.getMonth()
      completedByMonth.set(month, (completedByMonth.get(month) || 0) + 1)
    }
  }

  // Build ordered arrays for the last 6 months
  const months: string[] = []
  const createdData: number[] = []
  const completedData: number[] = []

  for (let i = 5; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12
    months.push(monthNames[monthIndex])
    createdData.push(createdByMonth.get(monthIndex) || 0)
    completedData.push(completedByMonth.get(monthIndex) || 0)
  }

  const totalCreated = createdData.reduce((sum, val) => sum + val, 0)
  const totalCompleted = completedData.reduce((sum, val) => sum + val, 0)

  return {
    created: createdData,
    completed: completedData,
    totalCreated,
    totalCompleted,
    months,
  }
})

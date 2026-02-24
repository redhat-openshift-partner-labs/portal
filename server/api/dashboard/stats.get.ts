export default defineEventHandler(async (event) => {
  requireAuth(event)

  const [totalLabs, activeLabs, totalUsers, completedLabs] = await Promise.all([
    prisma.lab.count(),
    prisma.lab.count({ where: { state: { in: ['Active', 'Running'] } } }),
    prisma.user.count(),
    prisma.lab.count({ where: { state: 'Completed' } }),
  ])

  return {
    totalLabs,
    activeLabs,
    totalUsers,
    completedLabs,
  }
})

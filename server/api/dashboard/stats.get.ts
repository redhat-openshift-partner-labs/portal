export default defineEventHandler(async (event) => {
  requireAuth(event)

  const [totalLabs, activeLabs, totalUsers, completedSessions] = await Promise.all([
    prisma.lab.count(),
    prisma.lab.count({ where: { status: 'active' } }),
    prisma.user.count(),
    prisma.session.count({ where: { completed: true } }),
  ])

  return {
    totalLabs,
    activeLabs,
    totalUsers,
    completedSessions,
  }
})

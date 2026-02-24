export default defineEventHandler(async (event) => {
  requireAuth(event)

  const [totalLabs, activeLabs, deniedLabs, completedLabs] = await Promise.all([
    prisma.lab.count(),
    prisma.lab.count({ where: { state: { in: ['Active', 'Running'] } } }),
    prisma.lab.count({ where: { state: 'Denied' } }),
    prisma.lab.count({ where: { state: 'Completed' } }),
  ])

  return {
    totalLabs,
    activeLabs,
    deniedLabs,
    completedLabs,
  }
})

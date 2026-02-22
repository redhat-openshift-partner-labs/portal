export default defineEventHandler(async (event) => {
  requireAuth(event)

  const requests = await prisma.request.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
      _count: {
        select: {
          notes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return requests.map((request) => ({
    id: request.id,
    cluster: request.cluster,
    company: request.company,
    timezone: request.timezone,
    status: request.status,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
    notesCount: request._count.notes,
  }))
})

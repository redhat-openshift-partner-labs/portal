export default defineEventHandler(async (event) => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const request = await prisma.request.findUnique({
    where: { id: Number(id) },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
      notes: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!request) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  return {
    id: request.id,
    cluster: request.cluster,
    company: request.company,
    timezone: request.timezone,
    status: request.status,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    notes: request.notes.map((note) => ({
      id: note.id,
      content: note.content,
      author: note.author,
      immutable: note.immutable,
      createdAt: note.createdAt.toISOString(),
    })),
  }
})

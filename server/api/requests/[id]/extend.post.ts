interface ExtendBody {
  duration: '3d' | '1w' | '2w' | '1mo'
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const body = await readBody<ExtendBody>(event)
  if (!body.duration || !['3d', '1w', '2w', '1mo'].includes(body.duration)) {
    throw createError({ statusCode: 400, message: 'Invalid duration. Must be 3d, 1w, 2w, or 1mo' })
  }

  const request = await prisma.request.findUnique({
    where: { id: Number(id) },
  })

  if (!request) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Calculate new end date based on duration
  const currentEndDate = new Date(request.endDate)
  let daysToAdd = 0

  switch (body.duration) {
    case '3d':
      daysToAdd = 3
      break
    case '1w':
      daysToAdd = 7
      break
    case '2w':
      daysToAdd = 14
      break
    case '1mo':
      daysToAdd = 30
      break
  }

  const newEndDate = new Date(currentEndDate)
  newEndDate.setDate(newEndDate.getDate() + daysToAdd)

  const updatedRequest = await prisma.request.update({
    where: { id: Number(id) },
    data: {
      endDate: newEndDate,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
  })

  return {
    id: updatedRequest.id,
    cluster: updatedRequest.cluster,
    company: updatedRequest.company,
    timezone: updatedRequest.timezone,
    status: updatedRequest.status,
    startDate: updatedRequest.startDate.toISOString(),
    endDate: updatedRequest.endDate.toISOString(),
  }
})

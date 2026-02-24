interface UpdateRequestBody {
  status?: string
  timezone?: string
}

const VALID_STATUSES = ['Pending', 'Active', 'Approved', 'Running', 'Hibernating', 'Denied', 'Completed']

export default defineEventHandler(async (event) => {
  await requireEditPermission(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const body = await readBody<UpdateRequestBody>(event)

  // Validate status if provided
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  // Validate timezone if provided
  if (body.timezone !== undefined && typeof body.timezone !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid timezone' })
  }

  // Verify request exists
  const existingRequest = await prisma.request.findUnique({
    where: { id: Number(id) },
  })

  if (!existingRequest) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Build update data
  const updateData: { status?: string; timezone?: string } = {}
  if (body.status !== undefined) {
    updateData.status = body.status
  }
  if (body.timezone !== undefined) {
    updateData.timezone = body.timezone.trim()
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, message: 'No valid fields to update' })
  }

  const request = await prisma.request.update({
    where: { id: Number(id) },
    data: updateData,
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
    id: request.id,
    cluster: request.cluster,
    company: request.company,
    timezone: request.timezone,
    status: request.status,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
  }
})

interface UpdateRequestBody {
  status?: string
  timezone?: string
  hold?: boolean
}

// User-settable statuses (Running/Hibernating are set by hub cluster, not users)
const USER_SETTABLE_STATUSES = ['Pending', 'Approved', 'Denied', 'Completed']

export default defineEventHandler(async (event) => {
  await requireEditPermission(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const body = await readBody<UpdateRequestBody>(event)

  // Validate status if provided
  if (body.status !== undefined && !USER_SETTABLE_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, message: `Invalid status. Must be one of: ${USER_SETTABLE_STATUSES.join(', ')}` })
  }

  // Validate timezone if provided
  if (body.timezone !== undefined && typeof body.timezone !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid timezone' })
  }

  // Verify lab exists
  const existingLab = await prisma.lab.findUnique({
    where: { id: Number(id) },
  })

  if (!existingLab) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Block edits for archived requests (Denied or Completed)
  if (['Denied', 'Completed'].includes(existingLab.state)) {
    throw createError({ statusCode: 403, message: 'Archived requests cannot be edited' })
  }

  // Build update data
  const updateData: { state?: string; region?: string; hold?: boolean } = {}
  if (body.status !== undefined) {
    updateData.state = body.status
  }
  if (body.timezone !== undefined) {
    updateData.region = body.timezone.trim()
  }
  if (body.hold !== undefined) {
    updateData.hold = body.hold
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, message: 'No valid fields to update' })
  }

  const lab = await prisma.lab.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
        },
      },
    },
  })

  return {
    id: lab.id,
    cluster: lab.clusterName,
    generatedName: lab.generatedName,
    company: lab.company ? {
      id: lab.company.id,
      name: lab.company.companyName,
      logoUrl: lab.company.logoUrl,
    } : null,
    companyName: lab.companyName,
    timezone: lab.region,
    status: lab.state,
    startDate: lab.startDate.toISOString(),
    endDate: lab.endDate.toISOString(),
    hold: lab.hold,
  }
})

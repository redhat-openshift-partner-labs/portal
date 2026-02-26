import { getDb } from '../../utils/db'

interface UpdateRequestBody {
  status?: string
  timezone?: string
  hold?: boolean
  openshiftVersion?: string
}

// User-settable statuses (Running/Hibernating are set by hub cluster, Denied requires deny endpoint)
const USER_SETTABLE_STATUSES = ['Pending', 'Approved', 'Completed']

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

  // Block direct status change to Denied - must use deny endpoint
  if (body.status === 'Denied') {
    throw createError({ statusCode: 400, message: 'Use the deny endpoint to deny a request with a reason' })
  }

  // Validate timezone if provided
  if (body.timezone !== undefined && typeof body.timezone !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid timezone' })
  }

  // Validate openshiftVersion if provided
  if (body.openshiftVersion !== undefined && typeof body.openshiftVersion !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid OpenShift version' })
  }

  const db = await getDb()

  // Verify lab exists and check for denial note
  const existingLab = await db.lab.findUnique({
    where: { id: Number(id) },
    include: { denialNote: true },
  })

  if (!existingLab) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Block edits for archived requests (Denied or Completed) or requests with denial notes
  if (['Denied', 'Completed'].includes(existingLab.state) || existingLab.denialNote) {
    throw createError({ statusCode: 403, message: 'Archived requests cannot be edited' })
  }

  // Build update data
  const updateData: { state?: string; region?: string; hold?: boolean; openshiftVersion?: string; completedAt?: Date | null } = {}
  if (body.status !== undefined) {
    updateData.state = body.status
    // Set completedAt when status changes to Completed
    if (body.status === 'Completed') {
      updateData.completedAt = new Date()
    }
  }
  if (body.timezone !== undefined) {
    updateData.region = body.timezone.trim()
  }
  if (body.hold !== undefined) {
    updateData.hold = body.hold
  }
  if (body.openshiftVersion !== undefined) {
    updateData.openshiftVersion = body.openshiftVersion.trim()
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, message: 'No valid fields to update' })
  }

  const lab = await db.lab.update({
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
    openshiftVersion: lab.openshiftVersion,
  }
})

import { getDb } from '../../../utils/db'

interface DenyRequestBody {
  reason: string
}

export default defineEventHandler(async (event) => {
  const session = await requireEditPermission(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const body = await readBody<DenyRequestBody>(event)
  if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Denial reason is required' })
  }

  const db = await getDb()

  // Verify lab exists and check its state
  const lab = await db.lab.findUnique({
    where: { id: Number(id) },
    include: { denialNote: true },
  })

  if (!lab) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Check if already denied
  if (lab.denialNote) {
    throw createError({ statusCode: 400, message: 'Request has already been denied' })
  }

  // Check if completed
  if (lab.state === 'Completed') {
    throw createError({ statusCode: 400, message: 'Cannot deny a completed request' })
  }

  // Transaction: create denial note and update lab status
  const result = await db.$transaction(async (tx) => {
    // Create immutable denial note
    await tx.denialNote.create({
      data: {
        labId: Number(id),
        userId: session.email,
        reason: body.reason.trim(),
      },
    })

    // Update lab status to Denied
    const updatedLab = await tx.lab.update({
      where: { id: Number(id) },
      data: { state: 'Denied' },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          },
        },
        denialNote: true,
      },
    })

    return updatedLab
  })

  return {
    id: result.id,
    generatedName: result.generatedName,
    status: result.state,
    company: result.company ? {
      id: result.company.id,
      name: result.company.companyName,
      logoUrl: result.company.logoUrl,
    } : null,
    denialNote: result.denialNote ? {
      reason: result.denialNote.reason,
      deniedBy: result.denialNote.userId,
      deniedAt: result.denialNote.createdAt.toISOString(),
    } : null,
  }
})

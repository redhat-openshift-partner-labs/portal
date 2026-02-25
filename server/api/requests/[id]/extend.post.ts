import { getDb } from '../../../utils/db'

interface ExtendBody {
  duration: '3d' | '1w' | '2w' | '1mo'
}

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const body = await readBody<ExtendBody>(event)
  if (!body.duration || !['3d', '1w', '2w', '1mo'].includes(body.duration)) {
    throw createError({ statusCode: 400, message: 'Invalid duration. Must be 3d, 1w, 2w, or 1mo' })
  }

  const db = await getDb()

  const lab = await db.lab.findUnique({
    where: { id: Number(id) },
  })

  if (!lab) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Calculate new end date based on duration
  const currentEndDate = new Date(lab.endDate)
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

  // Update lab and create extension request record in a transaction
  const [updatedLab, extensionRecord] = await db.$transaction([
    db.lab.update({
      where: { id: Number(id) },
      data: {
        endDate: newEndDate,
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          },
        },
      },
    }),
    db.extensionRequest.create({
      data: {
        labId: Number(id),
        extension: body.duration,
        currentUser: session.email,
        date: new Date(),
        status: 'Approved', // Auto-approved in this context
      },
    }),
  ])

  return {
    id: updatedLab.id,
    cluster: updatedLab.clusterName,
    generatedName: updatedLab.generatedName,
    company: updatedLab.company ? {
      id: updatedLab.company.id,
      name: updatedLab.company.companyName,
      logoUrl: updatedLab.company.logoUrl,
    } : null,
    companyName: updatedLab.companyName,
    timezone: updatedLab.region,
    status: updatedLab.state,
    startDate: updatedLab.startDate.toISOString(),
    endDate: updatedLab.endDate.toISOString(),
    extension: {
      id: extensionRecord.id,
      extension: extensionRecord.extension,
      requestedBy: extensionRecord.currentUser,
      date: extensionRecord.date?.toISOString() ?? null,
      status: extensionRecord.status,
      createdAt: extensionRecord.createdAt?.toISOString() ?? null,
    },
  }
})

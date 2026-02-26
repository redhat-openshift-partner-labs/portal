import { getDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const db = await getDb()

  const denialNote = await db.denialNote.findUnique({
    where: { labId: Number(id) },
  })

  if (!denialNote) {
    return null
  }

  return {
    reason: denialNote.reason,
    deniedBy: denialNote.userId,
    deniedAt: denialNote.createdAt.toISOString(),
  }
})

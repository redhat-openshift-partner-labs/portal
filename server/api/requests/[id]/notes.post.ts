import { getDb } from '../../../utils/db'

interface NoteBody {
  content: string
  immutable?: boolean
}

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const body = await readBody<NoteBody>(event)
  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Note content is required' })
  }

  const db = await getDb()

  // Verify lab exists
  const lab = await db.lab.findUnique({
    where: { id: Number(id) },
  })

  if (!lab) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Force immutable for archived requests (Denied or Completed)
  const isArchived = ['Denied', 'Completed'].includes(lab.state)
  const noteImmutable = isArchived ? true : (body.immutable ?? false)

  // Create note with userId as string (email) to match production schema
  const note = await db.note.create({
    data: {
      labId: Number(id),
      note: body.content.trim(),
      userId: session.email,
      immutable: noteImmutable,
    },
  })

  return {
    id: note.id,
    content: note.note,
    author: { name: note.userId },
    immutable: note.immutable,
    createdAt: note.createdAt.toISOString(),
  }
})

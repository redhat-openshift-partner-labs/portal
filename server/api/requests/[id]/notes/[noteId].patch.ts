interface UpdateNoteBody {
  content: string
}

export default defineEventHandler(async (event) => {
  await requireEditPermission(event)

  const requestId = getRouterParam(event, 'id')
  const noteId = getRouterParam(event, 'noteId')

  if (!requestId || isNaN(Number(requestId))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  if (!noteId || isNaN(Number(noteId))) {
    throw createError({ statusCode: 400, message: 'Invalid note ID' })
  }

  const body = await readBody<UpdateNoteBody>(event)
  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Note content is required' })
  }

  // Verify note exists and belongs to the request
  const existingNote = await prisma.note.findFirst({
    where: {
      id: Number(noteId),
      requestId: Number(requestId),
    },
  })

  if (!existingNote) {
    throw createError({ statusCode: 404, message: 'Note not found' })
  }

  // Check if note is immutable
  if (existingNote.immutable) {
    throw createError({ statusCode: 403, message: 'This note is immutable and cannot be edited' })
  }

  const note = await prisma.note.update({
    where: { id: Number(noteId) },
    data: {
      content: body.content.trim(),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  })

  return {
    id: note.id,
    content: note.content,
    author: note.author,
    immutable: note.immutable,
    createdAt: note.createdAt.toISOString(),
  }
})

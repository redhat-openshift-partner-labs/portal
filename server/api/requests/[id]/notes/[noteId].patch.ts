interface UpdateNoteBody {
  content?: string
  immutable?: boolean
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

  // Validate that at least one field is being updated
  const hasContent = body.content !== undefined && typeof body.content === 'string'
  const hasImmutable = body.immutable !== undefined && typeof body.immutable === 'boolean'

  if (!hasContent && !hasImmutable) {
    throw createError({ statusCode: 400, message: 'No valid fields to update' })
  }

  if (hasContent && body.content!.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Note content cannot be empty' })
  }

  // Verify note exists and belongs to the lab
  const existingNote = await prisma.note.findFirst({
    where: {
      id: Number(noteId),
      labId: Number(requestId),
    },
  })

  if (!existingNote) {
    throw createError({ statusCode: 404, message: 'Note not found' })
  }

  // Check if note is immutable (only allow setting immutable flag, not editing content)
  if (existingNote.immutable && hasContent) {
    throw createError({ statusCode: 403, message: 'This note is immutable and cannot be edited' })
  }

  // Build update data
  const updateData: { note?: string; immutable?: boolean } = {}
  if (hasContent) {
    updateData.note = body.content!.trim()
  }
  if (hasImmutable && !existingNote.immutable) {
    // Can only set immutable to true, not back to false
    updateData.immutable = body.immutable
  }

  const note = await prisma.note.update({
    where: { id: Number(noteId) },
    data: updateData,
  })

  return {
    id: note.id,
    content: note.note,
    author: note.userId ? { name: note.userId } : null,
    immutable: note.immutable,
    createdAt: note.createdAt.toISOString(),
  }
})

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

  // Verify request exists
  const request = await prisma.request.findUnique({
    where: { id: Number(id) },
  })

  if (!request) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  // Find the user by email from session
  const user = await prisma.user.findUnique({
    where: { email: session.email },
  })

  const note = await prisma.note.create({
    data: {
      requestId: Number(id),
      content: body.content.trim(),
      authorId: user?.id ?? null,
      immutable: body.immutable ?? false,
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

// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  // Fetch user's group from database
  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { group: true },
  })

  return {
    sub: session.sub,
    email: session.email,
    name: session.name,
    picture: session.picture,
    group: user?.group ?? null,
  }
})

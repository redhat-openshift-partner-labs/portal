// server/api/auth/me.get.ts
import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  // Fetch user's group from database
  const db = await getDb()
  const user = await db.user.findUnique({
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

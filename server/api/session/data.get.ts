// server/api/session/data.get.ts
import { sessionStore } from '../../utils/sessionStore'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler((event) => {
  const session = requireAuth(event)
  return sessionStore.getClient(session.sub) ?? null
})

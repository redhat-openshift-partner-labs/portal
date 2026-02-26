// server/api/auth/logout.post.ts
import { sessionStore } from '../../utils/sessionStore'
import { getAuthSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  // Get session before deleting cookie to clear session store
  const session = getAuthSession(event)
  if (session) {
    sessionStore.delete(session.sub)
  }

  deleteCookie(event, 'auth_session')
  return { success: true }
})

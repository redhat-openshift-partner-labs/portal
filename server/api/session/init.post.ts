// server/api/session/init.post.ts
import { sessionStore } from '../../utils/sessionStore'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  // Check if session data already exists
  if (sessionStore.has(session.sub)) {
    return sessionStore.getClient(session.sub)
  }

  // Fetch data from external source or compute session data
  // TODO: Replace with actual data fetching logic
  const sensitiveData: Record<string, unknown> = {
    // Server-only secrets that should never be sent to client
    // Example: internalApiKeys: [], serviceTokens: {}
  }

  const clientData: Record<string, unknown> = {
    // Safe to expose to client
    // Example: preferences: {}, permissions: []
    initializedAt: Date.now()
  }

  sessionStore.set(session.sub, {
    sensitive: sensitiveData,
    client: clientData
  })

  return clientData
})

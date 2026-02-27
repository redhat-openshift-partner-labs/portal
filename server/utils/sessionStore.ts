// server/utils/sessionStore.ts

interface SessionData {
  sensitive: Record<string, unknown> // Server-only, never sent to client
  client: Record<string, unknown> // Sent to client
  createdAt: number
}

const store = new Map<string, SessionData>()

export const sessionStore = {
  get(sessionId: string): SessionData | undefined {
    return store.get(sessionId)
  },

  set(sessionId: string, data: Omit<SessionData, 'createdAt'>): void {
    store.set(sessionId, {
      ...data,
      createdAt: Date.now(),
    })
  },

  delete(sessionId: string): boolean {
    return store.delete(sessionId)
  },

  getSensitive(sessionId: string): Record<string, unknown> | undefined {
    return store.get(sessionId)?.sensitive
  },

  getClient(sessionId: string): Record<string, unknown> | undefined {
    return store.get(sessionId)?.client
  },

  has(sessionId: string): boolean {
    return store.has(sessionId)
  },
}

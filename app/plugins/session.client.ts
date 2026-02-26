// plugins/session.client.ts
// Initializes session data on app mount for authenticated users
export default defineNuxtPlugin(async () => {
  const { user } = useAuth()
  const sessionData = useState<Record<string, unknown> | null>('session_data', () => null)

  // Skip if no authenticated user
  if (!user.value) return

  // Skip if session data already initialized (e.g., from SSR)
  if (sessionData.value) return

  try {
    const data = await $fetch('/api/session/init', { method: 'POST' })
    sessionData.value = data as Record<string, unknown>
  } catch {
    // Session init failed, but don't block app load
    sessionData.value = null
  }
})

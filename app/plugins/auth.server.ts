// plugins/auth.server.ts
// Hydrates auth state during SSR to prevent flash of unauthenticated content
export default defineNuxtPlugin(async (nuxtApp) => {
  const user = useState<{
    sub: string
    email: string
    name: string
    picture: string
  } | null>('auth_user', () => null)

  // Only run if we don't already have user data
  if (user.value) return

  // Check if cookie exists before making API call
  const token = useCookie('auth_session')
  if (!token.value) return

  try {
    // Use useRequestFetch to make internal API call during SSR
    // This reuses the existing /api/auth/me endpoint and its JWT verification
    const requestFetch = useRequestFetch()
    const data = await requestFetch('/api/auth/me')
    user.value = data as typeof user.value
  }
  catch {
    // Invalid or expired token - user remains null
    user.value = null
  }
})

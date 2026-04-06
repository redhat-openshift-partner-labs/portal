// plugins/auth.server.ts
// Hydrates auth state during SSR to prevent flash of unauthenticated content

interface AuthUser {
  sub: string
  email: string
  name: string
  picture: string
  group: string | null
}

export default defineNuxtPlugin(async () => {
  const user = useState<AuthUser | null>('auth_user', () => null)

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
    user.value = data as AuthUser
  }
  catch {
    // Invalid or expired token - user remains null
    user.value = null
  }
})

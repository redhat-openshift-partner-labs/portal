// composables/useAuth.ts
interface User {
  sub: string
  email: string
  name: string
  picture: string
  group: string | null
}

export type UserGroup = 'oplmgr' | 'opldev'
const EDIT_GROUPS: UserGroup[] = ['oplmgr', 'opldev']

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null)
  const config = useRuntimeConfig()

  // Shared promise to prevent duplicate concurrent init calls
  const initPromise = useState<Promise<void> | null>('auth_init_promise', () => null)

  // initialize user from cookie on client
  const init = async () => {
    if (user.value) return

    // If already initializing, wait for the existing promise
    if (initPromise.value) {
      return initPromise.value
    }

    // Create and store the promise
    initPromise.value = (async () => {
      try {
        const data = await $fetch<User>('/api/auth/me')
        user.value = data
      }
      catch {
        user.value = null
      }
      finally {
        initPromise.value = null
      }
    })()

    return initPromise.value
  }

  // const login = (returnUrl?: string) => {
  //   // Create state parameter with CSRF protection and return URL
  //   const state = {
  //     nonce: Math.random().toString(36).substring(2),
  //     returnUrl: returnUrl || '/dashboard',
  //   }
  //   // Use browser-compatible base64 encoding
  //   const stateParam = btoa(JSON.stringify(state))
  //
  //   const params = new URLSearchParams({
  //     client_id: config.public.googleClientId,
  //     redirect_uri: `${config.public.appUrl}/api/auth/callback`,
  //     response_type: 'code',
  //     scope: 'openid email profile',
  //     access_type: 'offline', // get refresh token
  //     prompt: 'consent',
  //     state: stateParam,
  //   })
  //   navigateTo(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, { external: true })
  // }

  const login = (returnUrl?: string) => {
    const state = {
      nonce: Math.random().toString(36).substring(2),
      returnUrl: returnUrl || '/dashboard',
    }
    const stateParam = btoa(JSON.stringify(state))

    const params = new URLSearchParams({
      client_id: config.public.oauthClientId,
      redirect_uri: `${config.public.appUrl}/api/auth/callback`,
      response_type: 'code',
      scope: 'openid email profile offline_access',
      state: stateParam,
    })

    navigateTo(`${config.public.oauthAuthUrl}?${params}`, { external: true })
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    // Clear client-side session data
    const sessionData = useState<Record<string, unknown> | null>('session_data')
    sessionData.value = null
    navigateTo('/auth')
  }

  const canEdit = computed(() => {
    return user.value?.group != null && EDIT_GROUPS.includes(user.value.group as UserGroup)
  })

  return { user, init, login, logout, canEdit }
}

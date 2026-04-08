// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (useRuntimeConfig().public.skipAuth && import.meta.dev) return
  // Skip for API auth callbacks
  if (to.path.startsWith('/api/auth/callback')) {
    return
  }

  const { user, init } = useAuth()

  // On client side, ensure user is initialized before checking auth
  if (import.meta.client) {
    await init()
  }

  // Check authentication: on server use cookie, on client use user state (already initialized above)
  const isAuthenticated = import.meta.server
    ? !!useCookie('auth_session').value
    : !!user.value

  // If user is authenticated and visiting auth page, redirect to dashboard
  if (to.path.startsWith('/auth')) {
    if (isAuthenticated) {
      return navigateTo('/dashboard')
    }
    // Not authenticated, allow access to auth page
    return
  }

  // Special handling for home page: redirect based on auth status
  if (to.path === '/') {
    if (isAuthenticated) {
      return navigateTo('/dashboard')
    }
    else {
      return navigateTo('/auth')
    }
  }

  // For all other routes, require authentication
  if (!isAuthenticated) {
    // Capture the intended URL and pass it as a redirect parameter
    const redirectPath = to.fullPath
    return navigateTo(`/auth?redirect=${encodeURIComponent(redirectPath)}`)
  }
})

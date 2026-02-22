// plugins/auth.client.ts
// Handles client-side auth initialization for cases where SSR didn't hydrate
// (e.g., client-side navigation after session expiry)
export default defineNuxtPlugin(async () => {
  const { user, init } = useAuth()

  // Skip if already hydrated from SSR (auth.server.ts)
  if (user.value) return

  // Initialize user state from server
  await init()
})

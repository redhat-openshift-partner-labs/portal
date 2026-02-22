// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  const { init } = useAuth()
  await init() // hydrate user state on client
})

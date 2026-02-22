// server/api/auth/me.get.ts
export default defineEventHandler((event) => {
  const session = requireAuth(event)
  return {
    sub: session.sub,
    email: session.email,
    name: session.name,
    picture: session.picture
  }
})

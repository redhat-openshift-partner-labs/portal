// server/api/auth/callback.get.ts
export default defineEventHandler(async (event) => {
  const { code, error, state } = getQuery(event)
  const config = useRuntimeConfig()

  if (error || !code) {
    return sendRedirect(event, '/auth?error=access_denied')
  }

  // Decode state parameter to get return URL
  let returnUrl = '/dashboard'
  if (state && typeof state === 'string') {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      // Validate that returnUrl is a relative path (prevent open redirect)
      if (stateData.returnUrl && stateData.returnUrl.startsWith('/')) {
        returnUrl = stateData.returnUrl
      }
    } catch {
      // If state parsing fails, default to dashboard
      returnUrl = '/dashboard'
    }
  }

  // exchange code for tokens
  const tokens = await $fetch<{
    access_token: string
    id_token: string
    refresh_token?: string
  }>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      code,
      client_id: config.public.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: `${config.public.appUrl}/api/auth/callback`,
      grant_type: 'authorization_code'
    }
  }).catch(() => null)

  if (!tokens) {
    return sendRedirect(event, '/auth?error=token_exchange_failed')
  }

  // decode id_token to get user info (already verified by Google)
  const payload = JSON.parse(
    Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
  )

  // create our session
  createSession(event, {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  })

  return sendRedirect(event, returnUrl)
})

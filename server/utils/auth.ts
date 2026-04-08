// server/utils/auth.ts
import type { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { getDb } from './db'

interface SessionPayload {
  sub: string
  email: string
  name: string
  picture: string
  exp: number
}

export const createSession = (event: H3Event, payload: Omit<SessionPayload, 'exp'>) => {
  const config = useRuntimeConfig()

  const token = jwt.sign(payload, config.authSecret, { expiresIn: '7d' })

  setCookie(event, 'auth_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export const getAuthSession = (event: H3Event): SessionPayload | null => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth_session')

  if (!token) return null

  try {
    return jwt.verify(token, config.authSecret) as SessionPayload
  }
  catch {
    // expired or invalid
    deleteCookie(event, 'auth_session')
    return null
  }
}

export const requireAuth = (event: H3Event): SessionPayload => {
  const config = useRuntimeConfig()
  if (config.public.skipAuth && process.dev) {
    return { sub: 'dev', email: 'dev@localhost', name: 'Dev User', picture: '', exp: 0 }
  }
  const session = getAuthSession(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return session
}

const EDIT_GROUPS = ['oplmgr', 'opldev']

export const requireEditPermission = async (event: H3Event): Promise<SessionPayload> => {
  const session = requireAuth(event)

  const db = await getDb()
  const user = await db.user.findUnique({
    where: { email: session.email },
    select: { group: true },
  })

  if (!user?.group || !EDIT_GROUPS.includes(user.group)) {
    throw createError({ statusCode: 403, message: 'You do not have permission to edit' })
  }

  return session
}
